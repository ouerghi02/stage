"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell from "@/components/AppShell";
import styles from "./page.module.css";

type Submission = {
  id: number;
  userEmail: string;
  nom: string;
  message: string;
  createdAt: string;
};

export default function FormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    const fetchSubmissions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/submissions");
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.error || "Erreur lors du chargement");
        }

        setSubmissions(data.submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Erreur inconnue");
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubmissions();
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return <p className={styles.loadingText}>Chargement...</p>;
  }

  return (
    <AppShell>
      <h1>Toutes les soumissions</h1>
      <p className={styles.subtitle}>Connecté en tant que : {session?.user?.email}</p>

      {isLoading && <p>Chargement des données...</p>}
      {error && <p className={styles.errorText}>❌ {error}</p>}

      {!isLoading && !error && submissions.length === 0 && (
        <p>Aucune soumission pour le moment.</p>
      )}

      <div className={styles.submissionsContainer}>
        {submissions.map((s) => (
          <div
            key={s.id}
            className={styles.card}
          >
            <ReadOnlyField label="Utilisateur" value={s.userEmail} />
            <ReadOnlyField label="Nom" value={s.nom} />
            <ReadOnlyField label="Message" value={s.message} />
            <ReadOnlyField label="Date" value={new Date(s.createdAt).toLocaleString("fr-FR")} />
          </div>
        ))}
      </div>
    </AppShell>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className={styles.fieldLabel}>
        {label}
      </span>
      <div className={styles.fieldValue}>
        {value}
      </div>
    </div>
  );
}
