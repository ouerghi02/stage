// src/lib/auth.ts
import type { NextAuthOptions } from "next-auth";
import KeycloakProvider from "next-auth/providers/keycloak";
import { env } from "./env";

/**
 * Extrait les rôles "realm" contenus dans l'access_token Keycloak (JWT).
 * On ne vérifie pas la signature ici : le token vient directement de
 * Keycloak (échange serveur-à-serveur), on ne fait que lire son contenu.
 */
function decodeRoles(accessToken?: string): string[] {
  if (!accessToken) return [];
  try {
    const payload = accessToken.split(".")[1];
    if (!payload) return [];
    
    // Correction : utiliser base64 au lieu de base64url
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf-8"));
    return decoded.realm_access?.roles ?? [];
  } catch (error) {
    console.error("Erreur lors du décodage du token :", error);
    return [];
  }
}

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
      roles: decodeRoles(refreshed.access_token),
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
      if (account) {
        return {
          ...token,
          accessToken: account.access_token,
          refreshToken: account.refresh_token,
          accessTokenExpires: Date.now() + (account.expires_in as number) * 1000,
          roles: decodeRoles(account.access_token as string),
        };
      }

      if (token.accessTokenExpires && Date.now() < token.accessTokenExpires) {
        return token;
      }

      return refreshAccessToken(token);
    },
    async session({ session, token }) {
      session.error = token.error;
      session.user.roles = token.roles ?? [];
      return session;
    },
  },
};