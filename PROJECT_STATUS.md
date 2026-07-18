# EduSubmit — Project Status

Last updated: 2026-07-18

## Overview
Assignment Submission and Administration System.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Roles: Student, Lecturer, Admin. Courses are Admin-assigned. Admin can override Lecturer reviews.
Repo: https://github.com/Tosin-001/edusubmit (main branch, pushed)
Local dev: Postgres running, `backend/.env` + `frontend/.env.local` configured, migrations applied, superuser + demo lecturer/course/assignment seeded.
Admin login: `admin@edusubmit.local` / `AdminPass2026!`

## Completed Tasks
- [x] Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes
- [x] Phase 2: Django backend scaffold (accounts, academics, assignments, submissions, activitylogs)
- [x] Phase 3: Next.js 15 frontend scaffold — auth, role-gated middleware, 3 live dashboards
- [x] Phase 4: Assignment upload UI + review workflow UI
- [x] Phase 5: Admin/Lecturer management panel UI (Lecturer Assignment Management, Review Queue course/status filters, Admin Users/Courses/Submissions, Activity Logs)
- [x] **Read-only My Profile pages** (Student + new Lecturer page) — closed a real permission gap where `MeView` allowed self-editing Admin-assigned fields with no restriction
- [x] **Phase 6 (QA pass) — code-level complete**: Modal Escape-key + a11y attributes, empty-state messaging for zero-courses scenarios (Student Upload, Lecturer Dashboard, Lecturer Assignments), full live end-to-end workflow test across all 3 roles (upload → review → grade → student sees it → admin override → activity log captures it)

## Current Task
Phase 6 code-level QA complete. **Not yet done: actual visual/browser testing at real breakpoints** — no browser automation tool is available in this environment, so responsive behavior was verified by reviewing the CSS/Bootstrap classes, not by rendering and screenshotting. Recommend a manual pass in Chrome DevTools' device toolbar (or on your phone) before calling Phase 6 fully closed.

## Pending / Not Started
- Manual visual/responsive QA pass (see above)
- Phase 7: Deployment (Vercel + Railway/Render)
- Phase 8: Testing & hardening (automated unit tests, DRF test client, file upload edge cases)

## Known Issues
1. **Django pinned to 4.2.13, not 5.0.6** — driven by your Python 3.9.5.
2. `/admin/users/{id}/submissions/` not wired to its own endpoint — reachable via `/admin/submissions/?student=<id>`.
3. Test/demo accounts in local DB (harmless): `teststudent@edusubmit.local` / `TestPass123!`, `lecturer@edusubmit.local` / `8sdWXaBC2DAU4MI9`, `admin@edusubmit.local` / `AdminPass2026!`.
4. **Recurring unexplained password/auth flakiness, now 3 occurrences** (admin account twice in Phase 5, teststudent once in Phase 6): a password confirmed correct via direct DB check would intermittently fail to authenticate via HTTP against a `runserver` process, then work again after killing all `python`/`node` processes and starting fresh. Ruled out: multiple databases (confirmed single Postgres instance, single `edusubmit` DB, correct user count each time), stale processes in the most recent occurrence (a genuinely fresh process still failed once, then worked on retry). **Root cause not identified.** If you hit "works when I check the DB directly but fails when I actually log in," this is likely it — try killing stray `python`/`node` processes and retrying before assuming a code bug. Worth keeping an eye on once real users are on this.
5. Native `confirm()` dialogs used for a couple of destructive actions (Admin submission delete) rather than a styled confirmation modal — functional but not visually consistent with the rest of the UI. Low priority polish item for Phase 6/8.

## Open Questions For You
1. Please do a manual responsive pass (resize browser / DevTools device toolbar) on at least: Login, a Dashboard, the Lecturer Review Queue (list+form split view), and Admin Users (table→cards) — these are the layouts most likely to have real-device quirks I can't verify without a browser tool.
2. Next: Phase 7 (deployment) or Phase 8 (automated tests) — or something else on your mind first?
