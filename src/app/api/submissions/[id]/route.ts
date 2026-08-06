import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  const body = await request.json();

  try {
    const updated = await prisma.submission.update({
      where: { id },
      data: {
        nom: body.nom,
        message: body.message,
        dateEvenement: new Date(body.dateEvenement),
        priorite: body.priorite,
        categorie: body.categorie,
      },
    });
    return NextResponse.json(updated);
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la soumission :", error);
    return NextResponse.json({ error: "Échec de la mise à jour" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Identifiant invalide" }, { status: 400 });
  }

  try {
    await prisma.submission.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Erreur lors de la suppression de la soumission :", error);
    return NextResponse.json({ error: "Échec de la suppression" }, { status: 500 });
  }
}