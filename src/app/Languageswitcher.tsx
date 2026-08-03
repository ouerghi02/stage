"use client";

import { useLocale } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import { SUPPORTED_LOCALES, type AppLocale } from "@/i18n/config";
import styles from "./Languageswitcher.module.css";

const LOCALE_LABELS: Record<AppLocale, string> = {
  fr: "FR",
  en: "EN",
};

export default function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleChange(next: AppLocale) {
    if (next === locale || isPending) return;
    startTransition(async () => {
      await setLocale(next);
      router.refresh();
    });
  }

  return (
    <div className={styles.switcher} role="group" aria-label="Langue / Language">
      {SUPPORTED_LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => handleChange(code)}
          disabled={isPending}
          className={code === locale ? `${styles.option} ${styles["option--active"]}` : styles.option}
        >
          {LOCALE_LABELS[code]}
        </button>
      ))}
    </div>
  );
}