import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    if (session.role === 'SEEKER') {
      const resume = await db.resume.findFirst({
        where: { id, userId: session.userId },
        select: { id: true, status: true },
      });
      if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const { position, city, salary, experience, education, workMode, about, status } = body;
      const data: Record<string, unknown> = {};
      if (position !== undefined) data.position = position;
      if (city !== undefined) data.city = city;
      if (salary !== undefined) data.salary = salary ? Number(salary) : null;
      if (experience !== undefined) data.experience = Number(experience) || 0;
      if (education !== undefined) data.education = education;
      if (workMode !== undefined) data.workMode = workMode;
      if (about !== undefined) data.about = about || null;
      if (status === 'PENDING') {
        data.status = 'PENDING';
      } else if (status === 'DRAFT') {
        data.status = 'DRAFT';
      }

      const updated = await db.resume.update({ where: { id }, data });
      return NextResponse.json({ id: updated.id, status: updated.status.toLowerCase() });
    }

    if (session.role === 'ADMIN') {
      const existing = await db.resume.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const { status, rejectReason } = body;
      const dbStatus = String(status).toUpperCase();
      if (!['ACTIVE', 'REJECTED', 'DRAFT', 'ARCHIVED', 'PENDING'].includes(dbStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const data: Record<string, unknown> = { status: dbStatus };
      if (rejectReason !== undefined) data.rejectReason = rejectReason || null;
      if (dbStatus === 'ACTIVE') data.publishedAt = new Date();

      const updated = await db.resume.update({ where: { id }, data });
      return NextResponse.json({ id: updated.id, status: updated.status.toLowerCase() });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (err) {
    console.error('[api/resumes/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
