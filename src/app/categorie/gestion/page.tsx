"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";
import { Table, Typography, Button, Form, Input, Upload, Modal, Popconfirm, message, Avatar } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import type { TableProps } from "antd";
import { useTranslations } from "next-intl";
import AppShell from "@/components/AppShell";

type Categorie = {
  id: number;
  nom: string;
  type: string;
  photo: string | null;
  createdAt: string;
};

type FormValues = {
  nom: string;
  type: string;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function CategorieGestionPage() {
  const { status } = useSession();
  const router = useRouter();
  const t = useTranslations("categorie");

  const [categories, setCategories] = useState<Categorie[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const [addForm] = Form.useForm<FormValues>();
  const [addPhoto, setAddPhoto] = useState<string | null>(null);
  const [isSubmittingAdd, setIsSubmittingAdd] = useState(false);

  const [editingRecord, setEditingRecord] = useState<Categorie | null>(null);
  const [editForm] = Form.useForm<FormValues>();
  const [editPhoto, setEditPhoto] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/");
  }, [status, router]);

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/categories");
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || t("genericError"));
      setCategories(data.categories);
    } catch {
      message.error(t("genericError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetchCategories();
  }, [status, fetchCategories]);

  const handleAdd = async (values: FormValues) => {
    setIsSubmittingAdd(true);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: values.nom, type: values.type, photo: addPhoto }),
      });
      if (!res.ok) throw new Error();
      message.success(t("addSuccess"));
      addForm.resetFields();
      setAddPhoto(null);
      fetchCategories();
    } catch {
      message.error(t("genericError"));
    } finally {
      setIsSubmittingAdd(false);
    }
  };

  const openEditModal = (record: Categorie) => {
    setEditingRecord(record);
    setEditPhoto(record.photo);
    editForm.setFieldsValue({ nom: record.nom, type: record.type });
  };

  const closeEditModal = () => {
    setEditingRecord(null);
    setEditPhoto(null);
    editForm.resetFields();
  };

  const handleEditSave = async (values: FormValues) => {
    if (!editingRecord) return;
    setIsSaving(true);
    try {
      const res = await fetch(`/api/categories/${editingRecord.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: values.nom, type: values.type, photo: editPhoto }),
      });
      if (!res.ok) throw new Error();
      message.success(t("updateSuccess"));
      closeEditModal();
      fetchCategories();
    } catch {
      message.error(t("genericError"));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      message.success(t("deleteSuccess"));
      fetchCategories();
    } catch {
      message.error(t("genericError"));
    }
  };

  const columns: TableProps<Categorie>["columns"] = [
    {
      title: t("columns.photo"),
      dataIndex: "photo",
      key: "photo",
      render: (photo: string | null) => (
        <Avatar shape="square" size={48} src={photo ?? undefined}>
          {!photo ? "?" : null}
        </Avatar>
      ),
    },
    { title: t("columns.nom"), dataIndex: "nom", key: "nom" },
    { title: t("columns.type"), dataIndex: "type", key: "type" },
    {
      title: t("columns.createdAt"),
      dataIndex: "createdAt",
      key: "createdAt",
      render: (value: string) => new Date(value).toLocaleDateString("fr-FR"),
    },
    {
      title: t("columns.actions"),
      key: "actions",
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

  if (status === "loading" || status === "unauthenticated") {
    return <Typography.Paragraph>{t("title")}</Typography.Paragraph>;
  }

  return (
    <AppShell>
      <Typography.Title level={2}>{t("title")}</Typography.Title>

      <Typography.Title level={4}>{t("formTitle")}</Typography.Title>
      <Form
        form={addForm}
        layout="inline"
        onFinish={handleAdd}
        disabled={isSubmittingAdd}
        style={{ marginBottom: 24, flexWrap: "wrap", rowGap: 12 }}
      >
        <Form.Item name="nom" rules={[{ required: true, message: t("fields.nomRequired") }]}>
          <Input placeholder={t("fields.nom")} />
        </Form.Item>
        <Form.Item name="type" rules={[{ required: true, message: t("fields.typeRequired") }]}>
          <Input placeholder={t("fields.type")} />
        </Form.Item>
        <Form.Item>
          <Upload
            beforeUpload={async (file) => {
              const base64 = await fileToBase64(file as File);
              setAddPhoto(base64);
              return false;
            }}
            maxCount={1}
            onRemove={() => setAddPhoto(null)}
          >
            <Button icon={<UploadOutlined />}>{t("uploadText")}</Button>
          </Upload>
        </Form.Item>
        <Form.Item>
          <Button type="primary" htmlType="submit" icon={<PlusOutlined />} loading={isSubmittingAdd}>
            {t("submit")}
          </Button>
        </Form.Item>
      </Form>

      <Typography.Title level={4}>{t("tableTitle")}</Typography.Title>
      <Table<Categorie>
        columns={columns}
        dataSource={categories}
        rowKey="id"
        loading={isLoading}
        locale={{ emptyText: t("empty") }}
        pagination={false}
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
          <Form.Item
            name="nom"
            label={t("fields.nom")}
            rules={[{ required: true, message: t("fields.nomRequired") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="type"
            label={t("fields.type")}
            rules={[{ required: true, message: t("fields.typeRequired") }]}
          >
            <Input />
          </Form.Item>
          <Form.Item label={t("fields.photo")}>
            <Upload
              beforeUpload={async (file) => {
                const base64 = await fileToBase64(file as File);
                setEditPhoto(base64);
                return false;
              }}
              maxCount={1}
              showUploadList={false}
            >
              <Button icon={<UploadOutlined />}>{t("uploadText")}</Button>
            </Upload>
            {editPhoto && <Avatar shape="square" size={48} src={editPhoto} style={{ marginLeft: 12 }} />}
          </Form.Item>
        </Form>
      </Modal>
    </AppShell>
  );
}