// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import styles from "./Navbar.module.css";

const baseNavItems = [{ href: "/", label: "Accueil" }];
const adminNavItems = [
  { href: "/form", label: "Soumissions" },
  { href: "/categorie", label: "Catégorie" },
];

export default function Navbar() {
  const pathname = usePathname();
  const navItems = [...baseNavItems, ...adminNavItems];

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

      <div className={styles.navbar__actions}>
        <button onClick={() => signOut()} className={styles["navbar__logout-button"]}>
          Se déconnecter
        </button>
      </div>
    </nav>
  );
}