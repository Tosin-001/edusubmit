"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";

interface AdminStats {
  total_students: number;
  total_lecturers: number;
  total_assignments: number;
  pending_review: number;
  reviewed: number;
  by_status: { status: string; count: number }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<AdminStats>("/admin/dashboard/")
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted">Loading…</div>;

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Admin Dashboard</h1>
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard label="Students" value={stats?.total_students ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Lecturers" value={stats?.total_lecturers ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Assignments" value={stats?.total_assignments ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Pending Review" value={stats?.pending_review ?? 0} />
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard label="Reviewed" value={stats?.reviewed ?? 0} />
        </div>
      </div>

      <div className="es-card bg-white p-3 p-md-4">
        <h2 className="h6 fw-bold mb-3">Submissions by Status</h2>
        {!stats?.by_status?.length ? (
          <p className="text-muted small mb-0">No submissions yet.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {stats.by_status.map((row) => (
              <li key={row.status} className="d-flex justify-content-between py-1">
                <span className="text-capitalize">{row.status.replace("_", " ")}</span>
                <span className="fw-semibold">{row.count}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
