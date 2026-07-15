# EduSubmit — Folder Structure

```
EduSubmit/
├── docs/                        # all project documentation (this folder)
├── backups/                     # timestamped pre-edit backups (per project rules)
├── CHANGELOG.md
├── PROJECT_STATUS.md
├── frontend/                    # Next.js 15 app
│   ├── app/
│   │   ├── (public)/
│   │   │   ├── page.tsx                # landing page
│   │   │   ├── login/page.tsx
│   │   │   └── register/page.tsx
│   │   ├── (student)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── upload/page.tsx
│   │   │   ├── submissions/page.tsx
│   │   │   └── profile/page.tsx
│   │   ├── (lecturer)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── assignments/page.tsx
│   │   │   └── review/[id]/page.tsx
│   │   ├── (admin)/
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── users/page.tsx
│   │   │   ├── courses/page.tsx
│   │   │   ├── submissions/page.tsx
│   │   │   └── logs/page.tsx
│   │   └── layout.tsx
│   ├── components/
│   │   ├── ui/                          # buttons, cards, badges, modals
│   │   ├── layout/                      # sidebar, topbar, mobile drawer
│   │   ├── charts/
│   │   └── forms/
│   ├── lib/
│   │   ├── api.ts                       # typed fetch wrapper + JWT attach
│   │   ├── auth.ts                      # token storage, refresh logic
│   │   └── types.ts
│   ├── middleware.ts                    # route guarding by role
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
