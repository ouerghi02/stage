"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Form, Input, DatePicker, Radio, Select, Button, Alert } from "antd";
import type { Dayjs } from "dayjs";
import { useTranslations } from "next-intl";
import AppShell from "@/components/AppShell";

type SubmitFormValues = {
  nom: string;
  message: string;
  dateEvenement: Dayjs;
  priorite: "basse" | "moyenne" | "haute";
  categorie: "general" | "support" | "reclamation";
};

export default function SubmitPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [form] = Form.useForm<SubmitFormValues>();
  const t = useTranslations("submit");
  const tSub = useTranslations("submissions");

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
    return <p className="loading-text">{t("loading")}</p>;
  }

  const handleFinish = async (values: SubmitFormValues) => {
    setFeedback(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nom: values.nom,
          message: values.message,
          dateEvenement: values.dateEvenement.toISOString(),
          priorite: values.priorite,
          categorie: values.categorie,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setFeedback({ type: "success", text: t("successMessage", { id: data.id }) });
        form.resetFields();
      } else {
        setFeedback({ type: "error", text: data.error || t("genericError") });
      }
    } catch {
      setFeedback({ type: "error", text: t("networkError") });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <h1>{t("title")}</h1>
      <p className="userInfo">{t("connectedAs", { email: session?.user?.email ?? "" })}</p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="submitForm"
        disabled={isSubmitting}
      >
        <Form.Item
          name="nom"
          label={t("fields.nom")}
          rules={[{ required: true, message: t("fields.nomRequired") }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="message"
          label={t("fields.message")}
          rules={[{ required: true, message: t("fields.messageRequired") }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="dateEvenement"
          label={t("fields.dateEvenement")}
          rules={[{ required: true, message: t("fields.dateEvenementRequired") }]}
        >
          <DatePicker className="fullWidth" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="priorite"
          label={t("fields.priorite")}
          rules={[{ required: true, message: t("fields.prioriteRequired") }]}
        >
          <Radio.Group>
            <Radio value="basse">{tSub("priority.basse")}</Radio>
            <Radio value="moyenne">{tSub("priority.moyenne")}</Radio>
            <Radio value="haute">{tSub("priority.haute")}</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="categorie"
          label={t("fields.categorie")}
          rules={[{ required: true, message: t("fields.categorieRequired") }]}
        >
          <Select
            placeholder={t("fields.categoriePlaceholder")}
            options={[
              { value: "general", label: tSub("category.general") },
              { value: "support", label: tSub("category.support") },
              { value: "reclamation", label: tSub("category.reclamation") },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            {t("submitButton")}
          </Button>
        </Form.Item>
      </Form>

      {feedback && (
        <Alert
          className="feedbackAlert"
          type={feedback.type === "error" ? "error" : "success"}
          message={feedback.text}
          showIcon
        />
      )}

      <style jsx>{`
        .userInfo {
          margin-bottom: 16px;
        }

        .submitForm {
          max-width: 500px;
          margin-top: 24px;
        }

        .fullWidth {
          width: 100%;
        }

        .feedbackAlert {
          margin-top: 16px;
          max-width: 500px;
        }
      `}</style>
    </AppShell>
  );
}