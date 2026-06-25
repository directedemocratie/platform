import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Numéro d'erreur */}
        <p className="text-8xl font-extrabold bg-gradient-to-r from-blue-900 via-indigo-950 to-blue-900 bg-clip-text text-transparent mb-4 select-none">
          404
        </p>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Page introuvable
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          Cette page n'existe pas ou a été déplacée. Vous pouvez explorer les
          textes de loi disponibles depuis l'accueil.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200"
          >
            ← Retour à l'accueil
          </Link>
          <Link
            href="/search"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl border border-slate-200 transition-all duration-200"
          >
            🔍 Rechercher un article
          </Link>
        </div>
      </div>
    </div>
  );
}
