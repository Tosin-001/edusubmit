# EduSubmit — Project Status

Last updated: 2026-07-19

## Overview
**MAJOR PIVOT IN PROGRESS**: converting from a university model (Course→Lecturer→Student) to a
secondary-school model (Class→Subject→Teacher→Student), per the 2026-07-19 architecture doc.
This is a multi-phase conversion — see "Pivot Progress" below for exactly what's done vs. pending.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Repo: https://github.com/Tosin-001/edusubmit (main branch — **not yet pushed, see below**)
Admin login: `admin@edusubmit.local` / `AdminPass2026!`

## Pivot Progress (2026-07-19)
- [x] Phase A: New models — `Subject` (renamed from `Course`), `SchoolClass` (new), `TeacherAssignment` (new), `User.school_class`, `Role.LECTURER`→`Role.TEACHER` with data migration. All verified live, zero data loss.
- [x] Phase B (partial): enough of the backend unblocked to load and pass checks — new Subject/Class/TeacherAssignment CRUD endpoints working, URL namespace partially renamed (`/teachers/`, `/subjects/`, `/classes/`, `/teacher-assignments/`), upload whitelist tightened to PDF/DOC/DOCX per the security section.
- [ ] Phase B (remaining): Assignment creation workflow rewired to the TeacherAssignment-first, no-dropdown flow; Student visibility filtered by `school_class`; Review Queue scoped by TeacherAssignment instead of the deprecated course/lecturer path
- [ ] Phase C: Frontend — Teacher terminology, Class/Subject/TeacherAssignment admin UI, class-scoped assignment picker
- [ ] Phase D: Public landing page (Student/Teacher login only) + separate `/admin-login`
- [ ] Phase E: Security review (cookies, cross-role access re-audit against new models)
- [ ] Phase F: Your 10-step end-to-end validation + final completion report

## ⚠️ Known-broken right now (until Phase C lands)
The **frontend is completely unchanged** and still calls the old URLs. Concretely:
- Admin → Courses page: calls `/admin/courses/` → now 404 (renamed to `/admin/subjects/`)
- Lecturer dashboard/nav: calls `/api/v1/lecturers/...` → now 404 (renamed to `/api/v1/teachers/...`)
- Admin Dashboard's "Lecturers" stat card: backend now returns `total_teachers`, not `total_lecturers` — will show blank/undefined
**Do not demo the live app until Phase C.** The backend is intentionally ahead of the frontend right now; this is a checkpoint, not a finished state.


## Pre-Pivot Completed Work (Phases 1–6, university model)
- Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes
- Phase 2: Django backend scaffold
- Phase 3: Next.js 15 frontend scaffold — auth, role-gated middleware, 3 dashboards
- Phase 4: Assignment upload UI + Lecturer Review Queue
- Phase 5: Admin/Lecturer management panel UI, Activity Logs
- Read-only My Profile pages (Student + Lecturer) — closed a real permission gap (MeView allowed self-editing Admin-assigned fields)
- Phase 6: QA pass — Modal a11y/Escape-key, empty-state messaging, full live E2E workflow test
All of the above still exists in the codebase but is now mid-rename to the secondary-school terminology (see Pivot Progress above) — expect some of it to be temporarily inconsistent or broken until Phase C.

## Known Issues (carried forward, still relevant)
1. Django pinned to 4.2.13, not 5.0.6 — driven by Python 3.9.5 on this machine.
2. **Recurring unexplained password/auth flakiness** (3 occurrences across Phases 5–6): a password confirmed correct via direct DB check intermittently failed to authenticate via HTTP against a `runserver` process. Root cause not identified — ruled out multiple databases. If you hit "works via DB check but fails via login," try killing stray `python`/`node` processes and retrying before assuming a code bug.
3. Test/demo accounts in local DB: `teststudent@edusubmit.local` / `TestPass123!`, `lecturer@edusubmit.local` / `8sdWXaBC2DAU4MI9` (now role=teacher), `admin@edusubmit.local` / `AdminPass2026!`.
4. Native `confirm()` dialogs used for a couple of destructive actions (Admin submission delete) rather than a styled confirmation modal.
5. Manual visual/responsive browser testing still not done — no browser automation tool available in this environment.

## Open Questions For You
1. Given the frontend is now out of sync with the backend (see "Known-broken" above), do you want me to continue straight into finishing Phase B (assignment workflow + class-scoped visibility) before touching the frontend, or pause here so you can review the model/API design first?
2. For `TeacherAssignment`, I made it one-teacher-per-(subject,class) — no team teaching / multiple teachers sharing a subject+class. Confirm that's right, or should it allow multiple?
3. Old deprecated fields (`Subject.lecturer`/`semester`, `Assignment.course`/`lecturer`) — kept for now per your no-destructive-migration rule. Want a target date/phase to actually drop them once you've confirmed nothing needs the pre-pivot data, or leave them indefinitely?
