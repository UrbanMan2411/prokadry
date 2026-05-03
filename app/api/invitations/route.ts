import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Invitation } from '@/lib/types';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json([], { status: 200 });

    let where: Record<string, unknown> = {};

    if (session.role === 'EMPLOYER') {
      const emp = await db.employer.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      if (emp) {
        where = { vacancy: { employerId: emp.id } };
      }
    } else if (session.role === 'SEEKER') {
      const resume = await db.resume.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      if (resume) {
        where = { resumeId: resume.id };
      }
    }

    const rows = await db.invitation.findMany({
      where,
      include: {
        resume: { select: { firstName: true, lastName: true } },
        vacancy: {
          select: {
            title: true,
            employer: { select: { name: true } },
          },
        },
      },
      orderBy: { sentAt: 'desc' },
    });

    const invitations: Invitation[] = rows.map(i => ({
      id: i.id,
      resumeId: i.resumeId,
      vacancyId: i.vacancyId,
      candidateName: `${i.resume.firstName} ${i.resume.lastName}`.trim(),
      vacancyTitle: i.vacancy.title,
      employerName: i.vacancy.employer.name,
      message: i.message,
      status: i.status.toLowerCase() as Invitation['status'],
      createdAt: i.sentAt.toISOString(),
    }));

    return NextResponse.json(invitations);
  } catch (err) {
    console.error('[api/invitations]', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || (session.role !== 'EMPLOYER' && session.role !== 'SEEKER')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (session.role === 'SEEKER') {
      const resume = await db.resume.findUnique({
        where: { userId: session.userId },
        select: { id: true },
      });
      if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });

      const { vacancyId } = await req.json();
      if (!vacancyId) return NextResponse.json({ error: 'Missing vacancyId' }, { status: 400 });

      const vacancy = await db.vacancy.findUnique({
        where: { id: vacancyId },
        include: { employer: { select: { name: true } } },
      });
      if (!vacancy) return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });

      const row = await db.invitation.create({
        data: { resumeId: resume.id, vacancyId, message: 'Отклик соискателя', status: 'SENT' },
        include: {
          resume: { select: { firstName: true, lastName: true } },
          vacancy: { select: { title: true, employer: { select: { name: true } } } },
        },
      });

      const inv: Invitation = {
        id: row.id,
        resumeId: row.resumeId,
        vacancyId: row.vacancyId,
        candidateName: `${row.resume.firstName} ${row.resume.lastName}`.trim(),
        vacancyTitle: row.vacancy.title,
        employerName: row.vacancy.employer.name,
        message: row.message,
        status: row.status.toLowerCase() as Invitation['status'],
        createdAt: row.sentAt.toISOString(),
      };
      return NextResponse.json(inv, { status: 201 });
    }

    // EMPLOYER path
    const emp = await db.employer.findUnique({
      where: { userId: session.userId },
      select: { id: true },
    });
    if (!emp) return NextResponse.json({ error: 'Employer not found' }, { status: 404 });

    const { resumeId, vacancyId, message } = await req.json();
    if (!resumeId || !vacancyId || !message) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
    }

    const vacancy = await db.vacancy.findFirst({ where: { id: vacancyId, employerId: emp.id } });
    if (!vacancy) return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });

    const row = await db.invitation.create({
      data: { resumeId, vacancyId, message, status: 'SENT' },
      include: {
        resume: { select: { firstName: true, lastName: true } },
        vacancy: { select: { title: true, employer: { select: { name: true } } } },
      },
    });

    const invitation: Invitation = {
      id: row.id,
      resumeId: row.resumeId,
      vacancyId: row.vacancyId,
      candidateName: `${row.resume.firstName} ${row.resume.lastName}`.trim(),
      vacancyTitle: row.vacancy.title,
      employerName: row.vacancy.employer.name,
      message: row.message,
      status: row.status.toLowerCase() as Invitation['status'],
      createdAt: row.sentAt.toISOString(),
    };

    return NextResponse.json(invitation, { status: 201 });
  } catch (err: unknown) {
    if ((err as { code?: string }).code === 'P2002') {
      return NextResponse.json({ error: 'Invitation already exists' }, { status: 409 });
    }
    console.error('[api/invitations POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
