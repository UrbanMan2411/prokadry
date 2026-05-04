import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAction } from '@/lib/audit';

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
    const body = await req.json();

    const user = await db.user.findUnique({ where: { id }, select: { email: true } });

    if (typeof body.isActive === 'boolean') {
      await db.user.update({ where: { id }, data: { isActive: body.isActive } });
      logAction(session.userId, body.isActive ? 'USER_UNBLOCKED' : 'USER_BLOCKED', 'User', id, user?.email);
      return NextResponse.json({ ok: true });
    }

    if (typeof body.newPassword === 'string' && body.newPassword.length >= 6) {
      const hash = await bcrypt.hash(body.newPassword, 10);
      await db.user.update({ where: { id }, data: { passwordHash: hash } });
      logAction(session.userId, 'USER_PASSWORD_CHANGED', 'User', id, user?.email);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: 'Nothing to update' }, { status: 400 });
  } catch (err) {
    console.error('[api/admin/users/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
