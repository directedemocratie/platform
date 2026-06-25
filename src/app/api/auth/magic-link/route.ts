import { NextResponse } from 'next/server';
import { z } from 'zod';
import { checkRateLimit } from '@/utils/rateLimit';
import prisma from '@/lib/prisma';
import crypto from 'crypto';

// ─────────────────────────────────────────────────────────────────────────────
// Envoi d'email — configuration
//
// Pour activer l'envoi réel, définissez dans votre .env :
//   EMAIL_PROVIDER=resend
//   RESEND_API_KEY=re_...
//   EMAIL_FROM=noreply@votre-domaine.fr
//
// Sans ces variables, le lien est affiché dans la console (mode simulation).
// ─────────────────────────────────────────────────────────────────────────────

async function sendMagicLinkEmail(params: {
  to: string;
  pseudo: string;
  magicLink: string;
}): Promise<{ sent: boolean; simulatedLink?: string }> {
  const isDev = process.env.NODE_ENV !== 'production';
  const provider = process.env.EMAIL_PROVIDER;

  // ── Mode simulation (aucun fournisseur configuré) ──────────────────
  if (!provider) {
    console.log('\n==============================================');
    console.log(`✉️  SIMULATION D'ENVOI D'EMAIL À : ${params.to}`);
    console.log(`Objet : Votre lien de connexion Démocratie Directe`);
    console.log(`Pseudo : ${params.pseudo}`);
    console.log(`Lien de connexion : ${params.magicLink}`);
    console.log('==============================================\n');
    return { sent: false, simulatedLink: isDev ? params.magicLink : undefined };
  }

  // ── Fournisseur Resend ────────────────────────────────────────────────────
  if (provider === 'resend') {
    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.EMAIL_FROM || 'noreply@directedemocratie.fr';

    if (!apiKey) {
      throw new Error('[magic-link] RESEND_API_KEY est manquante dans les variables d\'environnement.');
    }

    const body = {
      from,
      to: [params.to],
      subject: 'Votre lien de connexion — Démocratie Directe',
      html: `
        <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px 24px;">
          <h2 style="color:#3730a3;margin-bottom:8px;">Démocratie Directe</h2>
          <p>Bonjour <strong>${params.pseudo}</strong>,</p>
          <p>Cliquez sur le bouton ci-dessous pour vous connecter. Ce lien expire dans <strong>15 minutes</strong>.</p>
          <a href="${params.magicLink}"
             style="display:inline-block;margin:24px 0;padding:12px 24px;background:#4f46e5;color:#fff;border-radius:8px;text-decoration:none;font-weight:600;">
            Se connecter
          </a>
          <p style="color:#6b7280;font-size:13px;">
            Si vous n'avez pas demandé ce lien, ignorez simplement cet email.<br/>
            Ce lien ne peut être utilisé qu'une seule fois.
          </p>
          <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
          <p style="color:#9ca3af;font-size:12px;">
            Démocratie Directe — Simulation citoyenne collaborative à but non lucratif.
          </p>
        </div>
      `,
    };

    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`[magic-link] Erreur Resend (${response.status}): ${error}`);
    }

    return { sent: true };
  }

  // Fournisseur inconnu
  throw new Error(`[magic-link] Fournisseur email inconnu : "${provider}". Valeurs supportées : "resend".`);
}

// ─────────────────────────────────────────────────────────────────────────────

const MagicLinkSchema = z.object({
  email: z.string().email("Adresse e-mail invalide"),
  pseudo: z
    .string()
    .min(3, "Le pseudonyme doit contenir au moins 3 caractères")
    .max(30, "Le pseudonyme ne peut pas dépasser 30 caractères")
    .regex(/^[a-zA-Z0-9_\-]+$/, "Le pseudonyme ne peut contenir que des lettres, chiffres, tirets et underscores")
    .optional(),
});

export async function POST(request: Request) {
  try {
    // Rate limiting : max 5 demandes par 15 min par IP
    const ip =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const rl = checkRateLimit(`magic-link:${ip}`, { windowMs: 15 * 60 * 1000, max: 5 });
    if (rl.limited) {
      return NextResponse.json(
        { error: "Trop de tentatives. Veuillez patienter 15 minutes avant de réessayer." },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = MagicLinkSchema.safeParse(body);
    if (!parsed.success) {
      const message = parsed.error.issues[0]?.message ?? "Données invalides";
      return NextResponse.json({ error: message }, { status: 400 });
    }
    const { email, pseudo } = parsed.data;

    const cleanEmail = email.trim().toLowerCase();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email: cleanEmail },
    });

    let chosenPseudo = pseudo?.trim();

    // Inscription (nouvel utilisateur)
    if (!existingUser) {
      if (!chosenPseudo || chosenPseudo.length < 3) {
        return NextResponse.json(
          { error: "Un pseudonyme de 3 caractères minimum est requis pour l'inscription" },
          { status: 400 }
        );
      }

      const pseudoTaken = await prisma.user.findUnique({
        where: { pseudo: chosenPseudo },
      });

      if (pseudoTaken) {
        return NextResponse.json(
          { error: "Ce pseudonyme est déjà utilisé par un autre citoyen" },
          { status: 400 }
        );
      }
    } else {
      // Connexion : on ignore le pseudo fourni et on utilise le pseudo existant
      chosenPseudo = existingUser.pseudo;
    }

    // Générer le token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    // Stocker le token en base
    await prisma.verificationToken.create({
      data: {
        email: cleanEmail,
        pseudo: chosenPseudo,
        token,
        expires,
      },
    });

    // Construire l'URL de callback
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const magicLink = `${protocol}://${host}/api/auth/callback?token=${token}`;

    // Envoyer (ou simuler) l'email
    const result = await sendMagicLinkEmail({
      to: cleanEmail,
      pseudo: chosenPseudo,
      magicLink,
    });

    return NextResponse.json({
      success: true,
      message: result.sent
        ? "Un lien de connexion a été envoyé à votre adresse e-mail."
        : "Un lien de connexion a été généré (mode simulation — vérifiez la console serveur).",
      // simulatedLink n'est retourné qu'en développement pour faciliter les tests
      simulatedLink: result.simulatedLink,
      isNewUser: !existingUser,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Erreur inconnue";
    console.error("Erreur dans POST /api/auth/magic-link :", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
