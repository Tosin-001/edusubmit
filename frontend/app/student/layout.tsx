import DashboardShell, { NavItem } from "@/components/layout/DashboardShell";

const NAV: NavItem[] = [
  { label: "Dashboard", href: "/student/dashboard", icon: "speedometer2" },
  { label: "Upload Assignment", href: "/student/upload", icon: "cloud-upload" },
  { label: "My Submissions", href: "/student/submissions", icon: "list-check" },
  { label: "Profile", href: "/student/profile", icon: "person" },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell navItems={NAV}>{children}</DashboardShell>;
}
