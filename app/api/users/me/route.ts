import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
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
        resumes: { select: { firstName: true, lastName: true, patronymic: true }, take: 1 },
        employer: { select: { contactName: true, phone: true } },
      },
    });
    if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const firstName = user.resumes[0]?.firstName ?? user.employer?.contactName?.split(' ')[1] ?? '';
    const lastName = user.resumes[0]?.lastName ?? user.employer?.contactName?.split(' ')[0] ?? '';
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

    const { phone, currentPassword, newPassword } = await req.json();

    if (session.role === 'EMPLOYER') {
      const emp = await db.employer.findUnique({ where: { userId: session.userId }, select: { id: true } });
      if (emp && phone !== undefined) {
        await db.employer.update({ where: { id: emp.id }, data: { phone } });
      }
    }

    if (currentPassword && newPassword) {
      if (String(newPassword).length < 6) {
        return NextResponse.json({ error: 'Минимум 6 символов' }, { status: 400 });
      }
      const user = await db.user.findUnique({ where: { id: session.userId }, select: { passwordHash: true } });
      if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
      const ok = await bcrypt.compare(String(currentPassword), user.passwordHash);
      if (!ok) return NextResponse.json({ error: 'Неверный текущий пароль' }, { status: 400 });
      const hash = await bcrypt.hash(String(newPassword), 10);
      await db.user.update({ where: { id: session.userId }, data: { passwordHash: hash } });
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/users/me PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
