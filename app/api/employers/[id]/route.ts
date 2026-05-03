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
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existing = await db.employer.findUnique({ where: { id }, select: { id: true } });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { status } = await req.json();
    const dbStatus = String(status).toUpperCase();
    if (!['APPROVED', 'PENDING', 'SUSPENDED'].includes(dbStatus)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updated = await db.employer.update({
      where: { id },
      data: {
        status: dbStatus as 'APPROVED' | 'PENDING' | 'SUSPENDED',
        approvedAt: dbStatus === 'APPROVED' ? new Date() : undefined,
      },
    });

    return NextResponse.json({ id: updated.id, status: updated.status.toLowerCase() });
  } catch (err) {
    console.error('[api/employers/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
