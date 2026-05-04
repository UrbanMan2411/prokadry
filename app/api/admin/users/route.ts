import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAction } from '@/lib/audit';

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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { email, password, name, inn, region, city, contactName, phone } = await req.json();
    if (!email || !password || !name || !inn || !region || !city || !contactName || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    if (password.length < 6) {
      return NextResponse.json({ error: 'Пароль минимум 6 символов' }, { status: 400 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        email: email.trim().toLowerCase(),
        passwordHash,
        role: 'EMPLOYER',
        employer: {
          create: {
            name: name.trim(),
            inn: inn.trim(),
            region: region.trim(),
            city: city.trim(),
            contactName: contactName.trim(),
            phone: phone.trim(),
            status: 'APPROVED',
            approvedById: session.userId,
            approvedAt: new Date(),
          },
        },
      },
      select: { id: true, email: true },
    });

    logAction(session.userId, 'EMPLOYER_REGISTERED_BY_ADMIN', 'Employer', user.id, `${name} (${email})`);
    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Email или ИНН уже зарегистрированы' }, { status: 409 });
    }
    console.error('[api/admin/users POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
