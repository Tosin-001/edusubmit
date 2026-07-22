import DashboardShell, { NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/teacher/dashboard", icon: "speedometer2" },
  { label: "My Assignments", href: "/teacher/assignments", icon: "journal-text" },
  { label: "Review Queue", href: "/teacher/review", icon: "check2-square" },
  { label: "Profile", href: "/teacher/profile", icon: "person" },
];

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={NAV}>{children}</DashboardShell>;
}
