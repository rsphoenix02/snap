const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

interface ApiEnvelope<T = unknown> {
  data: T | null;
  error: string | null;
}

let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  try {
    const res = await fetch(`${API_URL}/api/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return null;
    const json: ApiEnvelope<{ access_token: string }> = await res.json();
    return json.data?.access_token ?? null;
  } catch {
    return null;
  }
}

export async function apiFetch<T = unknown>(
  path: string,
  options: RequestInit & { token?: string | null; onTokenRefreshed?: (token: string) => void } = {},
): Promise<ApiEnvelope<T>> {
  const { token, onTokenRefreshed, ...fetchOptions } = options;

  const headers = new Headers(fetchOptions.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(`${API_URL}${path}`, {
    ...fetchOptions,
    headers,
    credentials: "include",
  });

  if (res.status === 401 && token) {
    // Attempt silent refresh (deduplicated)
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken();
    }
    const newToken = await refreshPromise;
    refreshPromise = null;

    if (newToken) {
      onTokenRefreshed?.(newToken);
      headers.set("Authorization", `Bearer ${newToken}`);
      const retryRes = await fetch(`${API_URL}${path}`, {
        ...fetchOptions,
        headers,
        credentials: "include",
      });
      return retryRes.json();
    }

    // Refresh failed — redirect to login
    if (typeof window !== "undefined") {
      window.location.href = "/login";
    }
    return { data: null, error: "Session expired" };
  }

  return res.json();
}
