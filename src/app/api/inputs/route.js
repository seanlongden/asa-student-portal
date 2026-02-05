import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStudentByEmail, getStudentInputs, saveStudentInput } from '@/lib/db';
import { checkSubscriptionStatus } from '@/lib/stripe';

// GET: Retrieve saved inputs (optionally filtered by moduleId)
export async function GET(request) {
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

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    const inputs = await getStudentInputs(student.id, moduleId || null);

    return NextResponse.json({ inputs });
  } catch (error) {
    console.error('Get inputs error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Save a student input
export async function POST(request) {
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

    const { moduleId, moduleOrder, inputKey, value } = await request.json();

    if (!moduleId || !inputKey) {
      return NextResponse.json({ error: 'moduleId and inputKey are required' }, { status: 400 });
    }

    const result = await saveStudentInput(
      student.id,
      moduleId,
      moduleOrder || 0,
      inputKey,
      value || ''
    );

    return NextResponse.json({ success: true, input: result });
  } catch (error) {
    console.error('Save input error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
