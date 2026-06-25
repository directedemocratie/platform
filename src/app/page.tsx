import Link from "next/link";
import prisma from "@/lib/prisma";

// Server Component — fetch Prisma direct, pas d'aller-retour client/serveur inutile.
// Les catégories sont rendues côté serveur : pas de flash de contenu vide au chargement.

interface Category {
  id: string;
  name: string;
  icon: string;
  description: string;
  count: number;
  href: string;
}

async function getCategories(): Promise<Category[]> {
  try {
    const codes = await prisma.code.findMany({
      select: {
        id: true,
        name: true,
        slug: true,
        description: true,
        icon: true,
        _count: {
          select: { articles: true },
        },
      },
    });

    return codes.map((code) => ({
      id: code.id,
      name: code.name,
      icon: code.icon,
      description: code.description,
      count: code._count.articles,
      href: `/${code.slug}`,
    }));
  } catch {
    return [];
  }
}

export default async function Home() {
  const categories = await getCategories();

  return (
    <div className="relative min-h-screen bg-slate-50/50 text-slate-800 overflow-hidden font-sans">
      {/* Effets lumineux floutés en arrière-plan */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-5xl mx-auto px-6 py-10 md:py-16 z-10">

        {/* En-tête principal */}
        <header className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-indigo-50/60 backdrop-blur-md border border-indigo-100/80 rounded-full px-4 py-1.5 mb-6 text-sm text-indigo-700 font-semibold shadow-xs">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
            </span>
            <span>Simulation collaborative d'intérêt général</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent">
            Démocratie Directe
          </h1>
          <h2 className="text-xl md:text-2xl text-slate-700 font-semibold mb-6 max-w-3xl mx-auto leading-relaxed">
            Co-construisons les lois de demain
          </h2>
          <p className="text-base md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            Découvrez une expérience d'intelligence collective inédite. Plongez au cœur des textes juridiques qui régissent notre quotidien, proposez des amendements argumentés et débattez avec d'autres citoyens pour dégager des consensus d'avenir.
          </p>
        </header>

        {/* Section Avertissement / Démarche Pédagogique */}
        <div className="bg-white/70 backdrop-blur-md border border-amber-200/80 rounded-2xl p-6 md:p-8 mb-16 max-w-4xl mx-auto shadow-md shadow-amber-500/5">
          <div className="flex flex-col md:flex-row items-start md:space-x-6">
            <div className="flex items-center justify-center bg-amber-50 border border-amber-100 rounded-xl p-3 text-amber-600 mb-4 md:mb-0 shrink-0">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-slate-900 mb-2.5 text-lg flex items-center">
                Démarche expérimentale &amp; pédagogique
              </h3>
              <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                <strong>Démocratie Directe</strong> est une initiative citoyenne indépendante et expérimentale. Ce projet ne cherche en aucun cas à remplacer, concurrencer ou contourner les institutions démocratiques de la République française, ni le parcours législatif officiel. Conçue comme une simulation collaborative à vocation pédagogique, cette plateforme vise à encourager la participation et à vulgariser l'accès aux textes de loi. Les contenus, amendements et votes formulés ici n'ont aucune valeur légale ou juridique.
              </p>
            </div>
          </div>
        </div>

        {/* Section Les 3 Piliers */}
        <section className="mb-20">
          <h3 className="text-center text-xs font-bold text-indigo-600 uppercase tracking-widest mb-10">
            L'intelligence collective au service des citoyens
          </h3>
          <div className="grid gap-8 md:grid-cols-3">

            {/* Pilier 1 */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-8 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 flex items-center justify-center bg-blue-50/70 text-blue-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-blue-700 transition-colors">
                1. Explorer &amp; Vulgariser
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Accédez facilement aux textes fondamentaux (Constitution, Codes de loi) dans un format clair, structuré et agréable à lire.
              </p>
            </div>

            {/* Pilier 2 */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-8 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 flex items-center justify-center bg-indigo-50/70 text-indigo-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-700 transition-colors">
                2. Amender &amp; Proposer
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Suggérez des réformes ou modifications précises sur n'importe quel article de loi et étayez votre point de vue par une justification argumentée.
              </p>
            </div>

            {/* Pilier 3 */}
            <div className="group bg-white border border-slate-100 rounded-2xl p-8 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300">
              <div className="w-14 h-14 flex items-center justify-center bg-emerald-50/70 text-emerald-600 rounded-xl mb-6 group-hover:scale-110 transition-transform duration-300">
                <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                </svg>
              </div>
              <h4 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-emerald-700 transition-colors">
                3. Débattre &amp; Voter
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed">
                Échangez des arguments de manière respectueuse et constructive sur chaque proposition d'amendement, et votez pour faire émerger les consensus.
              </p>
            </div>

          </div>
        </section>

        {/* Section Liste des Codes */}
        <section className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-100/40">
          <div className="mb-10 max-w-2xl">
            <h3 className="text-2xl md:text-3xl font-extrabold text-slate-900 mb-3">
              Explorer la Législation
            </h3>
            <p className="text-base text-slate-500 leading-relaxed">
              Sélectionnez un texte de loi officiel ci-dessous pour commencer à l'explorer, l'amender ou débattre de ses articles.
            </p>
          </div>

          {categories.length === 0 ? (
            <p className="text-slate-400 text-sm">
              Aucun code disponible. Lancez <code className="bg-slate-100 px-1 rounded">npm run db:sync-laws</code> pour importer la législation.
            </p>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {categories.map((category) => (
                <Link
                  key={category.id}
                  href={category.href}
                  className="group block"
                >
                  <article className="h-full bg-slate-50/50 border border-slate-100 rounded-2xl p-6 md:p-8 hover:bg-white hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-300">
                    <div className="flex items-start space-x-5">
                      <span className="text-4xl p-3 bg-white border border-slate-100 rounded-xl group-hover:scale-110 group-hover:border-indigo-100 shadow-xs transition-all duration-300 shrink-0">
                        {category.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                          <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors truncate">
                            {category.name}
                          </h4>
                          <span className="inline-flex items-center text-xs font-semibold bg-slate-100 text-slate-600 px-3 py-1 rounded-full group-hover:bg-indigo-50 group-hover:text-indigo-700 shrink-0 transition-colors">
                            {category.count.toLocaleString("fr-FR")} articles
                          </span>
                        </div>
                        <p className="text-sm text-slate-500 leading-relaxed">
                          {category.description}
                        </p>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          )}
        </section>

      </main>
    </div>
  );
}
