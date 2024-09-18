import { NextResponse } from 'next/server';

// This should be updated whenever there are changes to the legendary Pokémon data
const CURRENT_VERSION = 1;

export async function GET() {
  return NextResponse.json({ version: CURRENT_VERSION });
}
