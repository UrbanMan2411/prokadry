/**
 * Deletes all ghost / seeded users and their resumes.
 * Ghost emails match:  seed.*@prokadry.local  OR  *.import@prokadry.local
 */
import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';
import os from 'os';
import { config } from 'dotenv';

config({ path: path.resolve(process.cwd(), '.env.local') });

function resolveDb(): string {
  const raw = (process.env.DATABASE_URL ?? 'file:./dev.db').trim();
  if (!raw.startsWith('file:')) return raw;
  const src = path.resolve(process.cwd(), raw.replace(/^file:/, '').replace(/^\.\//, ''));
  const tmp = path.join(os.tmpdir(), 'prokadry.db');
  if (fs.existsSync(src) && !fs.existsSync(tmp)) fs.copyFileSync(src, tmp);
  if (fs.existsSync(tmp)) return `file:${tmp}`;
  return raw;
}

async function main() {
  const adapter = new PrismaLibSql({ url: resolveDb() });
  const db = new PrismaClient({ adapter });

  const ghostUsers = await db.user.findMany({
    where: {
      OR: [
        { email: { contains: '@prokadry.local' } },
        { email: { contains: '@import.prokadry.local' } },
      ],
    },
    select: { id: true, email: true },
  });

  console.log(`Found ${ghostUsers.length} ghost users to delete`);
  if (ghostUsers.length === 0) {
    console.log('Nothing to clear.');
    process.exit(0);
  }

  const ids = ghostUsers.map(u => u.id);

  const { count: resumeCount } = await db.resume.deleteMany({ where: { userId: { in: ids } } });
  const { count: userCount } = await db.user.deleteMany({ where: { id: { in: ids } } });

  console.log(`Deleted ${resumeCount} resumes, ${userCount} users`);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
