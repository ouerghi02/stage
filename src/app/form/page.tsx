// src/app/form/page.tsx
"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Table, Tag, Alert, Typography, Input, Button } from "antd";
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

type Params = {
  page: number;
  pageSize: number;
  sortField: string;
  sortOrder: "ascend" | "descend";
  search: string;
  priorite: string[];
  categorie: string[];
};

export default function FormPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const [params, setParams] = useState<Params>(() => {
    const categorieFromUrl = searchParams.get("categorie");
    return {
      page: 1,
      pageSize: 10,
      sortField: "createdAt",
      sortOrder: "descend",
      search: "",
      priorite: [],
      categorie: categorieFromUrl ? [categorieFromUrl] : [],
    };
  });

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams({
        page: String(params.page),
        pageSize: String(params.pageSize),
        sortField: params.sortField,
        sortOrder: params.sortOrder,
      });
      if (params.search) qs.set("search", params.search);
      if (params.priorite.length) qs.set("priorite", params.priorite.join(","));
      if (params.categorie.length) qs.set("categorie", params.categorie.join(","));

      const res = await fetch(`/api/submissions?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors du chargement");

      setSubmissions(data.submissions);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erreur inconnue");
    } finally {
      setIsLoading(false);
    }
  }, [params]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchSubmissions();
  }, [status, fetchSubmissions]);

  const columns: TableProps<Submission>["columns"] = [
    { title: "Utilisateur", dataIndex: "userEmail", key: "userEmail" },
    { title: "Nom", dataIndex: "nom", key: "nom", sorter: true },
    { title: "Message", dataIndex: "message", key: "message", ellipsis: true },
    {
      title: "Date événement",
      dataIndex: "dateEvenement",
      key: "dateEvenement",
      render: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
      sorter: true,
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
      filteredValue: params.priorite.length ? params.priorite : null,
      render: (priorite: Submission["priorite"]) => (
        <Tag color={priorityColor[priorite]}>{priorite.toUpperCase()}</Tag>
      ),
    },
    {
      title: "Catégorie",
      dataIndex: "categorie",
      key: "categorie",
      filters: [
        { text: "Général", value: "general" },
        { text: "Support", value: "support" },
        { text: "Réclamation", value: "reclamation" },
      ],
      filteredValue: params.categorie.length ? params.categorie : null,
      render: (categorie: Submission["categorie"]) => categoryLabel[categorie],
    },
    {
      title: "Créé le",
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => new Date(value).toLocaleString("fr-FR"),
      sorter: true,
      defaultSortOrder: "descend",
    },
  ];

  const handleTableChange: TableProps<Submission>["onChange"] = (pagination, filters, sorter) => {
    const s = Array.isArray(sorter) ? sorter[0] : sorter;
    setParams((prev) => ({
      ...prev,
      page: pagination.current ?? 1,
      pageSize: pagination.pageSize ?? 10,
      sortField: (s?.field as string) ?? prev.sortField,
      sortOrder: s?.order === "ascend" || s?.order === "descend" ? s.order : prev.sortOrder,
      priorite: (filters.priorite as string[]) ?? [],
      categorie: (filters.categorie as string[]) ?? [],
    }));
  };

  const handleSearch = (value: string) => {
    setParams((prev) => ({ ...prev, page: 1, search: value }));
  };

  if (status === "loading" || status === "unauthenticated") {
    return <Typography.Paragraph>Chargement...</Typography.Paragraph>;
  }

  return (
    <AppShell>
      <Typography.Title level={2}>Toutes les soumissions</Typography.Title>
      <p className="text-gray-500">Connecté en tant que : {session?.user?.email}</p>

      {error && <Alert className="mb-4" type="error" showIcon message={error} />}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
        }}
      >
        <Input.Search
          placeholder="Rechercher par nom..."
          allowClear
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 320 }}
        />
        <Button type="primary" onClick={() => router.push("/submit")}>
          + Nouvelle soumission
        </Button>
      </div>

      <Table<Submission>
        columns={columns}
        dataSource={submissions}
        rowKey="id"
        loading={isLoading}
        onChange={handleTableChange}
        pagination={{
          current: params.page,
          pageSize: params.pageSize,
          total,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50"],
          showTotal: (t) => `${t} soumissions`,
        }}
      />
    </AppShell>
  );
}