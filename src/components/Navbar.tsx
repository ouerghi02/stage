// src/components/Navbar.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import LanguageSwitcher from "../app/Languageswitcher";
import styles from "./Navbar.module.css";

const ADMIN_ROLE = "admin";

export default function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const t = useTranslations("nav");
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const roles = session?.user?.roles ?? [];
  const isAdmin = roles.includes(ADMIN_ROLE);
  const isAuthenticated = !!session;

  const navItems = [
    { href: "/", label: t("home") },
    ...(isAuthenticated
      ? [
          { href: "/submit", label: t("newSubmission") },
          { href: "/form", label: t("submissions") },
        ]
      : []),
    ...(isAdmin ? [{ href: "/categorie", label: t("categorie") }] : []),
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <nav className={styles.navbar}>
      <div className={styles.navbar__left}>
        <div className={styles.navbar__menu} ref={menuRef}>
          <button
            type="button"
            className={styles.navbar__menuButton}
            onClick={() => setMenuOpen((open) => !open)}
            aria-haspopup="true"
            aria-expanded={menuOpen}
          >
            <span className={styles.navbar__menuIcon}>☰</span>
            {t("menu")}
          </button>

          {menuOpen && (
            <ul className={styles.navbar__dropdown}>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={
                        isActive
                          ? `${styles.navbar__dropdownLink} ${styles["navbar__dropdownLink--active"]}`
                          : styles.navbar__dropdownLink
                      }
                    >
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <Link href="/" className={styles.navbar__title}>
          Stage Keyrus
        </Link>
      </div>

      <div className={styles.navbar__actions}>
        <LanguageSwitcher />
        {isAuthenticated && (
          <button onClick={() => signOut()} className={styles["navbar__logout-button"]}>
            {t("logout")}
          </button>
        )}
      </div>
    </nav>
  );
}