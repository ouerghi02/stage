"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/form", label: "Soumissions" },
  { href: "/submit", label: "Nouvelle soumission" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav
      style={{
        width: 220,
        minHeight: "100vh",
        background: "#111827",
        color: "white",
        padding: "24px 16px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        position: "sticky",
        top: 0,
        flexShrink: 0,
      }}
    >
      <div>
        <h2 style={{ fontSize: 18, marginBottom: 24 }}>Stage Keyrus</h2>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 8 }}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    borderRadius: 6,
                    textDecoration: "none",
                    color: "white",
                    background: isActive ? "#374151" : "transparent",
                  }}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <button
        onClick={() => signOut()}
        style={{
          padding: "10px 12px",
          background: "#dc2626",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Se déconnecter
      </button>
    </nav>
  );
}
