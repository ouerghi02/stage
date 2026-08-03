import type { Metadata } from "next";
import type { ReactNode } from "react";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { AntdRegistry } from "@ant-design/nextjs-registry";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stage Keyrus - Demo Keycloak",
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="app-body">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <AntdRegistry>
            <Providers>{children}</Providers>
          </AntdRegistry>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}