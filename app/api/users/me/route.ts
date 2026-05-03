import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: {
        id: true,
        email: true,
        role: true,
        resume: { select: { firstName: true, lastName: true, patronymic: true } },
        employer: { select: { contactName: true, phone: true } },
      },
    });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const firstName = user.resume?.firstName ?? user.employer?.contactName?.split(' ')[1] ?? '';
    const lastName = user.resume?.lastName ?? user.employer?.contactName?.split(' ')[0] ?? '';
    const phone = user.employer?.phone ?? '';

    return NextResponse.json({ email: user.email, firstName, lastName, phone });
  } catch (err) {
    console.error('[api/users/me]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { phone } = await req.json();

    if (session.role === 'EMPLOYER') {
      const emp = await db.employer.findUnique({ where: { userId: session.userId }, select: { id: true } });
      if (emp && phone !== undefined) {
        await db.employer.update({ where: { id: emp.id }, data: { phone } });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/users/me PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
