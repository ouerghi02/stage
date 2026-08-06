"use client";

import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Table, Tag, Alert, Typography, Input, Button, Modal, Form, DatePicker, Radio, Select, Popconfirm, message } from "antd";
import { EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { useTranslations } from "next-intl";
import dayjs, { type Dayjs } from "dayjs";
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

type EditFormValues = {
  nom: string;
  message: string;
  dateEvenement: Dayjs;
  priorite: Submission["priorite"];
  categorie: Submission["categorie"];
};

const priorityColor: Record<Submission["priorite"], string> = {
  basse: "green",
  moyenne: "orange",
  haute: "red",
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
  const t = useTranslations("submissions");

  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");

  const [editingRecord, setEditingRecord] = useState<Submission | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm] = Form.useForm<EditFormValues>();

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

  const fetchSubmissions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const qs = new URLSearchParams();
      qs.set("page", String(params.page));
      qs.set("pageSize", String(params.pageSize));
      qs.set("sortField", params.sortField);
      qs.set("sortOrder", params.sortOrder);
      if (params.search) qs.set("search", params.search);
      if (params.priorite.length) qs.set("priorite", params.priorite.join(","));
      if (params.categorie.length) qs.set("categorie", params.categorie.join(","));

      const res = await fetch(`/api/submissions?${qs.toString()}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("genericError"));

      setSubmissions(data.submissions);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("genericError"));
    } finally {
      setIsLoading(false);
    }
  }, [params, t]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchSubmissions();
  }, [status, fetchSubmissions]);

  const openEditModal = (record: Submission) => {
    setEditingRecord(record);
    editForm.setFieldsValue({
      nom: record.nom,
      message: record.message,
      dateEvenement: dayjs(record.dateEvenement),
      priorite: record.priorite,
      categorie: record.categorie,
    });
  };

  const closeEditModal = () => {
    setEditingRecord(null);
    editForm.resetFields();
  };

  const handleEditSave = async (values: EditFormValues) => {
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/submissions/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: values.nom,
          message: values.message,
          dateEvenement: values.dateEvenement.toISOString(),
          priorite: values.priorite,
          categorie: values.categorie,
        }),
      });
      if (!res.ok) throw new Error();
      message.success(t("updateSuccess"));
      closeEditModal();
      fetchSubmissions();
    } catch {
      message.error(t("genericError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/submissions/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      message.success(t("deleteSuccess"));
      fetchSubmissions();
    } catch {
      message.error(t("genericError"));
    }
  };

  const columns: TableProps<Submission>["columns"] = [
    { title: t("columns.user"), dataIndex: "userEmail", key: "userEmail" },
    { title: t("columns.nom"), dataIndex: "nom", key: "nom", sorter: true },
    { title: t("columns.message"), dataIndex: "message", key: "message", ellipsis: true },
    {
      title: t("columns.dateEvenement"),
      dataIndex: "dateEvenement",
      key: "dateEvenement",
      render: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
      sorter: true,
    },
    {
      title: t("columns.priorite"),
      dataIndex: "priorite",
      key: "priorite",
      filters: [
        { text: t("priority.basse"), value: "basse" },
        { text: t("priority.moyenne"), value: "moyenne" },
        { text: t("priority.haute"), value: "haute" },
      ],
      filteredValue: params.priorite.length ? params.priorite : null,
      render: (priorite: Submission["priorite"]) => (
        <Tag color={priorityColor[priorite]}>{t(`priority.${priorite}`).toUpperCase()}</Tag>
      ),
    },
    {
      title: t("columns.categorie"),
      dataIndex: "categorie",
      key: "categorie",
      filters: [
        { text: t("category.general"), value: "general" },
        { text: t("category.support"), value: "support" },
        { text: t("category.reclamation"), value: "reclamation" },
      ],
      filteredValue: params.categorie.length ? params.categorie : null,
      render: (categorie: Submission["categorie"]) => t(`category.${categorie}`),
    },
    {
      title: t("columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => new Date(value).toLocaleString("fr-FR"),
      sorter: true,
      defaultSortOrder: "descend",
    },
    {
      title: t("columns.actions"),
      key: "actions",
      fixed: "right",
      width: 100,
      render: (_, record) => (
        <div style={{ display: "flex", gap: 8 }}>
          <Button
            type="text"
            icon={<EditOutlined />}
            aria-label={t("edit")}
            onClick={() => openEditModal(record)}
          />
          <Popconfirm
            title={t("deleteConfirmTitle")}
            okText={t("deleteConfirmOk")}
            cancelText={t("deleteConfirmCancel")}
            onConfirm={() => handleDelete(record.id)}
          >
            <Button type="text" danger icon={<DeleteOutlined />} aria-label={t("delete")} />
          </Popconfirm>
        </div>
      ),
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
    return <Typography.Paragraph>{t("connectedAs", { email: "" })}</Typography.Paragraph>;
  }

  return (
    <AppShell>
      <Typography.Title level={2}>{t("title")}</Typography.Title>
      <p className="text-gray-500">{t("connectedAs", { email: session?.user?.email ?? "" })}</p>

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
          placeholder={t("searchPlaceholder")}
          allowClear
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSearch={handleSearch}
          style={{ maxWidth: 320 }}
        />
        <Button type="primary" onClick={() => router.push("/submit")}>
          {t("newSubmission")}
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
          showTotal: (count) => t("total", { count }),
        }}
      />

      <Modal
        title={t("editModalTitle")}
        open={!!editingRecord}
        onCancel={closeEditModal}
        confirmLoading={isSaving}
        onOk={() => editForm.submit()}
        okText={t("save")}
        cancelText={t("cancel")}
      >
        <Form form={editForm} layout="vertical" onFinish={handleEditSave} disabled={isSaving}>
          <Form.Item name="nom" label={t("columns.nom")} rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="message" label={t("columns.message")} rules={[{ required: true }]}>
            <Input.TextArea rows={3} />
          </Form.Item>
          <Form.Item name="dateEvenement" label={t("columns.dateEvenement")} rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>
          <Form.Item name="priorite" label={t("columns.priorite")} rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="basse">{t("priority.basse")}</Radio>
              <Radio value="moyenne">{t("priority.moyenne")}</Radio>
              <Radio value="haute">{t("priority.haute")}</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item name="categorie" label={t("columns.categorie")} rules={[{ required: true }]}>
            <Select
              options={[
                { value: "general", label: t("category.general") },
                { value: "support", label: t("category.support") },
                { value: "reclamation", label: t("category.reclamation") },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </AppShell>
  );
}