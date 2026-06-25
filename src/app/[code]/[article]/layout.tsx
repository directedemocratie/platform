import type { Metadata } from "next";
import prisma from "@/lib/prisma";

interface Props {
  params: Promise<{ code: string; article: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { code: codeSlug, article: articleSlug } = await params;

  // Même logique de résolution que dans l'API /articles
  const cleanSlug = articleSlug.toLowerCase().replace(/^article-/, "");

  const article = await prisma.article.findFirst({
    where: {
      code: { slug: { equals: codeSlug, mode: "insensitive" } },
      OR: [
        { number: { equals: articleSlug, mode: "insensitive" } },
        { number: { equals: `Article ${cleanSlug}`, mode: "insensitive" } },
        { number: { equals: cleanSlug, mode: "insensitive" } },
      ],
    },
    select: {
      number: true,
      title: true,
      content: true,
      code: { select: { name: true } },
    },
  });

  if (!article) {
    return {
      title: "Article introuvable — Démocratie Directe",
    };
  }

  const pageTitle =
    article.title && article.title !== article.number
      ? `${article.number} — ${article.title} | ${article.code.name}`
      : `${article.number} | ${article.code.name}`;

  // Extrait les 160 premiers caractères du contenu pour la meta description
  const excerpt = article.content.slice(0, 160).replace(/\s+/g, " ").trim();

  return {
    title: `${pageTitle} — Démocratie Directe`,
    description: `${excerpt}… Proposez des amendements et débattez sur cet article du ${article.code.name}.`,
    openGraph: {
      title: `${pageTitle} — Démocratie Directe`,
      description: `${excerpt}…`,
      type: "article",
    },
  };
}

export default function ArticleLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
