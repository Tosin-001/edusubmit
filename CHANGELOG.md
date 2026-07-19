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


## 2026-07-18 — Read-only Profile pages + a real permission gap closed

**Fixed a real permission gap**: `MeView` (`/students/me/`, `/lecturers/me/`) was `RetrieveUpdateAPIView` — students and lecturers could PATCH their own `full_name`, `email`, `matric_number`/`staff_id`, and `department` with no restriction. Nothing in the frontend exposed this (the old placeholder Profile page had no edit form), but the API allowed it directly. Changed to `RetrieveAPIView` (read-only). Password changes are unaffected — separate `ChangePasswordView`, not a profile-editing concern. Verified live: GET still 200, PATCH now 405.

**Created** `frontend/components/profile/MyProfile.tsx` — shared read-only profile component (name/email/matric-or-staff-ID/department, labeled "Set by Admin") + a change-password form, used by both `app/student/profile/page.tsx` (rewritten) and `app/lecturer/profile/page.tsx` (new — Lecturer had no Profile page or nav entry before this).

**Debugging note, third occurrence of the same symptom class**: `teststudent@edusubmit.local`'s password stopped matching its known value again (same as the admin account twice in Phase 5), confirmed via direct DB check with a fresh `manage.py shell` process, single Postgres instance, single `edusubmit` database, 3 total users, no duplication. Reset and re-verified working. Root cause still unidentified — flagged prominently in `PROJECT_STATUS.md` as it's now happened 3 times across Phase 5–6 and could affect real usage, not just my testing.


## 2026-07-18 (cont'd) — Phase 6, QA pass

**Systematic audit** across all 16 routes for loading states, empty states, and mobile responsiveness (checked for the desktop-table/mobile-card dual-layout pattern, or confirmed the page doesn't need it — stat-card grids and single-column forms reflow naturally via Bootstrap's grid without needing a separate mobile layout).

**Real gaps found and fixed:**
1. `Modal.tsx` had no Escape-key-to-close (click-outside and the X button worked, Escape didn't) — added, plus `role="dialog"`/`aria-modal`/`aria-label` for screen readers. Affects every modal in the app (Assignments, Users, Courses create/edit).
2. Student Upload page: an empty course dropdown gave no explanation. Added an empty-state screen ("No courses yet — once your administrator creates courses...") and a warning when a selected course has zero assignments. Fixed the wording to not say "enrolled" — this system has no per-student course enrollment, any student can submit to any course, so "enrolled" would have been actively misleading.
3. Lecturer Dashboard and Lecturer Assignments: no guidance for a lecturer with zero assigned courses (a normal first-login state, since courses are Admin-assigned). Added explanatory banners; disabled the "New Assignment" button in that state instead of letting it open a form with an empty, unusable course dropdown.

**End-to-end verification** (not just unit-level): ran the full workflow live against the API — Student uploads a real file → appears in Lecturer's Review Queue → Lecturer grades it (88, approved) → Student's dashboard aggregates update correctly (avg grade 84.0 across 3 submissions) → Student sees the grade/feedback → Admin overrides the grade (95) → Student immediately sees the new grade and `reviewed_by: EduSubmit Admin` → `submission.review_overridden` correctly appears in Activity Logs. This confirms the actual product workflow works, not just that each endpoint returns 200 in isolation.

**Scope note**: this QA pass covers code-level review (loading/empty/error states, responsive class usage) and full API-level end-to-end testing. It does not include actual browser rendering/visual screenshot testing at real breakpoints (375px/768px/1024px etc.) — no browser automation tool is available in this environment. Recommend a manual visual pass in Chrome DevTools device toolbar before considering Phase 6 fully closed.


## 2026-07-19 — Secondary School pivot, Phase A (models/migrations) + partial Phase B (backend unblock)

**Scope note**: the pivot request is large — full Lecturer→Teacher and Course→Subject rename across every layer, two new models, a redesigned assignment-creation workflow, class-scoped visibility, a public landing page, and a security review. Completing all of it in one pass isn't realistic while keeping the same verify-every-step standard used throughout this project. This entry covers what's actually done and verified; remaining work is listed explicitly below, not implied as finished.

### New models (backend/academics/models.py)
- `Subject` — renamed from `Course` via `RenameModel` (preserves all rows/IDs). `course_code`→`code` (now optional), `course_title`→`name`. `lecturer`/`semester` kept but deprecated (nullable, unused by new code, not dropped).
- `SchoolClass` (new) — e.g. "JS1", "SS2 Science". Admin creates/edits/archives; no hardcoded values.
- `TeacherAssignment` (new) — the Teacher x Subject x Class triple. One teacher per (subject, class) pair. Admin-only write, verified live that a Teacher cannot self-assign (403).

### Data migration (real, not just a rename)
`User.Role.LECTURER` → `Role.TEACHER` (value `'lecturer'`→`'teacher'`) required a `RunPython` data migration to rewrite existing rows — a code-only rename would have silently broken `is_teacher` for the existing teacher account. Verified: `lecturer@edusubmit.local`'s role is now `teacher`, `is_teacher=True`.

### Assignment model
Added `teacher_assignment` FK (nullable). **Deliberately not auto-backfilled** — pre-pivot assignments (the two "CSC301"/"CSC302" test assignments) have no natural Class mapping, so inventing one would be dishonest data, not data preservation. They keep their data via the deprecated `course`/`lecturer` fields and remain in Django admin; they simply won't appear in the new class-scoped Teacher/Student views once those are built. Verified: both assignments and all 3 submissions survived the migration intact.

### Security (from the pivot's security section)
Upload whitelist tightened to PDF/DOC/DOCX (zip removed) per the explicit "Allow: PDF, DOC, DOCX" requirement — `submissions/models.py` `FileExtensionValidator` + a migration. Existing zip submissions untouched, only affects new uploads.

### New/updated endpoints (all verified live)
- `POST/GET /api/v1/subjects/`, `/api/v1/classes/`, `/api/v1/teacher-assignments/` (Admin write, authenticated read) — verified: created "JS1" (201), "Mathematics" (201), a TeacherAssignment linking them to the existing teacher (201)
- `GET /api/v1/teachers/me/assignments-taught/` — verified: teacher sees exactly their own Subject x Class assignment (200, 1 result)
- `POST /api/v1/teacher-assignments/` as a Teacher → correctly 403 (teachers cannot assign themselves)
- URL namespace: `/api/v1/lecturers/`→`/api/v1/teachers/` (file renamed `urls_lecturer.py`→`urls_teacher.py`, old file backed up), `/api/v1/courses/`→`/api/v1/subjects/` + new `/classes/`, `/teacher-assignments/`
- `IsLecturer`/`IsLecturerOrAdmin` permission classes → `IsTeacher`/`IsTeacherOrAdmin` (old names kept as aliases, not yet purged)

### Explicitly NOT done yet (do not assume these work)
1. **Assignment creation still uses the old Subject+Teacher direct picker**, not the new "open Mathematics—JS1, no dropdowns" workflow from the spec. `assignments/views.py` and `assignments/urls.py` are unchanged.
2. **Student visibility is not yet class-scoped** — students still see all assignments platform-wide, not filtered to their own `school_class`. `User.school_class` field exists but nothing reads it yet.
3. **Review Queue is not yet scoped by TeacherAssignment** — still filters via the deprecated `course.lecturer` path.
4. **Frontend is entirely unchanged** — still says "Lecturer"/"Course" everywhere, still calls `/lecturers/`, `/courses/` (now 404) — **the Admin Courses page and Lecturer nav/dashboard will visibly break** until frontend is rewired.
5. **No public landing page, no `/admin-login` separation** — not started.
6. **Admin frontend has no UI yet for Classes/Subjects(renamed)/TeacherAssignments** — API-only, reachable via Django admin or direct API calls for now.
7. Broader security review (cookie flags, cross-role access re-audit against the new models) not yet done.

### Verified end-to-end (what you can actually trust right now)
`manage.py check` clean, `manage.py makemigrations --check --dry-run` clean (model state and migration state match exactly), `migrate` applied all 6 new migrations against the real DB with zero data loss (spot-checked every table). Live API test: Admin creates Class→Subject→TeacherAssignment, Teacher sees only their own assignment, Teacher blocked from self-assigning.


## 2026-07-19 (cont'd) — Phase B complete: the actual class-scoped workflow

**Rewired `assignments/views.py`**: new `AssignmentCreateSerializer` (title/description/due_date/max_score/`teacher_assignment` only — no Subject or Class field, matching the spec's "no dropdowns" requirement exactly). `perform_create` validates the teacher owns the `TeacherAssignment` they're posting under (403 otherwise). `get_queryset` is now role-scoped: Teacher sees only their own TeacherAssignments' assignments; Student sees only assignments matching their own `school_class` (empty list if no class assigned — a safe default, not an error); Admin sees everything including pre-pivot data.

**Rewired `submissions/views.py`**: `LecturerSubmissionListView`→`TeacherSubmissionListView`, `LecturerDashboardView`→`TeacherDashboardView` (names now match the pivot, not just internal aliases). Every ownership check (Review Queue, submission detail, review, download) now uses a combined check — new `TeacherAssignment` path OR the deprecated `course.lecturer` path — via a shared `_is_owning_teacher()` helper, so a teacher can still review pre-pivot submissions they originally owned, not just new ones.

**Verified live, the full new-model loop**:
1. Teacher creates "Algebra Homework 1" via `teacher_assignment=1` only — no course, no lecturer, no subject/class field in the payload at all (201)
2. Admin assigns `teststudent` to class JS1
3. That student's `/assignments/` now returns exactly 1 result (the new one) — **and correctly excludes both pre-pivot assignments**, confirming class-scoping works and the "don't fake-backfill old data" decision from Phase A behaves as intended, not as a bug
4. A second student created with **no class assigned** sees 0 assignments — confirms the safe-default behavior
5. Student uploads → Teacher's Review Queue shows exactly 1 pending item → Teacher grades it (200) → both dashboards (`/teachers/me/dashboard/`, `/admin/dashboard/`) return correct, non-crashing aggregate stats

### Still not done (unchanged from the Phase A note, now shorter)
Frontend (Phase C), landing page + admin route separation (Phase D), broader security review (Phase E). Backend is now functionally complete for the core "Admin sets up Class/Subject/TeacherAssignment → Teacher creates assignment → Student (class-scoped) submits → Teacher grades" loop from your validation checklist — items 1–9 of your 10-step list are now genuinely exercisable via the API. Item 10 (Activity Log records all actions) — assignment.created/reviewed/etc. logging already existed and is unchanged, confirmed still firing during the test above.
