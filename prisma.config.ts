import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL?.trim() || process.env.TURSO_DATABASE_URL?.trim();

if (!databaseUrl && process.env.VERCEL_ENV === 'production') {
  throw new Error('DATABASE_URL or TURSO_DATABASE_URL is required in production');
}

export default defineConfig({
  schema: './prisma/schema.prisma',
  migrations: {
    seed: 'npx tsx ./prisma/seed.ts',
  },
  datasource: {
    url: databaseUrl || 'file:./dev.db',
  },
});
