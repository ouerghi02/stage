import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { env } from "./env";

/**
 * Demande un nouveau access_token à Keycloak en utilisant le refresh_token.
 * Sans cette étape, la session Next.js resterait "connectée" même après
 * qu'un admin ait révoqué ou désactivé l'utilisateur côté Keycloak, jusqu'à
 * expiration du cookie de session (potentiellement des jours).
 */
async function refreshAccessToken(token: import("next-auth/jwt").JWT) {
  try {
    const url = `${env.KEYCLOAK_ISSUER}/protocol/openid-connect/token`;

    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: env.KEYCLOAK_CLIENT_ID,
        client_secret: env.KEYCLOAK_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken ?? "",
      }),
    });

    const refreshed = await response.json();

    if (!response.ok) {
      throw refreshed;
    }

    return {
      ...token,
      accessToken: refreshed.access_token,
      accessTokenExpires: Date.now() + refreshed.expires_in * 1000,
      refreshToken: refreshed.refresh_token ?? token.refreshToken,
      error: undefined,
    };
  } catch (error) {
    console.error("Erreur lors du rafraîchissement du token Keycloak :", error);
    return { ...token, error: "RefreshAccessTokenError" as const };
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    KeycloakProvider({
      clientId: env.KEYCLOAK_CLIENT_ID,
      clientSecret: env.KEYCLOAK_CLIENT_SECRET,
      issuer: env.KEYCLOAK_ISSUER,
    }),
  ],
  secret: env.NEXTAUTH_SECRET,
  session: { strategy: "jwt" },
  callbacks: {
    async jwt({ token, account }) {
      // Première connexion : on stocke les tokens renvoyés par Keycloak
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_in as number) * 1000,
        };
      }

      // Le access token est encore valide
      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      // Le access token a expiré -> on le rafraîchit automatiquement
      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.error = token.error;
      return session;
    },
  },
};
