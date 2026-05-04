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
      const resumes = await db.resume.findMany({
        where: { userId: session.userId },
        select: { id: true },
      });
      if (resumes.length > 0) {
        where = { resumeId: { in: resumes.map(r => r.id) } };
      }
    }

    const rows = await db.invitation.findMany({
      where,
      include: {
        resume: { select: { firstName: true, lastName: true } },
        vacancy: {
          select: {
            title: true,
            employer: { select: { id: true, name: true } },
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
      employerId: i.vacancy.employer.id,
      message: i.message,
      status: i.status.toLowerCase() as Invitation['status'],
      createdAt: i.sentAt.toISOString(),
      fromSeeker: i.message === 'Отклик соискателя',
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
      const { vacancyId, resumeId: reqResumeId } = await req.json();
      const resume = reqResumeId
        ? await db.resume.findFirst({ where: { id: reqResumeId, userId: session.userId }, select: { id: true } })
        : await db.resume.findFirst({ where: { userId: session.userId, status: 'ACTIVE' }, select: { id: true } })
          ?? await db.resume.findFirst({ where: { userId: session.userId }, select: { id: true } });
      if (!resume) return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      if (!vacancyId) return NextResponse.json({ error: 'Missing vacancyId' }, { status: 400 });

      const vacancy = await db.vacancy.findUnique({
        where: { id: vacancyId },
        include: { employer: { select: { name: true, userId: true } } },
      });
      if (!vacancy) return NextResponse.json({ error: 'Vacancy not found' }, { status: 404 });

      // Allow re-apply if previous invitation was rejected
      const existingInv = await db.invitation.findFirst({
        where: { resumeId: resume.id, vacancyId },
        select: { id: true, status: true },
      });
      if (existingInv && existingInv.status !== 'REJECTED') {
        return NextResponse.json({ error: 'Invitation already exists' }, { status: 409 });
      }
      if (existingInv) {
        await db.invitation.delete({ where: { id: existingInv.id } });
      }

      const row = await db.invitation.create({
        data: { resumeId: resume.id, vacancyId, message: 'Отклик соискателя', status: 'SENT' },
        include: {
          resume: { select: { firstName: true, lastName: true } },
          vacancy: { select: { title: true, employer: { select: { id: true, name: true } } } },
        },
      });

      // Auto-start chat: seeker → employer
      if (vacancy.employer.userId) {
        await db.message.create({
          data: {
            senderId: session.userId,
            recipientId: vacancy.employer.userId,
            text: `Здравствуйте! Меня заинтересовала ваша вакансия «${vacancy.title}».`,
          },
        }).catch(() => {});
      }

      const inv: Invitation = {
        id: row.id,
        resumeId: row.resumeId,
        vacancyId: row.vacancyId,
        candidateName: `${row.resume.firstName} ${row.resume.lastName}`.trim(),
        vacancyTitle: row.vacancy.title,
        employerName: row.vacancy.employer.name,
        employerId: row.vacancy.employer.id,
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
        resume: { select: { firstName: true, lastName: true, userId: true } },
        vacancy: { select: { title: true, employer: { select: { id: true, name: true } } } },
      },
    });

    // Auto-start chat: employer → seeker
    await db.message.create({
      data: { senderId: session.userId, recipientId: row.resume.userId, text: message },
    }).catch(() => {});

    const invitation: Invitation = {
      id: row.id,
      resumeId: row.resumeId,
      vacancyId: row.vacancyId,
      candidateName: `${row.resume.firstName} ${row.resume.lastName}`.trim(),
      vacancyTitle: row.vacancy.title,
      employerName: row.vacancy.employer.name,
      employerId: row.vacancy.employer.id,
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
