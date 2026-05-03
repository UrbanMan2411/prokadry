import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emp = await db.employer.findUnique({
      where: { userId: session.userId },
      include: { user: { select: { email: true } } },
    });
    if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    return NextResponse.json({
      id: emp.id,
      name: emp.name,
      inn: emp.inn,
      ogrn: emp.ogrn ?? '',
      region: emp.region,
      city: emp.city,
      address: emp.address ?? '',
      contactName: emp.contactName,
      email: emp.user.email,
      phone: emp.phone,
      website: emp.website ?? '',
      description: emp.description ?? '',
      status: emp.status.toLowerCase(),
    });
  } catch (err) {
    console.error('[api/employers/me GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'EMPLOYER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const emp = await db.employer.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!emp) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const { name, ogrn, region, city, address, contactName, phone, website, description } = await req.json();

    const data: Record<string, unknown> = {};
    if (name !== undefined) data.name = name;
    if (ogrn !== undefined) data.ogrn = ogrn || null;
    if (region !== undefined) data.region = region;
    if (city !== undefined) data.city = city;
    if (address !== undefined) data.address = address || null;
    if (contactName !== undefined) data.contactName = contactName;
    if (phone !== undefined) data.phone = phone;
    if (website !== undefined) data.website = website || null;
    if (description !== undefined) data.description = description || null;

    await db.employer.update({ where: { id: emp.id }, data });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/employers/me PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
