"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { SchoolClass, Subject, TeacherAssignment, UserProfile } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

const emptyForm = { teacher: "", subject: "", school_class: "" };

export default function AdminTeacherAssignmentsPage() {
  const [assignments, setAssignments] = useState<TeacherAssignment[]>([]);
  const [teachers, setTeachers] = useState<UserProfile[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadAssignments() {
    setLoading(true);
    apiFetch<Paginated<TeacherAssignment> | TeacherAssignment[]>("/admin/teacher-assignments/")
      .then((data) => setAssignments(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    apiFetch<Paginated<UserProfile> | UserProfile[]>("/admin/users/?role=teacher").then((d) => setTeachers(unwrap(d)));
    apiFetch<Paginated<Subject> | Subject[]>("/admin/subjects/").then((d) => setSubjects(unwrap(d)));
    apiFetch<Paginated<SchoolClass> | SchoolClass[]>("/admin/classes/").then((d) => setClasses(unwrap(d)));
    loadAssignments();
  }, []);

  function openCreate() {
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      await apiFetch("/admin/teacher-assignments/", {
        method: "POST",
        body: JSON.stringify({
          teacher: Number(form.teacher),
          subject: Number(form.subject),
          school_class: Number(form.school_class),
        }),
      });
      setModalOpen(false);
      loadAssignments();
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as Record<string, string[]>;
        setError(
          body.non_field_errors?.[0] ??
            Object.values(body)[0]?.[0] ??
            "Could not save — that subject may already be assigned to a teacher for this class."
        );
      } else {
        setError("Could not save assignment.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(ta: TeacherAssignment) {
    const ok = confirm(
      `Remove ${ta.teacher_name} from ${ta.subject_name} — ${ta.class_name}?\n\n` +
        `This will also delete every assignment (and student submissions to them) created under ` +
        `this Subject/Class pairing. This cannot be undone.`
    );
    if (!ok) return;
    try {
      await apiFetch(`/admin/teacher-assignments/${ta.id}/`, { method: "DELETE" });
      loadAssignments();
    } catch {
      setError("Could not remove this assignment.");
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 fw-bold mb-0">Teacher Assignments</h1>
        <button type="button" className="btn es-btn-primary text-white" onClick={openCreate}>
          + Assign Teacher
        </button>
      </div>
      <p className="text-muted small mb-3">
        Links a Teacher to a Subject for a specific Class. Teachers cannot assign themselves —
        this is Admin-only.
      </p>

      {error && !modalOpen && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : assignments.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No teacher assignments yet.</div>
      ) : (
        <div className="es-card bg-white p-0 overflow-hidden">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr>
                <th>Teacher</th>
                <th>Subject</th>
                <th>Class</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((ta) => (
                <tr key={ta.id}>
                  <td>{ta.teacher_name}</td>
                  <td>{ta.subject_name}</td>
                  <td>{ta.class_name}</td>
                  <td className="text-end">
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(ta)}>
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && (
        <Modal title="Assign Teacher" onClose={() => setModalOpen(false)}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Teacher</label>
              <select
                className="form-select"
                value={form.teacher}
                onChange={(e) => setForm((f) => ({ ...f, teacher: e.target.value }))}
                required
              >
                <option value="">Select a teacher…</option>
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>{t.full_name}</option>
                ))}
              </select>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Subject</label>
              <select
                className="form-select"
                value={form.subject}
                onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                required
              >
                <option value="">Select a subject…</option>
                {subjects.map((s) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Class</label>
              <select
                className="form-select"
                value={form.school_class}
                onChange={(e) => setForm((f) => ({ ...f, school_class: e.target.value }))}
                required
              >
                <option value="">Select a class…</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn es-btn-primary text-white w-100" disabled={saving}>
              {saving ? "Saving…" : "Assign"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
