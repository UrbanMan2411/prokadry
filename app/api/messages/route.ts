import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Message } from '@/lib/types';

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json([], { status: 200 });

    const rows = await db.message.findMany({
      where: {
        OR: [{ senderId: session.userId }, { recipientId: session.userId }],
      },
      include: {
        sender: {
          include: {
            employer: { select: { name: true } },
            resume: { select: { firstName: true, lastName: true } },
          },
        },
        recipient: {
          include: {
            employer: { select: { name: true } },
            resume: { select: { firstName: true, lastName: true } },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    function userName(u: {
      role: string;
      email: string;
      employer: { name: string } | null;
      resume: { firstName: string; lastName: string } | null;
    }) {
      if (u.role === 'EMPLOYER' && u.employer) return u.employer.name;
      if (u.resume) return `${u.resume.firstName} ${u.resume.lastName}`.trim();
      return u.email;
    }

    const messages: Message[] = rows.map(m => ({
      id: m.id,
      fromRole: m.sender.role === 'EMPLOYER' ? 'employer' : 'candidate',
      fromName: userName(m.sender),
      toName: userName(m.recipient),
      text: m.text,
      createdAt: m.createdAt.toISOString(),
      isRead: m.isRead,
    }));

    return NextResponse.json(messages);
  } catch (err) {
    console.error('[api/messages]', err);
    return NextResponse.json([], { status: 200 });
  }
}
