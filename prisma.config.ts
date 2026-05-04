import { defineConfig } from '@prisma/config';

const databaseUrl = process.env.DATABASE_URL?.trim();

if (!databaseUrl && process.env.NODE_ENV === 'production') {
  throw new Error('DATABASE_URL is required in production');
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
