import type { ReactNode } from "react";
import Navbar from "./Navbar";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <Navbar />
      <main style={{ flex: 1, padding: 40 }}>{children}</main>
    </div>
  );
}
