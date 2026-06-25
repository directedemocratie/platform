import type { MetadataRoute } from "next";

// Next.js génère automatiquement /robots.txt depuis ce fichier.

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "https://directedemocratie.fr";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Bloquer les routes API et d'authentification
        disallow: ["/api/", "/login"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
