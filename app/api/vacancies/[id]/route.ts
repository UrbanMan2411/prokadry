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

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || (session.role !== 'EMPLOYER' && session.role !== 'ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'ADMIN') {
      const existing = await db.vacancy.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } else {
      const emp = await db.employer.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const existing = await db.vacancy.findFirst({ where: { id, employerId: emp.id } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const body = await req.json();
    const { status, title, department, city, workMode, salaryFrom, salaryTo, description, skills, activityAreas, purchaseTypes } = body;

    const updateData: Record<string, unknown> = {};
    if (status !== undefined) {
      const s = String(status).toUpperCase();
      if (['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(s)) updateData.status = s;
    }
    if (title !== undefined) updateData.title = title;
    if (department !== undefined) updateData.department = department || null;
    if (city !== undefined) updateData.city = city;
    if (workMode !== undefined) updateData.workMode = workMode;
    if (salaryFrom !== undefined) updateData.salaryFrom = salaryFrom ? Number(salaryFrom) : null;
    if (salaryTo !== undefined) updateData.salaryTo = salaryTo ? Number(salaryTo) : null;
    if (description !== undefined) updateData.description = description || null;

    await db.vacancy.update({ where: { id }, data: updateData });
    await saveVacancyTags(id, skills, activityAreas, purchaseTypes);

    const row = await db.vacancy.findUnique({
      where: { id },
      include: {
        employer: { select: { id: true, name: true } },
        skills: { include: { dictItem: true } },
        activityAreas: { include: { dictItem: true } },
      },
    });
    if (!row) return NextResponse.json({ error: 'Not found' }, { status: 404 });

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
      clientSpheres: row.activityAreas.filter(a => a.dictItem.category === 'ACTIVITY_AREA').map(a => a.dictItem.label),
      specialistActivities: row.activityAreas.filter(a => a.dictItem.category === 'PURCHASE_TYPE').map(a => a.dictItem.label),
      status: row.status.toLowerCase() as Vacancy['status'],
      createdAt: row.createdAt.toISOString(),
    };

    return NextResponse.json(vacancy);
  } catch (err) {
    console.error('[api/vacancies/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
