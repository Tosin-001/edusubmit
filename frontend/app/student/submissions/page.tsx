"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Submission, SubmissionStatus } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

const STATUS_OPTIONS: { value: SubmissionStatus | ""; label: string }[] = [
  { value: "", label: "All statuses" },
  { value: "submitted", label: "Submitted" },
  { value: "under_review", label: "Under Review" },
  { value: "reviewed", label: "Reviewed" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
];

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<SubmissionStatus | "">("");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (status) params.set("status", status);
    if (search) params.set("search", search);
    apiFetch<Paginated<Submission> | Submission[]>(`/students/me/submissions/?${params}`)
      .then((data) => setSubmissions(Array.isArray(data) ? data : (data.results ?? [])))
      .finally(() => setLoading(false));
  }, [status, search]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">My Submissions</h1>

      <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search by assignment or course…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 220 }}
          value={status}
          onChange={(e) => setStatus(e.target.value as SubmissionStatus | "")}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : submissions.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No submissions found.</div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="es-card bg-white p-0 d-none d-md-block overflow-hidden">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Assignment</th>
                  <th>Course</th>
                  <th>Submitted</th>
                  <th>Status</th>
                  <th>Grade</th>
                  <th>Feedback</th>
                </tr>
              </thead>
              <tbody>
                {submissions.map((s) => (
                  <tr key={s.id}>
                    <td>{s.assignment_title}</td>
                    <td>{s.course_code}</td>
                    <td>{formatDate(s.submitted_at)}</td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                    <td>{s.grade ?? "—"}</td>
                    <td className="text-truncate" style={{ maxWidth: 220 }}>
                      {s.feedback ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile stacked cards */}
          <div className="d-md-none d-flex flex-column gap-2">
            {submissions.map((s) => (
              <div key={s.id} className="es-card bg-white p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-semibold">{s.assignment_title}</div>
                    <div className="text-muted small">{s.course_code}</div>
                  </div>
                  <StatusBadge status={s.status} />
                </div>
                <div className="d-flex justify-content-between small text-muted">
                  <span>{formatDate(s.submitted_at)}</span>
                  <span>Grade: {s.grade ?? "—"}</span>
                </div>
                {s.feedback && <div className="small mt-2">{s.feedback}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
