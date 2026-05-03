import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';
import os from 'os';

function normalizeDatabaseUrl(value: string | undefined) {
  return (value ?? 'file:./dev.db').trim();
}

function resolveWritableDatabaseUrl() {
  const dbUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

  if (!dbUrl.startsWith('file:')) return dbUrl;

  const tmpDb = path.join(os.tmpdir(), 'prokadry.db');
  if (dbUrl.includes(tmpDb.replace(/\\/g, '/'))) return dbUrl;

  try {
    const src = path.resolve(process.cwd(), dbUrl.replace(/^file:/, '').replace(/^\.\//, ''));

    if (fs.existsSync(src)) {
      const srcMtime = fs.statSync(src).mtimeMs;
      const tmpMtime = fs.existsSync(tmpDb) ? fs.statSync(tmpDb).mtimeMs : 0;
      if (tmpMtime < srcMtime) {
        fs.copyFileSync(src, tmpDb);
        console.log('[db] Copied/refreshed DB to', tmpDb);
      }
      return `file:${tmpDb}`;
    }

    return dbUrl;
  } catch {
    return dbUrl;
  }
}

function createPrisma() {
  const adapter = new PrismaLibSql({ url: resolveWritableDatabaseUrl() });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
