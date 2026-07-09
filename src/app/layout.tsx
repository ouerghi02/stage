import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stage Keyrus - Demo Keycloak",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body className="app-body">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
