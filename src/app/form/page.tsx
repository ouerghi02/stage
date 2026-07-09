"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Table, Tag, Alert, Typography } from "antd";
import type { TableProps } from "antd";
import AppShell from "@/components/AppShell";

type Submission = {
  id: number;
  userEmail: string;
  nom: string;
  message: string;
  dateEvenement: string;
  priorite: "basse" | "moyenne" | "haute";
  categorie: "general" | "support" | "reclamation";
  createdAt: string;
};

const priorityColor: Record<Submission["priorite"], string> = {
  basse: "green",
  moyenne: "orange",
  haute: "red",
};

const categoryLabel: Record<Submission["categorie"], string> = {
  general: "Général",
  support: "Support",
  reclamation: "Réclamation",
};

const columns: TableProps<Submission>["columns"] = [
  { title: "Utilisateur", dataIndex: "userEmail", key: "userEmail" },
  { title: "Nom", dataIndex: "nom", key: "nom", sorter: (a, b) => a.nom.localeCompare(b.nom) },
  { title: "Message", dataIndex: "message", key: "message", ellipsis: true },
  {
    title: "Date événement",
    dataIndex: "dateEvenement",
    key: "dateEvenement",
    render: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
    sorter: (a, b) => new Date(a.dateEvenement).getTime() - new Date(b.dateEvenement).getTime(),
  },
  {
    title: "Priorité",
    dataIndex: "priorite",
    key: "priorite",
    filters: [
      { text: "Basse", value: "basse" },
      { text: "Moyenne", value: "moyenne" },
      { text: "Haute", value: "haute" },
    ],
    onFilter: (value, record) => record.priorite === value,
    render: (priorite: Submission["priorite"]) => (
      <Tag color={priorityColor[priorite]}>{priorite.toUpperCase()}</Tag>
    ),
  },
  {
    title: "Catégorie",
    dataIndex: "categorie",
    key: "categorie",
    render: (categorie: Submission["categorie"]) => categoryLabel[categorie],
  },
  {
    title: "Créé le",
    dataIndex: "createdAt",
    key: "createdAt",
    render: (value: string) => new Date(value).toLocaleString("fr-FR"),
    defaultSortOrder: "descend",
    sorter: (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
  },
];

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
    return <Typography.Paragraph>Chargement...</Typography.Paragraph>;
  }

  return (
    <AppShell>
      <Typography.Title level={2}>Toutes les soumissions</Typography.Title>
      <p className="text-gray-500">Connecté en tant que : {session?.user?.email}</p>

      {error && (
        <Alert className="mb-4" type="error" showIcon message={error} />
      )}

      <Table<Submission>
        columns={columns}
        dataSource={submissions}
        rowKey="id"
        loading={isLoading}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (total) => `${total} soumissions`,
        }}
      />
    </AppShell>
  );
}