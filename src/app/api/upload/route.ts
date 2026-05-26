import { NextRequest, NextResponse } from 'next/server';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export async function POST(request: NextRequest) {
  try {
    // Forward the multipart/form-data directly to Express (multer will handle it)
    const formData = await request.formData();

    const res = await fetch(`${API}/api/upload`, {
      method: 'POST',
      headers: { cookie: request.headers.get('cookie') || '' },
      // Pass the FormData body directly — fetch will set the correct Content-Type boundary
      body: formData,
    });

    const data = await res.json();
    return NextResponse.json(data, { status: res.status });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
