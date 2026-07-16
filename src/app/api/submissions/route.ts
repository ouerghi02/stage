import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

const ALLOWED_SORT_FIELDS = ["nom", "dateEvenement", "createdAt", "priorite", "categorie", "userEmail"] as const;
type SortField = (typeof ALLOWED_SORT_FIELDS)[number];

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);

  const page = Math.max(1, Number(searchParams.get("page")) || 1);
  const pageSize = Math.min(100, Math.max(1, Number(searchParams.get("pageSize")) || 10));

  const sortFieldParam = searchParams.get("sortField") ?? "createdAt";
  const sortField: SortField = (ALLOWED_SORT_FIELDS as readonly string[]).includes(sortFieldParam)
    ? (sortFieldParam as SortField)
    : "createdAt";
  const sortOrder: "asc" | "desc" = searchParams.get("sortOrder") === "ascend" ? "asc" : "desc";

  const search = searchParams.get("search")?.trim();
  const priorite = searchParams.get("priorite"); // ex: "haute,moyenne"
  const categorie = searchParams.get("categorie");

  const where: Prisma.SubmissionWhereInput = {};
  if (search) where.nom = { contains: search, mode: "insensitive" };
  if (priorite) where.priorite = { in: priorite.split(",") };
  if (categorie) where.categorie = { in: categorie.split(",") };

  try {
    const [submissions, total] = await Promise.all([
      prisma.submission.findMany({
        where,
        orderBy: { [sortField]: sortOrder },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.submission.count({ where }),
    ]);

    return NextResponse.json({ submissions, total, page, pageSize });
  } catch (error) {
    console.error("Erreur lors de la récupération des soumissions :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}