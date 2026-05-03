import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { AdminStats } from '@/lib/types';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [
      totalResumes,
      activeResumes,
      pendingResumes,
      totalEmployers,
      approvedEmployers,
      totalVacancies,
      activeVacancies,
      totalInvitations,
    ] = await Promise.all([
      db.resume.count(),
      db.resume.count({ where: { status: 'ACTIVE' } }),
      db.resume.count({ where: { status: 'PENDING' } }),
      db.employer.count(),
      db.employer.count({ where: { status: 'APPROVED' } }),
      db.vacancy.count(),
      db.vacancy.count({ where: { status: 'ACTIVE' } }),
      db.invitation.count(),
    ]);

    const stats: AdminStats = {
      totalResumes,
      activeResumes,
      pendingResumes,
      totalEmployers,
      approvedEmployers,
      totalVacancies,
      activeVacancies,
      totalInvitations,
    };

    return NextResponse.json(stats);
  } catch (err) {
    console.error('[api/admin/stats]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
