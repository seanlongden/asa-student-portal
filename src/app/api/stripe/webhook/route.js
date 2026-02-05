import { NextResponse } from 'next/server';
import { stripe as getStripe } from '@/lib/stripe';
import { getStudentByEmail, createStudent, updateStudent } from '@/lib/db';
import { Resend } from 'resend';
import { generateMagicToken } from '@/lib/auth';

let _resend;
function getResend() {
  if (!_resend) _resend = new Resend(process.env.RESEND_API_KEY);
  return _resend;
}

export async function POST(request) {
  try {
    const body = await request.text();
    const sig = request.headers.get('stripe-signature');

    let event;
    try {
      event = getStripe().webhooks.constructEvent(
        body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const email = session.customer_email || session.metadata?.studentEmail;
        const name = session.metadata?.studentName || '';

        if (email) {
          // Check if student already exists
          let student = await getStudentByEmail(email);

          if (!student) {
            student = await createStudent({
              name,
              email,
              stripeCustomerId: session.customer,
            });
          } else {
            // Update existing student
            await updateStudent(student.id, {
              stripeCustomerId: session.customer,
              status: 'Active',
            });
          }

          // Send magic link to new student
          const token = generateMagicToken(email);
          const magicLink = `${process.env.NEXT_PUBLIC_URL}/api/auth/verify?token=${encodeURIComponent(token)}`;

          await getResend().emails.send({
            from: process.env.EMAIL_FROM || 'ASA Portal <noreply@yourdomain.com>',
            to: email,
            subject: 'Welcome to ASA - Access Your Portal',
            html: `
              <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
                <h2 style="color: #1e293b;">Welcome to the Agency Scaling Accelerator!</h2>
                <p style="color: #64748b; font-size: 16px;">Your enrollment is confirmed. Click below to access your student portal and start Module 1.</p>
                <a href="${magicLink}" style="display: inline-block; background: #2563eb; color: #fff; padding: 14px 28px; border-radius: 6px; text-decoration: none; font-weight: 600; margin: 20px 0;">Access Your Portal</a>
                <p style="color: #94a3b8; font-size: 13px;">This link expires in 15 minutes. You can request a new one anytime from the login page.</p>
              </div>
            `,
          });
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const customer = await getStripe().customers.retrieve(subscription.customer);
        if (customer.email) {
          const student = await getStudentByEmail(customer.email);
          if (student) {
            await updateStudent(student.id, { status: 'Churned' });
          }
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const customer = await getStripe().customers.retrieve(invoice.customer);
        if (customer.email) {
          const student = await getStudentByEmail(customer.email);
          if (student) {
            await updateStudent(student.id, { status: 'Payment Failed' });
          }
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
