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
    if (!session || (session.role !== 'SEEKER' && session.role !== 'EMPLOYER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { status } = await req.json();
    const dbStatus = String(status).toUpperCase();
    if (!['ACCEPTED', 'REJECTED'].includes(dbStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (session.role === 'SEEKER') {
      const resume = await db.resume.findFirst({ where: { userId: session.userId }, select: { id: true } });
      if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      const existing = await db.invitation.findFirst({ where: { id, resumeId: resume.id } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } else {
      const emp = await db.employer.findUnique({ where: { userId: session.userId }, select: { id: true } });
      if (!emp) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
      const existing = await db.invitation.findFirst({ where: { id, vacancy: { employerId: emp.id } } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updated = await db.invitation.update({
      where: { id },
      data: { status: dbStatus as 'ACCEPTED' | 'REJECTED', respondedAt: new Date() },
    });

    return NextResponse.json({ id: updated.id, status: updated.status.toLowerCase() });
  } catch (err) {
    console.error('[api/invitations/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
