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
        resume: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(rows.map(u => ({
      id: u.id,
      email: u.email,
      role: u.role.toLowerCase(),
      name: u.employer?.name
        ?? (u.resume ? `${u.resume.firstName} ${u.resume.lastName}`.trim() : u.email),
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
