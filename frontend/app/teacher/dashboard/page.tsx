"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/api";
import StatCard from "@/components/ui/StatCard";
import type { TeacherAssignment } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

interface TeacherStats {
  total_assignments_taught: number;
  total_assignments: number;
  pending_review: number;
  reviewed: number;
}

export default function TeacherDashboardPage() {
  const [stats, setStats] = useState<TeacherStats | null>(null);
  const [assignmentsTaught, setAssignmentsTaught] = useState<TeacherAssignment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      apiFetch<TeacherStats>("/teachers/me/dashboard/"),
      apiFetch<Paginated<TeacherAssignment> | TeacherAssignment[]>("/teachers/me/assignments-taught/"),
    ])
      .then(([statsData, taughtData]) => {
        setStats(statsData);
        setAssignmentsTaught(unwrap(taughtData));
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-muted">Loading…</div>;

  return (
    <div>
      <h1 className="h4 fw-bold mb-4">Teacher Dashboard</h1>

      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <StatCard label="Classes Taught" value={stats?.total_assignments_taught ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Assignments" value={stats?.total_assignments ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Pending Review" value={stats?.pending_review ?? 0} />
        </div>
        <div className="col-6 col-md-3">
          <StatCard label="Reviewed" value={stats?.reviewed ?? 0} />
        </div>
      </div>

      <h2 className="h6 fw-bold mb-3">My Classes</h2>

      {assignmentsTaught.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">
          You don&apos;t have any Subject/Class assignments yet. Once your administrator assigns
          you to teach a subject for a class, it will appear here.
        </div>
      ) : (
        <div className="row g-3">
          {assignmentsTaught.map((ta) => (
            <div key={ta.id} className="col-sm-6 col-lg-4">
              <Link href={`/teacher/classes/${ta.id}`} className="text-decoration-none">
                <div className="es-card bg-white p-4 h-100 text-body">
                  <div className="fw-bold fs-5 mb-1">{ta.subject_name}</div>
                  <div className="text-muted">{ta.class_name}</div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
