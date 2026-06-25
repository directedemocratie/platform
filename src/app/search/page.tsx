"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { slugify } from "@/utils/slugify";

// Helper to escape regex special characters
function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Subcomponent to highlight matching text
function Highlight({ text, search }: { text: string; search: string }) {
  if (!search.trim() || !text) return <>{text}</>;
  
  const regex = new RegExp(`(${escapeRegExp(search)})`, "gi");
  const parts = text.split(regex);
  
  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-amber-100 text-amber-900 rounded px-0.5 font-medium no-underline">
            {part}
          </mark>
        ) : (
          part
        )
      )}
    </>
  );
}

// Inner search component that consumes search params
function SearchResultsContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }

    setLoading(true);
    setError(null);

    fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=50`)
      .then((res) => {
        if (!res.ok) {
          throw new Error("Erreur serveur lors de la recherche");
        }
        return res.json();
      })
      .then((data) => {
        setResults(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Erreur page recherche :", err);
        setError(err.message);
        setLoading(false);
      });
  }, [query]);

  if (!query || query.trim().length < 2) {
    return (
      <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl p-8 shadow-sm">
        <p className="text-slate-500 font-medium mb-2">Veuillez saisir au moins 2 caractères pour effectuer une recherche.</p>
        <Link href="/" className="text-indigo-600 hover:text-indigo-800 font-semibold text-sm">
          Retour à l'accueil
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-10">
        <Link 
          href="/"
          className="inline-flex items-center text-indigo-600 hover:text-indigo-800 mb-4 font-semibold text-sm transition-colors"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Retour à l'accueil
        </Link>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">
          Résultats de recherche
        </h1>
        <p className="text-slate-500 text-sm">
          {loading ? (
            <span>Recherche de &ldquo;{query}&rdquo;...</span>
          ) : (
            <span>
              {results.length} {results.length <= 1 ? "résultat trouvé" : "résultats trouvés"} pour &ldquo;<strong className="text-slate-800">{query}</strong>&rdquo;
            </span>
          )}
        </p>
      </header>

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white border border-slate-100 rounded-2xl p-6 h-36"></div>
          ))}
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 text-red-800">
          <p className="text-sm font-semibold">Une erreur est survenue lors de la recherche.</p>
          <p className="text-xs mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && results.length === 0 && (
        <div className="text-center py-12 bg-white border border-slate-100 rounded-3xl p-8 shadow-xs">
          <p className="text-slate-500 font-medium mb-3">Aucun article ne correspond à votre recherche.</p>
          <p className="text-xs text-slate-400">Essayez avec d'autres mots-clés ou vérifiez l'orthographe.</p>
        </div>
      )}

      {!loading && !error && results.length > 0 && (
        <div className="space-y-6">
          {results.map((article) => (
            <Link
              key={article.id}
              href={`/${article.code.slug}/${slugify(article.number)}`}
              className="block group"
            >
              <article className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs hover:shadow-xl hover:shadow-indigo-500/5 hover:border-indigo-200 transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl px-2 py-1 bg-slate-50 border border-slate-100 rounded-lg group-hover:bg-indigo-50 transition-colors">
                      {article.code.icon || "⚖️"}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-700 transition-colors">
                      <Highlight text={article.number} search={query} />
                    </h3>
                  </div>
                  <span className="inline-flex items-center text-xs font-semibold bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full shrink-0">
                    {article.code.name}
                  </span>
                </div>

                {article.title && article.title !== article.number && (
                  <h4 className="text-base font-bold text-slate-800 mb-2">
                    <Highlight text={article.title} search={query} />
                  </h4>
                )}

                <p className="text-slate-500 text-sm leading-relaxed line-clamp-4 font-normal" style={{ whiteSpace: "pre-line" }}>
                  <Highlight text={article.content} search={query} />
                </p>
              </article>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// Main page component with Suspense Boundary for useSearchParams
export default function SearchPage() {
  return (
    <div className="relative min-h-screen bg-slate-50/50 text-slate-800 overflow-hidden font-sans">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <main className="relative max-w-4xl mx-auto px-6 py-24 z-10">
        <Suspense fallback={
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
          </div>
        }>
          <SearchResultsContent />
        </Suspense>
      </main>
    </div>
  );
}
