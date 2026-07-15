# EduSubmit — User Flows

## Student Flow
1. Landing page → "Get Started" → Register (name, matric no, email, password)
2. Login → Student Dashboard (stats overview + recent activity)
3. Upload Assignment → select course, fill title/description → drag-drop file → progress bar → success toast
4. My Submissions → table with status badges → click row → detail view (grade/feedback once reviewed)
5. Profile → edit name/email → change password

## Lecturer Flow
1. Login (account provisioned by Admin, no self-registration)
2. Lecturer Dashboard → stats for own courses (pending reviews, total assignments)
3. Assignments → create new assignment (title, description, due date, course) or edit existing
4. Review Queue → list of pending submissions for own courses → open submission → view student info → download file → set grade + feedback + status → save → student sees it immediately

## Admin Flow
1. Login (separate admin login route)
2. Admin Dashboard → platform stats + charts (submission trends, per-course stats)
3. User Management → search/filter → create Lecturer/Admin accounts → edit/deactivate/delete → view a student's submission history
4. Course Management → create courses, assign/reassign lecturers
5. Assignment/Submission Management → global search (name/matric/course) → filter (status/date/course) → view/download/override review/delete
6. Activity Logs → audit trail of all actions
