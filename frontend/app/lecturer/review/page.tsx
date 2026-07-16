"use client";

import { useEffect, useState } from "react";
import { apiFetch, downloadFile, ApiError } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Submission, SubmissionStatus } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

const STATUS_OPTIONS: SubmissionStatus[] = [
  "submitted",
  "under_review",
  "reviewed",
  "approved",
  "rejected",
];

export default function ReviewQueuePage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Submission | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const [form, setForm] = useState({ status: "submitted" as SubmissionStatus, grade: "", feedback: "", review_notes: "" });

  function loadList() {
    setLoading(true);
    apiFetch<Paginated<Submission> | Submission[]>("/lecturers/me/submissions/?ordering=-submitted_at")
      .then((data) => setSubmissions(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(loadList, []);

  useEffect(() => {
    if (!selected) return;
    setForm({
      status: selected.status,
      grade: selected.grade != null ? String(selected.grade) : "",
      feedback: selected.feedback ?? "",
      review_notes: selected.review_notes ?? "",
    });
    setSaved(false);
    setError(null);
  }, [selected]);

  function openReview(s: Submission) {
    setSelected(s);
    apiFetch<Submission>(`/submissions/${s.id}/`).then(setSelected);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError(null);
    try {
      await apiFetch(`/submissions/${selected.id}/review/`, {
        method: "PATCH",
        body: JSON.stringify({
          status: form.status,
          grade: form.grade === "" ? null : Number(form.grade),
          feedback: form.feedback,
          review_notes: form.review_notes,
        }),
      });
      setSaved(true);
      loadList();
    } catch (err) {
      setError(err instanceof ApiError ? "Could not save review." : "Something went wrong.");
    } finally {
      setSaving(false);
    }
  }

  async function handleDownload() {
    if (!selected) return;
    try {
      await downloadFile(`/submissions/${selected.id}/download/`, selected.file_name);
    } catch {
      setError("Could not download file.");
    }
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Review Queue</h1>
      <div className="row g-3">
        <div className="col-lg-5">
          <div className="es-card bg-white p-0 overflow-hidden">
            {loading ? (
              <div className="p-3 text-muted">Loading…</div>
            ) : submissions.length === 0 ? (
              <div className="p-3 text-muted small">No submissions yet for your courses.</div>
            ) : (
              <ul className="list-group list-group-flush">
                {submissions.map((s) => (
                  <li
                    key={s.id}
                    className={`list-group-item list-group-item-action ${
                      selected?.id === s.id ? "active" : ""
                    }`}
                    role="button"
                    onClick={() => openReview(s)}
                  >
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className="fw-semibold">{s.student_name ?? "Student"}</div>
                        <div className="small text-muted">
                          {s.course_code} — {s.assignment_title}
                        </div>
                      </div>
                      <StatusBadge status={s.status} />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>

        <div className="col-lg-7">
          {!selected ? (
            <div className="es-card bg-white p-4 text-muted small">
              Select a submission on the left to review it.
            </div>
          ) : (
            <div className="es-card bg-white p-4">
              <div className="d-flex justify-content-between align-items-start mb-3">
                <div>
                  <h2 className="h6 fw-bold mb-1">{selected.assignment_title}</h2>
                  <div className="small text-muted">
                    {selected.student_name} · {selected.matric_number} · {selected.course_code}
                  </div>
                </div>
                <button type="button" className="btn btn-outline-primary btn-sm" onClick={handleDownload}>
                  Download File
                </button>
              </div>

              {saved && <div className="alert alert-success py-2">Review saved.</div>}
              {error && <div className="alert alert-danger py-2">{error}</div>}

              <form onSubmit={handleSave}>
                <div className="row g-3 mb-3">
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Grade (0–100)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      className="form-control"
                      value={form.grade}
                      onChange={(e) => setForm((f) => ({ ...f, grade: e.target.value }))}
                    />
                  </div>
                  <div className="col-6">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={form.status}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, status: e.target.value as SubmissionStatus }))
                      }
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt}>
                          {opt.replace("_", " ")}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label small fw-semibold">
                    Feedback <span className="text-muted fw-normal">(visible to student)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={form.feedback}
                    onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
                  />
                </div>

                <div className="mb-4">
                  <label className="form-label small fw-semibold">
                    Review Notes <span className="text-muted fw-normal">(internal only)</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={form.review_notes}
                    onChange={(e) => setForm((f) => ({ ...f, review_notes: e.target.value }))}
                  />
                </div>

                <button type="submit" className="btn es-btn-primary text-white" disabled={saving}>
                  {saving ? "Saving…" : "Save Review"}
                </button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
