"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import StatusBadge from "@/components/ui/StatusBadge";
import type { Submission } from "@/lib/types";

interface DashboardStats {
  total_submissions: number;
  pending_review: number;
  approved: number;
  average_grade: number | null;
}

export default function StudentDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recent, setRecent] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<DashboardStats>("/students/me/dashboard/"),
      apiFetch<{ results: Submission[] }>("/students/me/submissions/?ordering=-submitted_at"),
    ])
      .then(([statsData, subsData]) => {
        setStats(statsData);
        setRecent((subsData.results ?? subsData as unknown as Submission[]).slice(0, 5));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted">Loading…</div>;

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Welcome back{stats ? "" : ""}</h1>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard label="Total Submissions" value={stats?.total_submissions ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Pending Review" value={stats?.pending_review ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Approved" value={stats?.approved ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            label="Average Grade"
            value={stats?.average_grade != null ? `${stats.average_grade}%` : "—"}
          />
        </div>
      </div>

      <div className="es-card bg-white p-3 p-md-4">
        <h2 className="h6 fw-bold mb-3">Recent Activity</h2>
        {recent.length === 0 ? (
          <p className="text-muted small mb-0">No submissions yet.</p>
        ) : (
          <ul className="list-unstyled mb-0">
            {recent.map((s) => (
              <li key={s.id} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                <span>
                  {s.subject_name} ({s.class_name}) — {s.assignment_title}
                </span>
                <StatusBadge status={s.status} />
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
