import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  try {
    const code = await prisma.code.findUnique({
      where: { slug },
      include: {
        articles: {
          orderBy: { number: 'asc' },
        },
      },
    });

    if (!code) {
      return NextResponse.json({ error: 'Code non trouvé' }, { status: 404 });
    }

    return NextResponse.json(code);
  } catch (error) {
    console.error('Erreur lors de la récupération du code:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 