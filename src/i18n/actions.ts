// src/i18n/actions.ts
"use server";

import { cookies } from "next/headers";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, SUPPORTED_LOCALES, type AppLocale } from "./config";

export async function setLocale(locale: string) {
  const safeLocale: AppLocale = SUPPORTED_LOCALES.includes(locale as AppLocale)
    ? (locale as AppLocale)
    : DEFAULT_LOCALE;

  const cookieStore = await cookies();
  cookieStore.set(LOCALE_COOKIE_NAME, safeLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
}
