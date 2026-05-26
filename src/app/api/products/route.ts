import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function cookieHeader(request: NextRequest) {
  return { cookie: request.headers.get('cookie') || '' };
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = new URLSearchParams();
    if (searchParams.get('slug')) params.set('slug', searchParams.get('slug')!);
    if (searchParams.get('id')) params.set('id', searchParams.get('id')!);
    if (searchParams.get('featured')) params.set('featured', searchParams.get('featured')!);

    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await fetch(`${API}/api/products${query}`, {
      headers: cookieHeader(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API}/api/products`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...cookieHeader(request) },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const res = await fetch(`${API}/api/products`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...cookieHeader(request) },
      body: JSON.stringify(body),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const res = await fetch(`${API}/api/products?id=${id}`, {
      method: 'DELETE',
      headers: cookieHeader(request),
    });
    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
