import { NextResponse } from 'next/server';

export function middleware(request) {
  const { pathname } = request.nextUrl;

  // Check for auth cookie on protected routes
  const email = request.cookies.get('student_email')?.value;

  if (!email) {
    // For API routes, return 401
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }
    // For pages, redirect to login
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/training/:path*',
    '/my-work/:path*',
    '/settings/:path*',
    '/api/dashboard/:path*',
    '/api/training/:path*',
    '/api/inputs/:path*',
    '/api/settings/:path*',
    '/api/metrics/:path*',
  ],
};
