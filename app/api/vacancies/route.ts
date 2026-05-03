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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emp = await db.employer.findUnique({
      where: { userId: session.userId },
      select: { id: true, name: true, region: true },
    });
    if (!emp) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });

    const body = await req.json();
    const { title, department, city, workMode, salaryFrom, salaryTo, description, status } = body;

    const dbStatus = (['DRAFT', 'ACTIVE', 'ARCHIVED'].includes((status ?? '').toUpperCase())
      ? status.toUpperCase()
      : 'ACTIVE') as 'DRAFT' | 'ACTIVE' | 'ARCHIVED';

    const row = await db.vacancy.create({
      data: {
        employerId: emp.id,
        title: title || 'Новая вакансия',
        department: department || null,
        city: city || '',
        region: emp.region,
        workMode: workMode || 'Офис',
        salaryFrom: salaryFrom ? Number(salaryFrom) : null,
        salaryTo: salaryTo ? Number(salaryTo) : null,
        description: description || null,
        status: dbStatus,
      },
      include: {
        employer: { select: { id: true, name: true } },
        skills: { include: { dictItem: true } },
      },
    });

    const vacancy: Vacancy = {
      id: row.id,
      employerId: row.employerId,
      employerName: row.employer.name,
      title: row.title,
      department: row.department ?? '',
      city: row.city,
      region: row.region,
      workMode: row.workMode,
      salaryFrom: row.salaryFrom ?? 0,
      salaryTo: row.salaryTo ?? 0,
      description: row.description ?? '',
      skills: row.skills.map(s => s.dictItem.label),
      clientSpheres: [],
      specialistActivities: [],
      status: row.status.toLowerCase() as Vacancy['status'],
      createdAt: row.createdAt.toISOString(),
    };

    return NextResponse.json(vacancy, { status: 201 });
  } catch (err) {
    console.error('[api/vacancies POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
