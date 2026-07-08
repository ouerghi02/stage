import type { Metadata } from "next";
import type { ReactNode } from "react";
import Providers from "./providers";

export const metadata: Metadata = {
  title: "Stage Keyrus - Demo Keycloak",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr">
      <body style={{ fontFamily: "sans-serif", margin: 0 }}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
