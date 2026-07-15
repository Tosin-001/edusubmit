# EduSubmit — API Endpoint Map

Base URL: `/api/v1/`
Auth: `Authorization: Bearer <access_token>` unless marked public.

## Auth (`/api/v1/auth/`)

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| POST | `/auth/register/student/` | Public | Student self-registration |
| POST | `/auth/login/` | Public | Returns access + refresh token, role in payload |
| POST | `/auth/refresh/` | Public (needs refresh token) | Rotates access token |
| POST | `/auth/logout/` | Authenticated | Blacklists refresh token |
| POST | `/auth/change-password/` | Authenticated | |

## Student (`/api/v1/students/`)

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/students/me/` | Student | Own profile |
| PATCH | `/students/me/` | Student | Edit own profile |
| GET | `/students/me/dashboard/` | Student | Totals: submissions, pending, approved, avg grade |
| GET | `/students/me/submissions/` | Student | List own submissions, filter by status/course |
| POST | `/submissions/` | Student | Upload assignment (multipart) |
| GET | `/submissions/{id}/` | Student (own) | Detail incl. grade/feedback |

## Lecturer (`/api/v1/lecturers/`)

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/lecturers/me/dashboard/` | Lecturer | Stats for own courses |
| GET | `/lecturers/me/courses/` | Lecturer | Own courses |
| GET | `/lecturers/me/assignments/` | Lecturer | Own assignments |
| POST | `/assignments/` | Lecturer | Create assignment for own course |
| PATCH | `/assignments/{id}/` | Lecturer (own) | Edit |
| GET | `/lecturers/me/submissions/` | Lecturer | Submissions to own courses, filterable |
| PATCH | `/submissions/{id}/review/` | Lecturer (own course) | Set grade, feedback, status |

## Admin (`/api/v1/admin/`)

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/admin/dashboard/` | Admin | Platform-wide stats + chart data |
| GET | `/admin/users/` | Admin | List/search/filter all users |
| POST | `/admin/users/` | Admin | Create lecturer/admin account |
| PATCH | `/admin/users/{id}/` | Admin | Edit, deactivate |
| DELETE | `/admin/users/{id}/` | Admin | Delete (soft-delete preferred) |
| GET | `/admin/users/{id}/submissions/` | Admin | Submission history for one student |
| GET | `/admin/courses/` | Admin | List/create/assign lecturer |
| POST | `/admin/courses/` | Admin | |
| PATCH | `/admin/courses/{id}/` | Admin | Reassign lecturer |
| GET | `/admin/submissions/` | Admin | All submissions, search by name/matric/course, filter status/date |
| PATCH | `/admin/submissions/{id}/review/` | Admin | Override any review |
| DELETE | `/admin/submissions/{id}/` | Admin | |
| GET | `/admin/activity-logs/` | Admin | Paginated audit trail |

## Shared

| Method | Endpoint | Access | Notes |
|---|---|---|---|
| GET | `/submissions/{id}/download/` | Owner/Lecturer(course)/Admin | Signed/temporary file URL |
| GET | `/courses/` | Authenticated | Read-only course list (for dropdowns) |
