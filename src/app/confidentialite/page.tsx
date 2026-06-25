import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Politique de confidentialité — Démocratie Directe",
  description:
    "Politique de confidentialité et protection des données personnelles de la plateforme Démocratie Directe. Conformité RGPD.",
};

export default function ConfidentialitePage() {
  const lastUpdated = "16 juin 2026";

  return (
    <div className="min-h-screen bg-white">
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-16">
        {/* Fil d'Ariane */}
        <nav className="flex items-center gap-2 text-sm text-slate-400 mb-10">
          <Link href="/" className="hover:text-indigo-600 transition-colors">
            Accueil
          </Link>
          <span>/</span>
          <span className="text-slate-600 font-medium">Politique de confidentialité</span>
        </nav>

        <header className="mb-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-3">
            Politique de confidentialité
          </h1>
          <p className="text-sm text-slate-400">
            Dernière mise à jour : {lastUpdated}
          </p>
        </header>

        <div className="prose prose-slate max-w-none space-y-8 text-slate-700 leading-relaxed">

          {/* 1 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">1. Qui sommes-nous ?</h2>
            <p>
              <strong>Démocratie Directe</strong> est une plateforme citoyenne indépendante à but non
              lucratif, conçue comme une simulation collaborative et pédagogique autour des textes
              législatifs français. Elle n'a aucune affiliation avec des institutions publiques ou
              privées.
            </p>
            <p className="mt-2">
              Responsable de traitement : Le collectif <strong>Démocratie Directe</strong>, joignable à l'adresse e-mail <a href="mailto:contact@directedemocratie.fr" className="text-indigo-600 hover:underline">contact@directedemocratie.fr</a>.
            </p>
          </section>

          {/* 2 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">2. Données collectées</h2>
            <p>Nous collectons uniquement les données strictement nécessaires au fonctionnement du service :</p>
            <table className="w-full mt-4 text-sm border border-slate-200 rounded-lg overflow-hidden">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left px-4 py-2 font-semibold text-slate-700">Donnée</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-700">Finalité</th>
                  <th className="text-left px-4 py-2 font-semibold text-slate-700">Base légale</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-2">Adresse e-mail</td>
                  <td className="px-4 py-2">Authentification par Magic Link</td>
                  <td className="px-4 py-2">Consentement (inscription volontaire)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Pseudonyme</td>
                  <td className="px-4 py-2">Identification publique sur la plateforme</td>
                  <td className="px-4 py-2">Consentement (inscription volontaire)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Propositions d'amendements</td>
                  <td className="px-4 py-2">Publication et débat citoyen</td>
                  <td className="px-4 py-2">Consentement (action volontaire)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Votes</td>
                  <td className="px-4 py-2">Calcul des scores des propositions</td>
                  <td className="px-4 py-2">Consentement (action volontaire)</td>
                </tr>
                <tr>
                  <td className="px-4 py-2">Cookie de session (<code>auth-token</code>)</td>
                  <td className="px-4 py-2">Maintien de la session authentifiée</td>
                  <td className="px-4 py-2">Intérêt légitime (sécurité du compte)</td>
                </tr>
              </tbody>
            </table>
            <p className="mt-3 text-sm text-slate-500">
              Nous ne collectons pas de données de navigation, n'utilisons pas de traceurs publicitaires
              et ne partageons aucune donnée avec des tiers à des fins commerciales.
            </p>
          </section>

          {/* 3 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">3. Durée de conservation</h2>
            <ul className="list-disc pl-5 space-y-1">
              <li>
                <strong>Compte utilisateur</strong> (email, pseudo) : conservé jusqu'à suppression
                explicite du compte par l'utilisateur.
              </li>
              <li>
                <strong>Propositions et votes</strong> : conservés pour maintenir l'intégrité de
                l'historique participatif. Possibilité de retirer une proposition (suppression logique).
              </li>
              <li>
                <strong>Tokens de connexion</strong> (Magic Link) : valides 15 minutes, supprimés
                automatiquement après usage ou expiration.
              </li>
              <li>
                <strong>Cookie de session</strong> : expire après 30 jours d'inactivité.
              </li>
            </ul>
          </section>

          {/* 4 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">4. Vos droits (RGPD)</h2>
            <p>
              Conformément au Règlement Général sur la Protection des Données (RGPD — Règlement UE
              2016/679), vous disposez des droits suivants :
            </p>
            <ul className="list-disc pl-5 mt-3 space-y-1">
              <li><strong>Droit d'accès</strong> : obtenir une copie de vos données personnelles.</li>
              <li>
                <strong>Droit de rectification</strong> : corriger des données inexactes.
              </li>
              <li>
                <strong>Droit à l'effacement</strong> : demander la suppression de votre compte et de
                vos données (hors propositions déjà publiées, conservées pour l'intégrité du débat
                public sous votre pseudonyme).
              </li>
              <li>
                <strong>Droit à la portabilité</strong> : recevoir vos données dans un format
                structuré.
              </li>
              <li>
                <strong>Droit d'opposition</strong> : vous opposer à un traitement.
              </li>
            </ul>
            <p className="mt-3">
              Pour exercer ces droits, contactez-nous à : <a href="mailto:contact@directedemocratie.fr" className="text-indigo-600 hover:underline">contact@directedemocratie.fr</a>.
            </p>
            <p className="mt-2">
              Vous disposez également du droit d'introduire une réclamation auprès de la{" "}
              <a
                href="https://www.cnil.fr"
                target="_blank"
                rel="noopener noreferrer"
                className="text-indigo-600 hover:underline"
              >
                CNIL
              </a>
              .
            </p>
          </section>

          {/* 5 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">5. Sécurité</h2>
            <p>
              Les sessions sont chiffrées avec l'algorithme AES-256-GCM. Les cookies de session sont
              configurés en <code>httpOnly</code> et <code>secure</code> (HTTPS uniquement en
              production). Les tokens Magic Link sont à usage unique et expiration courte (15 minutes).
              Aucun mot de passe n'est stocké.
            </p>
          </section>

          {/* 6 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">6. Cookies</h2>
            <p>
              Un seul cookie est utilisé : <code>auth-token</code>, strictement nécessaire au
              fonctionnement de la session authentifiée. Il ne contient aucune donnée de traçage. Ce
              cookie est exempt de consentement au sens de la délibération CNIL n°2020-092 (cookies
              strictement nécessaires).
            </p>
          </section>

          {/* 7 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">7. Hébergement</h2>
            <p>
              Le site est hébergé par <strong>Vercel Inc.</strong>, situé au 340 S Lemon Ave #4133 Walnut, CA 91789, USA. Les serveurs sont localisés au sein de l'Union Européenne (région Paris ou Francfort). Le nom de domaine est enregistré auprès d'<strong>OVHcloud</strong>.
            </p>
          </section>

          {/* 8 */}
          <section>
            <h2 className="text-xl font-bold text-slate-900 mb-3">8. Modifications</h2>
            <p>
              Cette politique peut être mise à jour. La date de dernière modification est indiquée en
              haut de page. Toute modification significative sera signalée aux utilisateurs connectés.
            </p>
          </section>

        </div>

        <div className="mt-12 pt-8 border-t border-slate-100">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 transition-colors"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </main>
    </div>
  );
}
