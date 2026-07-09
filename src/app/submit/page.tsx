"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Form, Input, DatePicker, Radio, Select, Button, Alert } from "antd";
import type { Dayjs } from "dayjs";
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
    return <p className="loading-text">Chargement...</p>;
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
        setFeedback({ type: "success", text: `Soumission enregistrée (id: ${data.id})` });
        form.resetFields();
      } else {
        setFeedback({ type: "error", text: data.error || "Erreur lors de l'envoi" });
      }
    } catch {
      setFeedback({ type: "error", text: "Erreur réseau, réessayez." });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppShell>
      <h1>Nouvelle soumission</h1>
      <p className="userInfo">Connecté en tant que : {session?.user?.email}</p>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleFinish}
        className="submitForm"
        disabled={isSubmitting}
      >
        <Form.Item
          name="nom"
          label="Nom"
          rules={[{ required: true, message: "Le nom est requis" }]}
        >
          <Input />
        </Form.Item>

        <Form.Item
          name="message"
          label="Message"
          rules={[{ required: true, message: "Le message est requis" }]}
        >
          <Input.TextArea rows={4} />
        </Form.Item>

        <Form.Item
          name="dateEvenement"
          label="Date de l'événement"
          rules={[{ required: true, message: "La date est requise" }]}
        >
          <DatePicker className="fullWidth" format="DD/MM/YYYY" />
        </Form.Item>

        <Form.Item
          name="priorite"
          label="Priorité"
          rules={[{ required: true, message: "La priorité est requise" }]}
        >
          <Radio.Group>
            <Radio value="basse">Basse</Radio>
            <Radio value="moyenne">Moyenne</Radio>
            <Radio value="haute">Haute</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="categorie"
          label="Catégorie"
          rules={[{ required: true, message: "La catégorie est requise" }]}
        >
          <Select
            placeholder="Sélectionner une catégorie"
            options={[
              { value: "general", label: "Général" },
              { value: "support", label: "Support" },
              { value: "reclamation", label: "Réclamation" },
            ]}
          />
        </Form.Item>

        <Form.Item>
          <Button type="primary" htmlType="submit" loading={isSubmitting}>
            Envoyer
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