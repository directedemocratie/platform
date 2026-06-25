import type { Metadata } from "next";
import prisma from "@/lib/prisma";

interface Props {
  params: Promise<{ code: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code: slug } = await params;

  const code = await prisma.code.findUnique({
    where: { slug },
    select: { name: true, description: true },
  });

  if (!code) {
    return {
      title: "Code introuvable — Démocratie Directe",
    };
  }

  return {
    title: `${code.name} — Démocratie Directe`,
    description: `Explorez les articles du ${code.name}. Proposez des amendements, votez et débattez pour co-construire la législation française. ${code.description}`,
    openGraph: {
      title: `${code.name} — Démocratie Directe`,
      description: code.description,
      type: "website",
    },
  };
}

// Ce layout est transparent : il ne wrappe pas visuellement ses enfants
// mais fournit les metadata pour le segment [code] et ses sous-segments.
export default function CodeLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
