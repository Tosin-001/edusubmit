"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { Course, UserProfile } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

const emptyForm = { course_code: "", course_title: "", lecturer: "", semester: "" };

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [lecturers, setLecturers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Course | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<Paginated<UserProfile> | UserProfile[]>("/admin/users/?role=lecturer").then((data) =>
      setLecturers(unwrap(data))
    );
  }, []);

  function loadCourses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    apiFetch<Paginated<Course> | Course[]>(`/admin/courses/?${params}`)
      .then((data) => setCourses(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(loadCourses, [search]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(c: Course) {
    setEditing(c);
    setForm({
      course_code: c.course_code,
      course_title: c.course_title,
      lecturer: c.lecturer ? String(c.lecturer) : "",
      semester: c.semester ?? "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const payload = {
      course_code: form.course_code,
      course_title: form.course_title,
      lecturer: form.lecturer ? Number(form.lecturer) : null,
      semester: form.semester || null,
    };
    try {
      if (editing) {
        await apiFetch(`/admin/courses/${editing.id}/`, { method: "PATCH", body: JSON.stringify(payload) });
      } else {
        await apiFetch("/admin/courses/", { method: "POST", body: JSON.stringify(payload) });
      }
      setModalOpen(false);
      loadCourses();
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setError(Object.values(err.body as Record<string, string[]>)[0]?.[0] ?? "Could not save course.");
      } else {
        setError("Could not save course.");
      }
    } finally {
      setSaving(false);
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 fw-bold mb-0">Course Management</h1>
        <button type="button" className="btn es-btn-primary text-white" onClick={openCreate}>
          + New Course
        </button>
      </div>

      <input
        type="search"
        className="form-control mb-3"
        placeholder="Search by course code or title…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {error && !modalOpen && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : courses.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No courses found.</div>
      ) : (
        <>
          <div className="es-card bg-white p-0 d-none d-md-block overflow-hidden">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Code</th>
                  <th>Title</th>
                  <th>Lecturer</th>
                  <th>Semester</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {courses.map((c) => (
                  <tr key={c.id}>
                    <td className="fw-semibold">{c.course_code}</td>
                    <td>{c.course_title}</td>
                    <td>{c.lecturer_name ?? <span className="text-muted">Unassigned</span>}</td>
                    <td>{c.semester ?? "—"}</td>
                    <td className="text-end">
                      <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(c)}>
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none d-flex flex-column gap-2">
            {courses.map((c) => (
              <div key={c.id} className="es-card bg-white p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{c.course_code}</div>
                    <div className="small text-muted">{c.course_title}</div>
                  </div>
                  <button type="button" className="btn btn-sm btn-outline-secondary" onClick={() => openEdit(c)}>
                    Edit
                  </button>
                </div>
                <div className="small text-muted">
                  {c.lecturer_name ?? "Unassigned"} · {c.semester ?? "—"}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Course" : "New Course"} onClose={() => setModalOpen(false)}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Course code</label>
              <input
                className="form-control"
                placeholder="e.g. CSC301"
                value={form.course_code}
                onChange={(e) => setForm((f) => ({ ...f, course_code: e.target.value }))}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Course title</label>
              <input
                className="form-control"
                value={form.course_title}
                onChange={(e) => setForm((f) => ({ ...f, course_title: e.target.value }))}
                required
              />
            </div>

            <div className="mb-3">
              <label className="form-label small fw-semibold">Lecturer</label>
              <select
                className="form-select"
                value={form.lecturer}
                onChange={(e) => setForm((f) => ({ ...f, lecturer: e.target.value }))}
              >
                <option value="">Unassigned</option>
                {lecturers.map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.full_name}
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="form-label small fw-semibold">Semester</label>
              <input
                className="form-control"
                placeholder="e.g. 2025/2026 First"
                value={form.semester}
                onChange={(e) => setForm((f) => ({ ...f, semester: e.target.value }))}
              />
            </div>

            <button type="submit" className="btn es-btn-primary text-white w-100" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Course"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
