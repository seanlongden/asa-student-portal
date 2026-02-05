import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateMagicToken } from '@/lib/auth';
import { getStudentByEmail } from '@/lib/airtable';

let _resend;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function POST(request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Verify student exists in Airtable
    const student = await getStudentByEmail(email);
    if (!student) {
      // Return success even if student not found to prevent email enumeration
      return NextResponse.json({ success: true });
    }

    // Generate magic link token
    const token = generateMagicToken(email);
    const magicLink = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;

    // Send email via Resend
    await getResend().emails.send({
      from: process.env.EMAIL_FROM || 'ASA Portal <noreply@yourdomain.com>',
      to: email,
      subject: 'Your ASA Portal Login Link',
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
          <h2 style="color: #1e293b;">ASA Student Portal</h2>
          <p style="color: #64748b; font-size: 16px;">Click the link below to log in to your portal. This link expires in 15 minutes.</p>
          <a href="${magicLink}" style="display: inline-block; background: #2563eb; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0;">Log In to Portal</a>
          <p style="color: #94a3b8; font-size: 13px;">If you didn't request this link, you can safely ignore this email.</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Magic link error:', error);
    return NextResponse.json({ error: 'Failed to send login link' }, { status: 500 });
  }
}
