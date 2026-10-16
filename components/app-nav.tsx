"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "@/components/motion";

const links = [
  { href: "/", id: "desk", label: "Desk", hint: "Live decisions" },
  { href: "/settings", id: "settings", label: "Channel settings", hint: "Rules and limits" },
] as const;

export function AppNav() {
  const pathname = usePathname();
  const current = pathname.startsWith("/settings") ? "settings" : "desk";

  return (
    <aside className="sidebar">
      <div className="brand-block">
        <span className="brand-mark" aria-hidden="true">
          NS
        </span>
        <div>
          <div className="brand">Nachtschicht</div>
          <div className="brand-sub">Moderation desk</div>
        </div>
      </div>
      <nav className="side-nav" aria-label="Primary">
        {links.map((link) => (
          <Link
            key={link.id}
            href={link.href}
            className={current === link.id ? "active" : undefined}
            aria-current={current === link.id ? "page" : undefined}
          >
            {current === link.id ? <motion.span layoutId="nav-active" className="nav-indicator" /> : null}
            <span>{link.label}</span>
            <small>{link.hint}</small>
          </Link>
        ))}
      </nav>
      <p className="sidebar-note">Scores chat. Policy decides. Titles wait for you.</p>
    </aside>
  );
}
