import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const codeSlug = searchParams.get('code') || searchParams.get('category');
    const articleSlug = searchParams.get('article');

    // Si on demande un article spécifique au sein d'un code
    if (codeSlug && articleSlug) {
      const cleanArticleSlug = articleSlug.toLowerCase().replace(/^article-/, '');
      
      const article = await prisma.article.findFirst({
        where: {
          code: {
            slug: {
              equals: codeSlug,
              mode: 'insensitive',
            },
          },
          OR: [
            { number: { equals: articleSlug, mode: 'insensitive' } },
            { number: { equals: `Article ${cleanArticleSlug}`, mode: 'insensitive' } },
            { number: { equals: cleanArticleSlug, mode: 'insensitive' } },
          ],
        },
        include: {
          code: true,
        },
      });

      if (!article) {
        return NextResponse.json({ error: "Article non trouvé" }, { status: 404 });
      }

      return NextResponse.json(article);
    }

    // Sinon, on retourne la liste des articles d'un code avec pagination
    const limitParam = searchParams.get('limit');
    const offsetParam = searchParams.get('offset');

    // Permettre de désactiver la pagination avec limit=all ou limit=-1
    const isPagingDisabled = limitParam === 'all' || limitParam === '-1';
    const limit = isPagingDisabled ? undefined : parseInt(limitParam || '30', 10);
    const offset = offsetParam ? parseInt(offsetParam, 10) : 0;

    const articles = await prisma.article.findMany({
      where: codeSlug ? {
        code: {
          slug: {
            equals: codeSlug,
            mode: 'insensitive',
          },
        },
      } : undefined,
      include: {
        code: true,
      },
      orderBy: {
        order: 'asc',
      },
      take: limit,
      skip: isPagingDisabled ? undefined : offset,
    });

    return NextResponse.json(articles);
  } catch (error: any) {
    console.error("Erreur dans GET /api/articles :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}