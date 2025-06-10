import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BASE_URL;
const API_KEY = process.env.NEXT_PUBLIC_API_KEY;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const response = await fetch(`${BACKEND_URL}/notifications`, {
    method: 'GET',
    headers: {
      'Authorization': authHeader || '',
      'Content-Type': 'application/json',
      'x-api-key': API_KEY || '',
    },
  });

  const data = await response.json();
  return NextResponse.json(data, { status: response.status });
} 