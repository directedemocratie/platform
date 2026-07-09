import { NextResponse } from 'next/server';

export async function GET() {
  // Renvoie temporairement la variable pour que vous puissiez la copier
  return NextResponse.json({ url: process.env.DATABASE_URL });
}
