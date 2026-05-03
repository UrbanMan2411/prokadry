import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const { isActive } = await req.json();
    if (typeof isActive !== 'boolean') {
      return NextResponse.json({ error: 'Missing isActive' }, { status: 400 });
    }

    await db.user.update({ where: { id }, data: { isActive } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/admin/users/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
