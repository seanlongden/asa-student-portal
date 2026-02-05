import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStudentByEmail, updateStudent } from '@/lib/db';
import { checkSubscriptionStatus } from '@/lib/stripe';

// GET: Get current settings
export async function GET() {
  try {
    const cookieStore = cookies();
    const email = cookieStore.get('student_email')?.value;

    if (!email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const student = await getStudentByEmail(email);
    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    return NextResponse.json({
      emailTool: student.emailTool || '',
      hasApiKey: student.hasApiKey,
      name: student.name,
      email: student.email,
      company: student.company || '',
    });
  } catch (error) {
    console.error('Settings GET error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: Update settings
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

    const { emailTool, apiKey, company } = await request.json();

    const updateFields = {};
    if (emailTool !== undefined) updateFields.emailTool = emailTool;
    if (apiKey !== undefined) updateFields.apiKey = apiKey;
    if (company !== undefined) updateFields.company = company;

    if (Object.keys(updateFields).length === 0) {
      return NextResponse.json({ error: 'No fields to update' }, { status: 400 });
    }

    await updateStudent(student.id, updateFields);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings POST error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
