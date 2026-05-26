import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    const res = await fetch(`${API}/api/auth/logout`, {
      method: 'POST',
      headers: { cookie: request.headers.get('cookie') || '' },
    });
    const data = await res.json();

    const response = NextResponse.json(data, { status: res.status });

    // Forward cookie-clearing header from Express
    const setCookie = res.headers.get('set-cookie');
    if (setCookie) {
      response.headers.set('set-cookie', setCookie);
    }
    return response;
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
