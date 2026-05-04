import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import type { Resume, WorkExperience, SpecialStatus, ResumeTest } from '@/lib/types';
import { logAction } from '@/lib/audit';

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
        activityAreas: { include: { dictItem: { select: { value: true, label: true, category: true } } } },
        tests: { include: { dictItem: { select: { value: true, label: true } } } },
        specialStatuses: { include: { dictItem: { select: { value: true, label: true } } } },
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
      educationInstitution: r.educationInstitution ?? '',
      educationYears: r.educationYears ?? '',
      workMode: r.workMode,
      activityAreas: r.activityAreas
        .filter(a => a.dictItem.category === 'ACTIVITY_AREA')
        .map(a => a.dictItem.label),
      skills: r.activityAreas
        .filter(a => a.dictItem.category === 'SKILL')
        .map(a => a.dictItem.value),
      purchaseTypes: r.activityAreas
        .filter(a => a.dictItem.category === 'PURCHASE_TYPE')
        .map(a => a.dictItem.value),
      tests: r.tests.map((t): ResumeTest => ({
        value: t.dictItem.value,
        label: t.dictItem.label,
        passedAt: t.passedAt?.toISOString() ?? null,
      })),
      specialStatuses: r.specialStatuses.map((s): SpecialStatus => ({
        value: s.dictItem.value,
        label: s.dictItem.label,
        confirmed: !!s.confirmedAt,
        docDate: s.docDate ?? '',
        docNumber: s.docNumber ?? '',
        documentRef: s.documentRef ?? '',
        disabilityGroup: s.disabilityGroup ?? '',
      })),
      birthDate: session.role === 'SEEKER' ? r.birthDate.toISOString().slice(0, 10) : undefined,
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
      rejectReason: session.role === 'SEEKER' ? (r.rejectReason ?? undefined) : undefined,
    }));

    return NextResponse.json(resumes);
  } catch (err) {
    console.error('[api/resumes]', err);
    return NextResponse.json([], { status: 200 });
  }
}

export async function POST(_req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const row = await db.resume.create({
      data: {
        userId: session.userId,
        firstName: '',
        lastName: '',
        gender: 'FEMALE',
        birthDate: new Date('2000-01-01'),
        city: '',
        region: '',
        position: '',
        experience: 0,
        education: 'Высшее',
        workMode: 'Офис',
        status: 'DRAFT',
      },
    });

    logAction(session.userId, 'RESUME_CREATED', 'Resume', row.id);
    return NextResponse.json({ id: row.id, status: 'draft' }, { status: 201 });
  } catch (err) {
    console.error('[api/resumes POST]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
