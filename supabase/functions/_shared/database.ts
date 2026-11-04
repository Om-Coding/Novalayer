const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error("Supabase server credentials are not configured.");
}

export async function databaseRequest<T>(
  path: string,
  init: RequestInit = {},
): Promise<T | undefined> {
  const headers = new Headers(init.headers);
  headers.set("apikey", serviceRoleKey);
  headers.set("Authorization", `Bearer ${serviceRoleKey}`);
  headers.set("Content-Type", "application/json");
  const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
    ...init,
    headers,
  });
  const responseBody = await response.text();

  if (!response.ok) {
    throw new Error(`Supabase database request failed (${response.status}): ${responseBody}`);
  }

  if (!responseBody) return undefined;
  return JSON.parse(responseBody) as T;
}
