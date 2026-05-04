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

    const { status, replyMessage } = await req.json();
    const dbStatus = String(status).toUpperCase();
    const seekerAllowed = ['ACCEPTED', 'REJECTED', 'VIEWED'];
    const employerAllowed = ['ACCEPTED', 'REJECTED'];
    if (session.role === 'SEEKER' && !seekerAllowed.includes(dbStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }
    if (session.role === 'EMPLOYER' && !employerAllowed.includes(dbStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (session.role === 'SEEKER') {
      const resumes = await db.resume.findMany({ where: { userId: session.userId }, select: { id: true } });
      const resumeIds = resumes.map(r => r.id);
      const existing = await db.invitation.findFirst({ where: { id, resumeId: { in: resumeIds } } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    } else {
      const emp = await db.employer.findUnique({ where: { userId: session.userId }, select: { id: true } });
      if (!emp) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });
      const existing = await db.invitation.findFirst({ where: { id, vacancy: { employerId: emp.id } } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = { status: dbStatus };
    if (dbStatus === 'VIEWED') updateData.viewedAt = new Date();
    else updateData.respondedAt = new Date();
    if (replyMessage !== undefined) updateData.replyMessage = replyMessage || null;
    const updated = await db.invitation.update({
      where: { id },
      data: updateData as never,
    });

    return NextResponse.json({ id: updated.id, status: updated.status.toLowerCase() });
  } catch (err) {
    console.error('[api/invitations/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
