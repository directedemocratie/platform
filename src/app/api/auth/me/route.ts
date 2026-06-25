import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { decryptSession } from '@/utils/auth';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const tokenCookie = cookieStore.get('auth-token');

    if (!tokenCookie || !tokenCookie.value) {
      return NextResponse.json({ user: null });
    }

    const payload = decryptSession(tokenCookie.value);

    if (!payload) {
      return NextResponse.json({ user: null });
    }

    // Return the safe user object
    return NextResponse.json({
      user: {
        id: payload.userId,
        email: payload.email,
        pseudo: payload.pseudo,
        role: payload.role,
      }
    });
  } catch (error: any) {
    console.error("Erreur dans GET /api/auth/me :", error);
    return NextResponse.json({ user: null, error: error.message }, { status: 500 });
  }
}
