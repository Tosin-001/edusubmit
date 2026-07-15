"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    matric_number: "",
    email: "",
    password: "",
    confirm_password: "",
  });
  const [errors, setErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  function update(field: keyof typeof form, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors({});
    setLoading(true);
    try {
      await apiFetch("/auth/register/student/", {
        method: "POST",
        auth: false,
        body: JSON.stringify(form),
      });
      router.push("/login?registered=1");
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setErrors(err.body as Record<string, string[]>);
      } else {
        setErrors({ non_field_errors: ["Something went wrong. Please try again."] });
      }
    } finally {
      setLoading(false);
    }
  }

  function fieldError(name: string) {
    return errors[name]?.[0];
  }

  return (
    <div className="d-flex align-items-center justify-content-center min-vh-100 px-3 py-5">
      <div className="es-card bg-white p-4 p-md-5" style={{ maxWidth: 460, width: "100%" }}>
        <h1 className="h4 fw-bold mb-1">Create your student account</h1>
        <p className="text-muted mb-4">Register to start submitting assignments</p>

        {errors.non_field_errors && (
          <div className="alert alert-danger py-2">{errors.non_field_errors[0]}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Full name</label>
            <input
              className="form-control"
              value={form.full_name}
              onChange={(e) => update("full_name", e.target.value)}
              required
            />
            {fieldError("full_name") && <div className="text-danger small">{fieldError("full_name")}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Matric number</label>
            <input
              className="form-control"
              value={form.matric_number}
              onChange={(e) => update("matric_number", e.target.value)}
              required
            />
            {fieldError("matric_number") && (
              <div className="text-danger small">{fieldError("matric_number")}</div>
            )}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Email</label>
            <input
              type="email"
              className="form-control"
              value={form.email}
              onChange={(e) => update("email", e.target.value)}
              required
            />
            {fieldError("email") && <div className="text-danger small">{fieldError("email")}</div>}
          </div>

          <div className="mb-3">
            <label className="form-label small fw-semibold">Password</label>
            <input
              type="password"
              className="form-control"
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
              required
            />
            {fieldError("password") && <div className="text-danger small">{fieldError("password")}</div>}
          </div>

          <div className="mb-4">
            <label className="form-label small fw-semibold">Confirm password</label>
            <input
              type="password"
              className="form-control"
              value={form.confirm_password}
              onChange={(e) => update("confirm_password", e.target.value)}
              required
            />
            {fieldError("confirm_password") && (
              <div className="text-danger small">{fieldError("confirm_password")}</div>
            )}
          </div>

          <button type="submit" className="btn es-btn-primary text-white w-100" disabled={loading}>
            {loading ? "Creating account…" : "Create account"}
          </button>
        </form>

        <p className="text-center small text-muted mt-4 mb-0">
          Already have an account? <Link href="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
