import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

function cookieHeader(request: NextRequest) {
  return { cookie: request.headers.get('cookie') || '' };
}

export async function GET(request: NextRequest) {
  try {
    const res = await fetch(`${API}/api/orders`, {
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

    // Verify Razorpay signature here (in Next.js layer, since RAZORPAY_KEY_SECRET is server-only)
    const {
      payment_method,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = body;

    if (payment_method === 'online') {
      if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Missing Razorpay signature verification parameters.' },
          { status: 400 }
        );
      }

      const keySecret = process.env.RAZORPAY_KEY_SECRET;
      if (!keySecret) {
        return NextResponse.json(
          { success: false, message: 'Razorpay keys not configured on server.' },
          { status: 500 }
        );
      }

      const hmac = crypto.createHmac('sha256', keySecret);
      hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
      const generatedSignature = hmac.digest('hex');

      if (generatedSignature !== razorpay_signature) {
        return NextResponse.json(
          { success: false, message: 'Razorpay payment signature verification failed.' },
          { status: 400 }
        );
      }
    }

    const res = await fetch(`${API}/api/orders`, {
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
    const res = await fetch(`${API}/api/orders`, {
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
