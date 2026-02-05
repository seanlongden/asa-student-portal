import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createCheckoutSession } from '@/lib/stripe';

export async function POST(request) {
  try {
    const body = await request.json();
    let email = body.email;
    const name = body.name || '';

    // For reactivation, get email from cookie
    if (body.reactivate) {
      const cookieStore = cookies();
      email = cookieStore.get('student_email')?.value;
    }

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    const session = await createCheckoutSession(email, name);

    return NextResponse.json({ url: session.url });
  } catch (error) {
    console.error('Checkout error:', error);
    return NextResponse.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
}
