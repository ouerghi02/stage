import { z } from "zod";

/**
 * Toutes les variables d'environnement requises par l'app sont déclarées ici.
 * Si l'une d'elles manque ou est invalide, l'application refuse de démarrer
 * avec un message clair — plutôt qu'un plantage confus plus tard en prod.
 */
const envSchema = z.object({
  KEYCLOAK_CLIENT_ID: z.string().min(1, "KEYCLOAK_CLIENT_ID est requis"),
  KEYCLOAK_CLIENT_SECRET: z.string().min(1, "KEYCLOAK_CLIENT_SECRET est requis"),
  KEYCLOAK_ISSUER: z.string().url("KEYCLOAK_ISSUER doit être une URL valide"),
  NEXTAUTH_SECRET: z.string().min(16, "NEXTAUTH_SECRET doit faire au moins 16 caractères"),
  NEXTAUTH_URL: z.string().url(),
  DATABASE_URL: z.string().min(1, "DATABASE_URL est requis"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error(
    "❌ Variables d'environnement invalides :\n",
    parsed.error.flatten().fieldErrors
  );
  throw new Error("Configuration d'environnement invalide. Vérifie ton fichier .env.local");
}

export const env = parsed.data;
