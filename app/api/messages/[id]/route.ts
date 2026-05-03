import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const msg = await db.message.findFirst({
      where: { id, recipientId: session.userId },
      select: { id: true },
    });
    if (!msg) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.message.update({
      where: { id },
      data: { isRead: true, readAt: new Date() },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/messages/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
