"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { api } from "@/lib/api";

export default function Sidebar() {
  const path = usePathname();
  const [health, setHealth] = useState<"ok" | "err" | "loading">("loading");

  useEffect(() => {
    api.health()
      .then(() => setHealth("ok"))
      .catch(() => setHealth("err"));
  }, []);

  const links = [
    { href: "/", label: "Dashboard", icon: "◉" },
    { href: "/vendors", label: "Vendors", icon: "⬡" },
    { href: "/products", label: "Products", icon: "◫" },
    { href: "/vulnerabilities", label: "Vulnerabilities", icon: "⚠" },
    { href: "/reports", label: "Reports", icon: "⊞" },
  ];

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">
        <div className="wordmark">VulnVault</div>
        <div className="tagline">Vulnerability Management</div>
      </div>

      <nav className="nav">
        <div className="nav-section">
          <div className="nav-label">Navigation</div>
          {links.map(l => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link ${path === l.href ? "active" : ""}`}
            >
              <span className="icon">{l.icon}</span>
              {l.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="sidebar-footer">
        <div className="health-pill">
          <div className={`health-dot ${health}`} />
          API {health === "loading" ? "connecting..." : health === "ok" ? "online" : "offline"}
        </div>
      </div>
    </aside>
  );
}
