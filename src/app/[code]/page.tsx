"use client";

import { useEffect, useState, use, useRef, useCallback, Fragment } from "react";
import Link from "next/link";
import { slugify } from "@/utils/slugify";
import { computeDiff } from "@/utils/diff";

const BATCH_SIZE = 30;

interface CitizenProposal {
  citizenContent: string;
  citizenScore: number;
  citizenAuthor: string;
}

export default function CodePage({ params }: { params: Promise<{ code: string }> }) {
  const { code: codeSlug } = use(params);

  // ── Articles (chargement paginé + infinite scroll) ─────────────
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);

  // ── Données citoyennes (chargées en arrière-plan) ──────────────
  // Map articleId → CitizenProposal | null
  // undefined = pas encore chargé, null = pas de proposition, objet = proposition trouvée
  const [proposalMap, setProposalMap] = useState<Map<string, CitizenProposal | null>>(new Map());
  const [proposalMapLoaded, setProposalMapLoaded] = useState(false);
  const [codeInfo, setCodeInfo] = useState<{
    name: string; icon: string; amendedCount: number; totalCount: number;
  } | null>(null);

  // ── Affichage de la colonne citoyenne ──────────────────────────
  const [showCitizen, setShowCitizen] = useState(false);

  // ── Refs ───────────────────────────────────────────────────────
  const observerTarget = useRef<HTMLDivElement>(null);

  // ── Chargement initial ─────────────────────────────────────────
  useEffect(() => {
    setArticles([]);
    setLoading(true);
    setHasMore(true);
    setOffset(0);
    setProposalMap(new Map());
    setProposalMapLoaded(false);
    setCodeInfo(null);
    setShowCitizen(false);

    // 1. Articles paginés
    fetch(`/api/articles?code=${codeSlug}&limit=${BATCH_SIZE}&offset=0`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setArticles(list);
        setOffset(list.length);
        if (list.length < BATCH_SIZE) setHasMore(false);
        setLoading(false);
      })
      .catch(() => {
        setHasMore(false);
        setLoading(false);
      });

    // 2. Données citoyennes en arrière-plan
    fetch(`/api/codes/${codeSlug}/comparison`)
      .then((res) => res.json())
      .then((data) => {
        const map = new Map<string, CitizenProposal | null>();
        for (const a of data.articles) {
          map.set(
            a.id,
            a.hasAmendment
              ? { citizenContent: a.citizenContent, citizenScore: a.citizenScore, citizenAuthor: a.citizenAuthor }
              : null
          );
        }
        setProposalMap(map);
        setProposalMapLoaded(true);
        setCodeInfo({
          name: data.code.name,
          icon: data.code.icon,
          amendedCount: data.amendedArticles,
          totalCount: data.totalArticles,
        });
      })
      .catch(() => setProposalMapLoaded(true)); // Silencieux
  }, [codeSlug]);

  // ── Chargement du lot suivant ──────────────────────────────────
  const loadNextBatch = useCallback(() => {
    if (loading || loadingMore || !hasMore) return;
    setLoadingMore(true);
    fetch(`/api/articles?code=${codeSlug}&limit=${BATCH_SIZE}&offset=${offset}`)
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        setArticles((prev) => [...prev, ...list]);
        setOffset((prev) => prev + list.length);
        if (list.length < BATCH_SIZE) setHasMore(false);
        setLoadingMore(false);
      })
      .catch(() => setLoadingMore(false));
  }, [loading, loadingMore, hasMore, offset, codeSlug]);

  // ── IntersectionObserver (infinite scroll) ─────────────────────
  useEffect(() => {
    if (loading || !hasMore) return;
    const observer = new IntersectionObserver(
      (entries) => { if (entries[0].isIntersecting) loadNextBatch(); },
      { threshold: 0.1 }
    );
    const target = observerTarget.current;
    if (target) observer.observe(target);
    return () => { if (target) observer.unobserve(target); };
  }, [loading, loadingMore, hasMore, offset, loadNextBatch]);

  const categoryName =
    codeInfo?.name ||
    (articles.length > 0 && articles[0].code ? articles[0].code.name : codeSlug);
  const codeIcon = codeInfo?.icon || "⚖️";

  return (
    <div className="min-h-screen bg-white">

      {/* ── En-tête : sticky juste sous la Navbar fixe (h-16) ─── */}
      <header className="sticky top-16 z-40 bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-3">
          <div className="flex flex-wrap items-center justify-between gap-3">

            {/* Gauche : fil d'Ariane */}
            <div className="flex items-center gap-3 min-w-0">
              <Link
                href="/"
                className="text-gray-400 hover:text-blue-600 transition-colors flex items-center gap-1.5 text-sm shrink-0"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L7.414 9H15a1 1 0 110 2H7.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Accueil
              </Link>
              <span className="text-gray-300">/</span>
              <div className="flex items-center gap-2 min-w-0">
                <span className="text-xl shrink-0">{codeIcon}</span>
                <h1 className="text-lg font-bold text-gray-900 capitalize truncate">{categoryName}</h1>
              </div>
            </div>

            {/* Droite : stats + toggle */}
            <div className="flex items-center gap-3 shrink-0">
              {codeInfo && (
                <p className="hidden sm:block text-sm text-gray-400">
                  <span className="font-semibold text-emerald-600">{codeInfo.amendedCount}</span>
                  {" "}article{codeInfo.amendedCount > 1 ? "s" : ""} amendé{codeInfo.amendedCount > 1 ? "s" : ""}
                  <span className="text-gray-300 ml-1">/ {codeInfo.totalCount}</span>
                </p>
              )}
              <button
                onClick={() => setShowCitizen((v) => !v)}
                className={`inline-flex items-center gap-2 text-sm font-semibold px-4 py-2 rounded-xl border transition-all duration-200 ${
                  showCitizen
                    ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100"
                    : "bg-indigo-600 text-white border-transparent hover:bg-indigo-700 shadow-sm"
                }`}
              >
                <span>🏛</span>
                {showCitizen ? "Masquer la version citoyenne" : "Version Citoyenne"}
              </button>
            </div>
          </div>

          {/* Labels des colonnes (seulement quand la colonne droite est visible) */}
          {showCitizen && (
            <div className="grid grid-cols-2 mt-2.5 pt-2.5 border-t border-gray-100 -mx-6 px-6">
              <div className="flex items-center gap-2 pr-4">
                <div className="w-2 h-2 rounded-full bg-gray-400 shrink-0"></div>
                <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Texte Officiel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-500 shrink-0"></div>
                <span className="text-xs font-bold text-indigo-600 uppercase tracking-widest">Version Citoyenne 🏛</span>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ══════════════════════════════════════════════════════════
          CONTENU — scroll de page normal (body scroll)
          La grille passe de 1 à 2 colonnes quand showCitizen = true.
          Le scroll infini fonctionne dans les deux modes.
         ══════════════════════════════════════════════════════════ */}
      <div>
        <div className={`grid ${showCitizen ? "grid-cols-2" : "grid-cols-1"}`}>

          {/* ── Squelettes de chargement ── */}
          {loading && (
            <>
              {[1, 2, 3, 4].map((i) => (
                <Fragment key={i}>
                  <div className={`p-5 border-b border-gray-100 animate-pulse ${showCitizen ? "border-r" : ""}`}>
                    <div className="h-3 bg-gray-100 rounded w-20 mb-3"></div>
                    <div className="h-4 bg-gray-100 rounded w-48 mb-2"></div>
                    <div className="h-16 bg-gray-100 rounded"></div>
                  </div>
                  {showCitizen && (
                    <div className="p-5 border-b border-gray-100 animate-pulse">
                      <div className="h-3 bg-gray-100 rounded w-16 mb-3"></div>
                      <div className="h-20 bg-gray-100 rounded"></div>
                    </div>
                  )}
                </Fragment>
              ))}
            </>
          )}

          {/* ── Articles ── */}
          {articles.map((article) => {
            const proposal = proposalMap.get(article.id);
            // undefined → pas encore chargé | null → pas de proposition | objet → proposition
            const hasAmendment = proposal != null; // true seulement si objet CitizenProposal
            const articleSlug = slugify(article.number);

            return (
              <Fragment key={article.id}>
                {/* ── Cellule gauche : Texte officiel ── */}
                <div
                  className={`p-5 border-b border-gray-100 group hover:bg-gray-50/60 transition-colors ${
                    showCitizen ? "border-r" : ""
                  }`}
                >
                  {/* En-tête de l'article */}
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 flex-wrap min-w-0">
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider shrink-0">
                        {article.number}
                      </span>
                      {article.title && article.title !== article.number && (
                        <span className="text-sm font-semibold text-gray-700 truncate">
                          {article.title}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {hasAmendment && (
                        <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full whitespace-nowrap">
                          🟢 Modifié
                        </span>
                      )}
                      <Link
                        href={`/${codeSlug}/${articleSlug}`}
                        className="opacity-0 group-hover:opacity-100 text-xs font-semibold text-indigo-600 hover:text-white hover:bg-indigo-600 bg-indigo-50 border border-indigo-100 px-2.5 py-1 rounded-lg transition-all whitespace-nowrap"
                      >
                        Voir l'article →
                      </Link>
                    </div>
                  </div>

                  {/* Contenu */}
                  <p
                    className="text-sm text-gray-600 leading-relaxed whitespace-pre-line"
                    style={{ display: "-webkit-box", WebkitLineClamp: showCitizen ? 6 : 4, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                  >
                    {article.content}
                  </p>
                </div>

                {/* ── Cellule droite : Version citoyenne ── */}
                {showCitizen && (
                  <div
                    className={`p-5 border-b border-gray-100 transition-colors ${
                      hasAmendment ? "bg-emerald-50/20 hover:bg-emerald-50/40" : "hover:bg-gray-50/60"
                    }`}
                  >
                    {/* Proposition chargée */}
                    {proposal ? (
                      <>
                        <div className="flex items-center justify-between gap-2 mb-2">
                          <span className="text-xs text-gray-500">
                            par{" "}
                            <strong className="text-indigo-600">{proposal.citizenAuthor}</strong>
                          </span>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 rounded">
                              ▲ +{proposal.citizenScore}
                            </span>
                            <Link
                              href={`/${codeSlug}/${articleSlug}`}
                              className="text-xs text-gray-400 hover:text-indigo-600 transition-colors"
                              title="Voir l'article"
                            >
                              ↗
                            </Link>
                          </div>
                        </div>
                        <DiffView
                          original={article.content}
                          modified={proposal.citizenContent}
                        />
                      </>
                    ) : proposalMapLoaded ? (
                      /* Pas de proposition → afficher le texte officiel en grisé */
                      <>
                        <div className="flex justify-end mb-2">
                          <Link
                            href={`/${codeSlug}/${articleSlug}`}
                            className="text-xs text-gray-300 hover:text-indigo-500 transition-colors"
                            title="Voir l'article"
                          >
                            ↗
                          </Link>
                        </div>
                        <p
                          className="text-sm text-gray-300 leading-relaxed whitespace-pre-line italic"
                          style={{ display: "-webkit-box", WebkitLineClamp: 6, WebkitBoxOrient: "vertical", overflow: "hidden" }}
                        >
                          {article.content}
                        </p>
                      </>
                    ) : (
                      /* En attente de chargement */
                      <div className="animate-pulse space-y-2 pt-1">
                        <div className="h-3 bg-gray-100 rounded w-28"></div>
                        <div className="h-3 bg-gray-100 rounded w-full"></div>
                        <div className="h-3 bg-gray-100 rounded w-4/5"></div>
                      </div>
                    )}
                  </div>
                )}
              </Fragment>
            );
          })}

          {/* ── Zone de déclenchement du scroll infini ── */}
          {hasMore && !loading && (
            <div
              ref={observerTarget}
              className={`h-16 flex items-center justify-center ${showCitizen ? "col-span-2" : ""}`}
            >
              {loadingMore && (
                <div className="flex items-center gap-2 text-blue-600">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span className="text-sm font-medium">Chargement des articles suivants…</span>
                </div>
              )}
            </div>
          )}

          {/* ── Fin de la liste ── */}
          {!hasMore && !loading && articles.length > 0 && (
            <div className={`py-8 text-center text-gray-300 text-sm border-t border-gray-100 ${showCitizen ? "col-span-2" : ""}`}>
              {articles.length} article{articles.length > 1 ? "s" : ""} — fin de la liste
            </div>
          )}

          {/* ── Aucun article ── */}
          {!loading && articles.length === 0 && (
            <div className={`py-16 text-center ${showCitizen ? "col-span-2" : ""}`}>
              <p className="text-gray-400">Aucun article disponible pour ce texte.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Affichage du diff inline entre le texte officiel et la version citoyenne.
 */
function DiffView({ original, modified }: { original: string; modified: string }) {
  const tokens = computeDiff(original, modified);
  return (
    <div className="text-sm leading-relaxed whitespace-pre-wrap font-mono select-text">
      {tokens.map((token, i) => {
        if (token.type === "added") {
          return (
            <ins key={i} className="bg-emerald-100 text-emerald-800 no-underline rounded px-0.5 font-semibold">
              {token.value}
            </ins>
          );
        }
        if (token.type === "removed") {
          return (
            <del key={i} className="bg-red-100 text-red-600 line-through rounded px-0.5">
              {token.value}
            </del>
          );
        }
        return <span key={i} className="text-gray-700">{token.value}</span>;
      })}
    </div>
  );
}
