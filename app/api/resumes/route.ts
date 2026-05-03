import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Resume, WorkExperience } from '@/lib/types';

function calcAge(birthDate: Date): number {
  const now = new Date();
  let age = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) age--;
  return age;
}

export async function GET(_req: NextRequest) {
  try {
    const session = await getSession();

    // Unauthenticated — no access
    if (!session) return NextResponse.json([], { status: 200 });

    let employerId: string | null = null;
    let resumeWhere: Record<string, unknown> = {};

    if (session.role === 'SEEKER') {
      // Seeker sees only their own resume (any status)
      resumeWhere = { userId: session.userId };
    } else if (session.role === 'ADMIN') {
      resumeWhere = { status: { in: ['ACTIVE', 'PENDING', 'DRAFT'] } };
    } else if (session.role === 'EMPLOYER') {
      const emp = await db.employer.findUnique({
        where: { userId: session.userId },
        select: { id: true, status: true },
      });
      // PENDING employer can't see candidate data yet
      if (!emp || emp.status !== 'APPROVED') {
        return NextResponse.json([], { status: 200 });
      }
      employerId = emp.id;
      resumeWhere = { status: { in: ['ACTIVE', 'PENDING'] } };
    } else {
      return NextResponse.json([], { status: 200 });
    }

    const isAdmin = session.role === 'ADMIN';

    const rows = await db.resume.findMany({
      where: resumeWhere,
      include: {
        workExperiences: { orderBy: { sortOrder: 'asc' } },
        activityAreas: { include: { dictItem: true } },
        tests: { include: { dictItem: true } },
        specialStatuses: { include: { dictItem: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });

    const favoriteSet = new Set<string>();
    if (employerId) {
      const favs = await db.favorite.findMany({
        where: { employerId },
        select: { resumeId: true },
      });
      favs.forEach(f => favoriteSet.add(f.resumeId));
    }

    const resumes: Resume[] = rows.map(r => ({
      id: r.id,
      firstName: r.firstName,
      lastName: r.lastName,
      patronymic: r.patronymic ?? '',
      fullName: [r.lastName, r.firstName, r.patronymic ?? ''].filter(Boolean).join(' '),
      gender: r.gender.toLowerCase() as 'male' | 'female',
      age: calcAge(r.birthDate),
      city: r.city,
      region: r.region,
      position: r.position,
      salary: r.salary,
      experience: r.experience,
      education: r.education,
      workMode: r.workMode,
      activityAreas: r.activityAreas.map(a => a.dictItem.label),
      tests: r.tests.map(t => t.dictItem.label),
      specialStatuses: r.specialStatuses.map(s => s.dictItem.label),
      hasPhoto: r.hasPhoto,
      photo: r.photoUrl,
      publishedAt: (r.publishedAt ?? r.createdAt).toISOString(),
      about: r.about ?? '',
      workExperiences: r.workExperiences.map((w): WorkExperience => ({
        id: w.id,
        company: w.company,
        role: w.role,
        from: w.fromMonth,
        to: w.toMonth ?? 'по настоящее время',
        description: w.description ?? '',
      })),
      isFavorite: favoriteSet.has(r.id),
      status: r.status.toLowerCase() as Resume['status'],
    }));

    return NextResponse.json(resumes);
  } catch (err) {
    console.error('[api/resumes]', err);
    return NextResponse.json([], { status: 200 });
  }
}
