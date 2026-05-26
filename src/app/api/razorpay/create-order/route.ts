import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();

    if (!amount) {
      return NextResponse.json({ success: false, message: 'Amount is required' }, { status: 400 });
    }

    const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
      return NextResponse.json({ success: false, message: 'Razorpay keys are not configured' }, { status: 500 });
    }

    // Convert amount to paise (e.g. 150 INR becomes 15000 paise)
    const amountInPaise = Math.round(parseFloat(amount) * 100);

    // Create a unique receipt id
    const receipt = `rcpt_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

    // Call Razorpay API to create an order
    const auth = Buffer.from(`${keyId}:${keySecret}`).toString('base64');
    const response = await fetch('https://api.razorpay.com/v1/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${auth}`
      },
      body: JSON.stringify({
        amount: amountInPaise,
        currency: 'INR',
        receipt: receipt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Razorpay order creation failed:', data);
      return NextResponse.json({ success: false, message: data.error?.description || 'Failed to create Razorpay order' }, { status: response.status });
    }

    return NextResponse.json({
      success: true,
      orderId: data.id,
      amount: data.amount,
      currency: data.currency
    });
  } catch (error: any) {
    console.error('Error creating Razorpay order:', error);
    return NextResponse.json({ success: false, message: error.message || 'Server error' }, { status: 500 });
  }
}
