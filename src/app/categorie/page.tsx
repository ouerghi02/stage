// src/app/categorie/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Spin } from "antd";
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

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/stats")
      .then((res) => res.json())
      .then(setStats)
      .finally(() => setIsLoading(false));
  }, [status]);

  if (status === "loading" || status === "unauthenticated") {
    return <Typography.Paragraph>Chargement...</Typography.Paragraph>;
  }

  return (
    <AppShell>
      <Typography.Title level={2}>Soumissions par catégorie</Typography.Title>

      {isLoading || !stats ? (
        <Spin />
      ) : (
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
      )}
    </AppShell>
  );
}