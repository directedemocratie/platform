import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { encryptSession } from '@/utils/auth';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const token = searchParams.get('token');

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=missing_token', request.url));
    }

    // Find token in database
    const verificationToken = await prisma.verificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return NextResponse.redirect(new URL('/login?error=invalid_token', request.url));
    }

    // Check if expired
    if (new Date() > verificationToken.expires) {
      // Clean up expired token
      await prisma.verificationToken.delete({ where: { token } }).catch(() => {});
      return NextResponse.redirect(new URL('/login?error=expired_token', request.url));
    }

    // Token is valid! Find or create user
    let user = await prisma.user.findUnique({
      where: { email: verificationToken.email },
    });

    if (!user) {
      // Create user
      user = await prisma.user.create({
        data: {
          email: verificationToken.email,
          pseudo: verificationToken.pseudo || `Citoyen_${Math.floor(1000 + Math.random() * 9000)}`,
        },
      });
    }

    // Delete verification token after usage (single-use constraint)
    await prisma.verificationToken.delete({ where: { token } }).catch(() => {});

    // Generate secure session payload
    const expiresAt = Date.now() + 30 * 24 * 60 * 60 * 1000; // 30 days
    const sessionToken = encryptSession({
      userId: user.id,
      email: user.email,
      pseudo: user.pseudo,
      role: user.role,
      expiresAt,
    });

    // Create redirect response to homepage
    const response = NextResponse.redirect(new URL('/', request.url));
    
    // Set encrypted session cookie
    response.cookies.set('auth-token', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days in seconds
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error("Erreur dans GET /api/auth/callback :", error);
    return NextResponse.redirect(new URL('/login?error=server_error', request.url));
  }
}
