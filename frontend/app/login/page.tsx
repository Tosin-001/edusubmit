"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import { saveTokens, setRoleCookie } from "@/lib/auth";
import type { Role } from "@/lib/types";

interface LoginResponse {
  access: string;
  refresh: string;
  role: Role;
  full_name: string;
}

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const data = await apiFetch<LoginResponse>("/auth/login/", {
        method: "POST",
        auth: false,
        body: JSON.stringify({ email, password }),
      });
      saveTokens({ access: data.access, refresh: data.refresh });
      setRoleCookie(data.role);
      router.push(`/${data.role}/dashboard`);
    } catch (err) {
      if (err instanceof ApiError) {
        setError("Invalid email or password.");
      } else {
        setError("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3">
      <div className="es-card bg-white p-4 p-md-5" style={{ maxWidth: 420, width: "100%" }}>
        <h1 className="h4 fw-bold mb-1">Welcome back</h1>
        <p className="text-muted mb-4">Sign in to EduSubmit</p>

        {error && <div className="alert alert-danger py-2">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn es-btn-primary text-white w-100" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>

        <p className="text-center small text-muted mt-4 mb-0">
          Student? <Link href="/register">Create an account</Link>
        </p>
      </div>
    </div>
  );
}
