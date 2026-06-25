"use client";

import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
import { useRouter } from "next/navigation";

export interface User {
  id: string;
  email: string;
  pseudo: string;
  role: string;
}

interface SessionContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refetch: () => Promise<void>;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchSession = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      if (data && data.user) {
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Erreur lors de la récupération de la session :", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  const logout = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/auth/logout", { method: "POST" });
      if (res.ok) {
        setUser(null);
        // Supprimer également les anciens résidus de pseudos en localStorage
        localStorage.removeItem("voterPseudo");
        router.refresh();
        router.push("/");
      } else {
        console.error("Échec de la déconnexion");
      }
    } catch (e) {
      console.error("Erreur lors de la déconnexion :", e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SessionContext.Provider value={{ user, loading, logout, refetch: fetchSession }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error("useSession doit être utilisé à l'intérieur d'un SessionProvider");
  }
  return context;
}
