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


## 2026-07-15 (cont'd)

**16:00–16:40 WAT** | Created | Full Next.js 15 frontend scaffold under `frontend/`: `lib/api.ts`, `lib/auth.ts`, `lib/types.ts`, `middleware.ts`, `app/layout.tsx`, `app/page.tsx`, `app/login/`, `app/register/`, `app/student/*`, `app/lecturer/*`, `app/admin/*`, `components/layout/DashboardShell.tsx`, `components/ui/StatCard.tsx`, `components/ui/StatusBadge.tsx`
Why: Phase 3 deliverable. Auth (login/student-register), JWT storage + auto-refresh, role-gated middleware, and 3 live dashboards wired to the Phase 2 API, per your instruction to skip the landing page and go straight to auth + dashboards.

**16:05 WAT** | Deviation | Routing uses plain folders (`app/student/`, `app/lecturer/`, `app/admin/`) instead of the `(student)`/`(lecturer)`/`(admin)` route groups shown in `docs/04-folder-structure.md`
Why: Next.js route groups `(name)` don't add a URL segment — `app/(student)/dashboard/page.tsx` and `app/(lecturer)/dashboard/page.tsx` would both resolve to `/dashboard` and collide. Plain folders give distinct URLs (`/student/dashboard`, `/lecturer/dashboard`) which `middleware.ts` also needs for role-based path matching. `docs/04-folder-structure.md` updated to match.

**16:10 WAT** | Fixed | `frontend/package.json` scripts (`dev`/`start` wrapped in `cross-env`), added `postinstall` reminder
Why: This machine has a global `NODE_ENV=production` shell variable (same issue as intern-scoreboard) which was silently causing `npm install` to skip all devDependencies (`@types/node` missing, `tsc` failing). Confirmed via `echo $env:NODE_ENV`.

**16:15 WAT** | Fixed | `frontend/next.config.ts` — added `outputFileTracingRoot: __dirname`
Why: A pre-existing `package-lock.json` at `C:\Users\ADELAKUN OLUWATOSIN\` (unrelated project) was making Next.js mis-detect the monorepo root during build, per the known environmental quirk noted in prior projects.

**16:16 WAT** | Fixed | `frontend/eslint.config.mjs` — switched to `FlatCompat` wrapping `next/core-web-vitals` + `next/typescript`
Why: The version of `eslint-config-next` resolved for this project ships legacy (`extends`-style) config, not flat-config arrays; the originally scaffolded `eslint.config.mjs` assumed flat-config exports and failed with `nextVitals is not iterable`. `FlatCompat` bridges the two formats — this is the current Next.js-recommended pattern.

**16:20 WAT** | Verified | `npx tsc --noEmit` (0 errors), `npm run build` (clean, 19 routes generated, no ESLint or type errors)
Why: Confirms the frontend actually compiles and builds, not just "looks plausible."

**16:22 WAT** | Committed & pushed | `github.com/Tosin-001/edusubmit` `main` (44 files)
Why: Phase 3 baseline.


## 2026-07-16

**Local dev environment fully wired up.**

**Postgres password reset** — user ran the trust-mode script in an elevated PowerShell (verified `pg_hba.conf` byte-identical to backup before and after; auth restored to `scram-sha-256` post-reset).

**Created** `backend/.env` (real SECRET_KEY, DB credentials, JWT/upload settings) and `frontend/.env.local` — both gitignored, never committed.
Why: `.env.example` files existed but no real `.env` — API couldn't serve requests without them.

**Ran** `manage.py migrate` — all 34 migrations applied cleanly across 10 apps (5 ours + Django's auth/admin/contenttypes/sessions/token_blacklist).

**Created** Django superuser: `admin@edusubmit.local` (role=admin). Credentials shared with user directly, not stored in any tracked file.

**Verified end-to-end**: started `runserver`, POSTed to `/api/v1/auth/login/` with the superuser credentials, got back a valid JWT pair with `role`/`full_name` claims (HTTP 200). Confirms backend + DB + JWT auth actually work together, not just "migrations ran."

**16:35 WAT (Phase 4 start)** | Fixed | `backend/assignments/views.py` (backed up first)
Why: `/api/v1/assignments/` was Lecturer/Admin-only for GET, which meant Students had no way to see what assignments exist to upload against — a real functional gap caught while starting the Phase 4 upload UI, not a spec ambiguity. Now GET is open to any authenticated user (students see all assignments read-only); POST/PATCH/DELETE remain Lecturer(own course)/Admin-only, unchanged.


## 2026-07-16 (cont'd) — Phase 4 (Student upload flow)

**Created** `frontend/app/student/upload/page.tsx` — course/assignment dependent dropdowns, drag-and-drop zone, client-side file type/size validation (mirrors assignment's `allowed_file_types`/`max_file_size_mb`), real upload progress bar via a new `uploadWithProgress()` helper in `lib/api.ts` (XHR-based, since `fetch` has no upload progress event), success redirect to My Submissions.

**Created** `frontend/app/student/submissions/page.tsx` — live table (desktop) / stacked cards (mobile) of the student's own submissions, search + status filter, status badges, grade/feedback columns.

**Verified end-to-end** with a fresh test account: registered → logged in → GET `/assignments/` → GET `/courses/` all returned 200. Test account left in the DB (`teststudent@edusubmit.local`) — fine for local dev, flagging in case you want it removed before demoing.


**16:50 WAT** | Created | `backend/accounts/management/commands/seed_demo.py` (`python manage.py seed_demo`)
Why: Upload page dropdowns were empty — no courses/assignments existed. Rather than a throwaway script, added a proper idempotent management command (safe to re-run) that seeds one demo Lecturer (`lecturer@edusubmit.local`), one Course (`CSC301`, assigned to that lecturer), and one Assignment. Verified via live API request that the seeded course/assignment now appear for a student's `/courses/` and `/assignments/` calls.


## 2026-07-16 (cont'd) — Phase 4 complete (Lecturer Review Queue)

**Created** `frontend/app/lecturer/review/page.tsx` — split view: submission list (own courses only, via existing `/lecturers/me/submissions/`) on the left, grading form on the right. Selecting a submission fetches full detail, form PATCHes the existing `/submissions/{id}/review/` endpoint (grade, status, feedback, review_notes). List refreshes after save so status badges update immediately.

**Added** `downloadFile()` to `lib/api.ts` — the `/submissions/{id}/download/` endpoint needs the JWT header, which a plain `<a href>` can't send, so this fetches as a blob and triggers a browser save via a temporary object URL. Used by the review form's "Download File" button.

**Verified**: `npx tsc --noEmit` clean, `npm run build` clean (all 16 routes, `/lecturer/review` now ~3KB of real content vs. the ~140B placeholder).

**Note:** hit a transient Windows issue mid-build — a prior `npm run build` left orphaned `node` processes holding file locks on `.next/trace`, causing later builds to hang indefinitely. Killed all `node` processes and cleared `.next` before the final successful build. Not a code issue; flagging in case it recurs.

**Phase 4 is now done**: Student upload flow + Lecturer Review Queue both live and wired end-to-end to the Phase 2 API.


## 2026-07-17 — Phase 5, Items 1–2 (Lecturer Assignment Management, Review Queue improvements)

**Fixed a real pre-existing bug**: `search_fields` was set on several views (courses, submissions, now assignments) since Phase 2, but `REST_FRAMEWORK.DEFAULT_FILTER_BACKENDS` never included `rest_framework.filters.SearchFilter` — only `DjangoFilterBackend`. Every `?search=` param across the whole API has been silently doing nothing since Phase 2. Also added `OrderingFilter`, since `?ordering=` was already used in frontend code (Student Dashboard, Review Queue) and had the same problem. Fixed in `config/settings.py`.

**Backend**: added `is_archived` (BooleanField) to `Assignment` — migration `0002_assignment_is_archived`. "Delete" for assignments is implemented as archive (`PATCH is_archived=true`), not hard `DELETE`, because `Assignment` cascades to `Submission` — a real delete would destroy every student's grade/feedback history for that assignment. Hard `DELETE` endpoint still exists (Admin-only in practice) but the Lecturer UI never calls it. `AssignmentListCreateView` now hides archived by default (`?archived=true` to see only archived, `?archived=all` for everything), plus `search_fields` (title, course code/title). Serializer gained `is_archived`, `is_past_due` (computed), `submission_count`.

**Created** `frontend/app/lecturer/assignments/page.tsx` — full CRUD: create/edit modal (course/title/description/due date/max score), searchable + status-filterable (Active/Archived/All) table (desktop) / cards (mobile), Archive/Restore action.

**Created** `frontend/components/ui/Modal.tsx` — reusable modal, will be reused for Admin sections next.

**Updated** `frontend/app/lecturer/review/page.tsx` — added course tabs (`All` + one per the lecturer's own courses, via existing `/lecturers/me/courses/`) and a status filter dropdown, both driving the existing `/lecturers/me/submissions/` endpoint's `assignment__course`/`status` query params.

**Verified live** end-to-end as the seeded demo lecturer: create assignment (201) → archive it (200) → search+archived-filter finds it (200) → review queue course/status filters (200).


## 2026-07-17 (cont'd) — Phase 5, Items 3–4 (Admin Management, Activity Logs)

**Backend**: renamed `AdminCreateStaffSerializer` → `AdminCreateUserSerializer` (old name kept as an alias) and broadened it to create Student accounts too, not just Lecturer/Admin — Admin can now create any role directly. Added `AdminResetPasswordSerializer` + `AdminResetPasswordView` (`POST /admin/users/{id}/reset-password/`) — generates a random password if none is supplied, returns it once in the response for the admin to relay. `AdminUserDetailView.perform_update` now logs `admin.user_activated`/`admin.user_deactivated` specifically (was generic `admin.user_updated`) by diffing `is_active` before/after, same pattern as the assignment archive logging. Broadened `AdminSubmissionListView` filters to include `assignment__lecturer` and `student` (was course/status only). Added date-range filtering (`date_from`/`date_to`) and search to `ActivityLogListView`.

**Fixed a real bug caught during live testing**: `AdminCreateUserSerializer`'s `fields` didn't include `id`, so the create-user response had no way to know the new user's ID — the reset-password/deactivate flow that immediately follows creation would have silently failed in the UI. Added `id` as read-only.

**Created** `frontend/app/admin/users/page.tsx` — full CRUD, role-aware create form (matric number for students, staff ID for lecturer/admin), search + role/status filters, activate/deactivate toggle, reset-password action (shows the generated password once in a modal).

**Created** `frontend/app/admin/courses/page.tsx` — create/edit courses, lecturer assignment dropdown (sourced from `/admin/users/?role=lecturer`), search.

**Created** `frontend/app/admin/submissions/page.tsx` — same split list/review-form pattern as the Lecturer Review Queue, but with course + lecturer + student + status filters, and both an override-review capability (Admin can re-grade any submission, including ones a Lecturer already reviewed) and a real hard-delete (unlike Assignment archiving — a single submission record has no cascade risk, and "Delete Submission" was explicit in the original spec).

**Created** `frontend/app/admin/logs/page.tsx` — action-type filter, date range, search, friendly labels for every logged action, metadata summary column (title/status/grade/role as applicable).

**Debugging detour**: hit an intermittent local-dev issue where the `admin@edusubmit.local` password appeared to silently revert between test runs, even though the DB write was confirmed correct via an in-process Django test client. Root cause looked like a stale/orphaned `runserver` process from an earlier `force_terminate` not fully releasing port 8000. Fully killing all `python` processes and starting a completely fresh `runserver` resolved it. Not a code bug — flagging in `PROJECT_STATUS.md` in case it recurs, same category as the earlier orphaned-`node` build issue.

**Verified live**: login, activity-logs filter-by-action/date-range/search, admin user create/reset-password/deactivate — all confirmed working end-to-end against a fresh server process.
