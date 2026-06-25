import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

/**
 * GET /api/cron/cleanup
 *
 * Supprime les VerificationToken expirés depuis plus de 1 heure.
 * Route protégée par CRON_SECRET pour éviter les appels non autorisés.
 *
 * Usage :
 *  - Railway Cron : GET https://votre-domaine.fr/api/cron/cleanup
 *    Header Authorization: Bearer <CRON_SECRET>
 *  - Crontab VPS  : curl -H "Authorization: Bearer $CRON_SECRET" https://...
 *  - Vercel Cron  : configurer dans vercel.json + header automatique
 */
export async function GET(request: Request) {
  // Vérification du secret cron
  const cronSecret = process.env.CRON_SECRET;
  const authHeader = request.headers.get('authorization');

  if (cronSecret) {
    if (!authHeader || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
  } else if (process.env.NODE_ENV === 'production') {
    // En production, CRON_SECRET est obligatoire
    return NextResponse.json(
      { error: 'CRON_SECRET non configuré — route protégée désactivée' },
      { status: 503 }
    );
  }

  try {
    // Supprimer les tokens expirés depuis plus d'1 heure (marge de sécurité)
    const cutoff = new Date(Date.now() - 60 * 60 * 1000);

    const result = await prisma.verificationToken.deleteMany({
      where: {
        expires: {
          lt: cutoff,
        },
      },
    });

    console.log(`[cron/cleanup] ${result.count} VerificationToken(s) expirés supprimés.`);

    return NextResponse.json({
      success: true,
      deleted: result.count,
      timestamp: new Date().toISOString(),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erreur inconnue';
    console.error('[cron/cleanup] Erreur :', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
