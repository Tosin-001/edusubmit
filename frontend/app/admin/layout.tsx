import DashboardShell, { NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "speedometer2" },
  { label: "Users", href: "/admin/users", icon: "people" },
  { label: "Subjects", href: "/admin/subjects", icon: "book" },
  { label: "Classes", href: "/admin/classes", icon: "diagram-3" },
  { label: "Teacher Assignments", href: "/admin/teacher-assignments", icon: "person-check" },
  { label: "Submissions", href: "/admin/submissions", icon: "folder-check" },
  { label: "Activity Logs", href: "/admin/logs", icon: "clock-history" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={NAV}>{children}</DashboardShell>;
}
