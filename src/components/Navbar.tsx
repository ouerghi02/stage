"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./Navbar.module.css";

const navItems = [
  { href: "/", label: "Accueil" },
  { href: "/form", label: "Soumissions" },
  { href: "/submit", label: "Nouvelle soumission" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className={styles.navbar}>
      <div>
        <h2 className={styles.navbar__title}>Stage Keyrus</h2>
        <ul className={styles.navbar__list}>
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={isActive ? `${styles.navbar__link} ${styles["navbar__link--active"]}` : styles.navbar__link}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>

      <button onClick={() => signOut()} className={styles["navbar__logout-button"]}>
        Se déconnecter
      </button>
    </nav>
  );
}
