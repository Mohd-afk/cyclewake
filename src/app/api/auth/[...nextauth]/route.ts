import { NextResponse } from 'next/server';

// EXTENSION: NextAuth.js OAuth configuration will go here
export async function GET() {
  return NextResponse.json({ message: "NextAuth OAuth route stub" });
}

export async function POST() {
  return NextResponse.json({ message: "NextAuth OAuth route stub" });
}
