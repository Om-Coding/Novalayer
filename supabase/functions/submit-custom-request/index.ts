import { databaseRequest } from "../_shared/database.ts";
import { jsonResponse, originError } from "../_shared/http.ts";

type CustomRequestBody = {
  customer_name?: unknown;
  contact?: unknown;
  idea_description?: unknown;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

Deno.serve(async (request) => {
  const rejectedOrigin = originError(request);
  if (rejectedOrigin) return rejectedOrigin;
  if (request.method === "OPTIONS") {
    return jsonResponse(request, {});
  }
  if (request.method !== "POST") {
    return jsonResponse(request, { error: "Use POST to send a custom print request." }, 405);
  }

  let body: CustomRequestBody;
  try {
    const payload = await request.text();
    if (new TextEncoder().encode(payload).length > 6000) {
      return jsonResponse(request, { error: "Your request is too large." }, 413);
    }
    body = JSON.parse(payload);
  } catch {
    return jsonResponse(request, { error: "Enter your request details and try again." }, 400);
  }
  if (!isRecord(body)) {
    return jsonResponse(request, { error: "Enter your request details and try again." }, 400);
  }

  const customerName =
    typeof body.customer_name === "string" ? body.customer_name.trim() : "";
  const contact = typeof body.contact === "string" ? body.contact.trim() : "";
  const ideaDescription =
    typeof body.idea_description === "string" ? body.idea_description.trim() : "";

  if (customerName.length < 1 || customerName.length > 100) {
    return jsonResponse(request, { error: "Enter a name between 1 and 100 characters." }, 400);
  }
  if (contact.length < 2 || contact.length > 200) {
    return jsonResponse(request, { error: "Enter a contact method between 2 and 200 characters." }, 400);
  }
  if (ideaDescription.length < 10 || ideaDescription.length > 3000) {
    return jsonResponse(request, { error: "Describe your idea in 10 to 3,000 characters." }, 400);
  }

  try {
    await databaseRequest("custom_requests", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        customer_name: customerName,
        contact,
        idea_description: ideaDescription,
      }),
    });
    return jsonResponse(request, { success: true }, 201);
  } catch (error) {
    console.error("Could not save custom print request:", error);
    return jsonResponse(
      request,
      { error: "We couldn't save your idea right now. Please try again in a moment." },
      500,
    );
  }
});
