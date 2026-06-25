import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';
import { decryptSession } from '@/utils/auth';

/**
 * GET /api/proposals/[id]
 * Récupère une proposition par son ID avec son score calculé.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const proposal = await prisma.proposal.findUnique({
      where: { id },
      include: {
        article: {
          include: {
            code: true,
          },
        },
        votes: true,
      },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposition non trouvée" }, { status: 404 });
    }

    const score = proposal.votes.reduce((acc, v) => acc + v.value, 0);

    return NextResponse.json({
      ...proposal,
      score,
    });
  } catch (error: any) {
    console.error("Erreur dans GET /api/proposals/[id] :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/proposals/[id]
 * Suppression logique d'une proposition par son auteur.
 * Seul l'auteur de la proposition peut la retirer.
 * Le statut passe à "deleted" (suppression logique pour l'audit trail).
 */
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // 1. Vérifier l'authentification
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth-token');

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ error: "Vous devez être connecté pour effectuer cette action" }, { status: 401 });
    }

    const session = decryptSession(tokenCookie.value);
    if (!session) {
      return NextResponse.json({ error: "Session invalide ou expirée" }, { status: 401 });
    }

    const { id } = await params;

    // 2. Récupérer la proposition
    const proposal = await prisma.proposal.findUnique({
      where: { id },
    });

    if (!proposal) {
      return NextResponse.json({ error: "Proposition non trouvée" }, { status: 404 });
    }

    if (proposal.status !== 'pending') {
      return NextResponse.json({ error: "Cette proposition ne peut plus être retirée" }, { status: 400 });
    }

    // 3. Vérifier que c'est bien l'auteur qui fait la demande
    if (proposal.createdBy !== session.pseudo) {
      return NextResponse.json({ error: "Vous n'êtes pas autorisé à retirer cette proposition" }, { status: 403 });
    }

    // 4. Suppression logique : passer le statut à "deleted"
    const updatedProposal = await prisma.proposal.update({
      where: { id },
      data: { status: 'deleted' },
    });

    return NextResponse.json({ message: "Proposition retirée avec succès", proposal: updatedProposal });
  } catch (error: any) {
    console.error("Erreur dans DELETE /api/proposals/[id] :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
