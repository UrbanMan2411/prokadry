import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';
import { logAction } from '@/lib/audit';

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
        firstName, lastName, patronymic, gender, birthDate,
        photoUrl,
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
      if (birthDate !== undefined && birthDate) { const d = new Date(birthDate); if (!isNaN(d.getTime())) data.birthDate = d; }
      if (photoUrl !== undefined) { data.photoUrl = photoUrl || null; data.hasPhoto = !!photoUrl; }
      if (position !== undefined) data.position = position;
      if (city !== undefined) data.city = city;
      if (salary !== undefined) data.salary = salary ? Number(salary) : null;
      if (experience !== undefined) data.experience = Number(experience) || 0;
      if (education !== undefined) data.education = education;
      if (educationInstitution !== undefined) data.educationInstitution = educationInstitution || null;
      if (educationYears !== undefined) data.educationYears = educationYears || null;
      if (workMode !== undefined) data.workMode = workMode;
      if (about !== undefined) data.about = about || null;
      if (status === 'ACTIVE') { data.status = 'ACTIVE'; data.publishedAt = new Date(); }
      else if (status === 'DRAFT') data.status = 'DRAFT';

      const updatedResume = await db.resume.update({ where: { id }, data, select: { position: true, city: true, salary: true, workMode: true } });

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
      const responseStatus = updated!.status.toLowerCase();

      // When published, return matching vacancies
      if (responseStatus === 'active') {
        const allVacancies = await db.vacancy.findMany({
          where: { status: 'ACTIVE' },
          include: { employer: { select: { name: true } } },
          take: 50,
        });
        const r = updatedResume;
        const posWords = r.position.toLowerCase().split(/\s+/).filter(w => w.length > 3);
        const scored = allVacancies.map(v => {
          let score = 0;
          if (v.city === r.city) score += 2;
          if (v.workMode === r.workMode) score += 1;
          if (r.salary && v.salaryTo && v.salaryTo >= r.salary) score += 1;
          if (r.salary && v.salaryFrom && v.salaryFrom <= r.salary) score += 1;
          const titleWords = v.title.toLowerCase();
          for (const w of posWords) if (titleWords.includes(w)) score += 2;
          return { score, v };
        }).filter(x => x.score > 0).sort((a, b) => b.score - a.score).slice(0, 6);

        const matchedVacancies = scored.map(({ v }) => ({
          id: v.id, title: v.title, employerName: v.employer.name,
          city: v.city, workMode: v.workMode,
          salaryFrom: v.salaryFrom, salaryTo: v.salaryTo,
        }));
        return NextResponse.json({ id, status: responseStatus, matchedVacancies });
      }

      return NextResponse.json({ id, status: responseStatus });
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

      const existing2 = await db.resume.findUnique({ where: { id }, select: { firstName: true, lastName: true } });
      const updated = await db.resume.update({ where: { id }, data });
      const resumeName = existing2 ? `${existing2.lastName} ${existing2.firstName}` : id;
      const actionMap: Record<string, 'RESUME_APPROVED' | 'RESUME_REJECTED' | 'RESUME_ARCHIVED'> = {
        ACTIVE: 'RESUME_APPROVED',
        REJECTED: 'RESUME_REJECTED',
        ARCHIVED: 'RESUME_ARCHIVED',
      };
      if (actionMap[dbStatus]) {
        logAction(session.userId, actionMap[dbStatus], 'Resume', id, resumeName);
      }
      return NextResponse.json({ id: updated.id, status: updated.status.toLowerCase() });
    }

    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  } catch (err) {
    console.error('[api/resumes/[id] PATCH]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const session = await getSession();
    if (!session || session.role !== 'SEEKER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const resume = await db.resume.findFirst({
      where: { id, userId: session.userId },
      select: { id: true, status: true },
    });
    if (!resume) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    if (resume.status === 'ACTIVE') {
      return NextResponse.json({ error: 'Нельзя удалить активное резюме. Сначала снимите с публикации.' }, { status: 409 });
    }
    await db.resume.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[api/resumes/[id] DELETE]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
