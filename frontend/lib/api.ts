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


/**
 * Multipart upload with real progress reporting (fetch has no upload
 * progress event, so this uses XHR). Attaches the JWT and retries once on
 * 401 via refresh, same as apiFetch.
 */
export function uploadWithProgress<T>(
  path: string,
  formData: FormData,
  onProgress: (percent: number) => void
): Promise<T> {
  const doUpload = (token: string | null) =>
    new Promise<{ status: number; body: unknown }>((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open("POST", `${API_BASE}${path}`);
      if (token) xhr.setRequestHeader("Authorization", `Bearer ${token}`);
      xhr.upload.onprogress = (e) => {
        if (e.lengthComputable) onProgress(Math.round((e.loaded / e.total) * 100));
      };
      xhr.onload = () => {
        let body: unknown = null;
        try {
          body = JSON.parse(xhr.responseText);
        } catch {
          /* no JSON body */
        }
        resolve({ status: xhr.status, body });
      };
      xhr.onerror = () => reject(new Error("Network error during upload."));
      xhr.send(formData);
    });

  return (async () => {
    let token = getAccessToken();
    let { status, body } = await doUpload(token);

    if (status === 401) {
      refreshingPromise ??= refreshAccessToken().finally(() => {
        refreshingPromise = null;
      });
      token = await refreshingPromise;
      if (!token) {
        clearTokens();
        clearRoleCookie();
        if (typeof window !== "undefined") window.location.href = "/login";
        throw new ApiError(401, body);
      }
      ({ status, body } = await doUpload(token));
    }

    if (status < 200 || status >= 300) throw new ApiError(status, body);
    return body as T;
  })();
}


/**
 * Downloads a protected file (needs the JWT header, so a plain <a href>
 * won't work) and triggers a browser save via a temporary object URL.
 */
export async function downloadFile(path: string, filename: string): Promise<void> {
  const token = getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
  if (!res.ok) throw new ApiError(res.status, null);
  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
