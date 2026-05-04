import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';
import os from 'os';

function shouldRequireProductionDatabaseUrl() {
  return process.env.VERCEL_ENV === 'production';
}

function getDatabaseUrl() {
  const dbUrl = process.env.DATABASE_URL?.trim() || process.env.TURSO_DATABASE_URL?.trim();

  if (dbUrl) return dbUrl;

  if (shouldRequireProductionDatabaseUrl()) {
    throw new Error('DATABASE_URL or TURSO_DATABASE_URL is required in production');
  }

  return 'file:./dev.db';
}

function resolveWritableDatabaseUrl() {
  const dbUrl = getDatabaseUrl();

  if (!dbUrl.startsWith('file:')) return dbUrl;

  const filePath = dbUrl.replace(/^file:/, '');

  // Absolute path (production VPS): use directly — no copy needed
  if (path.isAbsolute(filePath)) return dbUrl;

  // Relative path: copy to /tmp for read-only environments (Vercel)
  const tmpDb = path.join(os.tmpdir(), 'prokadry.db');
  if (dbUrl.includes(tmpDb.replace(/\\/g, '/'))) return dbUrl;

  try {
    const src = path.resolve(process.cwd(), filePath.replace(/^\.\//, ''));

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
  const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
  const adapter = new PrismaLibSql({
    url: resolveWritableDatabaseUrl(),
    ...(authToken ? { authToken } : {}),
  });
  return new PrismaClient({ adapter });
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db = globalForPrisma.prisma ?? createPrisma();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;
