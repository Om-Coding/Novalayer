import { databaseRequest } from "../_shared/database.ts";
import { isAllowedOrigin, jsonResponse, originError } from "../_shared/http.ts";

type CheckoutRequest = {
  customer_name?: unknown;
  contact?: unknown;
  note?: unknown;
  items?: unknown;
};

type Product = {
  id: string;
  name: string;
  description: string;
  price_cents: number;
};

type OrderItem = {
  product_id: string;
  name: string;
  quantity: number;
  unit_amount_cents: number;
};

const maxQuantityPerProduct = 10;
const maxProductsPerOrder = 20;
const maxOrderTotalCents = 10_000_000;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getStripeSecret(): string {
  const value = Deno.env.get("STRIPE_SECRET_KEY");
  if (!value || !/^sk_(test|live)_/.test(value)) {
    throw new Error("Stripe is not configured. Add STRIPE_SECRET_KEY to Supabase function secrets.");
  }
  return value;
}

function getSiteUrl(): string {
  const value = (Deno.env.get("SITE_URL") ?? "https://om-coding.github.io/Novalayer")
    .trim()
    .replace(/\/+$/, "");
  const url = new URL(value);
  if (url.protocol !== "https:" && url.hostname !== "localhost" && url.hostname !== "127.0.0.1") {
    throw new Error("SITE_URL must use HTTPS.");
  }
  return value;
}

async function createStripeSession(
  orderId: string,
  items: Array<OrderItem & { description: string }>,
): Promise<{ id: string; url: string }> {
  const form = new URLSearchParams();
  form.set("mode", "payment");
  form.set("success_url", `${getSiteUrl()}/?checkout=success&session_id={CHECKOUT_SESSION_ID}`);
  form.set("cancel_url", `${getSiteUrl()}/?checkout=cancel`);
  form.set("customer_creation", "always");
  form.set("phone_number_collection[enabled]", "true");
  form.set("shipping_address_collection[allowed_countries][0]", "US");
  form.set("billing_address_collection", "auto");
  form.set("metadata[order_id]", orderId);
  form.set("payment_intent_data[metadata][order_id]", orderId);
  form.set("payment_intent_data[description]", `Novalayer order ${orderId}`);
  form.set("payment_method_types[0]", "card");

  items.forEach((item, index) => {
    form.set(`line_items[${index}][quantity]`, String(item.quantity));
    form.set(`line_items[${index}][price_data][currency]`, "usd");
    form.set(`line_items[${index}][price_data][unit_amount]`, String(item.unit_amount_cents));
    form.set(`line_items[${index}][price_data][product_data][name]`, item.name);
    form.set(
      `line_items[${index}][price_data][product_data][description]`,
      item.description,
    );
  });

  const response = await fetch("https://api.stripe.com/v1/checkout/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getStripeSecret()}`,
      "Content-Type": "application/x-www-form-urlencoded",
      "Idempotency-Key": orderId,
    },
    body: form,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result?.error?.message ?? "Stripe could not start checkout.");
  }
  if (typeof result.id !== "string" || typeof result.url !== "string") {
    throw new Error("Stripe returned an incomplete checkout session.");
  }
  return { id: result.id, url: result.url };
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return originError(request) ?? jsonResponse(request, {});
  }
  const rejectedOrigin = originError(request);
  if (rejectedOrigin) return rejectedOrigin;
  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Use POST to start checkout." }, 405);
  }
  if (!isAllowedOrigin(request.headers.get("Origin"))) {
    return jsonResponse(request, { error: "This website is not allowed to start checkout." }, 403);
  }

  let body: CheckoutRequest;
  try {
    body = await request.json();
  } catch {
    return jsonResponse(request, { error: "The checkout request must be valid JSON." }, 400);
  }

  const customerName = typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const note = typeof body.note === "string" ? body.note.trim() : "";
  if (customerName.length < 1 || customerName.length > 100) {
    return jsonResponse(request, { error: "Enter a name between 1 and 100 characters." }, 400);
  }
  if (contact.length < 2 || contact.length > 200) {
    return jsonResponse(request, { error: "Enter a contact method between 2 and 200 characters." }, 400);
  }
  if (note.length > 1500) {
    return jsonResponse(request, { error: "The order note must be 1,500 characters or fewer." }, 400);
  }
  if (!Array.isArray(body.items) || body.items.length < 1 || body.items.length > maxProductsPerOrder) {
    return jsonResponse(request, { error: "Add between 1 and 20 products to your bag." }, 400);
  }

  const quantities = new Map<string, number>();
  for (const item of body.items) {
    if (!isRecord(item) || typeof item.product_id !== "string" ||
      !/^[a-z0-9][a-z0-9_-]{0,80}$/.test(item.product_id) ||
      !Number.isSafeInteger(item.quantity) || Number(item.quantity) < 1 ||
      Number(item.quantity) > maxQuantityPerProduct) {
      return jsonResponse(request, { error: "One of the products or quantities is invalid." }, 400);
    }
    const productId = item.product_id;
    const quantity = (quantities.get(productId) ?? 0) + Number(item.quantity);
    if (quantity > maxQuantityPerProduct) {
      return jsonResponse(request, { error: "Each product is limited to 10 per order." }, 400);
    }
    quantities.set(productId, quantity);
  }

  const orderId = crypto.randomUUID();
  let orderCreated = false;
  let stripeSessionId: string | null = null;

  try {
    const productIds = [...quantities.keys()];
    const query = new URLSearchParams({
      select: "id,name,description,price_cents",
      active: "eq.true",
      id: `in.(${productIds.join(",")})`,
    });
    const products = await databaseRequest<Product[]>(`products?${query}`);
    if (!products) throw new Error("Supabase returned no product catalog response.");
    const productById = new Map(products.map((product) => [product.id, product]));
    if (productById.size !== productIds.length) {
      return jsonResponse(request, { error: "A product in your bag is no longer available. Refresh and try again." }, 400);
    }

    const items: Array<OrderItem & { description: string }> = productIds.map((id) => {
      const product = productById.get(id)!;
      return {
        product_id: product.id,
        name: product.name,
        quantity: quantities.get(id)!,
        unit_amount_cents: product.price_cents,
        description: product.description,
      };
    });
    const subtotalCents = items.reduce(
      (total, item) => total + item.unit_amount_cents * item.quantity,
      0,
    );
    if (!Number.isSafeInteger(subtotalCents) || subtotalCents < 1 || subtotalCents > maxOrderTotalCents) {
      return jsonResponse(request, { error: "The order total is outside the supported range." }, 400);
    }

    const orderItems: OrderItem[] = items.map(({ description: _description, ...item }) => item);
    await databaseRequest("orders", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        id: orderId,
        customer_name: customerName,
        contact,
        note,
        order_items: orderItems,
        subtotal_cents: subtotalCents,
        currency: "usd",
        status: "pending",
      }),
    });
    orderCreated = true;

    const session = await createStripeSession(orderId, items);
    stripeSessionId = session.id;
    const stripeUrl = new URL(session.url);
    if (stripeUrl.protocol !== "https:" || stripeUrl.hostname !== "checkout.stripe.com") {
      throw new Error("Stripe returned an invalid checkout URL.");
    }
    await databaseRequest(
      `orders?id=eq.${encodeURIComponent(orderId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ stripe_session_id: session.id }),
      },
    );
    return jsonResponse(request, { url: session.url });
  } catch (error) {
    console.error("Could not create Stripe checkout session:", error);
    if (stripeSessionId) {
      try {
        await fetch(
          `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(stripeSessionId)}/expire`,
          {
            method: "POST",
            headers: { Authorization: `Bearer ${getStripeSecret()}` },
          },
        );
      } catch (expireError) {
        console.error("Could not expire incomplete Stripe checkout session:", expireError);
      }
    }
    if (orderCreated) {
      try {
        await databaseRequest(`orders?id=eq.${encodeURIComponent(orderId)}`, {
          method: "PATCH",
          headers: { Prefer: "return=minimal" },
          body: JSON.stringify({ status: "cancelled" }),
        });
      } catch (cleanupError) {
        console.error("Could not mark incomplete checkout order as cancelled:", cleanupError);
      }
    }
    const message = error instanceof Error ? error.message : "Checkout could not be started.";
    return jsonResponse(request, { error: message }, 500);
  }
});
