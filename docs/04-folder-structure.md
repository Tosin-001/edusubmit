# EduSubmit — Folder Structure

**Update 2026-07-15:** the `(student)`/`(lecturer)`/`(admin)` route groups originally
planned below were replaced with plain folders (`app/student/`, `app/lecturer/`,
`app/admin/`) once Phase 3 was actually built — Next.js route groups don't add a
URL segment, so grouped folders would have collided on the same `/dashboard` URL.
Landing page (`(public)/page.tsx`) was also skipped per your instruction; `/`
now just redirects to `/login` or a role dashboard. This doc reflects what's
actually on disk.

```
EduSubmit/
├── docs/                        # all project documentation (this folder)
├── backups/                     # timestamped pre-edit backups (per project rules)
├── CHANGELOG.md
├── PROJECT_STATUS.md
├── frontend/                    # Next.js 15 app
│   ├── app/
│   │   ├── page.tsx                     # redirects to /login or /{role}/dashboard
│   │   ├── login/page.tsx
│   │   ├── register/page.tsx            # student self-registration
│   │   ├── student/
│   │   │   ├── layout.tsx               # DashboardShell + student nav
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── upload/page.tsx          # placeholder — Phase 4
│   │   │   ├── submissions/page.tsx     # placeholder — Phase 4
│   │   │   └── profile/page.tsx         # placeholder — Phase 4
│   │   ├── lecturer/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── assignments/page.tsx     # placeholder — Phase 4
│   │   │   └── review/page.tsx          # placeholder — Phase 4
│   │   ├── admin/
│   │   │   ├── layout.tsx
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── users/page.tsx           # placeholder — Phase 5
│   │   │   ├── courses/page.tsx         # placeholder — Phase 5
│   │   │   ├── submissions/page.tsx     # placeholder — Phase 5
│   │   │   └── logs/page.tsx            # placeholder — Phase 5
│   │   ├── layout.tsx                   # root layout, Bootstrap import
│   │   └── globals.css                  # palette + es-* utility classes
│   ├── components/
│   │   ├── ui/                          # StatCard, StatusBadge (growing)
│   │   └── layout/                      # DashboardShell (sidebar/topbar/drawer)
│   ├── lib/
│   │   ├── api.ts                       # typed fetch wrapper, JWT + auto-refresh
│   │   ├── auth.ts                      # token storage, role cookie, JWT decode
│   │   └── types.ts
│   ├── middleware.ts                    # role-based route gating (UX only)
│   ├── public/
│   ├── .env.local.example
│   ├── package.json
│   └── next.config.ts
│
├── backend/                     # Django project
│   ├── config/                          # settings, urls, wsgi/asgi
│   ├── accounts/                        # users, auth, roles
│   │   ├── models.py  serializers.py  views.py  permissions.py  urls.py
│   ├── academics/                       # courses
│   ├── assignments/                     # assignment definitions
│   ├── submissions/                     # student uploads + review
│   ├── activitylogs/
│   ├── media/                           # uploaded files (gitignored)
│   ├── requirements.txt
│   ├── manage.py
│   └── .env.example
│
└── .github/
    └── workflows/                       # CI (lint/test) — added later
```
