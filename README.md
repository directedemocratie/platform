# Démocratie Directe 🇫🇷

## Description

Démocratie Directe est une plateforme web civic-tech visant à rendre la législation française plus accessible et participative. Elle permet à chaque citoyen de lire les textes de loi officiels, de proposer des amendements argumentés et de voter pour faire émerger des consensus collectifs.

> ⚠️ **Démarche expérimentale & pédagogique.** Ce projet est une simulation citoyenne indépendante. Les propositions et votes n'ont aucune valeur légale ou juridique.

---

## Technologies

| Couche           | Technologie                                                                |
| ---------------- | -------------------------------------------------------------------------- |
| Framework        | [Next.js 15](https://nextjs.org/) (App Router, Server & Client Components) |
| Langage          | TypeScript 5                                                               |
| Base de données  | PostgreSQL                                                                 |
| ORM              | [Prisma 6](https://www.prisma.io/)                                         |
| Styles           | Tailwind CSS v4                                                            |
| Authentification | Magic Link maison (token AES-256-GCM, cookie httpOnly)                     |
| Envoi d'email    | [Resend](https://resend.com/) _(à configurer — voir `.env`)_               |

---

## Fonctionnalités

- **Base de données législative** : Constitution, Code Civil, Code Pénal, Code du Travail (via sync depuis [legalize-fr](https://github.com/legalize-dev/legalize-fr))
- **Navigation paginée** avec infinite scroll par code de loi
- **Version Citoyenne** : split-view officiel / version amendée avec diff inline
- **Propositions d'amendement** : soumission avec justification argumentée
- **Système de vote** : score calculé sur les votes +1 / -1
- **Authentification** par Magic Link (sans mot de passe)
- **Profil utilisateur** avec pseudo unique

---

## Structure du projet

```
src/
├── app/
│   ├── page.tsx               # Accueil (Server Component)
│   ├── [code]/                # Liste des articles d'un code
│   │   ├── page.tsx
│   │   └── [article]/         # Page d'un article + propositions
│   │       ├── page.tsx
│   │       └── ProposeModificationButton.tsx
│   ├── api/
│   │   ├── articles/          # CRUD articles
│   │   ├── categories/        # Liste des codes
│   │   ├── proposals/         # CRUD propositions (rate limited)
│   │   ├── auth/
│   │   │   ├── magic-link/    # Génération du lien de connexion
│   │   │   ├── callback/      # Validation du token
│   │   │   ├── logout/
│   │   │   └── me/
│   │   └── codes/             # API codes (comparaison citoyenne)
│   └── login/                 # Page de connexion
├── components/
│   └── Navbar.tsx
├── context/
│   └── SessionContext.tsx     # Contexte auth côté client
├── lib/
│   └── prisma.ts              # Singleton Prisma Client
└── utils/
    ├── auth.ts                # Chiffrement AES-256-GCM des sessions
    ├── diff.ts                # Diff inline texte officiel / citoyen
    ├── rateLimit.ts           # Rate limiter sliding window en mémoire
    └── slugify.ts

prisma/
├── schema.prisma              # Schéma de données
└── seed.ts

scripts/
└── sync_laws.ts               # Script d'import des textes de loi
```

---

## Guide de démarrage rapide

### 1. Variables d'environnement

Copiez `.env` et renseignez les valeurs :

```env
# Connexion PostgreSQL
DATABASE_URL="postgresql://utilisateur:motdepasse@localhost:5432/directedemocratie"

# Clé de chiffrement des sessions (générer avec : openssl rand -hex 32)
# OBLIGATOIRE en production
SESSION_SECRET=votre-cle-secrete-32-octets

# Email (décommenter quand vous avez un domaine)
# EMAIL_PROVIDER=resend
# RESEND_API_KEY=re_...
# EMAIL_FROM=noreply@votre-domaine.fr
```

### 2. Initialiser la base de données

```bash
npx prisma db push
```

### 3. Lancer le serveur de développement

```bash
npm run dev
```

Le site sera accessible sur [http://localhost:3000](http://localhost:3000).

### 4. Importer la législation

```bash
# Tous les codes par défaut (Constitution, Civil, Pénal, Travail)
npm run db:sync-laws

# Un seul code spécifique
npm run db:sync-laws -- --only constitution
npm run db:sync-laws -- --only code-civil
npm run db:sync-laws -- --only code-penal
npm run db:sync-laws -- --only code-travail
```

### 5. Résoudre un conflit de port

```bash
# Libérer le port 3000
kill -9 $(lsof -t -i :3000)
```

---

## Notes de sécurité

- En **développement**, si `SESSION_SECRET` n'est pas définie, une valeur de fallback locale est utilisée.
- En **production**, `SESSION_SECRET` **doit** être définie — son absence provoque un crash explicite au démarrage.
- Le Magic Link est valable **15 minutes** et ne peut être utilisé qu'une fois.
- Les routes `/api/proposals` (POST) et `/api/auth/magic-link` (POST) sont protégées par un rate limiting.

---

## Licence

MIT — voir `LICENSE` pour plus de détails.
