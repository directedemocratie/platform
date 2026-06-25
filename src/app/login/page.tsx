"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "@/context/SessionContext";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, refetch } = useSession();
  
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [simulatedLink, setSimulatedLink] = useState<string | null>(null);

  // Handle errors from URL parameters (e.g. callback failures)
  useEffect(() => {
    const errorParam = searchParams.get("error");
    if (errorParam) {
      if (errorParam === "invalid_token") {
        setError("Le lien de connexion est invalide ou a déjà été utilisé.");
      } else if (errorParam === "expired_token") {
        setError("Le lien de connexion a expiré (validité de 15 minutes).");
      } else if (errorParam === "missing_token") {
        setError("Jeton de vérification manquant.");
      } else {
        setError("Une erreur d'authentification est survenue.");
      }
    }
  }, [searchParams]);

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);
    setSimulatedLink(null);

    try {
      const res = await fetch("/api/auth/magic-link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, pseudo }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Une erreur est survenue");
      }

      setMessage(
        data.isNewUser
          ? "Inscription initiée ! Un lien de connexion vous a été envoyé par email."
          : "Demande de connexion reçue ! Un lien de connexion vous a été envoyé par email."
      );

      // Store the simulated link for easy testing during development
      if (data.simulatedLink) {
        setSimulatedLink(data.simulatedLink);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto bg-white/80 backdrop-blur-md border border-slate-100 rounded-3xl p-8 shadow-xl shadow-indigo-950/5">
      
      {/* En-tête */}
      <div className="text-center mb-8">
        <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-indigo-100/50">
          <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900">Espace Citoyen</h2>
        <p className="text-sm text-slate-500 mt-1 leading-relaxed">
          Connectez-vous de façon sécurisée sans mot de passe pour participer aux débats et voter sur les lois.
        </p>
      </div>

      {/* Messages de retour */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-xl mb-6 text-red-800 text-sm">
          <p className="font-semibold">Erreur</p>
          <p className="text-xs mt-0.5">{error}</p>
        </div>
      )}

      {message && (
        <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-r-xl mb-6 text-emerald-800 text-sm">
          <p className="font-semibold">Vérifiez vos e-mails</p>
          <p className="text-xs mt-0.5">{message}</p>
        </div>
      )}

      {/* Bouton de simulation locale */}
      {simulatedLink && (
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 mb-6 text-center shadow-xs">
          <p className="text-xs font-semibold text-blue-900 mb-2.5">
            🔌 [Mode Développement] Envoi d'email simulé.
          </p>
          <a
            href={simulatedLink}
            onClick={async () => {
              // Wait briefly to let the cookie register on redirection
              setTimeout(() => refetch(), 500);
            }}
            className="inline-flex items-center justify-center w-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs py-2 px-4 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            🚀 Se connecter directement
          </a>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Adresse e-mail
          </label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ex: citoyen.jean@domain.fr"
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-4 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-normal"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Pseudonyme unique
          </label>
          <input
            type="text"
            value={pseudo}
            onChange={(e) => setPseudo(e.target.value)}
            placeholder="Ex: CitoyenJean"
            className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2.5 px-4 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-normal"
          />
          <p className="text-xxs text-slate-400 mt-1.5 leading-relaxed font-normal">
            Le pseudo est requis uniquement si vous vous inscrivez pour la première fois. Il sera affiché publiquement sur vos propositions et votes.
          </p>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-900 to-indigo-950 hover:from-blue-800 hover:to-indigo-900 text-white font-semibold py-2.5 rounded-xl shadow-md shadow-indigo-900/10 hover:shadow-lg disabled:opacity-50 transition-all text-sm cursor-pointer flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Génération en cours...</span>
            </>
          ) : (
            <span>Recevoir mon lien de connexion ✉️</span>
          )}
        </button>
      </form>

      {/* Mentions de vie privée */}
      <div className="mt-8 pt-6 border-t border-slate-100 text-center">
        <p className="text-xxs text-slate-400 leading-relaxed font-normal">
          Conformément à notre démarche pédagogique, vos données sont hébergées de manière confidentielle et ne sont jamais partagées à des tiers.
        </p>
      </div>

    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="relative min-h-[calc(100vh-64px)] bg-slate-50/50 text-slate-800 flex items-center justify-center p-6 overflow-hidden">
      {/* Blobs d'arrière-plan */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-20 right-1/4 w-96 h-96 bg-indigo-400/10 rounded-full blur-[120px] pointer-events-none" />

      <Suspense fallback={
        <div className="max-w-md w-full bg-white/80 border border-slate-100 rounded-3xl p-8 shadow-sm flex items-center justify-center h-[400px]">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      }>
        <LoginContent />
      </Suspense>
    </div>
  );
}
