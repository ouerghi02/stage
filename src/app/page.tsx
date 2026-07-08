"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();

  if (status === "loading") {
    return <p style={{ padding: 40 }}>Chargement...</p>;
  }

  return (
    <main style={{ padding: 40, textAlign: "center" }}>
      <h1>Bienvenue sur l&apos;application (Stage Keyrus)</h1>

      {!session ? (
        <>
          <p>Vous n&apos;êtes pas connecté.</p>
          <button
            onClick={() => signIn("keycloak")}
            style={{
              padding: "10px 20px",
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Se connecter avec Keycloak
          </button>
        </>
      ) : (
        <>
          <p>Connecté en tant que : {session.user?.email ?? session.user?.name}</p>
          {session.error === "RefreshAccessTokenError" && (
            <p style={{ color: "red" }}>
              Votre session a expiré, merci de vous reconnecter.
            </p>
          )}
          <button
            onClick={() => router.push("/form")}
            style={{
              padding: "10px 20px",
              marginRight: 10,
              background: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Voir les soumissions
          </button>
          <button
            onClick={() => signOut()}
            style={{
              padding: "10px 20px",
              background: "#e00",
              color: "white",
              border: "none",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            Se déconnecter
          </button>
        </>
      )}
    </main>
  );
}
