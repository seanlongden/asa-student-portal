import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStudentByEmail, getStudentLeads, getStudentClients, getStudentMetrics } from '@/lib/airtable';
import { checkSubscriptionStatus } from '@/lib/stripe';

export async function GET() {
    try {
          // Get student email from session cookie
      const cookieStore = cookies();
          const email = cookieStore.get('student_email')?.value;

      if (!email) {
              return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
      }

      // Check Stripe subscription
      const { active } = await checkSubscriptionStatus(email);
          if (!active) {
                  return NextResponse.json({ error: 'Subscription inactive' }, { status: 403 });
          }

      // Get student data from Airtable
      const student = await getStudentByEmail(email);
          if (!student) {
                  return NextResponse.json({ error: 'Student not found' }, { status: 404 });
          }

      // Get all student data in parallel
      const [leads, clients, metrics] = await Promise.all([
              getStudentLeads(student.id),
              getStudentClients(student.id),
              getStudentMetrics(student.id)
            ]);

      return NextResponse.json({ student, leads, clients, metrics });
    } catch (error) {
          console.error('Dashboard API error:', error);
          return NextResponse.json({ error: 'Server error' }, { status: 500 });
    }
}
