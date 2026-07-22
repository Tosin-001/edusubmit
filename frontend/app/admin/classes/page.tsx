"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { SchoolClass } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

type StatusFilter = "active" | "archived" | "all";

export default function AdminClassesPage() {
  const [classes, setClasses] = useState<SchoolClass[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<SchoolClass | null>(null);
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function loadClasses() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    params.set("archived", statusFilter === "all" ? "all" : statusFilter === "archived" ? "true" : "false");
    apiFetch<Paginated<SchoolClass> | SchoolClass[]>(`/admin/classes/?${params}`)
      .then((data) => setClasses(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(loadClasses, [search, statusFilter]);

  function openCreate() {
    setEditing(null);
    setName("");
    setError(null);
    setModalOpen(true);
  }

  function openEdit(c: SchoolClass) {
    setEditing(c);
    setName(c.name);
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiFetch(`/admin/classes/${editing.id}/`, { method: "PATCH", body: JSON.stringify({ name }) });
      } else {
        await apiFetch("/admin/classes/", { method: "POST", body: JSON.stringify({ name }) });
      }
      setModalOpen(false);
      loadClasses();
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setError(Object.values(err.body as Record<string, string[]>)[0]?.[0] ?? "Could not save class.");
      } else {
        setError("Could not save class.");
      }
    } finally {
      setSaving(false);
    }
  }

  async function toggleArchive(c: SchoolClass) {
    try {
      await apiFetch(`/admin/classes/${c.id}/`, { method: "PATCH", body: JSON.stringify({ is_archived: !c.is_archived }) });
      loadClasses();
    } catch {
      setError("Could not update class status.");
    }
  }

  return (
    <div>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-4">
        <h1 className="h4 fw-bold mb-0">Class Management</h1>
        <button type="button" className="btn es-btn-primary text-white" onClick={openCreate}>
          + New Class
        </button>
      </div>

      <div className="d-flex flex-column flex-sm-row gap-2 mb-3">
        <input
          type="search"
          className="form-control"
          placeholder="Search classes…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="form-select"
          style={{ maxWidth: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
        >
          <option value="active">Active</option>
          <option value="archived">Archived</option>
          <option value="all">All</option>
        </select>
      </div>

      {error && !modalOpen && <div className="alert alert-danger py-2">{error}</div>}

      {loading ? (
        <div className="text-muted">Loading…</div>
      ) : classes.length === 0 ? (
        <div className="es-card bg-white p-4 text-muted small">No classes found.</div>
      ) : (
        <div className="row g-3">
          {classes.map((c) => (
            <div key={c.id} className="col-6 col-md-4 col-lg-3">
              <div className="es-card bg-white p-3 h-100 d-flex flex-column justify-content-between">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <span className="fw-bold">{c.name}</span>
                  {c.is_archived ? (
                    <span className="badge bg-secondary">Archived</span>
                  ) : (
                    <span className="badge text-white" style={{ backgroundColor: "var(--es-success)" }}>Active</span>
                  )}
                </div>
                <div className="d-flex gap-2">
                  <button type="button" className="btn btn-sm btn-outline-secondary flex-fill" onClick={() => openEdit(c)}>Edit</button>
                  <button
                    type="button"
                    className={`btn btn-sm flex-fill ${c.is_archived ? "btn-outline-success" : "btn-outline-danger"}`}
                    onClick={() => toggleArchive(c)}
                  >
                    {c.is_archived ? "Restore" : "Archive"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {modalOpen && (
        <Modal title={editing ? "Edit Class" : "New Class"} onClose={() => setModalOpen(false)}>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={handleSave}>
            <div className="mb-4">
              <label className="form-label small fw-semibold">Class name</label>
              <input
                className="form-control"
                placeholder="e.g. JS1, SS2 Science"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn es-btn-primary text-white w-100" disabled={saving}>
              {saving ? "Saving…" : editing ? "Save Changes" : "Create Class"}
            </button>
          </form>
        </Modal>
      )}
    </div>
  );
}
