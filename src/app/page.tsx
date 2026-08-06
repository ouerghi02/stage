"use client";

import { useSession, signIn } from "next-auth/react";
import { useEffect, useState } from "react";
import { Card, Col, Row, Statistic, Typography, Spin, Empty, Alert } from "antd";
import { Pie, Column } from "@ant-design/plots";
import { useTranslations } from "next-intl";
import AppShell from "@/components/AppShell";
import styles from "./page.module.css";

type Stats = {
  total: number;
  byPriorite: { priorite: string; count: number }[];
  byCategorie: { categorie: string; count: number }[];
  byMonth: { month: string; count: number }[];
};

export default function Home() {
  const { data: session, status } = useSession();
  const t = useTranslations("home");
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
          throw new Error(data.error || t("noData"));
        }
        setStats(data);
      })
      .catch((err) => {
        setStatsError(err instanceof Error ? err.message : t("noData"));
      })
      .finally(() => setLoadingStats(false));
  }, [status, t]);

  if (status === "loading") return <p className={styles.loading}>{t("loading")}</p>;

  return (
    <AppShell>
      <Typography.Title level={2}>{t("welcome")}</Typography.Title>

      {!session ? (
        <>
          <p>{t("notConnected")}</p>
          <button type="button" onClick={() => signIn("keycloak")} className={styles.primaryButton}>
            {t("loginWithKeycloak")}
          </button>
        </>
      ) : (
        <>
          <p>{t("connectedAs", { email: session.user?.email ?? session.user?.name ?? "" })}</p>
          {session.error === "RefreshAccessTokenError" && (
            <p className={styles.error}>{t("sessionExpired")}</p>
          )}

          <section className={styles.dashboard}>
            {loadingStats ? (
              <Spin />
            ) : statsError ? (
              <Alert type="error" showIcon message={statsError} />
            ) : !stats || stats.total === 0 ? (
              <Empty description={t("noData")} />
            ) : (
              <>
                <Row gutter={16} className={styles.statsRow}>
                  <Col xs={24} sm={8}>
                    <Card><Statistic title={t("totalSubmissions")} value={stats.total} /></Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic
                        title={t("highPriority")}
                        value={stats.byPriorite.find((p) => p.priorite === "haute")?.count ?? 0}
                        valueStyle={{ color: "#f14668" }}
                      />
                    </Card>
                  </Col>
                  <Col xs={24} sm={8}>
                    <Card>
                      <Statistic title={t("thisMonth")} value={stats.byMonth[stats.byMonth.length - 1]?.count ?? 0} />
                    </Card>
                  </Col>
                </Row>

                <Row gutter={16} className={styles.chartsRow}>
                  <Col xs={24} md={12}>
                    <Card title={t("byPriority")}>
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
                    <Card title={t("byCategory")}>
                      <Column
                        data={stats.byCategorie.map((c) => ({ categorie: c.categorie, value: c.count }))}
                        xField="categorie"
                        yField="value"
                        height={260}
                      />
                    </Card>
                  </Col>
                  <Col xs={24}>
                    <Card title={t("last6Months")}>
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
    </AppShell>
  );
}