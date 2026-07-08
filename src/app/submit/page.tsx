"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import AppShell from "@/components/AppShell";

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [nom, setNom] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; text: string } | null>(
    null
  );

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return <p style={{ padding: 40 }}>Chargement...</p>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom, message }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: "success", text: `✅ Soumission enregistrée (id: ${data.id})` });
        setNom("");
        setMessage("");
      } else {
        setFeedback({ type: "error", text: `❌ ${data.error}` });
      }
    } catch {
      setFeedback({ type: "error", text: "❌ Erreur réseau, réessayez." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <h1>Nouvelle soumission</h1>
      <p style={{ color: "#6b7280" }}>Connecté en tant que : {session?.user?.email}</p>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 12, maxWidth: 500, marginTop: 24 }}
      >
        <label>
          Nom
          <input
            type="text"
            value={nom}
            onChange={(e) => setNom(e.target.value)}
            required
            disabled={isSubmitting}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <label>
          Message
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
            disabled={isSubmitting}
            rows={4}
            style={{ width: "100%", padding: 8, marginTop: 4 }}
          />
        </label>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            padding: "10px 20px",
            background: isSubmitting ? "#999" : "#0070f3",
            color: "white",
            border: "none",
            borderRadius: 6,
            cursor: isSubmitting ? "not-allowed" : "pointer",
          }}
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer"}
        </button>
      </form>

      {feedback && (
        <p style={{ marginTop: 16, color: feedback.type === "error" ? "red" : "green" }}>
          {feedback.text}
        </p>
      )}
    </AppShell>
  );
}
