"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { Assignment } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

type StatusFilter = "active" | "archived" | "all";

const emptyForm = { title: "", description: "", due_date: "", max_score: "100" };

export default function AssignmentsPage() {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadAssignments() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("archived", statusFilter === "all" ? "all" : statusFilter === "archived" ? "true" : "false");
    apiFetch<Paginated<Assignment> | Assignment[]>(`/teachers/me/assignments/?${params}`)
      .then((data) => setAssignments(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(loadAssignments, [search, statusFilter]);

  function openEdit(a: Assignment) {
    setEditing(a);
    setForm({
      title: a.title,
      description: a.description,
      due_date: a.due_date ? a.due_date.slice(0, 16) : "",
      max_score: String(a.max_score),
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/assignments/${editing.id}/`, {
        method: "PATCH",
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
          max_score: Number(form.max_score),
        }),
      });
      setModalOpen(false);
      loadAssignments();
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setError(Object.values(err.body as Record<string, string[]>)[0]?.[0] ?? "Could not save assignment.");
      } else {
        setError("Could not save assignment.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchive(a: Assignment) {
    try {
      await apiFetch(`/assignments/${a.id}/`, { method: "PATCH", body: JSON.stringify({ is_archived: !a.is_archived }) });
      loadAssignments();
    } catch {
      setError("Could not update assignment status.");
    }
  }

  function formatDate(iso: string | null) {
    if (!iso) return "—";
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 fw-bold mb-0">My Assignments</h1>
        <Link href="/teacher/dashboard" className="btn es-btn-primary text-white">
          + New Assignment
        </Link>
      </div>
      <p className="text-muted small mb-3">
        To create a new assignment, open one of your classes from the Dashboard — this keeps
        assignments correctly tied to the right subject and class.
      </p>

      <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search by title or subject…"
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
      ) : assignments.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No assignments found.</div>
      ) : (
        <>
          <div className="es-card bg-white p-0 d-none d-md-block overflow-hidden">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Title</th>
                  <th>Subject</th>
                  <th>Class</th>
                  <th>Due Date</th>
                  <th>Submissions</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => (
                  <tr key={a.id}>
                    <td>{a.title}</td>
                    <td>{a.subject_name ?? "—"}</td>
                    <td>{a.class_name ?? "—"}</td>
                    <td>{formatDate(a.due_date)}</td>
                    <td>{a.submission_count}</td>
                    <td>
                      {a.is_archived ? (
                        <span className="badge bg-secondary">Archived</span>
                      ) : a.is_past_due ? (
                        <span className="badge text-white" style={{ backgroundColor: "var(--es-warning)" }}>Past Due</span>
                      ) : (
                        <span className="badge text-white" style={{ backgroundColor: "var(--es-success)" }}>Active</span>
                      )}
                    </td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-secondary me-2" onClick={() => openEdit(a)}>Edit</button>
                      <button
                        type="button"
                        className={`btn btn-sm ${a.is_archived ? "btn-outline-success" : "btn-outline-danger"}`}
                        onClick={() => toggleArchive(a)}
                      >
                        {a.is_archived ? "Restore" : "Archive"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none d-flex flex-column gap-2">
            {assignments.map((a) => (
              <div key={a.id} className="es-card bg-white p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{a.title}</div>
                    <div className="text-muted small">{a.subject_name} — {a.class_name}</div>
                  </div>
                  {a.is_archived ? (
                    <span className="badge bg-secondary">Archived</span>
                  ) : a.is_past_due ? (
                    <span className="badge text-white" style={{ backgroundColor: "var(--es-warning)" }}>Past Due</span>
                  ) : (
                    <span className="badge text-white" style={{ backgroundColor: "var(--es-success)" }}>Active</span>
                  )}
                </div>
                <div className="d-flex justify-content-between small text-muted mb-2">
                  <span>Due {formatDate(a.due_date)}</span>
                  <span>{a.submission_count} submissions</span>
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => openEdit(a)}>Edit</button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-fill ${a.is_archived ? "btn-outline-success" : "btn-outline-danger"}`}
                    onClick={() => toggleArchive(a)}
                  >
                    {a.is_archived ? "Restore" : "Archive"}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && editing && (
        <Modal title={`Edit — ${editing.subject_name} (${editing.class_name})`} onClose={() => setModalOpen(false)}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Title</label>
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Description</label>
              <textarea
                className="form-control"
                rows={3}
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              />
            </div>
            <div className="row g-3 mb-4">
              <div className="col-7">
                <label className="form-label small fw-semibold">Due date</label>
                <input
                  type="datetime-local"
                  className="form-control"
                  value={form.due_date}
                  onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))}
                />
              </div>
              <div className="col-5">
                <label className="form-label small fw-semibold">Max score</label>
                <input
                  type="number"
                  min={1}
                  className="form-control"
                  value={form.max_score}
                  onChange={(e) => setForm((f) => ({ ...f, max_score: e.target.value }))}
                  required
                />
              </div>
            </div>
            <button type="submit" className="btn es-btn-primary text-white w-100" disabled={saving}>
              {saving ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
