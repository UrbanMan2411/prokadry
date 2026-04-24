// Runs once on server startup (Next.js instrumentation hook).
// On Vercel the project root is read-only; copy the bundled demo DB to /tmp
// so @libsql/client can open it read-write (needed for lastLoginAt updates etc.)

import path from 'path';

export async function register() {
  if (process.env.NODE_ENV !== 'production') return;

  const dbUrl = process.env.DATABASE_URL ?? '';
  // Only act on file: URLs that point to the project root (not already /tmp)
  if (!dbUrl.startsWith('file:') || dbUrl.includes('/tmp/')) return;

  try {
    const fs = await import('fs');
    const src = path.resolve(process.cwd(), dbUrl.replace('file:', '').replace('./', ''));
    const dest = '/tmp/prokadry.db';

    if (!fs.existsSync(dest)) {
      fs.copyFileSync(src, dest);
      console.log('[instrumentation] Copied demo DB to /tmp/prokadry.db');
    }

    // Patch the env var so lib/db.ts picks up the writable copy
    process.env.DATABASE_URL = 'file:/tmp/prokadry.db';
  } catch (e) {
    console.warn('[instrumentation] DB copy skipped:', e);
  }
}
