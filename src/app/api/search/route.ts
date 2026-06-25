import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q');
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 10;

    if (!query || query.trim().length < 2) {
      return NextResponse.json([]);
    }

    const cleanQuery = query.trim();

    const articles = await prisma.article.findMany({
      where: {
        OR: [
          { number: { contains: cleanQuery, mode: 'insensitive' } },
          { title: { contains: cleanQuery, mode: 'insensitive' } },
          { content: { contains: cleanQuery, mode: 'insensitive' } },
        ],
      },
      include: {
        code: true,
      },
      take: limit,
      // On ordonne d'abord par pertinence approximative (par exemple numéro d'abord)
      orderBy: [
        { number: 'asc' },
        { title: 'asc' },
      ],
    });

    return NextResponse.json(articles);
  } catch (error: any) {
    console.error("Erreur dans GET /api/search :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
