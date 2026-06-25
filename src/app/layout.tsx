import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import Navbar from "@/components/Navbar";
import { SessionProvider } from "@/context/SessionContext";

export const metadata: Metadata = {
  title: "Démocratie Directe — Co-construction & Débat sur les lois françaises",
  description: "Découvrez la démocratie directe sur les lois françaises. Explorez les codes officiels, amendez les articles et votez pour co-construire notre avenir !",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-white`}
      >
        <SessionProvider>
          <Navbar />
          <div className="pt-16 min-h-screen flex flex-col">
            <main className="flex-grow">
              {children}
            </main>
            <footer className="w-full py-8 border-t border-slate-100/80 text-center text-xs text-slate-400 bg-white mt-12 shrink-0">
              <div className="max-w-5xl mx-auto px-6">
                <div className="flex justify-center space-x-6 mb-3 font-semibold">
                  <Link href="/a-propos" className="text-slate-500 hover:text-indigo-600 transition-colors">
                    À propos & Démarche
                  </Link>
                  <Link href="/confidentialite" className="text-slate-500 hover:text-indigo-600 transition-colors">
                    Confidentialité
                  </Link>
                  <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-indigo-600 transition-colors">
                    Code Source (GitHub)
                  </a>
                </div>
                <p>© {new Date().getFullYear()} Démocratie Directe. Simulation citoyenne collaborative à but non lucratif.</p>
                <p className="mt-1">Propulsé par les données publiques françaises issues de l'Open Data LEGI.</p>
              </div>
            </footer>
          </div>
        </SessionProvider>
      </body>
    </html>
  );
}
