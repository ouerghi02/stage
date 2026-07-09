import type { ReactNode } from "react";
import Navbar from "./Navbar";
import styles from "./AppShell.module.css";

export default function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className={styles.appShell}>
      <Navbar />
      <main className={styles.appShellMain}>{children}</main>
    </div>
  );
}
