"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import type { ActivityLog } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
  count?: number;
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

const ACTION_LABELS: Record<string, string> = {
  "auth.student_registered": "Student registered",
  "auth.login": "User logged in",
  "auth.logout": "User logged out",
  "auth.password_changed": "Password changed",
  "admin.user_created": "User created",
  "admin.staff_created": "User created",
  "admin.user_updated": "User updated",
  "admin.user_activated": "User activated",
  "admin.user_deactivated": "User deactivated",
  "admin.user_deleted": "User deleted",
  "admin.password_reset": "Password reset by admin",
  "course.created": "Course created",
  "course.updated": "Course updated",
  "course.deleted": "Course deleted",
  "assignment.created": "Assignment created",
  "assignment.updated": "Assignment updated",
  "assignment.archived": "Assignment archived",
  "assignment.restored": "Assignment restored",
  "assignment.deleted": "Assignment deleted",
  "submission.created": "Submission uploaded",
  "submission.reviewed": "Submission reviewed",
  "submission.review_overridden": "Review overridden by admin",
  "submission.downloaded": "Submission downloaded",
  "submission.deleted": "Submission deleted",
};

const FILTER_ACTIONS = [
  { value: "", label: "All actions" },
  { value: "assignment.created", label: "Assignment created" },
  { value: "submission.created", label: "Submission uploaded" },
  { value: "submission.reviewed", label: "Submission reviewed" },
  { value: "submission.review_overridden", label: "Review overridden" },
  { value: "admin.user_created", label: "User created" },
  { value: "admin.user_activated", label: "User activated" },
  { value: "admin.user_deactivated", label: "User deactivated" },
  { value: "admin.password_reset", label: "Password reset" },
  { value: "auth.login", label: "Login" },
];

function summarize(log: ActivityLog): string {
  const m = log.metadata;
  if (!m) return "";
  const parts: string[] = [];
  if (typeof m.title === "string") parts.push(m.title as string);
  if (typeof m.status === "string") parts.push(`status: ${m.status}`);
  if (m.grade != null) parts.push(`grade: ${m.grade}`);
  if (typeof m.role === "string") parts.push(`role: ${m.role}`);
  if (typeof m.full_name === "string") parts.push(m.full_name as string);
  return parts.join(" · ");
}

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [action, setAction] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (action) params.set("action", action);
    if (dateFrom) params.set("date_from", dateFrom);
    if (dateTo) params.set("date_to", dateTo);
    apiFetch<Paginated<ActivityLog> | ActivityLog[]>(`/admin/activity-logs/?${params}`)
      .then((data) => setLogs(unwrap(data)))
      .finally(() => setLoading(false));
  }, [search, action, dateFrom, dateTo]);

  function formatTimestamp(iso: string) {
    return new Date(iso).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }

  return (
    <div>
      <h1 className="h4 fw-bold mb-3">Activity Logs</h1>

      <div className="row g-2 mb-3">
        <div className="col-12 col-md-4">
          <input
            type="search"
            className="form-control"
            placeholder="Search by action or user…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-6 col-md-3">
          <select className="form-select" value={action} onChange={(e) => setAction(e.target.value)}>
            {FILTER_ACTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="col-6 col-md-2">
          <input type="date" className="form-control" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
        </div>
        <div className="col-6 col-md-2">
          <input type="date" className="form-control" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
        </div>
      </div>

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : logs.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No activity found for these filters.</div>
      ) : (
        <>
          <div className="es-card bg-white p-0 d-none d-md-block overflow-hidden">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr>
                  <th>Timestamp</th>
                  <th>User</th>
                  <th>Action</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {logs.map((log) => (
                  <tr key={log.id}>
                    <td className="text-nowrap">{formatTimestamp(log.timestamp)}</td>
                    <td>{log.user_name ?? <span className="text-muted">System</span>}</td>
                    <td>{ACTION_LABELS[log.action] ?? log.action}</td>
                    <td className="text-muted small">{summarize(log)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="d-md-none d-flex flex-column gap-2">
            {logs.map((log) => (
              <div key={log.id} className="es-card bg-white p-3">
                <div className="d-flex justify-content-between align-items-start mb-1">
                  <span className="fw-semibold small">{ACTION_LABELS[log.action] ?? log.action}</span>
                  <span className="text-muted small text-nowrap">{formatTimestamp(log.timestamp)}</span>
                </div>
                <div className="text-muted small">{log.user_name ?? "System"}</div>
                {summarize(log) && <div className="small mt-1">{summarize(log)}</div>}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
