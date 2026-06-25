import type { MetadataRoute } from "next";
import prisma from "@/lib/prisma";

// Next.js génère automatiquement /sitemap.xml depuis ce fichier.
// La taille maximale d'un sitemap est 50 000 URLs. Si le Code du travail
// dépasse cette limite, il faudra paginer avec generateSitemaps().
// Voir : https://nextjs.org/docs/app/api-reference/file-conventions/metadata/sitemap

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://directedemocratie.fr";

  // Pages statiques
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/a-propos`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/confidentialite`,
      lastModified: new Date(),
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Pages dynamiques — Codes de loi
  const codes = await prisma.code.findMany({
    select: { slug: true, updatedAt: true },
  });

  const codeRoutes: MetadataRoute.Sitemap = codes.map((code) => ({
    url: `${baseUrl}/${code.slug}`,
    lastModified: code.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.9,
  }));

  // Pages dynamiques — Articles
  // On limite à 40 000 pour laisser de la marge (limite : 50 000)
  const articles = await prisma.article.findMany({
    select: {
      number: true,
      updatedAt: true,
      code: { select: { slug: true } },
    },
    take: 40_000,
    orderBy: { order: "asc" },
  });

  const articleRoutes: MetadataRoute.Sitemap = articles.map((article) => {
    const articleSlug = article.number
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    return {
      url: `${baseUrl}/${article.code.slug}/${articleSlug}`,
      lastModified: article.updatedAt,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    };
  });

  return [...staticRoutes, ...codeRoutes, ...articleRoutes];
}
