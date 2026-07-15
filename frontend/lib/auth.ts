"use client";

import type { AuthTokens, AuthUser, Role } from "./types";

/**
 * Token storage + decode. Access/refresh tokens live in localStorage.
 * This is a client-only module ("use client") — never import it from
 * a Server Component.
 */

const ACCESS_KEY = "edusubmit_access";
const REFRESH_KEY = "edusubmit_refresh";

export function saveTokens(tokens: AuthTokens) {
  localStorage.setItem(ACCESS_KEY, tokens.access);
  localStorage.setItem(REFRESH_KEY, tokens.refresh);
}

export function getAccessToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ACCESS_KEY);
}

export function getRefreshToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function clearTokens() {
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
}

/**
 * Decode the JWT payload (no signature verification — this is just to read
 * the `role`/`full_name` claims client-side for UI routing). The backend is
 * the actual security boundary: every API call re-validates the token and
 * the user's role via DRF permission classes.
 */
export function decodeAccessToken(token: string): AuthUser & { exp: number } {
  const payload = token.split(".")[1];
  const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
  return JSON.parse(json);
}

export function getCurrentUser(): AuthUser | null {
  const token = getAccessToken();
  if (!token) return null;
  try {
    const { role, full_name } = decodeAccessToken(token);
    return { role, full_name };
  } catch {
    return null;
  }
}

/**
 * A lightweight, readable-by-middleware cookie so `middleware.ts` can do
 * fast route gating (UX only — not the security boundary, see above).
 */
export function setRoleCookie(role: Role) {
  document.cookie = `edusubmit_role=${role}; path=/; samesite=lax`;
}

export function clearRoleCookie() {
  document.cookie = "edusubmit_role=; path=/; max-age=0";
}
