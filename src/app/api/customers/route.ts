import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function cookieHeader(request: NextRequest) {
  return { cookie: request.headers.get('cookie') || '' };
}

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API}/api/customers`, {
      headers: cookieHeader(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
