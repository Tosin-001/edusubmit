# EduSubmit — Project Status

Last updated: 2026-07-16

## Overview
Assignment Submission and Administration System.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Roles: Student, Lecturer, Admin. Courses are Admin-assigned. Admin can override Lecturer reviews.
Repo: https://github.com/Tosin-001/edusubmit (main branch, pushed)
Local dev: Postgres running, `backend/.env` + `frontend/.env.local` configured, migrations applied, superuser created.

## Completed Tasks
- [x] Local project folder + `/docs`, `/backups`, `PROJECT_STATUS.md`, `CHANGELOG.md`
- [x] Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes — approved
- [x] Phase 2: Django backend scaffold (accounts, academics, assignments, submissions, activitylogs)
- [x] Phase 3: Next.js 15 frontend scaffold — auth, role-gated middleware, 3 live dashboards
- [x] Local environment fully wired: Postgres password reset, `.env` files created, `migrate` applied (34 migrations, 10 apps), superuser created (`admin@edusubmit.local`), verified end-to-end via live login request
- [x] Phase 4 (in progress): Student upload flow
  - Fixed a real gap: `/assignments/` was Lecturer/Admin-only for GET — students had no way to see what to submit against. Now readable by any authenticated user.
  - `app/student/upload/page.tsx` — course→assignment dropdowns, drag-and-drop, client-side validation, real progress bar (new `uploadWithProgress()` in `lib/api.ts`)
  - `app/student/submissions/page.tsx` — live table/cards, search + status filter
  - `npx tsc --noEmit` clean, `npm run build` clean, verified live against the running API (register→login→list assignments→list courses, all 200)

## Current Task
Phase 4 partially complete (Student upload flow done). Next: Lecturer Review Queue + grading form.

## Pending / Not Started
- Phase 4 (remaining): Lecturer Review Queue page (list submissions to own courses, grade/feedback form, calls existing `PATCH /submissions/{id}/review/`)
- Phase 5: Admin/Lecturer management panel UI (users, courses, submissions, activity logs — currently placeholder pages)
- Phase 6: Styling pass / responsive QA beyond the current baseline
- Phase 7: Deployment (Vercel + Railway/Render)
- Phase 8: Testing & hardening (unit tests, DRF test client, file upload edge cases)

## Known Issues
1. **Django pinned to 4.2.13, not 5.0.6** — driven by your Python 3.9.5.
2. `/admin/users/{id}/submissions/` not wired to its own endpoint — reachable via `/admin/submissions/?search=<matric_number>`. Low priority.
3. Student profile, Lecturer assignments, and all Admin management pages are still placeholder screens.
4. A test student account (`teststudent@edusubmit.local`) exists in the local DB from end-to-end verification — harmless for dev, delete before any demo if it matters.
5. No courses/assignments exist yet in the DB — the upload page will show empty dropdowns until an Admin creates a course + assigns a lecturer, and that lecturer creates an assignment (both doable right now via Django admin at `/admin/` even though the dedicated UI is Phase 5).

## Open Questions For You
1. Want me to seed a test course + lecturer + assignment via Django admin so you can actually test the upload flow end-to-end in the browser, or will you create real ones?
2. Should I delete the `teststudent@edusubmit.local` test account now, or leave it for your own testing?
