"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { clearRoleCookie, clearTokens, getCurrentUser } from "@/lib/auth";

export interface NavItem {
  label: string;
  href: string;
  icon: string; // bootstrap-icons class suffix, e.g. "speedometer2"
}

export default function DashboardShell({
  navItems,
  children,
}: {
  navItems: NavItem[];
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = getCurrentUser();

  function handleLogout() {
    clearTokens();
    clearRoleCookie();
    router.push("/login");
  }

  const sidebarContent = (
    <>
      <div className="px-3 py-4">
        <span className="fw-bold fs-5">EduSubmit</span>
      </div>
      <nav className="px-2 flex-grow-1">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`d-flex align-items-center gap-2 px-3 py-2 mb-1 ${
              pathname === item.href ? "active" : ""
            }`}
            onClick={() => setMobileOpen(false)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
      <div className="px-3 py-3">
        <button className="btn btn-outline-light btn-sm w-100" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </>
  );

  return (
    <div className="d-flex" style={{ minHeight: "100vh" }}>
      {/* Desktop sidebar */}
      <aside className="es-sidebar d-none d-md-flex flex-column" style={{ width: 240 }}>
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <div
          className="d-md-none position-fixed top-0 start-0 w-100 h-100"
          style={{ zIndex: 1040, background: "rgba(0,0,0,0.4)" }}
          onClick={() => setMobileOpen(false)}
        >
          <aside
            className="es-sidebar d-flex flex-column h-100"
            style={{ width: 240 }}
            onClick={(e) => e.stopPropagation()}
          >
            {sidebarContent}
          </aside>
        </div>
      )}

      <div className="flex-grow-1 d-flex flex-column">
        <header className="d-flex align-items-center justify-content-between px-3 px-md-4 py-3 bg-white border-bottom">
          <button
            className="btn btn-light d-md-none"
            onClick={() => setMobileOpen(true)}
            aria-label="Open menu"
          >
            ☰
          </button>
          <span className="fw-semibold">{user?.full_name ?? ""}</span>
        </header>
        <main className="flex-grow-1 p-3 p-md-4">{children}</main>
      </div>
    </div>
  );
}
