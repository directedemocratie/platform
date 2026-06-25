"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useSession } from '@/context/SessionContext';

interface ProposeModificationButtonProps {
  articleId: string;
  articleNumber: string;
  articleTitle: string;
  currentContent: string;
  onProposalCreated: () => void;
}

export default function ProposeModificationButton({
  articleId,
  articleNumber,
  articleTitle,
  currentContent,
  onProposalCreated
}: ProposeModificationButtonProps) {
  const { user } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState(currentContent);
  const [justification, setJustification] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !justification.trim()) {
      setError("Tous les champs sont obligatoires.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/proposals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          articleId,
          content,
          justification,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erreur lors de la soumission de la proposition.");
      }

      // Reinitialiser
      setJustification('');
      setIsOpen(false);
      onProposalCreated();
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Une erreur est survenue.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return (
      <Link
        href="/login"
        className="inline-flex items-center bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-lg border border-slate-200 hover:border-slate-300 transition-all text-sm shadow-xs"
      >
        <span className="mr-2">🔒</span>
        Se connecter pour proposer une modification
      </Link>
    );
  }

  return (
    <div>
      <button
        onClick={() => {
          setContent(currentContent);
          setIsOpen(true);
        }}
        className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:-translate-y-[1px] cursor-pointer text-sm"
      >
        Proposer une modification
      </button>

      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full border border-slate-100 max-h-[90vh] flex flex-col transform scale-100 transition-transform duration-300">
            <header className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900 flex items-center">
                <span className="mr-2">📝</span>
                Modifier {articleNumber}
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-slate-600 transition-colors text-2xl font-light leading-none cursor-pointer"
              >
                &times;
              </button>
            </header>

            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
              {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-3 text-red-700 text-sm rounded-r-md">
                  {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Nouveau texte proposé pour l'article
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={8}
                  className="w-full border border-slate-200 rounded-lg p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent font-mono text-sm leading-relaxed"
                  placeholder="Saisissez ici le texte révisé de la loi..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Justification de la modification (Modèle AIDA / Argumentation claire)
                </label>
                <textarea
                  value={justification}
                  onChange={(e) => setJustification(e.target.value)}
                  rows={4}
                  className="w-full border border-slate-200 rounded-lg p-3 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm leading-relaxed"
                  placeholder="Expliquez pourquoi cette modification est nécessaire et bénéfique pour les citoyens..."
                  required
                />
              </div>

              <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 block">Identité citoyenne vérifiée</span>
                  <span className="text-sm font-bold text-slate-900">👤 {user.pseudo}</span>
                </div>
                <span className="text-xxs bg-emerald-50 border border-emerald-100 text-emerald-700 px-2 py-0.5 rounded font-semibold">
                  Compte Connecté
                </span>
              </div>

              <footer className="pt-4 border-t border-slate-100 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg text-sm transition-colors font-medium cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 cursor-pointer"
                >
                  {isSubmitting ? "Envoi..." : "Soumettre la proposition"}
                </button>
              </footer>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
