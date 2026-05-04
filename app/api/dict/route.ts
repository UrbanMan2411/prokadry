import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

const ALLOWED: string[] = ['POSITION', 'ACTIVITY_AREA', 'SKILL', 'PURCHASE_TYPE', 'SPECIAL_STATUS', 'TEST', 'EDUCATION', 'WORK_MODE'];

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get('category')?.toUpperCase() ?? '';
  if (!ALLOWED.includes(category)) {
    return NextResponse.json({ error: 'invalid_category' }, { status: 400 });
  }
  try {
    const items = await db.dictItem.findMany({
      where: { category: category as never, isActive: true },
      select: { id: true, value: true, label: true },
      orderBy: [{ sortOrder: 'asc' }, { label: 'asc' }],
    });
    return NextResponse.json(items);
  } catch (err) {
    console.error('[api/dict]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { category, value, label } = await req.json();
    const cat = String(category ?? '').toUpperCase();
    if (!ALLOWED.includes(cat) || !value || !label) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
    }

    const item = await db.dictItem.create({
      data: { category: cat as never, value: String(value).trim(), label: String(label).trim(), isActive: true },
      select: { id: true, value: true, label: true },
    });
    return NextResponse.json(item, { status: 201 });
  } catch (err) {
    console.error('[api/dict POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { id } = await req.json();
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    await db.dictItem.update({ where: { id: String(id) }, data: { isActive: false } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/dict DELETE]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
