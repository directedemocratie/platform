import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ success: true, message: "Déconnexion réussie." });
    
    // Clear the session cookie by setting maxAge to 0
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0,
      path: '/',
    });

    return response;
  } catch (error: any) {
    console.error("Erreur dans POST /api/auth/logout :", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
