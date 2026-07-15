# EduSubmit — Project Status

Last updated: 2026-07-15

## Overview
Assignment Submission and Administration System.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Roles: Student, Lecturer, Admin. Courses are Admin-assigned. Admin can override Lecturer reviews.
Repo: https://github.com/Tosin-001/edusubmit (main branch, pushed)

## Completed Tasks
- [x] Local project folder + `/docs`, `/backups`, `PROJECT_STATUS.md`, `CHANGELOG.md`
- [x] Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes — approved
- [x] Phase 2: Django backend scaffold (accounts, academics, assignments, submissions, activitylogs)
  - `manage.py check` passed, `makemigrations` generated cleanly for all 5 apps
- [x] Phase 3: Next.js 15 frontend scaffold
  - Auth: `/login`, `/register` (student), JWT stored client-side, role-aware `middleware.ts`
  - `lib/api.ts` — typed fetch wrapper, auto-refresh on 401, `lib/auth.ts` — token/role storage
  - 3 role dashboards (`/student`, `/lecturer`, `/admin`) wired live to the Phase 2 API, each with its own `DashboardShell` (sidebar nav, mobile drawer, logout)
  - Bootstrap 5 wired in with the spec's color palette (`app/globals.css`)
  - `npx tsc --noEmit` clean, `npm run build` clean — 19 routes generated
  - Committed + pushed (44 files)

## Current Task
Phase 3 complete. **Awaiting your go-ahead for Phase 4 (assignment upload UI + review workflow UI).**

## Pending / Not Started
- Phase 4: Student upload page (drag-drop, progress bar), My Submissions table (search/filter), Lecturer Review Queue + grading form
- Phase 5: Admin/Lecturer management panel UI (users, courses, submissions, activity logs — currently placeholder pages)
- Phase 6: Styling pass / responsive QA beyond the current baseline
- Phase 7: Deployment (Vercel + Railway/Render)
- Phase 8: Testing & hardening (unit tests, DRF test client, file upload edge cases)

## Known Issues
1. **No local PostgreSQL configured yet.** `backend/.env` doesn't exist (only `.env.example`) — `migrate` has not run against a real DB, so the API can't serve real requests yet. `frontend/.env.local` also doesn't exist yet (only `.env.local.example`).
2. **Django pinned to 4.2.13, not 5.0.6** — driven by your Python 3.9.5 (see Changelog 2026-07-15).
3. `/admin/users/{id}/submissions/` not wired to its own endpoint yet — reachable via `/admin/submissions/?search=<matric_number>` instead. Low priority.
4. Student upload/submissions/profile, Lecturer assignments/review, and all Admin management pages are placeholder screens — real UI is Phase 4/5.
5. **Two recurring environment quirks on this machine, now handled:** (a) global `NODE_ENV=production` was silently skipping devDependencies on `npm install` — `frontend/package.json` scripts now use `cross-env` and there's a `postinstall` reminder; (b) a stray `package-lock.json` at `C:\Users\ADELAKUN OLUWATOSIN\` was making Next.js mis-detect the workspace root — fixed via `outputFileTracingRoot` in `next.config.ts`.

## Open Questions For You
1. Now that Postgres is on you: once `.env` is filled in, want me to run `migrate` + create a superuser for you, or will you do that yourself?
2. Phase 4 start: Student upload flow first, or Lecturer review queue first?
