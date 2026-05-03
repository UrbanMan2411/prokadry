import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Vacancy } from '@/lib/types';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    const isAdmin = session?.role === 'ADMIN';

    let employerFilter: { employerId?: string } = {};
    if (session?.role === 'EMPLOYER') {
      const emp = await db.employer.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      if (emp) {
        // employer sees all their own vacancies
        employerFilter = { employerId: emp.id };
      }
    }

    const rows = await db.vacancy.findMany({
      where: {
        status: isAdmin
          ? { in: ['ACTIVE', 'DRAFT', 'ARCHIVED'] }
          : { in: ['ACTIVE', 'DRAFT'] },
        ...employerFilter,
      },
      include: {
        employer: { select: { id: true, name: true } },
        skills: { include: { dictItem: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const vacancies: Vacancy[] = rows.map(v => ({
      id: v.id,
      employerId: v.employerId,
      employerName: v.employer.name,
      title: v.title,
      department: v.department ?? '',
      city: v.city,
      region: v.region,
      workMode: v.workMode,
      salaryFrom: v.salaryFrom ?? 0,
      salaryTo: v.salaryTo ?? 0,
      description: v.description ?? '',
      skills: v.skills.map(s => s.dictItem.label),
      clientSpheres: [],
      specialistActivities: [],
      status: v.status.toLowerCase() as Vacancy['status'],
      createdAt: v.createdAt.toISOString(),
    }));

    return NextResponse.json(vacancies);
  } catch (err) {
    console.error('[api/vacancies]', err);
    return NextResponse.json([], { status: 200 });
  }
}
