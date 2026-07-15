# EduSubmit — Project Status

Last updated: 2026-07-14

## Overview
Assignment Submission and Administration System.
Stack: Next.js 15 + TypeScript + Bootstrap 5 (frontend) | Django + DRF + PostgreSQL (backend) | JWT auth.
Roles: Student, Lecturer, Admin (upgraded from the original 2-role spec per project owner's instruction).

## Completed Tasks
- [x] Local project folder created: `C:\Users\ADELAKUN OLUWATOSIN\Documents\NHS\EduSubmit`
- [x] `/docs`, `/backups` folders created
- [x] `PROJECT_STATUS.md`, `CHANGELOG.md` initialized

## Current Task — Phase 1 (Architecture & Planning)
- [x] System architecture doc (`docs/01-system-architecture.md`)
- [x] Database ERD, 3-role model (`docs/02-database-erd.md`)
- [x] API endpoint map (`docs/03-api-endpoint-map.md`)
- [x] Folder structure (`docs/04-folder-structure.md`)
- [x] User flows (`docs/05-user-flows.md`)
- [x] UI wireframes, text/ASCII (`docs/06-ui-wireframes.md`)
- [ ] **Awaiting your approval before Phase 2 (Django backend scaffolding) begins**

## Pending / Not Started
- Phase 2: Django backend scaffold (models, migrations, DRF serializers/views, JWT)
- Phase 3: Next.js frontend scaffold (auth pages, dashboards)
- Phase 4: Assignment upload + review workflow
- Phase 5: Admin/Lecturer management panels
- Phase 6: Styling pass (Bootstrap theme, responsive QA)
- Phase 7: Deployment (Vercel + Railway/Render)
- Phase 8: Testing & hardening
- GitHub repo connection — **need repo URL/name from you** to link this local folder as origin

## Known Issues
- None yet (pre-code phase)

## Open Questions For You
1. What is the GitHub repo URL for EduSubmit? (You said it already exists — I'll `git init` / set remote once you give it to me.)
2. Should Lecturers be able to create their own courses, or does Admin assign courses to Lecturers?
3. Should Admin retain override power on all reviews (grade/status) even after a Lecturer has reviewed, or is Lecturer review final for their own courses?
