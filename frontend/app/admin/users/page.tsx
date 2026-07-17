"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { Role, UserProfile } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

const emptyForm = {
  role: "student" as Role,
  full_name: "",
  email: "",
  matric_number: "",
  staff_id: "",
  department: "",
  password: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetResult, setResetResult] = useState<{ user: UserProfile; password: string } | null>(null);

  function loadUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("is_active", statusFilter);
    apiFetch<Paginated<UserProfile> | UserProfile[]>(`/admin/users/?${params}`)
      .then((data) => setUsers(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(loadUsers, [search, roleFilter, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(u: UserProfile) {
    setEditing(u);
    setForm({
      role: u.role,
      full_name: u.full_name,
      email: u.email,
      matric_number: u.matric_number ?? "",
      staff_id: u.staff_id ?? "",
      department: u.department ?? "",
      password: "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiFetch(`/admin/users/${editing.id}/`, {
          method: "PATCH",
          body: JSON.stringify({
            full_name: form.full_name,
            email: form.email,
            matric_number: form.matric_number || null,
            staff_id: form.staff_id || null,
            department: form.department || null,
          }),
        });
      } else {
        await apiFetch("/admin/users/", { method: "POST", body: JSON.stringify(form) });
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setError(Object.values(err.body as Record<string, string[]>)[0]?.[0] ?? "Could not save user.");
      } else {
        setError("Could not save user.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleActive(u: UserProfile) {
    try {
      await apiFetch(`/admin/users/${u.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_active: !u.is_active }),
      });
      loadUsers();
    } catch {
      setError("Could not update account status.");
    }
  }

  async function resetPassword(u: UserProfile) {
    try {
      const res = await apiFetch<{ generated_password: string }>(`/admin/users/${u.id}/reset-password/`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      setResetResult({ user: u, password: res.generated_password });
    } catch {
      setError("Could not reset password.");
    }
  }

  const roleLabel: Record<Role, string> = { student: "Student", lecturer: "Lecturer", admin: "Admin" };

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 fw-bold mb-0">User Management</h1>
        <button type="button" className="btn es-btn-primary text-white" onClick={openCreate}>
          + New User
        </button>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search name, email, matric/staff ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 160 }}
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as Role | "")}
        >
          <option value="">All roles</option>
          <option value="student">Student</option>
          <option value="lecturer">Lecturer</option>
          <option value="admin">Admin</option>
        </select>
        <select
          className="form-select"
          style={{ maxWidth: 160 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as "" | "true" | "false")}
        >
          <option value="">All statuses</option>
          <option value="true">Active</option>
          <option value="false">Inactive</option>
        </select>
      </div>

      {error && !modalOpen && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : users.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No users found.</div>
      ) : (
        <>
          <div className="es-card bg-white p-0 d-none d-md-block overflow-hidden">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>ID</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name}</td>
                    <td>{u.email}</td>
                    <td>{roleLabel[u.role]}</td>
                    <td>{u.matric_number ?? u.staff_id ?? "—"}</td>
                    <td>
                      {u.is_active ? (
                        <span className="badge text-white" style={{ backgroundColor: "var(--es-success)" }}>
                          Active
                        </span>
                      ) : (
                        <span className="badge bg-secondary">Inactive</span>
                      )}
                    </td>
                    <td className="text-end text-nowrap">
                      <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(u)}>
                        Edit
                      </button>
                      <button type="button" className="btn btn-sm btn-outline-primary me-2" onClick={() => resetPassword(u)}>
                        Reset Password
                      </button>
                      <button
                        type="button"
                        className={`btn btn-sm ${u.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                        onClick={() => toggleActive(u)}
                      >
                        {u.is_active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none d-flex flex-column gap-2">
            {users.map((u) => (
              <div key={u.id} className="es-card bg-white p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{u.full_name}</div>
                    <div className="text-muted small">{u.email}</div>
                    <div className="text-muted small">
                      {roleLabel[u.role]} · {u.matric_number ?? u.staff_id ?? "—"}
                    </div>
                  </div>
                  {u.is_active ? (
                    <span className="badge text-white" style={{ backgroundColor: "var(--es-success)" }}>
                      Active
                    </span>
                  ) : (
                    <span className="badge bg-secondary">Inactive</span>
                  )}
                </div>
                <div className="d-flex flex-wrap gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => openEdit(u)}>
                    Edit
                  </button>
                  <button type="button" className="btn btn-sm btn-outline-primary flex-fill" onClick={() => resetPassword(u)}>
                    Reset Password
                  </button>
                  <button
                    type="button"
                    className={`btn btn-sm w-100 ${u.is_active ? "btn-outline-danger" : "btn-outline-success"}`}
                    onClick={() => toggleActive(u)}
                  >
                    {u.is_active ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit User" : "New User"} onClose={() => setModalOpen(false)}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            {!editing && (
              <div className="mb-3">
                <label className="form-label small fw-semibold">Role</label>
                <select
                  className="form-select"
                  value={form.role}
                  onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                >
                  <option value="student">Student</option>
                  <option value="lecturer">Lecturer</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-semibold">Full name</label>
              <input
                className="form-control"
                value={form.full_name}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Email</label>
              <input
                type="email"
                className="form-control"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </div>

            {form.role === "student" ? (
              <div className="mb-3">
                <label className="form-label small fw-semibold">Matric number</label>
                <input
                  className="form-control"
                  value={form.matric_number}
                  onChange={(e) => setForm((f) => ({ ...f, matric_number: e.target.value }))}
                  required
                />
              </div>
            ) : (
              <div className="mb-3">
                <label className="form-label small fw-semibold">Staff ID</label>
                <input
                  className="form-control"
                  value={form.staff_id}
                  onChange={(e) => setForm((f) => ({ ...f, staff_id: e.target.value }))}
                  required
                />
              </div>
            )}

            <div className="mb-3">
              <label className="form-label small fw-semibold">Department</label>
              <input
                className="form-control"
                value={form.department}
                onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
              />
            </div>

            {!editing && (
              <div className="mb-4">
                <label className="form-label small fw-semibold">Password</label>
                <input
                  type="password"
                  className="form-control"
                  value={form.password}
                  onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  required
                />
              </div>
            )}

            <button type="submit" className="btn es-btn-primary text-white w-100" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create User"}
            </button>
          </form>
        </Modal>
      )}

      {resetResult && (
        <Modal title="Password Reset" onClose={() => setResetResult(null)}>
          <p className="small text-muted">
            New password for <strong>{resetResult.user.full_name}</strong> — share this with
            them securely, it won&apos;t be shown again:
          </p>
          <div className="es-card bg-light p-3 text-center mb-3">
            <code style={{ fontSize: "1.1rem" }}>{resetResult.password}</code>
          </div>
          <button type="button" className="btn es-btn-primary text-white w-100" onClick={() => setResetResult(null)}>
            Done
          </button>
        </Modal>
      )}
    </div>
  );
}
