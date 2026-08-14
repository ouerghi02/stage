import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  try {
    const categories = await prisma.categorie.findMany({ orderBy: { createdAt: "desc" } });
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }
  const body = await request.json();
  if (!body.nom || !body.type) {
    return NextResponse.json({ error: "Champs requis manquants" }, { status: 400 });
  }
  try {
    const categorie = await prisma.categorie.create({
      data: { nom: body.nom, type: body.type, photo: body.photo ?? null },
    });
    return NextResponse.json(categorie, { status: 201 });
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}