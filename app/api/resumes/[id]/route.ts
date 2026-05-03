import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();

    if (session.role === 'SEEKER') {
      const resume = await db.resume.findFirst({
        where: { id, userId: session.userId },
        select: { id: true, status: true },
      });
      if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const {
        firstName, lastName, patronymic, gender,
        position, city, salary, experience,
        education, educationInstitution, educationYears,
        workMode, about, status,
        workExperiences,
        specialStatuses,
        // all tag arrays stored in resumeActivityArea by dict category
        activityAreas,
        skills,
        purchaseTypes,
        tests,
      } = body;

      const data: Record<string, unknown> = {};
      if (firstName !== undefined) data.firstName = firstName;
      if (lastName !== undefined) data.lastName = lastName;
      if (patronymic !== undefined) data.patronymic = patronymic || null;
      if (gender !== undefined && ['MALE', 'FEMALE'].includes(String(gender).toUpperCase())) data.gender = String(gender).toUpperCase();
      if (position !== undefined) data.position = position;
      if (city !== undefined) data.city = city;
      if (salary !== undefined) data.salary = salary ? Number(salary) : null;
      if (experience !== undefined) data.experience = Number(experience) || 0;
      if (education !== undefined) data.education = education;
      if (educationInstitution !== undefined) data.educationInstitution = educationInstitution || null;
      if (educationYears !== undefined) data.educationYears = educationYears || null;
      if (workMode !== undefined) data.workMode = workMode;
      if (about !== undefined) data.about = about || null;
      if (status === 'PENDING') data.status = 'PENDING';
      else if (status === 'DRAFT') data.status = 'DRAFT';

      await db.resume.update({ where: { id }, data });

      // workExperiences — full replace
      if (Array.isArray(workExperiences)) {
        await db.workExperience.deleteMany({ where: { resumeId: id } });
        if (workExperiences.length > 0) {
          await db.workExperience.createMany({
            data: (workExperiences as Record<string, unknown>[]).map((w, idx) => ({
              resumeId: id,
              company: String(w.company ?? ''),
              role: String(w.role ?? ''),
              fromMonth: String(w.fromMonth ?? ''),
              toMonth: w.toMonth ? String(w.toMonth) : null,
              isCurrent: Boolean(w.isCurrent),
              description: w.description ? String(w.description) : null,
              sortOrder: idx,
            })),
          });
        }
      }

      // specialStatuses — full replace
      if (Array.isArray(specialStatuses)) {
        await db.resumeSpecialStatus.deleteMany({ where: { resumeId: id } });
        for (const s of specialStatuses as Record<string, unknown>[]) {
          const dictItem = await db.dictItem.findFirst({
            where: { category: 'SPECIAL_STATUS', value: String(s.value) },
            select: { id: true },
          });
          if (dictItem) {
            await db.resumeSpecialStatus.create({
              data: {
                resumeId: id,
                dictItemId: dictItem.id,
                docDate: s.docDate ? String(s.docDate) : null,
                docNumber: s.docNumber ? String(s.docNumber) : null,
                documentRef: s.documentRef ? String(s.documentRef) : null,
                disabilityGroup: s.disabilityGroup ? String(s.disabilityGroup) : null,
              },
            });
          }
        }
      }

      // tags (activityAreas + skills + purchaseTypes) — all in resumeActivityArea
      // replace only the categories that are explicitly sent
      const tagsByCat: Record<string, string[]> = {};
      if (Array.isArray(activityAreas)) tagsByCat['ACTIVITY_AREA'] = activityAreas as string[];
      if (Array.isArray(skills)) tagsByCat['SKILL'] = skills as string[];
      if (Array.isArray(purchaseTypes)) tagsByCat['PURCHASE_TYPE'] = purchaseTypes as string[];

      for (const [cat, values] of Object.entries(tagsByCat)) {
        // get all dictItem ids for this category
        const existing = await db.resumeActivityArea.findMany({
          where: { resumeId: id, dictItem: { category: cat as never } },
          select: { dictItemId: true },
        });
        await db.resumeActivityArea.deleteMany({
          where: { resumeId: id, dictItemId: { in: existing.map(e => e.dictItemId) } },
        });
        for (const value of values) {
          const dictItem = await db.dictItem.findFirst({
            where: { category: cat as never, value },
            select: { id: true },
          });
          if (dictItem) {
            await db.resumeActivityArea.create({ data: { resumeId: id, dictItemId: dictItem.id } }).catch(() => {});
          }
        }
      }

      // tests — full replace
      if (Array.isArray(tests)) {
        await db.resumeTest.deleteMany({ where: { resumeId: id } });
        for (const t of tests as { value: string; passedAt?: string }[]) {
          const dictItem = await db.dictItem.findFirst({
            where: { category: 'TEST', value: t.value },
            select: { id: true },
          });
          if (dictItem) {
            await db.resumeTest.create({
              data: {
                resumeId: id,
                dictItemId: dictItem.id,
                passedAt: t.passedAt ? new Date(t.passedAt) : null,
              },
            }).catch(() => {});
          }
        }
      }

      const updated = await db.resume.findUnique({ where: { id }, select: { id: true, status: true } });
      return NextResponse.json({ id, status: updated!.status.toLowerCase() });
    }

    if (session.role === 'ADMIN') {
      const existing = await db.resume.findUnique({ where: { id }, select: { id: true } });
      if (!existing) return NextResponse.json({ error: 'Not found' }, { status: 404 });

      const { status, rejectReason } = body;
      const dbStatus = String(status).toUpperCase();
      if (!['ACTIVE', 'REJECTED', 'DRAFT', 'ARCHIVED', 'PENDING'].includes(dbStatus)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
      }

      const data: Record<string, unknown> = { status: dbStatus };
      if (rejectReason !== undefined) data.rejectReason = rejectReason || null;
      if (dbStatus === 'ACTIVE') data.publishedAt = new Date();

      const updated = await db.resume.update({ where: { id }, data });
      return NextResponse.json({ id: updated.id, status: updated.status.toLowerCase() });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (err) {
    console.error('[api/resumes/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
