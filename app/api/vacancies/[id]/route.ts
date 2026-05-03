import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Vacancy } from '@/lib/types';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emp = await db.employer.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const existing = await db.vacancy.findFirst({ where: { id, employerId: emp.id } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const body = await req.json();
    const { status, title, department, city, workMode, salaryFrom, salaryTo, description } = body;

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

    const row = await db.vacancy.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(vacancy);
  } catch (err) {
    console.error('[api/vacancies/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
