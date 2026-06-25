import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  // On récupère tous les codes (Code du travail, Code civil, etc.)
  const codes = await prisma.code.findMany({
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      icon: true,
      articles: {
        select: { id: true }
      }
    }
  });

  // On formate pour l'affichage front
  const categories = codes.map(code => ({
    id: code.id,
    name: code.name,
    icon: code.icon,
    description: code.description,
    count: code.articles.length,
    href: `/${code.slug}`
  }));

  // On ne met PAS la Constitution ici, elle est déjà ajoutée côté front
  return NextResponse.json(categories);
} 