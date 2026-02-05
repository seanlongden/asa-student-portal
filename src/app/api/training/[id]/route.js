import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStudentByEmail, getStudentProgress, getStudentInputs } from '@/lib/airtable';
import { checkSubscriptionStatus } from '@/lib/stripe';
import { MODULES, getModuleById } from '@/lib/modules';

export async function GET(request, { params }) {
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

    const moduleData = getModuleById(params.id);
    if (!moduleData) {
      return NextResponse.json({ error: 'Module not found' }, { status: 404 });
    }

    // Check if module is unlocked
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

    // Get saved inputs for this module
    const savedInputs = await getStudentInputs(student.id, moduleData.id);
    const inputValues = {};
    savedInputs.forEach((input) => {
      inputValues[input.inputKey] = input.value;
    });

    const isCompleted = completedModuleIds.has(moduleData.id);

    return NextResponse.json({
      module: {
        ...moduleData,
        status: isCompleted ? 'completed' : 'unlocked',
      },
      inputValues,
      studentId: student.id,
    });
  } catch (error) {
    console.error('Module API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
