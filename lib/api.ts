const API_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function apiRequest(
  endpoint: string,
  method = "GET",
  body?: any,
  options?: { authToken?: string }
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (options?.authToken) {
    headers.authorization = `Bearer ${options.authToken}`;
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}