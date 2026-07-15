# EduSubmit — Changelog

All notable changes to this project are documented here.
Format: Date/Time | Files Changed | What Changed | Why

---

## 2026-07-14

**14:00 WAT** | Created | `PROJECT_STATUS.md`, `CHANGELOG.md`, `/docs`, `/backups`
Why: Project kickoff. Establishing tracking files before any code is written, per project rules (never modify without changelog entry, backups folder required before edits).

**14:05 WAT** | Planned | Phase 1 deliverables (architecture, ERD, API map, folder structure, user flows, wireframes)
Why: User requested full architecture package for approval before Phase 1 coding begins. Role model expanded from spec's original 2 roles (Student/Admin) to 3 roles (Student/Lecturer/Admin) per explicit instruction.

**14:30 WAT** | Created | `docs/01-system-architecture.md` through `docs/06-ui-wireframes.md`
Why: Phase 1 deliverable — architecture, DB ERD (3-role model), API endpoint map, folder structure, user flows, and wireframes, all pending your approval before Phase 2 (Django backend scaffold) begins.


## 2026-07-15

**15:00 WAT** | Approved | Phase 1 architecture
Why: User approved Phase 1, connected GitHub repo `github.com/Tosin-001/edusubmit`, and confirmed: (1) courses are Admin-assigned, not Lecturer-created; (2) Admin can override a Lecturer's review.

**15:00–15:15 WAT** | Created | Full Django backend scaffold: `backend/config/`, `backend/accounts/`, `backend/academics/`, `backend/assignments/`, `backend/submissions/`, `backend/activitylogs/` (models, serializers, views, permissions, urls, admin, migrations)
Why: Phase 2 deliverable per approved architecture. Custom `User` model (email login, 3 roles), JWT auth with role claim, admin-assigned `Course` model, Lecturer-scoped `Assignment`/`Submission` review with Admin override + audit logging on every write action.

**15:10 WAT** | Deviation | `requirements.txt`: Django pinned to `4.2.13` instead of the originally planned `5.0.6`
Why: Local machine runs Python 3.9.5; Django 5.0 requires Python ≥3.10. Django 4.2 is the current LTS release (security support into April 2026) and supports Python 3.9, so no functionality is lost.

**15:12 WAT** | Modified | `backend/accounts/urls_student.py`, `urls_lecturer.py`, `urls_admin.py`, `backend/academics/views.py` (backed up to `/backups` first)
Why: Wired dashboard/submission/course endpoints from `submissions` and `academics` apps into the role-based URL files per the approved API map; added `MyCoursesView` so `/lecturers/me/courses/` returns only the lecturer's own courses instead of the full course list.

**15:15 WAT** | Verified | `manage.py check` (0 issues), `manage.py makemigrations` (5 apps, all migrations generated cleanly)
Why: Confirms all models, relationships, and app config are structurally valid before handing off. DB connection warning during makemigrations is expected — no local Postgres/`.env` configured yet (see Known Issues).

**15:16 WAT** | Committed & pushed | Initial commit to `github.com/Tosin-001/edusubmit` `main` (69 files)
Why: Repo was empty; this establishes Phase 1 + Phase 2 as the project baseline.
