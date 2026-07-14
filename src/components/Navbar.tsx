// src/components/Navbar.tsx
"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import styles from "./Navbar.module.css";

const baseNavItems = [{ href: "/", label: "Accueil" }];
const adminNavItems = [
  { href: "/form", label: "Soumissions" },
  { href: "/categorie", label: "Catégorie" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const isAdmin = session?.user?.roles?.includes("admin") ?? false;
  const navItems = isAdmin ? [...baseNavItems, ...adminNavItems] : baseNavItems;

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
        <Link href="/submit" className={styles["navbar__new-button"]}>
          + Nouvelle soumission
        </Link>
        <button onClick={() => signOut()} className={styles["navbar__logout-button"]}>
          Se déconnecter
        </button>
      </div>
    </nav>
  );
}