import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

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
