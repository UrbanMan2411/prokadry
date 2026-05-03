import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Employer } from '@/lib/types';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (session?.role !== 'ADMIN') {
      return NextResponse.json([], { status: 200 });
    }

    const rows = await db.employer.findMany({
      include: {
        _count: { select: { vacancies: true } },
        user: { select: { email: true } },
      },
      orderBy: { registeredAt: 'desc' },
    });

    const employers: Employer[] = rows.map(e => ({
      id: e.id,
      name: e.name,
      inn: e.inn,
      region: e.region,
      city: e.city,
      contactName: e.contactName,
      email: e.user.email,
      phone: e.phone,
      status: e.status.toLowerCase() as Employer['status'],
      registeredAt: e.registeredAt.toISOString(),
      vacancyCount: e._count.vacancies,
    }));

    return NextResponse.json(employers);
  } catch (err) {
    console.error('[api/employers]', err);
    return NextResponse.json([], { status: 200 });
  }
}
