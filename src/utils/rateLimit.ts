/**
 * Rate limiter en mémoire (sliding window).
 *
 * ⚠️  Adapté à un déploiement mono-instance (dev, VPS, Coolify...).
 * Pour un déploiement multi-instances (Vercel Edge, Kubernetes...), remplacer
 * par une solution Redis-based (ex: @upstash/ratelimit).
 */

interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const store = new Map<string, RateLimitEntry>();

// Nettoyage périodique pour éviter les fuites mémoire
setInterval(() => {
  const now = Date.now();
  for (const [key, entry] of store.entries()) {
    // On supprime les entrées plus vieilles que 10 minutes
    if (now - entry.windowStart > 10 * 60 * 1000) {
      store.delete(key);
    }
  }
}, 5 * 60 * 1000); // toutes les 5 min

export interface RateLimitOptions {
  /** Durée de la fenêtre glissante en millisecondes */
  windowMs: number;
  /** Nombre maximum de requêtes autorisées dans cette fenêtre */
  max: number;
}

/**
 * Vérifie si une clé dépasse la limite.
 * @returns `{ limited: true }` si la limite est atteinte, `{ limited: false, remaining }` sinon.
 */
export function checkRateLimit(
  key: string,
  options: RateLimitOptions
): { limited: true } | { limited: false; remaining: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now - entry.windowStart > options.windowMs) {
    // Nouvelle fenêtre
    store.set(key, { count: 1, windowStart: now });
    return { limited: false, remaining: options.max - 1 };
  }

  if (entry.count >= options.max) {
    return { limited: true };
  }

  entry.count++;
  return { limited: false, remaining: options.max - entry.count };
}
