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
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { value, confirmed } = await req.json();
    if (!value || typeof confirmed !== 'boolean') {
      return NextResponse.json({ error: 'Bad request' }, { status: 400 });
    }

    const dictItem = await db.dictItem.findFirst({
      where: { category: 'SPECIAL_STATUS', value: String(value) },
      select: { id: true },
    });
    if (!dictItem) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const existing = await db.resumeSpecialStatus.findUnique({
      where: { resumeId_dictItemId: { resumeId: id, dictItemId: dictItem.id } },
    });
    if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await db.resumeSpecialStatus.update({
      where: { resumeId_dictItemId: { resumeId: id, dictItemId: dictItem.id } },
      data: { confirmedAt: confirmed ? new Date() : null },
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[confirm-status]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
