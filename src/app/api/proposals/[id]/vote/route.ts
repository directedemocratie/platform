import { NextResponse } from 'next/server';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decryptSession } from '@/utils/auth';
import { checkRateLimit } from '@/utils/rateLimit';

const VoteSchema = z.object({
  value: z.union([z.literal(1), z.literal(-1)]),
});


export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth-token');

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: "Vous devez être connecté pour voter" }, { status: 401 });
    }

    const session = decryptSession(tokenCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Session invalide ou expirée" }, { status: 401 });
    }

    // Rate limiting : max 30 votes par heure par utilisateur
    const rl = checkRateLimit(`votes:${session.userId}`, { windowMs: 60 * 60 * 1000, max: 30 });
    if (rl.limited) {
      return NextResponse.json(
        { error: "Vous avez atteint la limite de votes pour cette heure. Merci de réessayer plus tard." },
        { status: 429 }
      );
    }

    const { id: proposalId } = await params;
    const body = await request.json();
    const parsed = VoteSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "La valeur du vote doit être 1 (pour) ou -1 (contre)" },
        { status: 400 }
      );
    }
    const { value } = parsed.data;

    const userId = session.userId;

    // Vérifier si la proposition existe
    const proposal = await prisma.proposal.findUnique({
      where: { id: proposalId },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposition non trouvée" }, { status: 404 });
    }

    // Rechercher un vote existant
    const existingVote = await prisma.vote.findUnique({
      where: {
        proposalId_userId: {
          proposalId,
          userId,
        },
      },
    });

    if (existingVote && existingVote.value === value) {
      // Annuler le vote si clic répété sur le même bouton
      await prisma.vote.delete({
        where: {
          proposalId_userId: {
            proposalId,
            userId,
          },
        },
      });
      return NextResponse.json({ status: "removed" });
    } else {
      // Créer ou modifier le vote
      const vote = await prisma.vote.upsert({
        where: {
          proposalId_userId: {
            proposalId,
            userId,
          },
        },
        update: {
          value,
        },
        create: {
          proposalId,
          userId,
          value,
        },
      });
      return NextResponse.json({ status: "success", vote });
    }
  } catch (error: any) {
    console.error("Erreur dans POST /api/proposals/[id]/vote :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
