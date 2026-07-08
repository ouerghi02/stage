# Stage Keyrus — Next.js + Keycloak + Docker + Postgres (version "clean code")

Version prête à être développée sur le long terme : TypeScript, Prisma, validation
stricte, refresh token automatique, Keycloak persistant.

## Ce qui a changé par rapport à la version "démo 2 jours"

| Avant | Maintenant | Pourquoi |
|---|---|---|
| JavaScript | TypeScript strict | Détecte les erreurs à la compilation |
| Requêtes SQL brutes + pool `pg` manuel | Prisma ORM | Typage auto, migrations versionnées, moins d'erreurs |
| Keycloak en mémoire (H2) | Keycloak → Postgres dédié | La config survit aux redémarrages |
| Pas de refresh token | Refresh automatique dans le callback JWT | La session expire vraiment quand elle doit expirer |
| Pas de validation d'env | Zod valide `.env.local` au démarrage | Erreurs claires au lieu de bugs silencieux |
| Pas de validation d'input API | Zod valide le body de `/api/submit` | Jamais confiance aux données client |
| Aucune limite de requêtes | Rate limiting basique | Anti-spam (voir limite notée dans le code) |
| Bouton sans état de chargement | `isSubmitting` + désactivation | Empêche la double soumission |
| Pas de `.gitignore` | `.gitignore` complet | Le `.env.local` ne part jamais sur Git |

## Étape 1 — Lancer Docker

```bash
docker-compose up -d
```

Postgres attend d'être "healthy" avant que Keycloak démarre (Keycloak a maintenant besoin
de sa propre base `keycloak`, créée automatiquement par `docker/init-db.sh`).

## Étape 2 — Configurer Keycloak (admin console, http://localhost:8080, admin/admin)

1. Create realm → `monapp`
2. Clients → Create client → Client ID `nextjs-app`, Client authentication **ON**
3. Valid redirect URIs : `http://localhost:3000/api/auth/callback/keycloak`
4. Web origins : `http://localhost:3000`
5. Onglet Credentials → copier le secret
6. Users → Add user `test` → onglet Credentials → mot de passe (désactiver "Temporary")

## Étape 3 — Installer et configurer l'app

```bash
npm install
cp .env.local.example .env.local
```

Remplir `.env.local` (secret Keycloak + `NEXTAUTH_SECRET` généré via `openssl rand -base64 32`).

## Étape 4 — Base de données applicative (Prisma)

```bash
npx prisma migrate dev --name init
```

Cette commande crée la table `submissions` **et** garde un historique versionné des
migrations dans `prisma/migrations/` — contrairement au `init.sql` de la v1, chaque
évolution du schéma est traçable et rejouable sur n'importe quel environnement.

## Étape 5 — Lancer l'app

```bash
npm run dev
```

http://localhost:3000 → connexion → **"Nouvelle soumission"** dans la navbar pour ajouter des
données → **"Soumissions"** pour voir la liste en lecture seule (toutes les soumissions, tous
utilisateurs confondus).

### Insérer rapidement des données de test (sans passer par l'UI)

```bash
npm run prisma:seed
```

Insère 3 soumissions de test directement en base — pratique pour vérifier que la page
d'affichage fonctionne sans remplir le formulaire à la main à chaque fois.

## Vérifier les données

```bash
npx prisma studio
```

Ouvre une interface graphique pour explorer les tables (bien plus pratique que `psql` en dev).

## Structure

```
stage-keyrus-app/
├── docker-compose.yml
├── docker/init-db.sh         # crée la base "keycloak" séparée
├── prisma/schema.prisma       # source de vérité du schéma DB
├── .env.local.example
├── tsconfig.json
├── .eslintrc.json / .prettierrc
└── src/
    ├── middleware.ts          # protège /form ET /api/submit
    ├── lib/
    │   ├── env.ts             # validation Zod des variables d'env
    │   ├── auth.ts            # config NextAuth + refresh token Keycloak
    │   ├── prisma.ts          # client Prisma singleton
    │   └── rateLimit.ts       # anti-spam basique
    ├── types/next-auth.d.ts   # types étendus (accessToken, error)
    ├── components/
    │   ├── Navbar.tsx
    │   └── AppShell.tsx
    └── app/
        ├── layout.tsx
        ├── providers.tsx
        ├── page.tsx           # accueil / login
        ├── form/page.tsx      # page 2 : affichage lecture seule de toutes les soumissions
        ├── submit/page.tsx    # page de saisie (formulaire de remplissage)
        └── api/
            ├── auth/[...nextauth]/route.ts
            ├── submit/route.ts       # POST : insère une soumission
            └── submissions/route.ts  # GET : liste toutes les soumissions
```

## Limites connues à garder en tête pour la suite

- **Rate limiting en mémoire** : ne fonctionne que sur une seule instance serveur.
  Pour un vrai déploiement multi-instance, migrer vers Upstash Redis (`@upstash/ratelimit`).
- **Pas de tests automatisés** : à ajouter (Vitest/Jest pour la logique, Playwright pour l'e2e)
  avant que le projet grossisse davantage.
- **Styles inline** : suffisant pour une démo, mais à migrer vers Tailwind CSS si le nombre
  de pages augmente.
