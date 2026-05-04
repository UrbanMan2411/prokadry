import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Vacancy } from '@/lib/types';

async function saveVacancyTags(
  vacancyId: string,
  skills?: string[],
  activityAreas?: string[],
  purchaseTypes?: string[],
) {
  if (Array.isArray(skills)) {
    await db.vacancySkill.deleteMany({ where: { vacancyId } });
    for (const v of skills) {
      const item = await db.dictItem.findFirst({ where: { category: 'SKILL', value: v }, select: { id: true } });
      if (item) await db.vacancySkill.create({ data: { vacancyId, dictItemId: item.id } }).catch(() => {});
    }
  }
  const areaValues: { cat: 'ACTIVITY_AREA' | 'PURCHASE_TYPE'; arr: string[] }[] = [];
  if (Array.isArray(activityAreas)) areaValues.push({ cat: 'ACTIVITY_AREA', arr: activityAreas });
  if (Array.isArray(purchaseTypes)) areaValues.push({ cat: 'PURCHASE_TYPE', arr: purchaseTypes });
  for (const { cat, arr } of areaValues) {
    const existing = await db.vacancyActivityArea.findMany({
      where: { vacancyId, dictItem: { category: cat as never } },
      select: { dictItemId: true },
    });
    await db.vacancyActivityArea.deleteMany({ where: { vacancyId, dictItemId: { in: existing.map(e => e.dictItemId) } } });
    for (const v of arr) {
      const item = await db.dictItem.findFirst({ where: { category: cat as never, value: v }, select: { id: true } });
      if (item) await db.vacancyActivityArea.create({ data: { vacancyId, dictItemId: item.id } }).catch(() => {});
    }
  }
}

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

    type VS = 'ACTIVE' | 'DRAFT' | 'ARCHIVED';
    const statusIn: VS[] = isAdmin || employerFilter.employerId
      ? ['ACTIVE', 'DRAFT', 'ARCHIVED']
      : ['ACTIVE'];

    const rows = await db.vacancy.findMany({
      where: { status: { in: statusIn }, ...employerFilter },
      include: {
        employer: { select: { id: true, name: true } },
        skills: { include: { dictItem: true } },
        activityAreas: { include: { dictItem: true } },
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
      clientSpheres: v.activityAreas.filter(a => a.dictItem.category === 'ACTIVITY_AREA').map(a => a.dictItem.label),
      specialistActivities: v.activityAreas.filter(a => a.dictItem.category === 'PURCHASE_TYPE').map(a => a.dictItem.label),
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
      select: { id: true, name: true, region: true, status: true },
    });
    if (!emp) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });

    const body = await req.json();
    const { title, department, city, workMode, salaryFrom, salaryTo, description, status, skills, activityAreas, purchaseTypes } = body;

    const requestedStatus = (['DRAFT', 'ACTIVE', 'ARCHIVED'].includes((status ?? '').toUpperCase())
      ? status.toUpperCase()
      : 'ACTIVE') as 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
    // Unapproved employers can only save drafts
    const dbStatus: 'DRAFT' | 'ACTIVE' | 'ARCHIVED' =
      emp.status !== 'APPROVED' ? 'DRAFT' : requestedStatus;

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
        activityAreas: { include: { dictItem: true } },
      },
    });

    await saveVacancyTags(row.id, skills, activityAreas, purchaseTypes);

    const savedRow = await db.vacancy.findUnique({
      where: { id: row.id },
      include: {
        employer: { select: { id: true, name: true } },
        skills: { include: { dictItem: true } },
        activityAreas: { include: { dictItem: true } },
      },
    });

    if (!savedRow) {
      return NextResponse.json({ error: 'Internal error' }, { status: 500 });
    }

    const vacancy: Vacancy = {
      id: savedRow.id,
      employerId: savedRow.employerId,
      employerName: savedRow.employer.name,
      title: savedRow.title,
      department: savedRow.department ?? '',
      city: savedRow.city,
      region: savedRow.region,
      workMode: savedRow.workMode,
      salaryFrom: savedRow.salaryFrom ?? 0,
      salaryTo: savedRow.salaryTo ?? 0,
      description: savedRow.description ?? '',
      skills: savedRow.skills.map(s => s.dictItem.label),
      clientSpheres: savedRow.activityAreas
        .filter(a => a.dictItem.category === 'ACTIVITY_AREA')
        .map(a => a.dictItem.label),
      specialistActivities: savedRow.activityAreas
        .filter(a => a.dictItem.category === 'PURCHASE_TYPE')
        .map(a => a.dictItem.label),
      status: savedRow.status.toLowerCase() as Vacancy['status'],
      createdAt: savedRow.createdAt.toISOString(),
    };

    return NextResponse.json(vacancy, { status: 201 });
  } catch (err) {
    console.error('[api/vacancies POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
