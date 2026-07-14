// src/app/api/stats/route.ts
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
  }

  try {
    const [total, byPriorite, byCategorie, byMonthRaw] = await Promise.all([
      prisma.submission.count(),
      prisma.submission.groupBy({ by: ["priorite"], _count: { _all: true } }),
      prisma.submission.groupBy({ by: ["categorie"], _count: { _all: true } }),
      prisma.$queryRaw<{ month: Date; count: bigint }[]>`
        SELECT date_trunc('month', "created_at") AS month, COUNT(*)::bigint AS count
        FROM submissions
        WHERE "created_at" >= NOW() - INTERVAL '6 months'
        GROUP BY month
        ORDER BY month ASC
      `,
    ]);

    return NextResponse.json({
      total,
      byPriorite: byPriorite.map((p) => ({ priorite: p.priorite, count: p._count._all })),
      byCategorie: byCategorie.map((c) => ({ categorie: c.categorie, count: c._count._all })),
      byMonth: byMonthRaw.map((m) => ({ month: m.month.toISOString().slice(0, 7), count: Number(m.count) })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques :", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}