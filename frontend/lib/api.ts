import { clearRoleCookie, clearTokens, getAccessToken, getRefreshToken, saveTokens } from "./auth";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api/v1";

export class ApiError extends Error {
  status: number;
  body: unknown;
  constructor(status: number, body: unknown) {
    super(typeof body === "string" ? body : JSON.stringify(body));
    this.status = status;
    this.body = body;
  }
}

let refreshingPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshToken();
  if (!refresh) return null;
  const res = await fetch(`${API_BASE}/auth/refresh/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh }),
  });
  if (!res.ok) return null;
  const data = await res.json();
  saveTokens({ access: data.access, refresh });
  return data.access as string;
}

interface RequestOptions extends RequestInit {
  auth?: boolean; // default true — attach Bearer token
}

/**
 * Typed fetch wrapper. Attaches the JWT, retries once on 401 via refresh,
 * and throws ApiError (with parsed body) on any non-2xx response.
 */
export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { auth = true, headers, ...rest } = options;
  const isFormData = rest.body instanceof FormData;

  const doFetch = async (token: string | null) => {
    const finalHeaders: HeadersInit = {
      ...(isFormData ? {} : { "Content-Type": "application/json" }),
      ...(auth && token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    };
    return fetch(`${API_BASE}${path}`, { ...rest, headers: finalHeaders });
  };

  let token = auth ? getAccessToken() : null;
  let res = await doFetch(token);

  if (res.status === 401 && auth) {
    refreshingPromise ??= refreshAccessToken().finally(() => {
      refreshingPromise = null;
    });
    token = await refreshingPromise;
    if (token) {
      res = await doFetch(token);
    } else {
      clearTokens();
      clearRoleCookie();
      if (typeof window !== "undefined") window.location.href = "/login";
    }
  }

  if (!res.ok) {
    let body: unknown = null;
    try {
      body = await res.json();
    } catch {
      /* no JSON body */
    }
    throw new ApiError(res.status, body);
  }

  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}
