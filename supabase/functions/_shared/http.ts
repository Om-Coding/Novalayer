const defaultOrigins = [
  "https://om-coding.github.io",
  "http://localhost:5173",
  "http://127.0.0.1:5173",
];

export function isAllowedOrigin(origin: string | null): boolean {
  if (!origin) return true;
  const allowedOrigins = (Deno.env.get("ALLOWED_ORIGINS") ?? defaultOrigins.join(","))
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  return allowedOrigins.includes(origin);
}

export function jsonResponse(
  request: Request,
  body: Record<string, unknown>,
  status = 200,
): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Cache-Control": "no-store",
  });
  const origin = request.headers.get("Origin");
  if (origin && isAllowedOrigin(origin)) {
    headers.set("Access-Control-Allow-Origin", origin);
    headers.set("Vary", "Origin");
  }
  headers.set("Access-Control-Allow-Headers", "authorization, x-client-info, apikey, content-type");
  headers.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  return new Response(JSON.stringify(body), { status, headers });
}

export function originError(request: Request): Response | null {
  if (!isAllowedOrigin(request.headers.get("Origin"))) {
    return jsonResponse(request, { error: "This website is not allowed to start checkout." }, 403);
  }
  return null;
}
