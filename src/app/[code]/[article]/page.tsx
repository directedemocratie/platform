"use client";

import { useEffect, useState, use, useCallback } from "react";
import Link from "next/link";
import ProposeModificationButton from './ProposeModificationButton';
import { computeDiff } from '@/utils/diff';
import { useSession } from "@/context/SessionContext";

export default function ArticlePage({ params }: { params: Promise<{ code: string; article: string }> }) {
  const { code: codeSlug, article: articleSlug } = use(params);
  const { user } = useSession();

  const [article, setArticle] = useState<any>(null);
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [votingId, setVotingId] = useState<string | null>(null);

  const loadArticleDetails = useCallback(() => {
    if (!codeSlug || !articleSlug) return;

    fetch(`/api/articles?code=${codeSlug}&article=${articleSlug}`)
      .then((res) => {
        if (!res.ok) throw new Error("Article non trouvé");
        return res.json();
      })
      .then((articleData) => {
        setArticle(articleData);
        fetch(`/api/proposals?articleId=${articleData.id}`)
          .then((res) => res.json())
          .then((pData) => setProposals(Array.isArray(pData) ? pData : []))
          .catch(console.error);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, [codeSlug, articleSlug]);

  useEffect(() => {
    loadArticleDetails();
  }, [loadArticleDetails]);

  const handleVote = async (proposalId: string, value: number) => {
    if (!user) {
      alert("Veuillez vous connecter pour voter.");
      return;
    }
    setVotingId(proposalId);
    try {
      const res = await fetch(`/api/proposals/${proposalId}/vote`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur de vote");
      }
      loadArticleDetails();
    } catch (err: any) {
      alert(err.message || "Impossible d'enregistrer le vote.");
    } finally {
      setVotingId(null);
    }
  };

  const handleDelete = async (proposalId: string) => {
    if (!window.confirm("Voulez-vous retirer votre proposition ? Cette action est irréversible.")) return;
    setDeletingId(proposalId);
    try {
      const res = await fetch(`/api/proposals/${proposalId}`, { method: 'DELETE' });
      if (!res.ok) {
        const d = await res.json();
        throw new Error(d.error || "Erreur lors du retrait");
      }
      loadArticleDetails();
    } catch (err: any) {
      alert(err.message || "Impossible de retirer la proposition.");
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-blue-200 border-t-blue-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-xl font-bold text-red-600 mb-3">Article non trouvé</h1>
          <Link href={`/${codeSlug}`} className="text-blue-600 hover:underline text-sm">
            ← Retour au texte de loi
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-3xl mx-auto px-4 py-8">

        {/* ── Fil d'Ariane ─────────────────────────────────────── */}
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-6">
          <Link href="/" className="hover:text-blue-600 transition-colors">Accueil</Link>
          <span>/</span>
          <Link href={`/${article.code.slug}`} className="hover:text-blue-600 transition-colors">
            {article.code.name}
          </Link>
          <span>/</span>
          <span className="text-gray-600 font-medium">{article.number}</span>
        </nav>

        {/* ── Texte officiel ───────────────────────────────────── */}
        <div className="mb-10">
          <div className="mb-4">
            <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
              {article.code.name}
            </span>
            <h1 className="text-2xl font-bold text-gray-900 mt-1">
              {article.title && article.title !== article.number
                ? `${article.number} — ${article.title}`
                : article.number}
            </h1>
          </div>

          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
            <p className="text-gray-800 leading-relaxed text-base whitespace-pre-line">
              {article.content}
            </p>
          </div>

          <p className="text-xs text-gray-400 mt-2 text-right">
            Dernière mise à jour :{" "}
            {new Date(article.updatedAt).toLocaleDateString("fr-FR", {
              day: "numeric", month: "long", year: "numeric",
            })}
          </p>
        </div>

        {/* ── Section propositions ─────────────────────────────── */}
        <div>
          {/* En-tête de section */}
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-200">
            <h2 className="text-lg font-bold text-gray-900">
              {proposals.length > 0
                ? `${proposals.length} proposition${proposals.length > 1 ? "s" : ""} citoyenne${proposals.length > 1 ? "s" : ""}`
                : "Propositions citoyennes"}
            </h2>
            <ProposeModificationButton
              articleId={article.id}
              articleNumber={article.number}
              articleTitle={article.title}
              currentContent={article.content}
              onProposalCreated={loadArticleDetails}
            />
          </div>

          {/* Bandeau connexion si non connecté */}
          {!user && (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 flex items-center justify-between gap-4">
              <p className="text-sm text-amber-800">
                Connectez-vous pour voter sur les propositions ou en soumettre une.
              </p>
              <Link
                href="/login"
                className="shrink-0 text-xs font-semibold bg-amber-600 hover:bg-amber-700 text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                Se connecter
              </Link>
            </div>
          )}

          {/* Liste des propositions */}
          {proposals.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg">
              <p className="text-gray-500 font-medium">Aucune proposition pour cet article.</p>
              <p className="text-gray-400 text-sm mt-1">
                Soyez le premier à proposer un amendement.
              </p>
            </div>
          ) : (
            <div className="space-y-0">
              {proposals.map((proposal, index) => {
                const diffTokens = computeDiff(article.content, proposal.content);
                const isAuthor = user?.pseudo === proposal.createdBy;
                const isVoting = votingId === proposal.id;
                const isDeleting = deletingId === proposal.id;
                const isTop = index === 0 && proposal.score > 0;

                return (
                  <div
                    key={proposal.id}
                    className={`flex gap-0 border-b border-gray-100 last:border-b-0 ${
                      isTop ? "bg-green-50/30" : ""
                    }`}
                  >
                    {/* ── Widget de vote (style Stack Overflow) ── */}
                    <div className="flex flex-col items-center py-5 px-4 gap-1 shrink-0 w-16">
                      <button
                        onClick={() => handleVote(proposal.id, 1)}
                        disabled={isVoting || !user}
                        className={`p-1 rounded transition-colors ${
                          !user
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-orange-500 hover:bg-orange-50"
                        }`}
                        title="Cette proposition améliore la loi"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 4l8 8H4z" />
                        </svg>
                      </button>

                      <span
                        className={`text-xl font-bold tabular-nums min-w-[2ch] text-center ${
                          proposal.score > 0
                            ? "text-green-600"
                            : proposal.score < 0
                            ? "text-red-500"
                            : "text-gray-400"
                        }`}
                      >
                        {isVoting ? (
                          <span className="inline-block w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></span>
                        ) : (
                          proposal.score
                        )}
                      </span>

                      <button
                        onClick={() => handleVote(proposal.id, -1)}
                        disabled={isVoting || !user}
                        className={`p-1 rounded transition-colors ${
                          !user
                            ? "text-gray-300 cursor-not-allowed"
                            : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                        }`}
                        title="Cette proposition nuit à la loi"
                      >
                        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 20l-8-8h16z" />
                        </svg>
                      </button>
                    </div>

                    {/* ── Contenu de la proposition ── */}
                    <div className="flex-1 py-5 pr-4 min-w-0">
                      {/* Diff */}
                      <div className="bg-gray-50 border border-gray-200 rounded p-4 font-mono text-sm leading-relaxed whitespace-pre-wrap select-text mb-3">
                        {diffTokens.map((token, i) => {
                          if (token.type === "added") {
                            return (
                              <ins key={i} className="bg-green-100 text-green-800 no-underline rounded-sm px-0.5 font-semibold">
                                {token.value}
                              </ins>
                            );
                          }
                          if (token.type === "removed") {
                            return (
                              <del key={i} className="bg-red-100 text-red-700 line-through rounded-sm px-0.5">
                                {token.value}
                              </del>
                            );
                          }
                          return <span key={i} className="text-gray-700">{token.value}</span>;
                        })}
                      </div>

                      {/* Justification */}
                      <blockquote className="border-l-2 border-blue-200 pl-3 mb-3">
                        <p className="text-sm text-gray-600 italic leading-relaxed">
                          {proposal.justification}
                        </p>
                      </blockquote>

                      {/* Métadonnées + actions */}
                      <div className="flex items-center justify-between gap-2 flex-wrap">
                        <div className="flex items-center gap-2 text-xs text-gray-400">
                          <span>👤</span>
                          <span className="font-medium text-gray-600">{proposal.createdBy}</span>
                          {isAuthor && (
                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded font-semibold">
                              Vous
                            </span>
                          )}
                          <span>·</span>
                          <span>
                            {new Date(proposal.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric", month: "short", year: "numeric",
                            })}
                          </span>
                          {isTop && (
                            <>
                              <span>·</span>
                              <span className="text-green-600 font-semibold">✓ Meilleure proposition</span>
                            </>
                          )}
                        </div>

                        {isAuthor && (
                          <button
                            onClick={() => handleDelete(proposal.id)}
                            disabled={isDeleting}
                            className="text-xs text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1 disabled:opacity-50"
                          >
                            {isDeleting ? "Retrait…" : "🗑 Retirer"}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
