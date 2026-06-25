"use client";

import Link from "next/link";

export default function AboutPage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50/50 text-slate-800 font-sans py-12 px-6">
      {/* Background blur decorative blobs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-3xl mx-auto bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-8 md:p-12 shadow-xl shadow-indigo-950/5">
        
        {/* Navigation Breadcrumb */}
        <nav className="flex items-center space-x-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-8">
          <Link href="/" className="hover:text-indigo-600 transition-colors">Accueil</Link>
          <span>/</span>
          <span className="text-slate-600">À propos</span>
        </nav>

        {/* Title */}
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-900 mb-6">
          À propos de Démocratie Directe
        </h1>

        <div className="space-y-6 text-sm md:text-base text-slate-600 leading-relaxed font-normal">
          <p>
            <strong>Démocratie Directe</strong> est une initiative citoyenne, technologique et pédagogique indépendante. 
            Le but de ce projet est de vulgariser le droit français et d'explorer comment l'intelligence collective peut 
            co-construire et améliorer nos lois.
          </p>

          <hr className="border-slate-100 my-6" />

          {/* Section 1 */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2.5">
              1. Une démarche neutre et expérimentale
            </h2>
            <p>
              Ce projet n'est affilié à aucun parti politique, aucune organisation gouvernementale, ni aucun groupe d'influence. 
              Il est conçu comme une **simulation collaborative d'intérêt général**. Les amendements proposés et les votes 
              exprimés sur cette plateforme n'ont aucune valeur légale.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2.5">
              2. Transparence totale et Open-Source
            </h2>
            <p>
              Pour garantir une confiance totale dans le traitement des propositions et des votes, l'intégralité du code source 
              de la plateforme est **publique et libre (Open-Source)**. Chacun peut auditer le fonctionnement de l'application, 
              proposer des correctifs ou l'héberger de manière autonome :
            </p>
            <div className="mt-3.5">
              <a 
                href="https://github.com/directedemocratie/platform" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100/80 px-4 py-2 rounded-xl transition-all"
              >
                🛸 Voir le projet sur GitHub
              </a>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2.5">
              3. Gestion de la modération et comportement
            </h2>
            <p>
              Pour préserver la qualité des échanges, la plateforme applique une **modération a posteriori**. Si vous constatez un contenu abusif 
              (propos haineux, diffamatoires, insultants, spam, etc.), vous pouvez le signaler directement par e-mail à l'adresse de contact ci-dessous. 
              Tout contenu inapproprié sera retiré.
            </p>
            <p className="mt-2">
              Chaque amendement citoyen doit être accompagné d'une **justification argumentée** afin de favoriser des débats riches et instructifs.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-lg font-bold text-slate-900 mb-2.5">
              4. Respect de la vie privée
            </h2>
            <p>
              Le site utilise un système de connexion par **Magic Link** (un lien temporaire envoyé par e-mail), évitant la gestion 
              et le stockage de mots de passe. Vos données ne sont jamais partagées ni vendues. L'adresse e-mail sert uniquement à 
              sécuriser votre compte citoyen et à valider vos votes.
            </p>
          </div>

          <hr className="border-slate-100 my-8" />

          {/* Contact info */}
          <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
            <h3 className="font-bold text-slate-900 mb-1.5">Une question, une remarque ?</h3>
            <p className="text-xs text-slate-500 mb-3.5">
              Vous pouvez nous contacter directement par e-mail pour toute demande relative au projet.
            </p>
            <a 
              href="mailto:contact@directedemocratie.fr" 
              className="inline-flex items-center text-xs font-bold text-slate-700 bg-white border border-slate-200/80 hover:border-slate-300 px-4 py-2 rounded-xl transition-colors"
            >
              ✉️ contact@directedemocratie.fr
            </a>
          </div>

        </div>

      </main>
    </div>
  );
}
