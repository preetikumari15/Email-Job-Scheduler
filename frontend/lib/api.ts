export const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";
export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  const r = await fetch(`${API}${path}`, {
    ...init,
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(init?.headers || {}) },
  });
  if (!r.ok)
    throw new Error(
      (await r.json().catch(() => ({ error: r.statusText }))).error,
    );
  return r.json();
}
