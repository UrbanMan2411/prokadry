import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/session';

const ACTION_LABELS: Record<string, string> = {
  RESUME_CREATED: 'Резюме создано',
  RESUME_UPDATED: 'Резюме обновлено',
  RESUME_SUBMITTED: 'Резюме подано',
  RESUME_APPROVED: 'Резюме одобрено',
  RESUME_REJECTED: 'Резюме отклонено',
  RESUME_ARCHIVED: 'Резюме архивировано',
  EMPLOYER_REGISTERED: 'Работодатель зарегистрирован',
  EMPLOYER_APPROVED: 'Работодатель одобрен',
  EMPLOYER_SUSPENDED: 'Работодатель заблокирован',
  VACANCY_CREATED: 'Вакансия создана',
  VACANCY_UPDATED: 'Вакансия обновлена',
  VACANCY_ARCHIVED: 'Вакансия архивирована',
  INVITATION_SENT: 'Приглашение отправлено',
  INVITATION_WITHDRAWN: 'Приглашение отозвано',
  FAVORITE_ADDED: 'Добавлено в избранное',
  FAVORITE_REMOVED: 'Удалено из избранного',
  MESSAGE_SENT: 'Сообщение отправлено',
  USER_LOGIN: 'Вход в систему',
  USER_LOGOUT: 'Выход из системы',
  USER_PASSWORD_CHANGED: 'Пароль изменён',
  DICT_ITEM_CREATED: 'Справочник: добавлено',
  DICT_ITEM_UPDATED: 'Справочник: обновлено',
  DICT_ITEM_DISABLED: 'Справочник: отключено',
  USER_BLOCKED: 'Пользователь заблокирован',
  USER_UNBLOCKED: 'Пользователь разблокирован',
};

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'Администратор',
  EMPLOYER: 'Работодатель',
  SEEKER: 'Соискатель',
};

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: { user: { select: { email: true, role: true } } },
    });

    const result = logs.map(l => ({
      id: l.id,
      action: ACTION_LABELS[l.action] ?? l.action,
      user: l.user?.email ?? '(система)',
      role: ROLE_LABELS[l.user?.role ?? ''] ?? (l.user?.role ?? ''),
      timestamp: l.createdAt.toISOString(),
      details: [l.entityType, l.entityId, l.detail].filter(Boolean).join(' · '),
    }));

    return NextResponse.json(result);
  } catch (err) {
    console.error('[api/admin/logs GET]', err);
    return NextResponse.json({ error: 'Internal error' }, { status: 500 });
  }
}
