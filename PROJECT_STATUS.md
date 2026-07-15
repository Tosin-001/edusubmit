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
- [x] Phase 2: Django backend scaffold
  - [x] `accounts` — custom `User` model (email login, role field), JWT login/refresh/logout, student self-registration, admin staff creation, change password
  - [x] `academics` — `Course` model (admin-assigned), list/create/detail views
  - [x] `assignments` — `Assignment` model, lecturer-scoped create/list/detail
  - [x] `submissions` — `Submission` model + upload, student/lecturer/admin list views, review endpoint (lecturer own-course, admin any + override), download endpoint, dashboards (student/lecturer/admin)
  - [x] `activitylogs` — audit log model + admin list endpoint, wired into every write action above
  - [x] `manage.py check` passed, `makemigrations` generated cleanly for all 5 apps
  - [x] Committed + pushed to GitHub (69 files, initial commit)

## Current Task
Phase 2 complete. **Awaiting your go-ahead for Phase 3 (Next.js frontend scaffold).**

## Pending / Not Started
- Phase 3: Next.js frontend scaffold (landing page, auth pages, role-gated dashboards)
- Phase 4: Assignment upload UI + review workflow UI
- Phase 5: Admin/Lecturer management panel UI
- Phase 6: Styling pass (Bootstrap theme, responsive QA)
- Phase 7: Deployment (Vercel + Railway/Render)
- Phase 8: Testing & hardening (unit tests, DRF test client, file upload edge cases)

## Known Issues
1. **No local PostgreSQL configured yet.** `backend/.env` doesn't exist (only `.env.example`) — `makemigrations` ran but `migrate` has not been run against a real database. You'll need to install/start Postgres, create a `edusubmit` DB, copy `.env.example` → `.env`, and fill in real credentials before the API can actually serve requests.
2. **Django pinned to 4.2.13, not 5.0.6** — see Changelog 2026-07-15, driven by your Python 3.9.5.
3. `/admin/users/{id}/submissions/` (a student's submission history, from the original API map) is not yet wired to its own endpoint — currently reachable via `/admin/submissions/?search=<matric_number>` instead. Low priority; can add a dedicated route in Phase 4 if you want the exact original shape.
4. Frontend (`/frontend`) does not exist yet — Phase 3.

## Open Questions For You
1. Local Postgres: do you already have it installed, or do you want a docker-compose for Postgres to make local dev easier?
2. Phase 3 start: landing page first, or straight into the 3 dashboards with placeholder landing?
