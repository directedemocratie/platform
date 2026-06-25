import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const codes = await prisma.code.findMany({
      orderBy: { name: 'asc' },
    });
    return NextResponse.json(codes);
  } catch (error) {
    console.error('Erreur lors de la récupération des codes:', error);
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 });
  }
} 