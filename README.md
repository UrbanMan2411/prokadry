# ПРОкадры

Специализированная HR-платформа для поиска специалистов в сфере закупок, 44-ФЗ, 223-ФЗ и тендерного сопровождения.

## Что внутри

- Лендинг продукта: `app/page.tsx`, `components/landing.tsx`.
- Авторизация и регистрация: `app/auth/page.tsx`, `app/actions/auth.ts`.
- Личный кабинет: `app/dashboard/page.tsx`, `app/dashboard/_app.tsx`.
- Роли: работодатель, соискатель, администратор.
- Демо-данные интерфейса: `lib/mock-data.ts`.
- Prisma-схема и seed: `prisma/schema.prisma`, `prisma/seed.ts`.

## Стек

- Next.js `16.2.4`
- React `19.2.4`
- TypeScript
- Tailwind CSS `4`
- Prisma `7`
- SQLite/libsql для локального demo DB
- JWT-cookie сессии через `jose`

## Быстрый старт

```bash
npm ci
copy .env.example .env.local
npm run db:generate
npm run dev
```

Откройте `http://localhost:3000`.

## Демо-аккаунты

После seed доступны:

```text
admin@prokadry.ru / admin123
employer@demo.ru  / demo123
seeker@demo.ru    / demo123
```

Если нужно пересоздать demo DB:

```bash
npm run db:migrate
npm run db:seed
```

## Переменные окружения

Скопируйте `.env.example` в `.env.local` и заполните значения.

Минимум для локальной разработки:

```env
DATABASE_URL=file:./dev.db
SESSION_SECRET=replace-with-local-secret-at-least-32-chars
```

AI-ключи нужны только для функций, которые реально обращаются к внешним моделям.

## Проверки

```bash
npm run typecheck
npm run build
npm run lint
```

Для быстрой проверки перед PR:

```bash
npm run verify
```

Сейчас `lint` может падать на известных местах React Hooks/React Compiler. Список см. в `docs/known-issues.md`.

## Важные договорённости

- Не коммитить `.env.local`, локальные скриншоты, HTML-экспорты и HyperFrames-артефакты.
- Не менять `dev.db` без явной причины: файл содержит demo DB и легко меняется при локальных прогонах.
- Перед изменениями в Next.js 16 читать релевантный документ из `node_modules/next/dist/docs/`.
- Для новой логики доступа проверять права на сервере, а не только в клиентском UI.

## Документы для команды

- `CONTRIBUTING.md` — процесс совместной работы.
- `docs/known-issues.md` — текущие технические риски и ближайшие задачи.
- `AGENTS.md` — правила для AI-агентов в этом проекте.
