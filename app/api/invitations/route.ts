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
