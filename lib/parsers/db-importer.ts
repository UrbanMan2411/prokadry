import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import type { ParsedResumeForDB } from './hh';

let _ghostHash: string | null = null;
async function ghostHash(): Promise<string> {
  if (!_ghostHash) _ghostHash = await bcrypt.hash('prokadry-ghost-not-for-login', 4);
  return _ghostHash;
}

export type ImportResult = {
  sourceId: string;
  status: 'created' | 'skipped' | 'error';
  resumeId?: string;
  reason?: string;
};

export async function importResumeToDb(r: ParsedResumeForDB): Promise<ImportResult> {
  const email = `${r.source}.${r.sourceId}@import.prokadry.local`;

  try {
    // Dedup by import email
    const existing = await db.user.findUnique({ where: { email }, select: { resumes: { select: { id: true }, take: 1 } } });
    if (existing?.resumes[0]) {
      return { sourceId: r.sourceId, status: 'skipped', resumeId: existing.resumes[0].id };
    }

    const hash = await ghostHash();

    const user = await db.user.upsert({
      where: { email },
      create: { email, passwordHash: hash, role: 'SEEKER', isActive: true },
      update: {},
    });

    const resume = await db.resume.create({
      data: {
        userId: user.id,
        firstName: r.firstName.slice(0, 100),
        lastName: r.lastName.slice(0, 100),
        patronymic: r.patronymic ?? null,
        gender: r.gender,
        birthDate: r.birthDate,
        city: r.city.slice(0, 100),
        region: r.region.slice(0, 100),
        position: r.position.slice(0, 200),
        salary: r.salaryFrom ?? null,
        experience: r.experienceYears,
        education: r.education,
        workMode: r.workMode,
        about: `[Импортировано с ${r.source === 'hh' ? 'hh.ru' : 'Avito'}]\n\n${r.about}`.slice(0, 5000),
        status: 'ACTIVE',
        publishedAt: new Date(),
        workExperiences: r.workExperiences.length > 0
          ? {
              create: r.workExperiences.map((w, i) => ({
                company: w.company.slice(0, 200),
                role: w.role.slice(0, 200),
                fromMonth: w.fromMonth,
                toMonth: w.toMonth ?? null,
                isCurrent: w.isCurrent,
                description: w.description?.slice(0, 2000) ?? null,
                sortOrder: i,
              })),
            }
          : undefined,
      },
    });

    return { sourceId: r.sourceId, status: 'created', resumeId: resume.id };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return { sourceId: r.sourceId, status: 'error', reason: msg };
  }
}

export async function bulkImport(
  items: ParsedResumeForDB[],
  onProgress?: (done: number, total: number) => void,
): Promise<{ created: number; skipped: number; errors: number; results: ImportResult[] }> {
  const results: ImportResult[] = [];
  for (let i = 0; i < items.length; i++) {
    const r = await importResumeToDb(items[i]);
    results.push(r);
    onProgress?.(i + 1, items.length);
  }
  return {
    created: results.filter(r => r.status === 'created').length,
    skipped: results.filter(r => r.status === 'skipped').length,
    errors: results.filter(r => r.status === 'error').length,
    results,
  };
}
