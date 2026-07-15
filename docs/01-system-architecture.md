# EduSubmit — System Architecture

## 1. High-Level Overview

EduSubmit is a 3-tier web application:

```
┌─────────────────────┐      HTTPS/JSON       ┌──────────────────────┐      SQL      ┌──────────────┐
│   Next.js 15 (App    │ ───────────────────▶ │  Django + DRF API     │ ────────────▶ │  PostgreSQL   │
│   Router) Frontend   │ ◀─────────────────── │  (JWT-authenticated)  │ ◀──────────── │  Database     │
│   Vercel              │      JSON responses   │  Railway / Render     │               │  (Railway)    │
└─────────────────────┘                        └──────────────────────┘               └──────────────┘
        │                                                │
        │                                                ▼
        │                                        ┌──────────────────┐
        └───────────────────────────────────────▶│  File Storage      │
              signed download URLs                │  (local /media or  │
                                                    │  S3-compatible)    │
                                                    └──────────────────┘
```

## 2. Roles & Responsibilities

| Role      | Can do |
|-----------|--------|
| Student   | Register/login, upload assignments, track own submissions, view grades/feedback, edit own profile |
| Lecturer  | Login (admin-provisioned), view/manage assignments for their own courses, review + grade + give feedback on submissions to their courses, view student list for their courses |
| Admin     | Full platform oversight: manage all users (students + lecturers), manage all courses/assignments, override any review, view platform-wide analytics, deactivate/delete accounts, view activity logs |

## 3. Auth Model

- JWT access token (short-lived, ~15 min) + refresh token (long-lived, ~7 days), via `djangorestframework-simplejwt`.
- Role embedded as a custom claim in the token payload; frontend uses it for route gating, backend re-validates on every request via DRF permission classes (never trusts the frontend).
- Students self-register. Lecturers and Admins are provisioned by an existing Admin (no public lecturer/admin signup route) — prevents privilege escalation via open registration.

## 4. Frontend Architecture (Next.js 15 App Router)

- `app/(public)/` — landing page, login, student registration
- `app/(student)/` — student dashboard, upload, submissions, profile — protected by middleware checking role=student
- `app/(lecturer)/` — lecturer dashboard, assignment/course management, review queue — role=lecturer
- `app/(admin)/` — admin dashboard, user management, assignment management, analytics — role=admin
- Shared `components/`, `lib/api.ts` (typed fetch wrapper attaching JWT), `lib/auth.ts` (token storage/refresh)
- State: React Server Components for initial data, client components + SWR/React Query for interactive tables/uploads

## 5. Backend Architecture (Django + DRF)

- App split: `accounts` (users/auth/roles), `academics` (courses), `assignments` (assignment defs), `submissions` (student uploads + review), `activitylogs` (audit trail)
- Permission classes: `IsStudent`, `IsLecturer`, `IsAdmin`, `IsOwnerOrAdmin` — object-level checks (e.g., lecturer can only review submissions for courses they own)
- File uploads validated server-side: extension whitelist (pdf, docx, doc, zip), max size (e.g. 15MB), content-type sniffing (not just extension trust)
- Every write action (upload, review, grade change, user edit/delete) logs to `ActivityLogs`

## 6. Security Layers

1. HTTPS everywhere (enforced at Vercel/Railway level)
2. Password hashing via Django's PBKDF2 (default) or Argon2
3. JWT short expiry + refresh rotation + blacklist on logout
4. CSRF protection on any session-based endpoints (JWT endpoints are exempt but locked to `Authorization: Bearer` header only — no cookie auth for the API)
5. DRF throttling on auth endpoints (login/register) to slow brute force
6. Input validation via DRF serializers on every field
7. File validation (type, size, virus-scan hook placeholder for future)
8. Role-based object-level permissions, not just view-level

## 7. Deployment Topology

- Frontend → Vercel (auto-deploy from `main` via GitHub)
- Backend → Railway or Render (Docker or buildpack), Postgres add-on on same platform
- Media files → start on local disk volume; documented migration path to S3-compatible storage (Cloudflare R2 / Backblaze) if scale requires it
- Environment variables documented separately in `/docs/07-environment-variables.md` (values never committed)
