"use client";

import { use, useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { Assignment, TeacherAssignment } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

const emptyForm = { title: "", description: "", due_date: "", max_score: "100" };

export default function TeacherClassPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);

  const [ta, setTa] = useState<TeacherAssignment | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Assignment | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadAssignments() {
    apiFetch<Paginated<Assignment> | Assignment[]>(`/assignments/?teacher_assignment=${id}&archived=all`)
      .then((data) => setAssignments(unwrap(data)));
  }

  useEffect(() => {
    setLoading(true);
    Promise.all([
      apiFetch<Paginated<TeacherAssignment> | TeacherAssignment[]>("/teachers/me/assignments-taught/"),
      apiFetch<Paginated<Assignment> | Assignment[]>(`/assignments/?teacher_assignment=${id}&archived=all`),
    ])
      .then(([taData, assignData]) => {
        const mine = unwrap(taData).find((t) => String(t.id) === id) ?? null;
        setTa(mine);
        setAssignments(unwrap(assignData));
      })
      .finally(() => setLoading(false));
  }, [id]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

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
    setSaving(true);
    setError(null);
    const basePayload = {
      title: form.title,
      description: form.description,
      due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
      max_score: Number(form.max_score),
    };
    try {
      if (editing) {
        await apiFetch(`/assignments/${editing.id}/`, { method: "PATCH", body: JSON.stringify(basePayload) });
      } else {
        // No Subject/Class picker — teacher_assignment comes from the URL, not a dropdown.
        await apiFetch("/assignments/", {
          method: "POST",
          body: JSON.stringify({ ...basePayload, teacher_assignment: Number(id) }),
        });
      }
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
      await apiFetch(`/assignments/${a.id}/`, {
        method: "PATCH",
        body: JSON.stringify({ is_archived: !a.is_archived }),
      });
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

  if (loading) return <div className="text-muted">Loading…</div>;
  if (!ta) {
    return (
      <div className="es-card bg-white p-4 text-muted small">
        This class assignment wasn&apos;t found, or isn&apos;t yours.
      </div>
    );
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <div>
          <h1 className="h4 fw-bold mb-0">{ta.subject_name}</h1>
          <div className="text-muted">{ta.class_name}</div>
        </div>
        <button type="button" className="btn es-btn-primary text-white" onClick={openCreate}>
          + Create Assignment
        </button>
      </div>

      {error && !modalOpen && <div className="alert alert-danger py-2">{error}</div>}

      {assignments.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">
          No assignments yet for {ta.subject_name} — {ta.class_name}.
        </div>
      ) : (
        <div className="d-flex flex-column gap-2">
          {assignments.map((a) => (
            <div key={a.id} className="es-card bg-white p-3 d-flex justify-content-between align-items-center flex-wrap gap-2">
              <div>
                <div className="fw-semibold">
                  {a.title}
                  {a.is_archived && <span className="badge bg-secondary ms-2">Archived</span>}
                </div>
                <div className="text-muted small">
                  Due {formatDate(a.due_date)} · {a.submission_count} submissions
                </div>
              </div>
              <div className="d-flex gap-2">
                <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(a)}>
                  Edit
                </button>
                <button
                  type="button"
                  className={`btn btn-sm ${a.is_archived ? "btn-outline-success" : "btn-outline-danger"}`}
                  onClick={() => toggleArchive(a)}
                >
                  {a.is_archived ? "Restore" : "Archive"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Assignment" : `New Assignment — ${ta.subject_name} (${ta.class_name})`} onClose={() => setModalOpen(false)}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Assignment Title</label>
              <input
                className="form-control"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Instructions</label>
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
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Assignment"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
