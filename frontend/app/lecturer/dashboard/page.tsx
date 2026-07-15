"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";

interface LecturerStats {
  total_courses: number;
  total_assignments: number;
  pending_review: number;
  reviewed: number;
}

export default function LecturerDashboardPage() {
  const [stats, setStats] = useState<LecturerStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<LecturerStats>("/lecturers/me/dashboard/")
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted">Loading…</div>;

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Lecturer Dashboard</h1>
      <div className="row g-3">
        <div className="col-6 col-md-3">
          <StatCard label="My Courses" value={stats?.total_courses ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="My Assignments" value={stats?.total_assignments ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Pending Review" value={stats?.pending_review ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Reviewed" value={stats?.reviewed ?? 0} />
        </div>
      </div>
    </div>
  );
}
