import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStudentByEmail, upsertWeeklyMetrics } from '@/lib/db';
import { checkSubscriptionStatus } from '@/lib/stripe';
import { fetchMetrics } from '@/lib/email-metrics';

export async function POST() {
  try {
    const cookieStore = cookies();
    const email = cookieStore.get('student_email')?.value;

    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { active } = await checkSubscriptionStatus(email);
    if (!active) {
      return NextResponse.json({ error: 'Subscription inactive' }, { status: 403 });
    }

    const student = await getStudentByEmail(email);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    if (!student.emailTool || !student.apiKey) {
      return NextResponse.json(
        { error: 'No email tool connected. Go to Settings to connect your tool.' },
        { status: 400 }
      );
    }

    // Fetch metrics from the connected tool
    const metrics = await fetchMetrics(student.emailTool, student.apiKey);

    // Get current week's Monday as the week identifier
    const now = new Date();
    const dayOfWeek = now.getDay();
    const monday = new Date(now);
    monday.setDate(now.getDate() - ((dayOfWeek + 6) % 7));
    const weekStarting = monday.toISOString().split('T')[0];

    // Save to database
    await upsertWeeklyMetrics(student.id, weekStarting, metrics);

    return NextResponse.json({
      success: true,
      metrics,
      weekStarting,
    });
  } catch (error) {
    console.error('Metrics sync error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to sync metrics' },
      { status: 500 }
    );
  }
}
