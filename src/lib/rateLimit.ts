/**
 * Rate limiter minimal, en mémoire.
 *
 * ⚠️ Limite connue : cette implémentation ne fonctionne correctement que
 * pour UNE seule instance du serveur. Dès que l'app tourne sur plusieurs
 * instances (scaling horizontal, plusieurs pods, Vercel serverless, etc.),
 * chaque instance a son propre compteur et la limite globale n'est plus
 * respectée. Pour la production, remplacer par un store partagé comme
 * Upstash Redis (@upstash/ratelimit) ou une solution équivalente.
 */

const WINDOW_MS = 60_000; // fenêtre d'1 minute
const MAX_REQUESTS = 10; // 10 requêtes max par utilisateur par minute

type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

export function checkRateLimit(identifier: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const existing = buckets.get(identifier);

  if (!existing || now > existing.resetAt) {
    buckets.set(identifier, { count: 1, resetAt: now + WINDOW_MS });
    return { allowed: true, remaining: MAX_REQUESTS - 1 };
  }

  if (existing.count >= MAX_REQUESTS) {
    return { allowed: false, remaining: 0 };
  }

  existing.count += 1;
  return { allowed: true, remaining: MAX_REQUESTS - existing.count };
}
