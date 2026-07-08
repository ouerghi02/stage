import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * Renvoie TOUTES les soumissions de TOUS les utilisateurs.
 *
 * ⚠️ Sécurité : cette route vérifie uniquement que l'utilisateur est
 * authentifié, pas qu'il a un rôle "admin". En l'état, n'importe quel
 * utilisateur connecté peut voir les données des autres. Si ce n'est
 * pas le comportement voulu à terme, il faudra ajouter une vérification
 * de rôle Keycloak (ex: session.user.roles?.includes("admin")).
 */
export async function GET() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const submissions = await prisma.submission.findMany({
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ submissions });
  } catch (error) {
    console.error("Erreur lors de la récupération des soumissions :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}
