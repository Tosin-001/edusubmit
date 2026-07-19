# EduSubmit — Project Status

Last updated: 2026-07-19

## Overview
**MAJOR PIVOT IN PROGRESS**: converting from a university model (Course→Lecturer→Student) to a
secondary-school model (Class→Subject→Teacher→Student), per the 2026-07-19 architecture doc.
Backend is now functionally complete for the core workflow; frontend has not been touched yet.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django 4.2 LTS + DRF + PostgreSQL (backend) | JWT auth.
Repo: https://github.com/Tosin-001/edusubmit (main branch)
Admin login: `admin@edusubmit.local` / `AdminPass2026!`

## Pivot Progress (2026-07-19)
- [x] Phase A: `Subject` (renamed from `Course`), `SchoolClass` (new), `TeacherAssignment` (new, one-teacher-per-subject+class — confirmed correct), `User.school_class`, `Role.LECTURER`→`Role.TEACHER` with data migration. Zero data loss, verified.
- [x] Phase B: Assignment creation rewired to the TeacherAssignment-first, no-dropdown flow; Student visibility filtered by `school_class` (empty list if no class assigned, not an error); Review Queue scoped by TeacherAssignment (with backward-compat for pre-pivot data via a combined ownership check). **Full loop verified live**: Teacher creates assignment with zero subject/class fields in the payload → class-scoped Student sees exactly the right assignments (and correctly not the old pre-pivot ones) → uploads → Teacher's Review Queue → grades it → both dashboards return correct stats.
- [ ] Phase C: Frontend — Teacher terminology, Class/Subject/TeacherAssignment admin UI, class-scoped assignment picker (currently the only gap between "backend works" and "app is usable")
- [ ] Phase D: Public landing page (Student/Teacher login only) + separate `/admin-login`
- [ ] Phase E: Security review (cookies, cross-role access re-audit against new models)
- [ ] Phase F: Your 10-step end-to-end validation + final completion report

## ⚠️ Known-broken right now (until Phase C lands)
The **frontend is completely unchanged** and still calls the old URLs. Concretely:
- Admin → Courses page: calls `/admin/courses/` → now 404 (renamed to `/admin/subjects/`)
- Lecturer dashboard/nav: calls `/api/v1/lecturers/...` → now 404 (renamed to `/api/v1/teachers/...`)
- Admin Dashboard's "Lecturers" stat card: backend now returns `total_teachers`, not `total_lecturers`
- Lecturer Assignments/Review Queue pages: old UI has Subject/Course dropdowns that no longer make sense with the new no-dropdown backend — these pages need a genuine redesign in Phase C, not just a relabel
**Do not demo the live app until Phase C.**


## Pre-Pivot Completed Work (Phases 1–6, university model)
- Phase 1: architecture, DB ERD, API map, folder structure, user flows, wireframes
- Phase 2: Django backend scaffold
- Phase 3: Next.js 15 frontend scaffold — auth, role-gated middleware, 3 dashboards
- Phase 4: Assignment upload UI + Lecturer Review Queue
- Phase 5: Admin/Lecturer management panel UI, Activity Logs
- Read-only My Profile pages (Student + Lecturer) — closed a real permission gap
- Phase 6: QA pass — Modal a11y/Escape-key, empty-state messaging, full live E2E workflow test
All of the above still exists in the codebase but is now mid-rename to the secondary-school
terminology — expect visible inconsistency in the frontend until Phase C.

## Known Issues (carried forward, still relevant)
1. Django pinned to 4.2.13, not 5.0.6 — driven by Python 3.9.5 on this machine.
2. **Recurring unexplained password/auth flakiness** (3 occurrences across Phases 5–6, none during Phase A/B pivot work). Root cause not identified. If "works via DB check but fails via login" happens again, try killing stray `python`/`node` processes before assuming a code bug.
3. Test/demo accounts in local DB: `teststudent@edusubmit.local` / `TestPass123!` (now in class JS1), `lecturer@edusubmit.local` / `8sdWXaBC2DAU4MI9` (role=teacher, teaches Mathematics—JS1), `admin@edusubmit.local` / `AdminPass2026!`, `noclass@edusubmit.local` / `NoClass123!` (student with no class, for testing the empty-visibility case).
4. Native `confirm()` dialogs used for a couple of destructive actions rather than a styled confirmation modal.
5. Manual visual/responsive browser testing still not done — no browser automation tool available in this environment.
6. Deprecated fields (`Subject.lecturer`/`semester`, `Assignment.course`/`lecturer`) still present, not dropped — awaiting your call on when it's safe to remove them (see Open Questions).

## Open Questions For You
1. Old deprecated fields (`Subject.lecturer`/`semester`, `Assignment.course`/`lecturer`) — kept for now per your no-destructive-migration rule. Want a target phase to actually drop them once you've confirmed nothing needs the pre-pivot data, or leave them indefinitely?
2. Phase C is a real frontend redesign, not a find-replace — the Lecturer Assignments page's "pick a course" dropdown becomes "click into a Mathematics—JS1 card," which is a different UI, not just relabeled text. Want me to start there, or with the simpler wins first (terminology-only pages, Admin Classes/Subjects/TeacherAssignments management UI)?
