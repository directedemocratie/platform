import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decryptSession } from '@/utils/auth';
import { checkRateLimit } from '@/utils/rateLimit';

const ProposalCreateSchema = z.object({
  articleId: z.string().cuid("articleId invalide"),
  content: z
    .string()
    .min(10, "Le texte proposé doit contenir au moins 10 caractères")
    .max(10_000, "Le texte proposé est trop long (max 10 000 caractères)"),
  justification: z
    .string()
    .min(30, "La justification doit contenir au moins 30 caractères")
    .max(2_000, "La justification est trop longue (max 2 000 caractères)"),
});


export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const articleId = searchParams.get('articleId');

    if (!articleId) {
      return NextResponse.json({ error: "articleId requis" }, { status: 400 });
    }

    // Récupérer uniquement les propositions actives (non supprimées)
    const proposals = await prisma.proposal.findMany({
      where: {
        articleId: articleId,
        status: 'pending',
      },
      include: {
        votes: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculer le score et trier par score décroissant
    const formattedProposals = proposals
      .map((p) => {
        const score = p.votes.reduce((acc, v) => acc + v.value, 0);
        return {
          ...p,
          score,
        };
      })
      .sort((a, b) => b.score - a.score);

    return NextResponse.json(formattedProposals);
  } catch (error: any) {
    console.error("Erreur dans GET /api/proposals :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth-token');

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: "Vous devez être connecté pour proposer une modification" }, { status: 401 });
    }

    const session = decryptSession(tokenCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Session invalide ou expirée" }, { status: 401 });
    }

    // Rate limiting : max 10 propositions par heure par utilisateur
    const rl = checkRateLimit(`proposals:${session.userId}`, { windowMs: 60 * 60 * 1000, max: 10 });
    if (rl.limited) {
      return NextResponse.json(
        { error: "Vous avez atteint la limite de 10 propositions par heure. Merci de réessayer plus tard." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = ProposalCreateSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { articleId, content, justification } = parsed.data;

    // Récupérer l'utilisateur en base pour stocker son ID
    const userRecord = await prisma.user.findUnique({
      where: { pseudo: session.pseudo },
    });

    const proposal = await prisma.proposal.create({
      data: {
        articleId,
        content,
        justification,
        createdBy: session.pseudo,
        userId: userRecord?.id ?? null,
        status: 'pending',
      },
    });

    return NextResponse.json(proposal, { status: 201 });
  } catch (error: any) {
    console.error("Erreur dans POST /api/proposals :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
