import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: articleId } = await params;

    const versions = await prisma.articleVersion.findMany({
      where: {
        articleId,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(versions);
  } catch (error: any) {
    console.error("Erreur dans GET /api/articles/[id]/versions :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
