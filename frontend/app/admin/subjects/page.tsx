"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { Subject } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

type StatusFilter = "active" | "archived" | "all";
const emptyForm = { name: "", code: "" };

export default function AdminSubjectsPage() {
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Subject | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadSubjects() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("archived", statusFilter === "all" ? "all" : statusFilter === "archived" ? "true" : "false");
    apiFetch<Paginated<Subject> | Subject[]>(`/admin/subjects/?${params}`)
      .then((data) => setSubjects(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(loadSubjects, [search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(s: Subject) {
    setEditing(s);
    setForm({ name: s.name, code: s.code ?? "" });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = { name: form.name, code: form.code || null };
    try {
      if (editing) {
        await apiFetch(`/admin/subjects/${editing.id}/`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/admin/subjects/", { method: "POST", body: JSON.stringify(payload) });
      }
      setModalOpen(false);
      loadSubjects();
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setError(Object.values(err.body as Record<string, string[]>)[0]?.[0] ?? "Could not save subject.");
      } else {
        setError("Could not save subject.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchive(s: Subject) {
    try {
      await apiFetch(`/admin/subjects/${s.id}/`, { method: "PATCH", body: JSON.stringify({ is_archived: !s.is_archived }) });
      loadSubjects();
    } catch {
      setError("Could not update subject status.");
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 fw-bold mb-0">Subject Management</h1>
        <button type="button" className="btn es-btn-primary text-white" onClick={openCreate}>
          + New Subject
        </button>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search by name or code…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
      </div>

      {error && !modalOpen && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : subjects.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No subjects found.</div>
      ) : (
        <>
          <div className="es-card bg-white p-0 d-none d-md-block overflow-hidden">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {subjects.map((s) => (
                  <tr key={s.id}>
                    <td className="fw-semibold">{s.name}</td>
                    <td>{s.code ?? "—"}</td>
                    <td>
                      {s.is_archived ? (
                        <span className="badge bg-secondary">Archived</span>
                      ) : (
                        <span className="badge text-white" style={{ backgroundColor: "var(--es-success)" }}>Active</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(s)}>Edit</button>
                      <button
                        type="button"
                        className={`btn btn-sm ${s.is_archived ? "btn-outline-success" : "btn-outline-danger"}`}
                        onClick={() => toggleArchive(s)}
                      >
                        {s.is_archived ? "Restore" : "Archive"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none d-flex flex-column gap-2">
            {subjects.map((s) => (
              <div key={s.id} className="es-card bg-white p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{s.name}</div>
                    <div className="small text-muted">{s.code ?? "—"}</div>
                  </div>
                  {s.is_archived ? (
                    <span className="badge bg-secondary">Archived</span>
                  ) : (
                    <span className="badge text-white" style={{ backgroundColor: "var(--es-success)" }}>Active</span>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => openEdit(s)}>Edit</button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-fill ${s.is_archived ? "btn-outline-success" : "btn-outline-danger"}`}
                    onClick={() => toggleArchive(s)}
                  >
                    {s.is_archived ? "Restore" : "Archive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Subject" : "New Subject"} onClose={() => setModalOpen(false)}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Subject name</label>
              <input
                className="form-control"
                placeholder="e.g. Mathematics"
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                required
              />
            </div>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Code (optional)</label>
              <input
                className="form-control"
                placeholder="e.g. MTH"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
              />
            </div>
            <button type="submit" className="btn es-btn-primary text-white w-100" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Subject"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
