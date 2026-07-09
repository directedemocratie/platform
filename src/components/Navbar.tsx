"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { slugify } from "@/utils/slugify";
import { useSession } from "@/context/SessionContext";

export default function Navbar() {
  const router = useRouter();
  const { user, loading: sessionLoading, logout } = useSession();
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Focus the input when mobile search is toggled
  useEffect(() => {
    if (showMobileSearch && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showMobileSearch]);

  // Debounce query change to avoid flooding API requests
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    const delayDebounce = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}&limit=7`)
        .then((res) => res.json())
        .then((data) => {
          setSuggestions(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch((err) => {
          console.error("Erreur recherche Navbar :", err);
          setLoading(false);
        });
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Close suggestions dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim().length >= 2) {
      setIsOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  const handleSuggestionClick = (codeSlug: string, articleNumber: string) => {
    setIsOpen(false);
    setQuery("");
    router.push(`/${codeSlug}/${slugify(articleNumber)}`);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100/80 shadow-xs h-16">
      <div className="max-w-5xl mx-auto px-6 h-full flex items-center justify-between gap-4">
        
        {/* Logo / Titre */}
        {!showMobileSearch && (
          <Link href="/" className="flex items-center space-x-2 shrink-0 group">
            <span className="text-xl md:text-2xl font-bold tracking-tight bg-gradient-to-r from-blue-900 to-indigo-950 bg-clip-text text-transparent group-hover:text-blue-800 transition-colors">
              Démocratie Directe
            </span>
            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded font-semibold border border-blue-100 hidden sm:inline">
              FR 🇫🇷
            </span>
          </Link>
        )}

        {/* Formulaire de recherche avec suggestion typeahead */}
        <div
          ref={containerRef}
          className={`relative flex-1 max-w-sm sm:max-w-md ${
            showMobileSearch ? "flex items-center gap-2 w-full" : "hidden sm:block"
          }`}
        >
          {showMobileSearch && (
            <button
              onClick={() => {
                setShowMobileSearch(false);
                setQuery("");
              }}
              className="p-1.5 text-slate-400 hover:text-indigo-600 sm:hidden shrink-0 bg-slate-50 border border-slate-200/80 rounded-xl"
              type="button"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          )}
          <form onSubmit={handleSearchSubmit} className="relative flex-1">
            <div className="relative">
              <input
                ref={searchInputRef}
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setIsOpen(true);
                }}
                onFocus={() => setIsOpen(true)}
                placeholder="Rechercher un article, un mot-clé..."
                className="w-full bg-slate-50 border border-slate-200/80 rounded-xl py-2 pl-4 pr-10 text-sm placeholder:text-slate-400 focus:outline-none focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all text-slate-800 font-normal"
              />
              <button
                type="submit"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-indigo-600 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </div>
          </form>

          {/* Dropdown des suggestions instantanées */}
          {isOpen && query.trim().length >= 2 && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl shadow-indigo-950/10 overflow-hidden z-50">
              
              {loading && (
                <div className="p-4 text-center text-sm text-slate-400 flex items-center justify-center space-x-2">
                  <svg className="animate-spin h-4 w-4 text-indigo-500" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Recherche en cours...</span>
                </div>
              )}

              {!loading && suggestions.length === 0 && (
                <div className="p-4 text-center text-sm text-slate-400">
                  Aucun article trouvé pour &ldquo;{query}&rdquo;
                </div>
              )}

              {!loading && suggestions.length > 0 && (
                <div className="py-2 max-h-96 overflow-y-auto">
                  <div className="px-4 py-1.5 text-xxs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-50">
                    Articles suggérés
                  </div>
                  {suggestions.map((article) => (
                    <button
                      key={article.id}
                      onClick={() => handleSuggestionClick(article.code.slug, article.number)}
                      className="w-full text-left px-4 py-3 hover:bg-slate-50 flex flex-col gap-0.5 border-b border-slate-50 last:border-0 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-bold text-slate-900 truncate">
                          {article.title === article.number || !article.title ? article.number : `${article.number} - ${article.title}`}
                        </span>
                        <span className="text-xxs font-semibold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full shrink-0">
                          {article.code.name}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1 font-normal">
                        {article.content}
                      </p>
                    </button>
                  ))}
                  <button
                    onClick={handleSearchSubmit}
                    className="w-full text-center py-2.5 bg-slate-50 hover:bg-slate-100 text-xs font-bold text-indigo-600 hover:text-indigo-800 border-t border-slate-100 transition-colors"
                  >
                    Voir tous les résultats pour &ldquo;{query}&rdquo;
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Authentification & Boutons mobiles */}
        <div className="flex items-center space-x-2 sm:space-x-4 shrink-0 text-sm">
          {!showMobileSearch && (
            <button
              onClick={() => setShowMobileSearch(true)}
              className="p-2 text-slate-500 hover:text-indigo-600 sm:hidden rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer"
              type="button"
              aria-label="Rechercher"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          )}

          {!showMobileSearch && (
            <div className="flex items-center space-x-4">
              {sessionLoading ? (
                <div className="h-8 w-20 bg-slate-100 animate-pulse rounded-xl"></div>
              ) : user ? (
                <div className="flex items-center space-x-3">
                  <span className="text-slate-600 font-medium hidden md:inline text-xs">
                    👤 {user.pseudo}
                  </span>
                  <button
                    onClick={logout}
                    className="text-xxs font-semibold text-slate-500 hover:text-red-600 transition-colors border border-slate-200/80 hover:border-red-200 px-2.5 py-1.5 rounded-lg bg-white/50 cursor-pointer"
                  >
                    Déconnexion
                  </button>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
                >
                  Connexion
                </Link>
              )}
            </div>
          )}
        </div>

      </div>
    </nav>
  );
}
