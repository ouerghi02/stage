// src/lib/rbac.ts
import type { Session } from "next-auth";

/**
 * Nom du rôle Keycloak (realm role) qui donne accès aux données de tous
 * les utilisateurs. Adapte cette valeur au nom réel du rôle configuré
 * dans ton royaume Keycloak si ce n'est pas "admin".
 */
export const ADMIN_ROLE = "admin";

export function isAdmin(session: Session | null): boolean {
  return !!session?.user?.roles?.includes(ADMIN_ROLE);
}