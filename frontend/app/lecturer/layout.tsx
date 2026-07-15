import DashboardShell, { NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/lecturer/dashboard", icon: "speedometer2" },
  { label: "Assignments", href: "/lecturer/assignments", icon: "journal-text" },
  { label: "Review Queue", href: "/lecturer/review", icon: "check2-square" },
];

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={NAV}>{children}</DashboardShell>;
}
