"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { AdminProfile, WeddingRecord } from "@/lib/admin-auth";

const links = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "⌂" },
  { href: "/admin/invitations", label: "Invitations", icon: "✉" },
  { href: "/admin/rsvps", label: "RSVPs", icon: "✓" },
  { href: "/admin/gallery", label: "Gallery", icon: "▣" },
  { href: "/admin/settings", label: "Wedding Settings", icon: "⚙" },
  { href: "/admin/account", label: "My Account", icon: "◉" },
];

export default function AdminShell({
  profile,
  wedding,
  children,
}: {
  profile: AdminProfile;
  wedding: WeddingRecord | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  return (
    <div className="admin-app-shell">
      <button className="admin-mobile-menu" type="button" onClick={() => setOpen((value) => !value)} aria-label="Toggle admin navigation">
        <span /> <span /> <span />
      </button>
      {open && <button className="admin-sidebar-backdrop" aria-label="Close menu" onClick={() => setOpen(false)} />}
      <aside className={`admin-sidebar${open ? " admin-sidebar-open" : ""}`}>
        <div className="admin-brand">
          <span>R & R</span>
          <strong>Wedding Management</strong>
          <small>{profile.role === "super_admin" ? "Super Admin" : "Client Admin"}</small>
        </div>

        <nav className="admin-nav">
          {links.map((item) => (
            <Link key={item.href} href={item.href} className={pathname === item.href ? "active" : ""} onClick={() => setOpen(false)}>
              <i>{item.icon}</i><span>{item.label}</span>
            </Link>
          ))}
          {profile.role === "super_admin" && (
            <Link href="/admin/admins" className={pathname === "/admin/admins" ? "active" : ""} onClick={() => setOpen(false)}>
              <i>♙</i><span>Admin Management</span>
            </Link>
          )}
        </nav>

        <div className="admin-sidebar-footer">
          <div>
            <strong>{profile.full_name || profile.email}</strong>
            <span>{wedding ? `${wedding.bride_name} & ${wedding.groom_name}` : "No wedding assigned"}</span>
          </div>
          <form action="/api/admin/logout" method="post">
            <button type="submit">Log out</button>
          </form>
        </div>
      </aside>
      <section className="admin-main-content">{children}</section>
    </div>
  );
}
