# EduSubmit — Project Status

Last updated: 2026-07-17

## Overview
Assignment Submission and Administration System.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Roles: Student, Lecturer, Admin. Courses are Admin-assigned. Admin can override Lecturer reviews.
Repo: https://github.com/Tosin-001/edusubmit (main branch, pushed)
Local dev: Postgres running, `backend/.env` + `frontend/.env.local` configured, migrations applied, superuser + demo lecturer/course/assignment seeded.
Admin login (reset during Phase 5 debugging): `admin@edusubmit.local` / `AdminPass2026!`

## Completed Tasks
- [x] Local project folder + `/docs`, `/backups`, `PROJECT_STATUS.md`, `CHANGELOG.md`
- [x] Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes — approved
- [x] Phase 2: Django backend scaffold (accounts, academics, assignments, submissions, activitylogs)
- [x] Phase 3: Next.js 15 frontend scaffold — auth, role-gated middleware, 3 live dashboards
- [x] Phase 4: Assignment upload UI + review workflow UI (Student upload, My Submissions, Lecturer Review Queue)
- [x] **Phase 5 complete: Admin/Lecturer management panel UI**
  1. **Lecturer Assignment Management** — full CRUD, archive (not hard-delete, since Assignment cascades to Submission), search + status filter
  2. **Review Queue improvements** — course tabs + status filter on top of the existing grading form
  3. **Admin Management** — Users (create any role, search/filter, activate/deactivate, reset password), Courses (create/edit, assign lecturer), Submissions (course/lecturer/student/status filters, override review, hard delete)
  4. **Activity Logs** — action-type filter, date range, search, friendly action labels, metadata summary
- [x] Real bugs caught and fixed along the way: `SearchFilter`/`OrderingFilter` were never registered in DRF settings (every `?search=`/`?ordering=` since Phase 2 was silently doing nothing); `AdminCreateUserSerializer` didn't return the new user's `id`
- [x] `npx tsc --noEmit` clean, `npm run build` clean (16 routes, all Admin/Lecturer pages now real content, 2–4KB each vs. placeholder ~120B)

## Current Task
Phase 5 complete. **Awaiting your go-ahead for Phase 6 (styling/responsive QA pass) or Phase 7 (deployment).**

## Pending / Not Started
- Phase 6: Styling pass / responsive QA beyond the current baseline (spot-checked, not exhaustively tested on real devices)
- Phase 7: Deployment (Vercel + Railway/Render)
- Phase 8: Testing & hardening (unit tests, DRF test client, file upload edge cases)
- Student Profile page still placeholder (edit name/email, change password — backend endpoints already exist: `PATCH /students/me/`, `POST /auth/change-password/`)

## Known Issues
1. **Django pinned to 4.2.13, not 5.0.6** — driven by your Python 3.9.5.
2. `/admin/users/{id}/submissions/` not wired to its own endpoint — reachable via `/admin/submissions/?search=<matric_number>&assignment__course=` combo, or by filtering `/admin/submissions/?student=<id>` directly (works now that `student` was added to the filterset).
3. Student Profile page is still a placeholder.
4. Test/demo accounts in local DB (harmless, yours to manage): `teststudent@edusubmit.local`, `lecturer@edusubmit.local` (from `seed_demo`), `admin@edusubmit.local` (password reset to `AdminPass2026!` during Phase 5 debugging — the original superuser password from Phase 4 stopped working for unclear reasons, see below).
5. **Two intermittent local Windows process issues encountered so far**, both resolved by killing orphaned processes: (a) Phase 4 — orphaned `node` processes held `.next` file locks after an interrupted build; (b) Phase 5 — an orphaned `python manage.py runserver` process appeared to serve stale auth state (a password reset wasn't reflected in HTTP login attempts against it, despite being confirmed correct via direct DB check and Django's in-process test client). If you ever see mysterious "works via direct check but fails via the browser/HTTP" behavior, check `Get-Process python`/`Get-Process node` and kill stragglers before assuming it's a code bug.

## Open Questions For You
1. Try the full admin loop: log in as `admin@edusubmit.local` / `AdminPass2026!` → create a student or lecturer → reset a password → deactivate/reactivate an account → check Activity Logs shows it all.
2. Phase 6 (polish) or Phase 7 (deployment) next — or Student Profile page first, since it's the one remaining placeholder from the original spec?
