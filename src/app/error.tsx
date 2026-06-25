"use client";

import { useEffect } from "react";
import Link from "next/link";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function GlobalError({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    // Log en production pour un service de monitoring futur (ex: Sentry)
    console.error("[GlobalError]", error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        {/* Icône */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 bg-red-50 border border-red-100 rounded-2xl flex items-center justify-center">
            <svg
              className="w-8 h-8 text-red-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-3">
          Une erreur est survenue
        </h1>
        <p className="text-slate-500 text-base leading-relaxed mb-8">
          Quelque chose s'est mal passé. Vous pouvez réessayer ou revenir à
          l'accueil.
        </p>

        {/* Digest pour le support technique */}
        {error.digest && (
          <p className="text-xs text-slate-400 font-mono mb-6">
            Référence : {error.digest}
          </p>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold px-5 py-2.5 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer"
          >
            🔄 Réessayer
          </button>
          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold px-5 py-2.5 rounded-xl border border-slate-200 transition-all duration-200"
          >
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
