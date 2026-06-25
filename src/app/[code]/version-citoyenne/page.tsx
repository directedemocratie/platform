"use client";

import { useEffect, useState, use, useRef, useCallback, Fragment } from "react";
import Link from "next/link";
import { computeDiff } from "@/utils/diff";

interface ArticleComparison {
  id: string;
  number: string;
  title: string;
  order: number;
  officialContent: string;
  citizenContent: string | null;
  citizenScore: number | null;
  citizenAuthor: string | null;
  citizenCreatedAt: string | null;
  hasAmendment: boolean;
}

interface ComparisonData {
  code: { name: string; slug: string; description: string; icon: string };
  totalArticles: number;
  amendedArticles: number;
  articles: ArticleComparison[];
}

export default function VersionCitoyennePage({
  params,
}: {
  params: Promise<{ code: string }>;
}) {
  const { code: codeSlug } = use(params);
  const [data, setData] = useState<ComparisonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<"all" | "amended">("all");
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  // Refs pour la navigation par article
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch(`/api/codes/${codeSlug}/comparison`)
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger les données");
        return res.json();
      })
      .then((d: ComparisonData) => {
        setData(d);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [codeSlug]);

  // Clic sur un article → scroll jusqu'à lui + surbrillance
  const handleArticleClick = useCallback((articleId: string) => {
    setActiveArticleId(articleId);
    const row = rowRefs.current.get(articleId);
    if (row && scrollContainerRef.current) {
      const containerTop = scrollContainerRef.current.getBoundingClientRect().top;
      const rowTop = row.getBoundingClientRect().top;
      scrollContainerRef.current.scrollBy({
        top: rowTop - containerTop - 24,
        behavior: "smooth",
      });
    }
  }, []);

  // Navigation entre amendements
  const goToAmended = useCallback(
    (direction: "next" | "prev") => {
      if (!data) return;
      const amended = data.articles.filter((a) => a.hasAmendment);
      if (amended.length === 0) return;

      const currentIdx = amended.findIndex((a) => a.id === activeArticleId);
      let nextIdx: number;

      if (direction === "next") {
        nextIdx = currentIdx < amended.length - 1 ? currentIdx + 1 : 0;
      } else {
        nextIdx = currentIdx > 0 ? currentIdx - 1 : amended.length - 1;
      }

      handleArticleClick(amended[nextIdx].id);
    },
    [data, activeArticleId, handleArticleClick]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-2 border-indigo-200 border-t-indigo-500"></div>
          <div className="absolute inset-0 flex items-center justify-center text-xl">🏛</div>
        </div>
        <div className="text-center">
          <p className="text-slate-700 font-semibold text-lg">Compilation de la Version Citoyenne…</p>
          <p className="text-slate-400 text-sm mt-1">Calcul des meilleures propositions par article</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 font-semibold text-xl mb-4">Erreur de chargement</p>
          <p className="text-slate-500 mb-6">{error}</p>
          <Link href={`/${codeSlug}`} className="text-indigo-600 hover:text-indigo-800 underline">
            Retour à la liste des articles
          </Link>
        </div>
      </div>
    );
  }

  const displayedArticles =
    filter === "amended"
      ? data.articles.filter((a) => a.hasAmendment)
      : data.articles;

  const amendedPercent =
    data.totalArticles > 0
      ? Math.round((data.amendedArticles / data.totalArticles) * 100)
      : 0;

  return (
    <div className="h-screen flex flex-col bg-white overflow-hidden">
      {/* ── En-tête ─────────────────────────────────────────────────── */}
      <header className="flex-none bg-white border-b border-gray-200 px-6 py-4 shadow-sm">
        <div className="max-w-screen-2xl mx-auto flex flex-wrap items-center justify-between gap-4">
          {/* Breadcrumb + titre */}
          <div className="flex items-center gap-4">
            <Link
              href={`/${codeSlug}`}
              className="text-gray-400 hover:text-indigo-600 transition-colors flex items-center gap-1.5 text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              {data.code.name}
            </Link>
            <span className="text-gray-300">/</span>
            <div className="flex items-center gap-2">
              <span className="text-xl">{data.code.icon}</span>
              <div>
                <h1 className="text-gray-900 font-bold text-lg leading-tight">
                  Version Citoyenne — {data.code.name}
                </h1>
                <p className="text-gray-400 text-xs">
                  Cliquez sur un article pour l'aligner dans les deux colonnes
                </p>
              </div>
            </div>
          </div>

          {/* Stats + contrôles */}
          <div className="flex items-center gap-4">
            {/* Progression */}
            <div className="hidden md:flex flex-col items-end gap-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-400">Articles amendés</span>
                <span className="text-sm font-bold text-emerald-600">
                  {data.amendedArticles}
                  <span className="text-gray-400 font-normal"> / {data.totalArticles}</span>
                </span>
                <span className="text-xs font-semibold text-indigo-500 bg-indigo-50 border border-indigo-100 px-1.5 py-0.5 rounded-full">
                  {amendedPercent}%
                </span>
              </div>
              <div className="w-44 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-indigo-400 to-emerald-400 rounded-full transition-all duration-1000"
                  style={{ width: `${amendedPercent}%` }}
                />
              </div>
            </div>

            {/* Filtre */}
            <div className="flex bg-gray-100 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filter === "all"
                    ? "bg-white text-gray-900 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Tous ({data.totalArticles})
              </button>
              <button
                onClick={() => setFilter("amended")}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  filter === "amended"
                    ? "bg-white text-emerald-700 shadow-sm"
                    : "text-gray-500 hover:text-gray-700"
                }`}
              >
                🟢 Amendés ({data.amendedArticles})
              </button>
            </div>

            {/* Navigation amendements */}
            {data.amendedArticles > 0 && (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToAmended("prev")}
                  title="Amendement précédent"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 transition-colors text-sm font-bold"
                >
                  ↑
                </button>
                <button
                  onClick={() => goToAmended("next")}
                  title="Amendement suivant"
                  className="p-2 rounded-lg bg-gray-100 hover:bg-indigo-50 hover:text-indigo-600 text-gray-500 transition-colors text-sm font-bold"
                >
                  ↓
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ── Labels des colonnes ─────────────────────────────────────── */}
      <div className="flex-none grid grid-cols-2 border-b border-gray-200 bg-gray-50">
        <div className="px-6 py-2.5 border-r border-gray-200 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-gray-400"></div>
          <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">
            Texte Officiel
          </span>
        </div>
        <div className="px-6 py-2.5 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
          <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">
            Version Citoyenne 🏛
          </span>
        </div>
      </div>

      {/* ── Contenu : UN seul conteneur scrollable, grille à 2 colonnes ── */}
      {/*
        La clé de la solution : un unique overflow-y-scroll contenant une grille.
        Chaque ligne de la grille = un article (2 cellules côte à côte).
        Les deux cellules d'une même ligne ont toujours la même hauteur (la plus
        haute des deux). Il n'y a qu'un seul scrollbar, donc les colonnes
        restent parfaitement alignées sans aucune synchronisation JavaScript.
      */}
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-scroll min-h-0"
      >
        <div className="grid grid-cols-2 min-h-full">
          {displayedArticles.length === 0 && (
            <div className="col-span-2 flex items-center justify-center py-24">
              <div className="text-center max-w-md">
                <div className="text-5xl mb-4">🗳️</div>
                <h2 className="text-gray-800 font-bold text-xl mb-2">Aucun amendement citoyen</h2>
                <p className="text-gray-400 text-sm mb-6">
                  Aucune proposition n'a encore reçu de votes positifs sur ce texte.
                  Soyez le premier à contribuer !
                </p>
                <Link
                  href={`/${codeSlug}`}
                  className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm"
                >
                  Explorer les articles
                </Link>
              </div>
            </div>
          )}

          {displayedArticles.map((article) => {
            const isActive = activeArticleId === article.id;

            return (
              <Fragment key={article.id}>
                {/* ── Cellule gauche : Texte officiel ── */}
                <div
                  ref={(el) => {
                    if (el) rowRefs.current.set(article.id, el);
                  }}
                  onClick={() => handleArticleClick(article.id)}
                  className={`p-6 border-r border-b border-gray-100 cursor-pointer transition-all duration-150 ${
                    isActive
                      ? "bg-indigo-50/80 border-l-4 border-l-indigo-400"
                      : "hover:bg-gray-50 border-l-4 border-l-transparent"
                  }`}
                >
                  {/* En-tête article */}
                  <div className="flex items-center gap-2 mb-3">
                    <Link
                      href={`/${codeSlug}/${article.number.toLowerCase().replace(/\s+/g, "-")}`}
                      onClick={(e) => e.stopPropagation()}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase tracking-wider transition-colors"
                    >
                      {article.number}
                    </Link>
                    {article.title && article.title !== article.number && (
                      <span className="text-xs text-gray-400 truncate max-w-[200px]">
                        — {article.title}
                      </span>
                    )}
                    {article.hasAmendment && (
                      <span className="ml-auto shrink-0 text-xs font-semibold text-amber-600 bg-amber-50 border border-amber-200 px-1.5 py-0.5 rounded">
                        Modifié
                      </span>
                    )}
                  </div>
                  {/* Contenu */}
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line font-mono">
                    {article.officialContent}
                  </p>
                </div>

                {/* ── Cellule droite : Version citoyenne ── */}
                <div
                  onClick={() => handleArticleClick(article.id)}
                  className={`p-6 border-b border-gray-100 cursor-pointer transition-all duration-150 ${
                    isActive && article.hasAmendment
                      ? "bg-emerald-50/60 border-r-4 border-r-emerald-400"
                      : isActive
                      ? "bg-indigo-50/40 border-r-4 border-r-indigo-200"
                      : article.hasAmendment
                      ? "bg-emerald-50/20 hover:bg-emerald-50/40"
                      : "hover:bg-gray-50"
                  }`}
                >
                  {/* En-tête article */}
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                      {article.number}
                    </span>
                    {article.hasAmendment ? (
                      <div className="ml-auto flex items-center gap-2 shrink-0">
                        <span className="text-xs text-gray-500">
                          par{" "}
                          <strong className="text-indigo-600">{article.citizenAuthor}</strong>
                        </span>
                        <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                          ▲ +{article.citizenScore}
                        </span>
                      </div>
                    ) : (
                      <span className="ml-auto shrink-0 text-xs text-gray-300 italic">
                        Texte original
                      </span>
                    )}
                  </div>

                  {/* Contenu */}
                  {article.hasAmendment ? (
                    <DiffView
                      original={article.officialContent}
                      modified={article.citizenContent!}
                    />
                  ) : (
                    <p className="text-sm text-gray-400 leading-relaxed whitespace-pre-line font-mono italic">
                      {article.officialContent}
                    </p>
                  )}
                </div>
              </Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/**
 * Affichage du diff inline entre texte officiel et version citoyenne.
 */
function DiffView({ original, modified }: { original: string; modified: string }) {
  const tokens = computeDiff(original, modified);

  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono select-text text-gray-700">
      {tokens.map((token, i) => {
        if (token.type === "added") {
          return (
            <ins
              key={i}
              className="bg-emerald-100 text-emerald-800 no-underline rounded px-0.5 font-semibold"
            >
              {token.value}
            </ins>
          );
        }
        if (token.type === "removed") {
          return (
            <del
              key={i}
              className="bg-red-100 text-red-600 line-through rounded px-0.5"
            >
              {token.value}
            </del>
          );
        }
        return (
          <span key={i} className="text-gray-700">
            {token.value}
          </span>
        );
      })}
    </div>
  );
}
