# EduSubmit — UI Wireframes (Text/ASCII)

Palette: Primary #2563EB · Secondary #0F172A · Accent #14B8A6 · Bg #F8FAFC
Radius: 16–20px · Soft shadows · Large spacing · Inter/similar type

## Student Dashboard (desktop)

```
┌──────────┬──────────────────────────────────────────────────────┐
│ Logo     │  Welcome back, [Name]                     [avatar ▾] │
│──────────│──────────────────────────────────────────────────────│
│ Dashboard│  ┌──────────┐┌──────────┐┌──────────┐┌──────────┐    │
│ Upload   │  │ Total: 12││ Pending:3││Approved:8││ Avg: 82% │    │
│ Submiss. │  └──────────┘└──────────┘└──────────┘└──────────┘    │
│ Profile  │  Recent Activity                                     │
│ Logout   │  ● CSC301 Assignment 2 — Reviewed, Grade 85           │
│          │  ● CSC205 Lab Report — Under Review                   │
│          │  Submission status cards / mini list...               │
└──────────┴──────────────────────────────────────────────────────┘
```
Mobile: sidebar collapses into a bottom/hamburger drawer; stat cards stack 2×2 then 1-column; tables become stacked cards.

## Upload Assignment

```
┌────────────────────────────────────────────┐
│  Upload Assignment                          │
│  Course [dropdown ▾]  Title [___________]   │
│  Description [textarea______________]       │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┐        │
│  │   Drag & drop file here, or click  │        │
│  │   PDF · DOCX · DOC · ZIP · max 15MB│        │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┘        │
│  [progress bar ████████░░ 80%]              │
│              [Cancel]  [Submit Assignment]  │
└────────────────────────────────────────────┘
```

## Lecturer Review Screen

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │  Submission: CSC301 — Assignment 2             │
│          │  Student: Jane Doe (MAT/2021/0123)             │
│          │  [Download File]                               │
│          │  Grade [___] /100   Status [dropdown ▾]        │
│          │  Feedback [textarea________________]           │
│          │  Review Notes (internal) [textarea______]      │
│          │                          [Save Review]          │
└──────────┴──────────────────────────────────────────────┘
```

## Admin Dashboard

```
┌──────────┬──────────────────────────────────────────────┐
│ Sidebar  │  [Students:340][Assignments:1.2k][Pending:45]  │
│          │  [Chart: Submission Trends]  [Chart: By Course]│
│          │  Recent Activity Panel                         │
└──────────┴──────────────────────────────────────────────┘
```

Full clickable Figma wireframes can be generated next via the Figma MCP connector if you want higher-fidelity mockups before Phase 3 (frontend build) — let me know.
