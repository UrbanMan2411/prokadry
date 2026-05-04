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
            resumes: { select: { firstName: true, lastName: true }, take: 1 },
          },
        },
        recipient: {
          include: {
            employer: { select: { name: true } },
            resumes: { select: { firstName: true, lastName: true }, take: 1 },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 500,
    });

    function userName(u: {
      role: string;
      email: string;
      employer: { name: string } | null;
      resumes: { firstName: string; lastName: string }[];
    }) {
      if (u.role === 'EMPLOYER' && u.employer) return u.employer.name;
      if (u.resumes[0]) return `${u.resumes[0].firstName} ${u.resumes[0].lastName}`.trim();
      return u.email;
    }

    const messages: Message[] = rows.map(m => ({
      id: m.id,
      fromRole: m.sender.role === 'EMPLOYER' ? 'employer' : 'candidate',
      fromName: userName(m.sender),
      toName: userName(m.recipient),
      counterpartyUserId: m.sender.id === session.userId ? m.recipientId : m.senderId,
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

export async function POST(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { text, recipientUserId, resumeId } = body;
    if (!text || text.trim().length < 2) {
      return NextResponse.json({ error: 'Message too short' }, { status: 400 });
    }

    let targetUserId: string | null = recipientUserId ?? null;

    if (!targetUserId && resumeId) {
      const resume = await db.resume.findUnique({ where: { id: resumeId }, select: { userId: true } });
      targetUserId = resume?.userId ?? null;
    }

    if (!targetUserId) return NextResponse.json({ error: 'Recipient not found' }, { status: 400 });

    const msg = await db.message.create({
      data: {
        senderId: session.userId,
        recipientId: targetUserId,
        text: text.trim(),
      },
    });

    return NextResponse.json({ id: msg.id, createdAt: msg.createdAt }, { status: 201 });
  } catch (err) {
    console.error('[api/messages POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
