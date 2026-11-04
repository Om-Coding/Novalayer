import { databaseRequest } from "../_shared/database.ts";

type StripeEvent = {
  type?: string;
  data?: {
    object?: {
      id?: string;
      mode?: string;
      livemode?: boolean;
      metadata?: { order_id?: string };
      payment_status?: string;
      amount_total?: number | null;
      currency?: string | null;
      payment_intent?: string | { id?: string } | null;
      customer_details?: { email?: string | null } | null;
      shipping_details?: Record<string, unknown> | null;
    };
  };
};

function constantTimeEqual(left: string, right: string): boolean {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let index = 0; index < left.length; index += 1) {
    difference |= left.charCodeAt(index) ^ right.charCodeAt(index);
  }
  return difference === 0;
}

function toHex(bytes: Uint8Array): string {
  return [...bytes].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

async function hasValidSignature(
  payload: string,
  signatureHeader: string | null,
  secret: string,
): Promise<boolean> {
  if (!signatureHeader) return false;
  const fields = signatureHeader.split(",").map((field) => field.split("=", 2));
  const timestamp = fields.find(([key]) => key === "t")?.[1];
  const signatures = fields
    .filter(([key]) => key === "v1")
    .map(([, value]) => value)
    .filter(Boolean);
  if (!timestamp || signatures.length === 0 || !/^\d+$/.test(timestamp)) return false;
  if (Math.abs(Date.now() / 1000 - Number(timestamp)) > 300) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const digest = await crypto.subtle.sign(
    "HMAC",
    key,
    new TextEncoder().encode(`${timestamp}.${payload}`),
  );
  const expected = toHex(new Uint8Array(digest));
  return signatures.some((signature) => constantTimeEqual(signature, expected));
}

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Use POST for Stripe webhook events." }, 405);
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured.");
    return jsonResponse({ error: "Stripe webhook is not configured." }, 500);
  }

  const payload = await request.text();
  let validSignature = false;
  try {
    validSignature = await hasValidSignature(
      payload,
      request.headers.get("Stripe-Signature"),
      webhookSecret,
    );
  } catch (error) {
    console.error("Could not validate Stripe webhook signature:", error);
    return jsonResponse({ error: "Could not validate the Stripe signature." }, 400);
  }
  if (!validSignature) {
    return jsonResponse({ error: "Invalid Stripe signature." }, 400);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(payload);
  } catch {
    return jsonResponse({ error: "Stripe sent invalid JSON." }, 400);
  }

  const session = event.data?.object;
  const orderId = session?.metadata?.order_id;
  const sessionId = session?.id;
  if (!orderId || !/^[0-9a-f-]{36}$/i.test(orderId) || !sessionId) {
    return jsonResponse({ error: "Stripe event is missing its order reference." }, 400);
  }
  const stripeSecret = Deno.env.get("STRIPE_SECRET_KEY");
  if (
    session.mode !== "payment" ||
    typeof session.livemode !== "boolean" ||
    session.livemode !== stripeSecret?.startsWith("sk_live_")
  ) {
    return jsonResponse({ error: "Stripe event mode does not match the configured account." }, 400);
  }

  let orderRows: Array<{
    id: string;
    subtotal_cents: number;
    currency: string;
    stripe_session_id: string | null;
    status: string;
  }> | undefined;
  try {
    const query = new URLSearchParams({
      select: "id,subtotal_cents,currency,stripe_session_id,status",
      id: `eq.${orderId}`,
    });
    orderRows = await databaseRequest<typeof orderRows>(`orders?${query}`);
  } catch (error) {
    console.error("Could not find order for Stripe webhook:", error);
    return jsonResponse({ error: "Could not look up the order." }, 500);
  }
  const order = orderRows?.[0];
  if (!order || order.stripe_session_id !== sessionId) {
    return jsonResponse({ error: "Stripe session does not match an order." }, 400);
  }

  let update: Record<string, unknown> | null = null;
  if (
    (event.type === "checkout.session.completed" ||
      event.type === "checkout.session.async_payment_succeeded") &&
    session.payment_status === "paid"
  ) {
    if (
      session.amount_total !== order.subtotal_cents ||
      session.currency?.toLowerCase() !== order.currency.toLowerCase()
    ) {
      console.error("Stripe payment total does not match order:", orderId);
      return jsonResponse({ error: "Stripe payment total does not match the order." }, 400);
    }
    const paymentIntent = session.payment_intent;
    update = {
      status: "paid",
      stripe_session_id: sessionId,
      stripe_payment_intent_id:
        typeof paymentIntent === "string" ? paymentIntent : paymentIntent?.id ?? null,
      customer_email: session.customer_details?.email ?? null,
      shipping_details: session.shipping_details ?? null,
      paid_at: new Date().toISOString(),
    };
  } else if (event.type === "checkout.session.expired") {
    if (order.status === "paid") return jsonResponse({ received: true });
    update = { status: "cancelled", stripe_session_id: sessionId };
  }

  if (!update) return jsonResponse({ received: true });

  try {
    await databaseRequest(
      `orders?id=eq.${encodeURIComponent(orderId)}`,
      {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify(update),
      },
    );
  } catch (error) {
    console.error("Could not update order from Stripe webhook:", error);
    return jsonResponse({ error: "Could not update the order." }, 500);
  }

  return jsonResponse({ received: true });
});
