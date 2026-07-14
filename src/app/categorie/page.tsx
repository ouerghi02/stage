"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Spin, Alert } from "antd";
import AppShell from "@/components/AppShell";

type Stats = { byCategorie: { categorie: string; count: number }[] };

const categoryMeta: Record<string, { label: string; color: string }> = {
  general: { label: "Général", color: "#3b82f6" },
  support: { label: "Support", color: "#10b981" },
  reclamation: { label: "Réclamation", color: "#f14668" },
};

export default function CategoriePage() {
  const { status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;

    setError(null);
    fetch("/api/stats")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erreur lors du chargement");
        }
        setStats(data);
      })
      .catch((err) => setError(err instanceof Error ? err.message : "Erreur inconnue"))
      .finally(() => setIsLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return <Typography.Paragraph>Chargement...</Typography.Paragraph>;
  }

  return (
    <AppShell>
      <Typography.Title level={2}>Soumissions par catégorie</Typography.Title>

      {error && <Alert type="error" showIcon message={error} style={{ marginBottom: 16 }} />}

      {isLoading ? (
        <Spin />
      ) : stats ? (
        <Row gutter={16}>
          {stats.byCategorie.map(({ categorie, count }) => {
            const meta = categoryMeta[categorie] ?? { label: categorie, color: "#666" };
            return (
              <Col xs={24} sm={8} key={categorie}>
                <Card hoverable onClick={() => router.push(`/form?categorie=${categorie}`)}>
                  <Statistic title={meta.label} value={count} valueStyle={{ color: meta.color }} />
                </Card>
              </Col>
            );
          })}
        </Row>
      ) : null}
    </AppShell>
  );
}