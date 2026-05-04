import { db } from '@/lib/db';
import type { AuditAction } from '@prisma/client';

export function logAction(
  userId: string | null,
  action: AuditAction,
  entityType: string,
  entityId?: string,
  detail?: string,
): void {
  db.auditLog
    .create({ data: { userId, action, entityType, entityId: entityId ?? null, detail: detail ?? null } })
    .catch(err => console.error('[audit]', err));
}
