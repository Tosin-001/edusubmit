# EduSubmit — Project Status

Last updated: 2026-07-20

## Overview
**MAJOR PIVOT**: converting from a university model (Course→Lecturer→Student) to a
secondary-school model (Class→Subject→Teacher→Student). Backend and frontend are now both
functionally complete for the core workflow. Deployment prep (Phases D–F) remains.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Repo: https://github.com/Tosin-001/edusubmit (main branch)
Admin login: `admin@edusubmit.local` / `AdminPass2026!`

## Pivot Progress
- [x] Phase A: `Subject`/`SchoolClass`/`TeacherAssignment` models, `Role.LECTURER`→`Role.TEACHER` data migration. Zero data loss, verified.
- [x] Phase B: Assignment creation rewired to TeacherAssignment-first no-dropdown flow; class-scoped Student visibility; TeacherAssignment-scoped Review Queue. Full loop verified live.
- [x] **Phase C: Frontend fully converted.** Zero `Course`/`Lecturer` references remain anywhere in `frontend/` source (verified via full-codebase search, not spot-checked). Teacher Dashboard rebuilt around clickable Subject/Class cards; assignment creation has no Subject/Class picker at all. New Admin UI for Subjects/Classes/Teacher Assignments. `tsc`/`build` clean (22 routes), live API contract-verified for every new/changed endpoint.
- [ ] Phase D: Public landing page (Student/Teacher login only) + separate `/admin-login`
- [ ] Phase E: Security review (cookies, cross-role access re-audit against new models)
- [ ] Phase F: Your 10-step end-to-end validation + final completion report

## ⚠️ Not yet done
1. **No browser/visual testing** — no browser automation tool available in this environment. Recommend a manual click-through before anything else, especially: Teacher Dashboard → click a class card → Create Assignment (the biggest UX change); Admin → Teacher Assignments → the cascade-delete warning; Student Upload with 0 vs 1+ assignments.
2. No public landing page yet — the app still opens straight to `/login`.
3. Admin and Student/Teacher login aren't separated onto different routes yet (Phase D requirement).
4. Security review section from the pivot doc (cookie flags, broader cross-role re-audit) not yet done — file-type whitelist tightening (Phase A) is the only security item completed so far.

## Pre-Pivot Completed Work (Phases 1–6, university model)
- Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes
- Phase 2: Django backend scaffold
- Phase 3: Next.js 15 frontend scaffold — auth, role-gated middleware, 3 dashboards
- Phase 4: Assignment upload UI + Lecturer Review Queue
- Phase 5: Admin/Lecturer management panel UI, Activity Logs
- Read-only My Profile pages — closed a real permission gap
- Phase 6: QA pass — Modal a11y/Escape-key, empty-state messaging, full live E2E workflow test
Fully superseded by the pivot now (Phase C renamed/rebuilt everything Lecturer/Course-related);
kept here for history only.

## Known Issues
1. Django pinned to 4.2.13, not 5.0.6 — driven by Python 3.9.5 on this machine.
2. **Recurring unexplained password/auth flakiness** (3 occurrences across Phases 5–6, none during the pivot work itself). Root cause not identified. If "works via DB check but fails via login" happens again, try killing stray `python`/`node` processes before assuming a code bug.
3. Test/demo accounts in local DB: `teststudent@edusubmit.local` / `TestPass123!` (class JS1), `lecturer@edusubmit.local` / `8sdWXaBC2DAU4MI9` (role=teacher, teaches Mathematics—JS1), `admin@edusubmit.local` / `AdminPass2026!`, `noclass@edusubmit.local` / `NoClass123!` (student with no class, for testing empty states).
4. Native `confirm()` dialogs used for a few destructive actions (Admin submission delete, Teacher Assignment removal) rather than a styled confirmation modal — the Teacher Assignment one has strong explanatory text about the cascade, so it's not just a bare "are you sure."
5. Deprecated backend fields (`Subject.lecturer`/`semester`, `Assignment.course`/`lecturer`) still present, not dropped.

## Open Questions For You
1. Ready for Phase D (landing page + admin route separation), or want to do a manual browser pass first given nothing's been visually verified yet?
2. Deprecated fields — still no target date from you on when it's safe to drop them. Not urgent, just tracking it.
3. `TeacherAssignment` deletion currently hard-deletes (with a strong warning) rather than being archivable like Subject/Class/Assignment. Given it cascades to real student data, want me to add an `is_archived` field to `TeacherAssignment` too (matching the pattern everywhere else) so it's reversible, or is a warned hard-delete acceptable here?
