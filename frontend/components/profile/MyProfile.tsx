"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import type { UserProfile } from "@/lib/types";

/**
 * Read-only profile info + a change-password form. Name/email/matric-or-staff
 * ID/department are Admin-assigned and cannot be edited here by design —
 * see backend/accounts/views.py MeView docstring. Password is the one thing
 * a user can change about their own account.
 */
export default function MyProfile({
  endpoint,
  idLabel,
}: {
  endpoint: "/students/me/" | "/lecturers/me/";
  idLabel: "Matric Number" | "Staff ID";
}) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const [pwForm, setPwForm] = useState({ old_password: "", new_password: "", confirm_password: "" });
  const [pwError, setPwError] = useState<string | null>(null);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSuccess, setPwSuccess] = useState(false);

  useEffect(() => {
    apiFetch<UserProfile>(endpoint).then(setProfile).finally(() => setLoading(false));
  }, [endpoint]);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setPwError(null);
    setPwSuccess(false);
    if (pwForm.new_password !== pwForm.confirm_password) {
      setPwError("New passwords do not match.");
      return;
    }
    setPwSaving(true);
    try {
      await apiFetch("/auth/change-password/", {
        method: "POST",
        body: JSON.stringify({ old_password: pwForm.old_password, new_password: pwForm.new_password }),
      });
      setPwSuccess(true);
      setPwForm({ old_password: "", new_password: "", confirm_password: "" });
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setPwError(Object.values(err.body as Record<string, string[]>)[0]?.[0] ?? "Could not change password.");
      } else {
        setPwError("Could not change password.");
      }
    } finally {
      setPwSaving(false);
    }
  }

  if (loading) return <div className="text-muted">Loading…</div>;
  if (!profile) return <div className="es-card bg-white p-4 text-muted small">Could not load profile.</div>;

  const idValue = idLabel === "Matric Number" ? profile.matric_number : profile.staff_id;

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">My Profile</h1>

      <div className="es-card bg-white p-4 mb-3">
        <div className="d-flex justify-content-between align-items-start mb-3">
          <h2 className="h6 fw-bold mb-0">Account Information</h2>
          <span className="badge bg-secondary">Set by Admin</span>
        </div>
        <div className="row g-3">
          <div className="col-sm-6">
            <div className="text-muted small">Full Name</div>
            <div className="fw-semibold">{profile.full_name}</div>
          </div>
          <div className="col-sm-6">
            <div className="text-muted small">Email</div>
            <div className="fw-semibold">{profile.email}</div>
          </div>
          <div className="col-sm-6">
            <div className="text-muted small">{idLabel}</div>
            <div className="fw-semibold">{idValue ?? "—"}</div>
          </div>
          <div className="col-sm-6">
            <div className="text-muted small">Department</div>
            <div className="fw-semibold">{profile.department ?? "—"}</div>
          </div>
        </div>
        <p className="text-muted small mt-3 mb-0">
          These details are managed by your administrator. If anything here needs to change,
          contact them directly.
        </p>
      </div>

      <div className="es-card bg-white p-4" style={{ maxWidth: 480 }}>
        <h2 className="h6 fw-bold mb-3">Change Password</h2>
        {pwSuccess && <div className="alert alert-success py-2">Password updated.</div>}
        {pwError && <div className="alert alert-danger py-2">{pwError}</div>}
        <form onSubmit={handleChangePassword}>
          <div className="mb-3">
            <label className="form-label small fw-semibold">Current password</label>
            <input
              type="password"
              className="form-control"
              value={pwForm.old_password}
              onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))}
              required
            />
          </div>
          <div className="mb-3">
            <label className="form-label small fw-semibold">New password</label>
            <input
              type="password"
              className="form-control"
              value={pwForm.new_password}
              onChange={(e) => setPwForm((f) => ({ ...f, new_password: e.target.value }))}
              required
            />
          </div>
          <div className="mb-4">
            <label className="form-label small fw-semibold">Confirm new password</label>
            <input
              type="password"
              className="form-control"
              value={pwForm.confirm_password}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm_password: e.target.value }))}
              required
            />
          </div>
          <button type="submit" className="btn es-btn-primary text-white w-100" disabled={pwSaving}>
            {pwSaving ? "Updating…" : "Update Password"}
          </button>
        </form>
      </div>
    </div>
  );
}
