import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import fs from 'fs';
import path from 'path';

function normalizeDatabaseUrl(value: string | undefined) {
  return (value ?? 'file:./dev.db').trim();
}

function resolveWritableDatabaseUrl() {
  const dbUrl = normalizeDatabaseUrl(process.env.DATABASE_URL);

  if (!dbUrl.startsWith('file:') || dbUrl.includes('/tmp/')) {
    return dbUrl;
  }

  try {
    const src = path.resolve(process.cwd(), dbUrl.replace('file:', '').replace('./', '').trim());
    const dest = '/tmp/prokadry.db';

    if (fs.existsSync(src)) {
      if (!fs.existsSync(dest)) {
        fs.copyFileSync(src, dest);
        console.log('[db] Copied demo DB to /tmp/prokadry.db');
      }
      return 'file:/tmp/prokadry.db';
    }

    console.warn('[db] Source DB is missing, using configured DATABASE_URL as-is:', src);
    return dbUrl;
  } catch (error) {
    console.warn('[db] Falling back to configured DATABASE_URL:', error);
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
