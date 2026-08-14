import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rateLimit";

// Schéma de validation : on ne fait jamais confiance aux données envoyées
// par le client, même si l'UI les valide déjà côté front.
// La catégorie n'est plus une liste figée (general/support/reclamation) :
// elle est désormais gérée dynamiquement via la table Categorie
// (page /categorie/gestion). On vérifie donc juste que c'est une chaîne
// non vide ici, puis on contrôle son existence réelle en base plus bas.
const submissionSchema = z.object({
  nom: z.string().trim().min(1, "Le nom est requis").max(100),
  message: z.string().trim().min(1, "Le message est requis").max(2000),
  dateEvenement: z.coerce.date({ errorMap: () => ({ message: "Date invalide" }) }),
  priorite: z.enum(["basse", "moyenne", "haute"], {
    errorMap: () => ({ message: "Priorité invalide" }),
  }),
  categorie: z.string().trim().min(1, "La catégorie est requise").max(100),
});

export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  if (session.error === "RefreshAccessTokenError") {
    return NextResponse.json(
      { error: "Session expirée, merci de vous reconnecter" },
      { status: 401 }
    );
  }

  const rateLimit = checkRateLimit(session.user.email);
  if (!rateLimit.allowed) {
    return NextResponse.json(
      { error: "Trop de requêtes, réessayez dans une minute" },
      { status: 429 }
    );
  }

  const body = await request.json();
  const parsed = submissionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides", details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    );
  }

  // On vérifie que la catégorie envoyée existe bien dans la table Categorie,
  // pour éviter qu'un client n'enregistre une soumission avec une catégorie
  // qui n'a jamais été créée dans la gestion des catégories.
  const categorieExists = await prisma.categorie.findFirst({
    where: { nom: parsed.data.categorie },
  });

  if (!categorieExists) {
    return NextResponse.json(
      { error: "Catégorie invalide", details: { categorie: ["Catégorie inconnue"] } },
      { status: 400 }
    );
  }

  try {
    const submission = await prisma.submission.create({
      data: {
        userEmail: session.user.email,
        nom: parsed.data.nom,
        message: parsed.data.message,
        dateEvenement: parsed.data.dateEvenement,
        priorite: parsed.data.priorite,
        categorie: parsed.data.categorie,
      },
    });

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Erreur lors de l'insertion en base :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}