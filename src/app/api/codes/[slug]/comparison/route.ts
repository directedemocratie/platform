import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/codes/[slug]/comparison
 *
 * Retourne tous les articles d'un code avec, pour chaque article,
 * la meilleure proposition citoyenne (score le plus élevé, si score > 0).
 *
 * Format de réponse :
 * {
 *   code: { name, slug, description },
 *   totalArticles: number,
 *   amendedArticles: number,
 *   articles: [
 *     {
 *       id, number, title, order,
 *       officialContent: string,
 *       citizenContent: string | null,
 *       citizenScore: number | null,
 *       citizenAuthor: string | null,
 *       citizenCreatedAt: string | null,
 *       hasAmendment: boolean,
 *     }
 *   ]
 * }
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;

    // 1. Récupérer le code avec tous ses articles et leurs propositions pending
    const code = await prisma.code.findFirst({
      where: {
        slug: {
          equals: slug,
          mode: 'insensitive',
        },
      },
      include: {
        articles: {
          orderBy: { order: 'asc' },
          include: {
            proposals: {
              where: { status: 'pending' },
              include: { votes: true },
            },
          },
        },
      },
    });

    if (!code) {
      return NextResponse.json({ error: `Code "${slug}" non trouvé` }, { status: 404 });
    }

    // 2. Pour chaque article, calculer la meilleure proposition
    const articles = code.articles.map((article) => {
      // Calculer le score de chaque proposition et trouver la meilleure
      const scoredProposals = article.proposals
        .map((p) => ({
          ...p,
          score: p.votes.reduce((acc, v) => acc + v.value, 0),
        }))
        .filter((p) => p.score > 0) // Seuil : au moins 1 vote positif net
        .sort((a, b) => b.score - a.score);

      const bestProposal = scoredProposals[0] ?? null;

      return {
        id: article.id,
        number: article.number,
        title: article.title,
        order: article.order,
        officialContent: article.content,
        citizenContent: bestProposal?.content ?? null,
        citizenScore: bestProposal?.score ?? null,
        citizenAuthor: bestProposal?.createdBy ?? null,
        citizenCreatedAt: bestProposal?.createdAt ?? null,
        hasAmendment: bestProposal !== null,
      };
    });

    const amendedCount = articles.filter((a) => a.hasAmendment).length;

    return NextResponse.json({
      code: {
        name: code.name,
        slug: code.slug,
        description: code.description,
        icon: code.icon,
      },
      totalArticles: articles.length,
      amendedArticles: amendedCount,
      articles,
    });
  } catch (error: any) {
    console.error('Erreur dans GET /api/codes/[slug]/comparison :', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
