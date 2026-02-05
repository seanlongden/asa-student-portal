import { NextResponse } from 'next/server';
import { verifyMagicToken } from '@/lib/auth';
import { checkSubscriptionStatus } from '@/lib/stripe';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/?error=invalid-link', process.env.NEXT_PUBLIC_URL));
  }

  const email = verifyMagicToken(token);

  if (!email) {
    return NextResponse.redirect(new URL('/?error=expired-link', process.env.NEXT_PUBLIC_URL));
  }

  // Check subscription status
  const { active } = await checkSubscriptionStatus(email);

  // Set auth cookie
  const response = NextResponse.redirect(
    new URL(active ? '/dashboard' : '/reactivate', process.env.NEXT_PUBLIC_URL)
  );

  response.cookies.set('student_email', email, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 30, // 30 days
    path: '/',
  });

  return response;
}
