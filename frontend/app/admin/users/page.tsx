"use client";

import { useEffect, useState } from "react";
import { apiFetch, ApiError } from "@/lib/api";
import Modal from "@/components/ui/Modal";
import type { Role, UserProfile } from "@/lib/types";

interface Paginated<T> {
  results?: T[];
}

function unwrap<T>(data: Paginated<T> | T[]): T[] {
  return Array.isArray(data) ? data : (data.results ?? []);
}

const emptyForm = {
  role: "student" as Role,
  full_name: "",
  email: "",
  matric_number: "",
  staff_id: "",
  department: "",
  password: "",
};

export default function AdminUsersPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "">("");
  const [statusFilter, setStatusFilter] = useState<"" | "true" | "false">("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<UserProfile | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [resetResult, setResetResult] = useState<{ user: UserProfile; password: string } | null>(null);

  function loadUsers() {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (roleFilter) params.set("role", roleFilter);
    if (statusFilter) params.set("is_active", statusFilter);
    apiFetch<Paginated<UserProfile> | UserProfile[]>(`/admin/users/?${params}`)
      .then((data) => setUsers(unwrap(data)))
      .finally(() => setLoading(false));
  }

  useEffect(loadUsers, [search, roleFilter, statusFilter]);

  function openCreate() {
    setEditing(null);
    setForm(emptyForm);
    setError(null);
    setModalOpen(true);
  }

  function openEdit(u: UserProfile) {
    setEditing(u);
    setForm({
      role: u.role,
      full_name: u.full_name,
      email: u.email,
      matric_number: u.matric_number ?? "",
      staff_id: u.staff_id ?? "",
      department: u.department ?? "",
      password: "",
    });
    setError(null);
    setModalOpen(true);
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await apiFetch(`/admin/users/${editing.id}/`, {
          method: "PATCH",
          body: JSON.stringify({
            full_name: form.full_name,
            email: form.email,
            matric_number: form.matric_number || null,
            staff_id: form.staff_id || null,
            department: form.department || null,
          }),
        });
      } else {
        await apiFetch("/admin/users/", { method: "POST", body: JSON.stringify(form) });
      }
      setModalOpen(false);
      loadUsers();
    } catch (err) {
      if (err instanceof ApiError && err.body && typeof err.body === "object") {
        setError(Object.values(err.body as Record<string, string[]>)[0]?.[0] ?? "Could not save user.");
      } else {
        setError("Could not save user.");
      }
    } finally {
      setSaving(false);
    }
  }
