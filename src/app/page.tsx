"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Spin, Empty, Alert } from "antd";
import { Pie, Column } from "@ant-design/plots";
import styles from "./page.module.css";

type Stats = {
  total: number;
  byPriorite: { priorite: string; count: number }[];
  byCategorie: { categorie: string; count: number }[];
  byMonth: { month: string; count: number }[];
};

export default function Home() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    if (status !== "authenticated") return;

    setLoadingStats(true);
    setStatsError(null);

    fetch("/api/stats")
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || "Erreur lors du chargement des statistiques");
        }
        setStats(data);
      })
      .catch((err) => {
        setStatsError(err instanceof Error ? err.message : "Erreur inconnue");
      })
      .finally(() => setLoadingStats(false));
  }, [status]);

  if (status === "loading") return <p className={styles.loading}>Chargement...</p>;

  return (
    <main className={styles.main}>
      <Typography.Title level={2}>Bienvenue sur l&apos;application (Stage Keyrus)</Typography.Title>

      {!session ? (
        <>
          <p>Vous n&apos;êtes pas connecté.</p>
          <button type="button" onClick={() => signIn("keycloak")} className={styles.primaryButton}>
            Se connecter avec Keycloak
          </button>
        </>
      ) : (
        <>
          <p>Connecté en tant que : {session.user?.email ?? session.user?.name}</p>
          {session.error === "RefreshAccessTokenError" && (
            <p className={styles.error}>Votre session a expiré, merci de vous reconnecter.</p>
          )}

          <div className={styles.actions}>
            <button type="button" onClick={() => router.push("/form")} className={styles.primaryButton}>
              Voir les soumissions
            </button>
            <button type="button" onClick={() => router.push("/submit")} className={styles.primaryButton}>
              Nouvelle soumission
            </button>
            <button type="button" onClick={() => signOut()} className={styles.dangerButton}>
              Se déconnecter
            </button>
          </div>

          <section className={styles.dashboard}>
            {loadingStats ? (
              <Spin />
            ) : statsError ? (
              <Alert type="error" showIcon message={statsError} />
            ) : !stats || stats.total === 0 ? (
              <Empty description="Aucune donnée disponible" />
            ) : (
              <>
                <Row gutter={16} className={styles.statsRow}>
                  <Col xs={24} sm={8}>
                    <Card><Statistic title="Total des soumissions" value={stats.total} /></Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title="Priorité haute"
                        value={stats.byPriorite.find((p) => p.priorite === "haute")?.count ?? 0}
                        valueStyle={{ color: "#f14668" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic title="Ce mois-ci" value={stats.byMonth[stats.byMonth.length - 1]?.count ?? 0} />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16} className={styles.chartsRow}>
                  <Col xs={24} md={12}>
                    <Card title="Répartition par priorité">
                      <Pie
                        data={stats.byPriorite.map((p) => ({ type: p.priorite, value: p.count }))}
                        angleField="value"
                        colorField="type"
                        radius={0.8}
                        height={260}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} md={12}>
                    <Card title="Répartition par catégorie">
                      <Column
                        data={stats.byCategorie.map((c) => ({ categorie: c.categorie, value: c.count }))}
                        xField="categorie"
                        yField="value"
                        height={260}
                      />
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card title="Évolution sur les 6 derniers mois">
                      <Column
                        data={stats.byMonth.map((m) => ({ mois: m.month, value: m.count }))}
                        xField="mois"
                        yField="value"
                        height={260}
                      />
                    </Card>
                  </Col>
                </Row>
              </>
            )}
          </section>
        </>
      )}
    </main>
  );
}