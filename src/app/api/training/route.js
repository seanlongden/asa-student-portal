import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getStudentByEmail, getStudentProgress } from '@/lib/airtable';
import { checkSubscriptionStatus } from '@/lib/stripe';
import { MODULES } from '@/lib/modules';

export async function GET() {
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

    const progress = await getStudentProgress(student.id);

    // Build module list with progress status
    const completedModuleIds = new Set(
      progress.filter((p) => p.status === 'Completed').map((p) => p.moduleId)
    );

    const modules = MODULES.map((mod) => {
      const isCompleted = completedModuleIds.has(mod.id);
      // A module is unlocked if it's the first one, or if the previous module is completed
      const previousModule = MODULES.find((m) => m.order === mod.order - 1);
      const isUnlocked =
        mod.order === 1 || (previousModule && completedModuleIds.has(previousModule.id));

      return {
        ...mod,
        status: isCompleted ? 'completed' : isUnlocked ? 'unlocked' : 'locked',
      };
    });

    const completedCount = completedModuleIds.size;

    return NextResponse.json({
      modules,
      progress: {
        completed: completedCount,
        total: MODULES.length,
        percentage: Math.round((completedCount / MODULES.length) * 100),
      },
    });
  } catch (error) {
    console.error('Training API error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
