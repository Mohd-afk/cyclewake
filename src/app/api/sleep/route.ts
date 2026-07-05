import { NextResponse } from 'next/server';

// EXTENSION: GET sleep history logs from DB
export async function GET() {
  return NextResponse.json({ sessions: [] });
}

// EXTENSION: POST a new sleep log session to DB
export async function POST() {
  return NextResponse.json({ success: true, message: "Sleep session saved (stub)" });
}
