import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStudentByEmail, getStudentProgress, markModuleComplete } from '@/lib/airtable';
import { checkSubscriptionStatus } from '@/lib/stripe';
import { MODULES, getModuleById } from '@/lib/modules';

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

    const { moduleId } = await request.json();
    const moduleData = getModuleById(moduleId);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Verify module is unlocked (previous module completed)
    const progress = await getStudentProgress(student.id);
    const completedModuleIds = new Set(
      progress.filter((p) => p.status === 'Completed').map((p) => p.moduleId)
    );

    const previousModule = MODULES.find((m) => m.order === moduleData.order - 1);
    const isUnlocked =
      moduleData.order === 1 || (previousModule && completedModuleIds.has(previousModule.id));

    if (!isUnlocked) {
      return NextResponse.json({ error: 'Module is locked' }, { status: 403 });
    }

    // Mark as complete
    const result = await markModuleComplete(student.id, moduleData.id, moduleData.order);

    return NextResponse.json({ success: true, progress: result });
  } catch (error) {
    console.error('Complete module error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
