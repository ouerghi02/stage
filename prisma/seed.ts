import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.submission.createMany({
    data: [
      {
        userEmail: "test@monapp.local",
        nom: "Ahmed",
        message: "Première soumission de test",
        dateEvenement: new Date(),
        priorite: "moyenne",
        categorie: "général",
      },
      {
        userEmail: "test@monapp.local",
        nom: "Sarah",
        message: "Deuxième soumission de test",
        dateEvenement: new Date(),
        priorite: "haute",
        categorie: "feedback",
      },
      {
        userEmail: "autre@monapp.local",
        nom: "Karim",
        message: "Un message d'un autre utilisateur",
        dateEvenement: new Date(),
        priorite: "basse",
        categorie: "question",
      },
    ],
  });
  console.log("✅ Données de test insérées");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
