import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.submission.createMany({
    data: [
      { userEmail: "test@monapp.local", nom: "Ahmed", message: "Première soumission de test" },
      { userEmail: "test@monapp.local", nom: "Sarah", message: "Deuxième soumission de test" },
      { userEmail: "autre@monapp.local", nom: "Karim", message: "Un message d'un autre utilisateur" },
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
