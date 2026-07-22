"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch, ApiError, uploadWithProgress } from "@/lib/api";
import type { Assignment, Submission } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

export default function UploadPage() {
  const router = useRouter();
  // No Subject/Class picker — the backend already returns only assignments
  // for this student's own class, so there's just one dropdown: which
  // assignment to submit against.
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentId, setAssignmentId] = useState<string>("");
  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    apiFetch<Paginated<Assignment> | Assignment[]>("/assignments/")
      .then((data) => setAssignments(unwrap(data)))
      .finally(() => setAssignmentsLoading(false));
  }, []);

  const selectedAssignment = useMemo(
    () => assignments.find((a) => String(a.id) === assignmentId) ?? null,
    [assignments, assignmentId]
  );

  function validateFile(f: File): string | null {
    const allowed = (selectedAssignment?.allowed_file_types ?? "pdf,docx,doc").split(",");
    const ext = f.name.split(".").pop()?.toLowerCase() ?? "";
    if (!allowed.includes(ext)) {
      return `File type .${ext} not allowed. Allowed: ${allowed.join(", ")}`;
    }
    const maxMb = selectedAssignment?.max_file_size_mb ?? 15;
    if (f.size > maxMb * 1024 * 1024) {
      return `File exceeds the ${maxMb}MB limit.`;
    }
    return null;
  }

  function handleFileSelect(f: File) {
    const validationError = validateFile(f);
    if (validationError) {
      setError(validationError);
      setFile(null);
      return;
    }
    setError(null);
    setFile(f);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files?.[0];
    if (dropped) handleFileSelect(dropped);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!file || !assignmentId) {
      setError("Please choose an assignment and a file.");
      return;
    }
    setError(null);
    setProgress(0);

    const formData = new FormData();
    formData.append("assignment", assignmentId);
    formData.append("file", file);

    try {
      await uploadWithProgress<Submission>("/submissions/", formData, setProgress);
      setSuccess(true);
      setTimeout(() => router.push("/student/submissions"), 1200);
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        const body = err.body as Record<string, string[]>;
        setError(body.file?.[0] ?? body.assignment?.[0] ?? body.detail?.[0] ?? "Upload failed.");
      } else {
        setError("Upload failed. Please try again.");
      }
      setProgress(null);
    }
  }

  if (assignmentsLoading) {
    return <div className="text-muted">Loading…</div>;
  }

  if (assignments.length === 0) {
    return (
      <div className="es-card bg-white p-4 p-md-5 text-center" style={{ maxWidth: 480 }}>
        <h1 className="h5 fw-bold mb-2">No assignments yet</h1>
        <p className="text-muted mb-0">
          Either you haven&apos;t been assigned a class yet, or your teachers haven&apos;t
          posted any assignments — check with your administrator or teacher.
        </p>
      </div>
    );
  }

  return (
    <div className="es-card bg-white p-4 p-md-5" style={{ maxWidth: 640 }}>
      <h1 className="h5 fw-bold mb-4">Upload Assignment</h1>

      {success && <div className="alert alert-success py-2">Submitted! Redirecting…</div>}
      {error && <div className="alert alert-danger py-2">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="form-label small fw-semibold">Assignment</label>
          <select
            className="form-select"
            value={assignmentId}
            onChange={(e) => setAssignmentId(e.target.value)}
            required
          >
            <option value="">Select an assignment…</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.subject_name} — {a.title}
              </option>
            ))}
          </select>
          {selectedAssignment?.description && (
            <div className="form-text">{selectedAssignment.description}</div>
          )}
        </div>

        <div
          className="mb-4 p-4 text-center rounded-3"
          style={{
            border: `2px dashed ${dragOver ? "var(--es-primary)" : "#cbd5e1"}`,
            backgroundColor: dragOver ? "rgba(37,99,235,0.05)" : "transparent",
            cursor: "pointer",
          }}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => document.getElementById("es-file-input")?.click()}
        >
          {file ? (
            <span className="fw-semibold">{file.name}</span>
          ) : (
            <>
              <div>Drag & drop file here, or click to browse</div>
              <div className="text-muted small mt-1">
                {(selectedAssignment?.allowed_file_types ?? "pdf,docx,doc").toUpperCase()} · max{" "}
                {selectedAssignment?.max_file_size_mb ?? 15}MB
              </div>
            </>
          )}
          <input
            id="es-file-input"
            type="file"
            className="d-none"
            onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
          />
        </div>

        {progress !== null && (
          <div className="progress mb-4" style={{ height: 8 }}>
            <div
              className="progress-bar"
              role="progressbar"
              style={{ width: `${progress}%`, backgroundColor: "var(--es-primary)" }}
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        )}

        <button
          type="submit"
          className="btn es-btn-primary text-white w-100"
          disabled={progress !== null && progress < 100 && !error}
        >
          {progress !== null && progress < 100 ? `Uploading… ${progress}%` : "Submit Assignment"}
        </button>
      </form>
    </div>
  );
}
