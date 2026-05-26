import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API}/api/auth/session`, {
      headers: { cookie: request.headers.get('cookie') || '' },
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}
