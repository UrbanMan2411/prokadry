import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const rows = await db.user.findMany({
      include: {
        employer: { select: { id: true, name: true, inn: true } },
        resumes: { select: { firstName: true, lastName: true }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    type Row = typeof rows[number];
    return NextResponse.json(rows.map((u: Row) => ({
      id: u.id,
      email: u.email,
      role: u.role.toLowerCase(),
      name: u.employer?.name
        ?? (u.resumes[0] ? `${u.resumes[0].firstName} ${u.resumes[0].lastName}`.trim() : u.email),
      org: u.employer?.name ?? '',
      inn: u.employer?.inn ?? '',
      isActive: u.isActive,
      createdAt: u.createdAt.toISOString(),
    })));
  } catch (err) {
    console.error('[api/admin/users]', err);
    return NextResponse.json([], { status: 200 });
  }
}
