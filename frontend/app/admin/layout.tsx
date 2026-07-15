import DashboardShell, { NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "speedometer2" },
  { label: "Users", href: "/admin/users", icon: "people" },
  { label: "Courses", href: "/admin/courses", icon: "book" },
  { label: "Submissions", href: "/admin/submissions", icon: "folder-check" },
  { label: "Activity Logs", href: "/admin/logs", icon: "clock-history" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={NAV}>{children}</DashboardShell>;
}
