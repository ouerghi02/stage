"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import styles from "./page.module.css";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p className={styles.loading}>Chargement...</p>;
  }

  return (
    <main className={styles.main}>
      <h1>Bienvenue sur l&apos;application (Stage Keyrus)</h1>

      {!session ? (
        <>
          <p>Vous n&apos;êtes pas connecté.</p>
          <button
            type="button"
            onClick={() => signIn("keycloak")}
            className={styles.primaryButton}
          >
            Se connecter avec Keycloak
          </button>
        </>
      ) : (
        <>
          <p>Connecté en tant que : {session.user?.email ?? session.user?.name}</p>
          {session.error === "RefreshAccessTokenError" && (
            <p className={styles.error}>
              Votre session a expiré, merci de vous reconnecter.
            </p>
          )}
          <button
            type="button"
            onClick={() => router.push("/form")}
            className={styles.primaryButton}
          >
            Voir les soumissions
          </button>
          <button
            type="button"
            onClick={() => signOut()}
            className={styles.dangerButton}
          >
            Se déconnecter
          </button>
        </>
      )}
    </main>
  );
}
