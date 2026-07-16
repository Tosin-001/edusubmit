# EduSubmit — Project Status

Last updated: 2026-07-16

## Overview
Assignment Submission and Administration System.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Roles: Student, Lecturer, Admin. Courses are Admin-assigned. Admin can override Lecturer reviews.
Repo: https://github.com/Tosin-001/edusubmit (main branch, pushed)
Local dev: Postgres running, `backend/.env` + `frontend/.env.local` configured, migrations applied, superuser + demo lecturer/course/assignment seeded.

## Completed Tasks
- [x] Local project folder + `/docs`, `/backups`, `PROJECT_STATUS.md`, `CHANGELOG.md`
- [x] Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes — approved
- [x] Phase 2: Django backend scaffold (accounts, academics, assignments, submissions, activitylogs)
- [x] Phase 3: Next.js 15 frontend scaffold — auth, role-gated middleware, 3 live dashboards
- [x] Local environment fully wired: Postgres reset, `.env` files created, migrations applied, superuser + demo data seeded, verified end-to-end
- [x] **Phase 4 complete: Assignment upload UI + review workflow UI**
  - Fixed a real gap: `/assignments/` was Lecturer/Admin-only for GET — students couldn't see what to submit against. Now readable by any authenticated user.
  - `app/student/upload/page.tsx` — course→assignment dropdowns, drag-and-drop, client-side validation, real progress bar
  - `app/student/submissions/page.tsx` — live table/cards, search + status filter
  - `app/lecturer/review/page.tsx` — submission list (own courses) + grading form (grade/status/feedback/notes), file download via a new `downloadFile()` helper
  - `npx tsc --noEmit` clean, `npm run build` clean throughout

## Current Task
Phase 4 complete. **Awaiting your go-ahead for Phase 5 (Admin/Lecturer management panel UI).**

## Pending / Not Started
- Phase 5: Admin/Lecturer management panel UI (users, courses, submissions, activity logs — currently placeholder pages; Lecturer "Assignments" create/edit UI also still placeholder)
- Phase 6: Styling pass / responsive QA beyond the current baseline
- Phase 7: Deployment (Vercel + Railway/Render)
- Phase 8: Testing & hardening (unit tests, DRF test client, file upload edge cases)

## Known Issues
1. **Django pinned to 4.2.13, not 5.0.6** — driven by your Python 3.9.5.
2. `/admin/users/{id}/submissions/` not wired to its own endpoint — reachable via `/admin/submissions/?search=<matric_number>`. Low priority.
3. Student profile, Lecturer assignments create/edit, and all Admin management pages are still placeholder screens — Phase 5.
4. Test accounts in local DB (harmless, yours to clean up whenever): `teststudent@edusubmit.local`, `lecturer@edusubmit.local` (from `seed_demo`), `admin@edusubmit.local` (superuser).
5. A transient Windows issue hit during Phase 4: orphaned `node` processes from an interrupted build held file locks and caused a later build to hang. Resolved by killing all `node` processes + clearing `.next`. Not a code bug, but if a future `npm run build` seems to hang forever, check `Get-Process node` first.

## Open Questions For You
1. Try the full loop now if you want: log in as `teststudent@edusubmit.local` → Upload → CSC301/Assignment 1 → submit a file. Then log in as `lecturer@edusubmit.local` → Review Queue → grade it. Then check the student dashboard for the grade/feedback.
2. Phase 5 start: Admin user management first, or Admin course management first?
