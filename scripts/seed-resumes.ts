/**
 * Seed the database with synthetic procurement specialist resumes.
 * Run: npx tsx scripts/seed-resumes.ts [count]
 * Default count: 250
 */

import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// ── DB connection ─────────────────────────────────────────────────────────────

function loadEnv() {
  const envPath = path.resolve(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const val = trimmed.slice(eq + 1).trim();
    if (!(key in process.env)) process.env[key] = val;
  }
}

loadEnv();

function buildDbUrl(): string {
  const raw = (process.env.DATABASE_URL ?? 'file:./dev.db').trim();
  if (!raw.startsWith('file:')) return raw;
  const rel = raw.replace(/^file:/, '').replace(/^\.\//, '');
  return `file:${path.resolve(process.cwd(), rel)}`;
}

const adapter = new PrismaLibSql({ url: buildDbUrl() });
const db = new PrismaClient({ adapter } as never);

// ── Data pools ────────────────────────────────────────────────────────────────

const MALE_FIRST = [
  'Александр', 'Дмитрий', 'Сергей', 'Андрей', 'Алексей',
  'Максим', 'Михаил', 'Евгений', 'Иван', 'Виктор',
  'Никита', 'Павел', 'Роман', 'Денис', 'Антон',
  'Артём', 'Кирилл', 'Владислав', 'Игорь', 'Олег',
  'Вадим', 'Константин', 'Григорий', 'Валентин', 'Юрий',
];

const FEMALE_FIRST = [
  'Анна', 'Мария', 'Ольга', 'Екатерина', 'Наталья',
  'Татьяна', 'Елена', 'Людмила', 'Светлана', 'Юлия',
  'Ирина', 'Виктория', 'Дарья', 'Алина', 'Полина',
  'Кристина', 'Анастасия', 'Марина', 'Вероника', 'Оксана',
  'Валентина', 'Галина', 'Надежда', 'Тамара', 'Зинаида',
];

const MALE_LAST = [
  'Иванов', 'Петров', 'Сидоров', 'Смирнов', 'Кузнецов',
  'Попов', 'Лебедев', 'Козлов', 'Новиков', 'Морозов',
  'Волков', 'Соколов', 'Зайцев', 'Орлов', 'Макаров',
  'Медведев', 'Фёдоров', 'Николаев', 'Степанов', 'Захаров',
  'Громов', 'Киселёв', 'Фролов', 'Тихонов', 'Беляев',
  'Давыдов', 'Комаров', 'Воронов', 'Алексеев', 'Борисов',
];

const FEMALE_LAST = [
  'Иванова', 'Петрова', 'Сидорова', 'Смирнова', 'Кузнецова',
  'Попова', 'Лебедева', 'Козлова', 'Новикова', 'Морозова',
  'Волкова', 'Соколова', 'Зайцева', 'Орлова', 'Макарова',
  'Медведева', 'Фёдорова', 'Николаева', 'Степанова', 'Захарова',
  'Громова', 'Киселёва', 'Фролова', 'Тихонова', 'Беляева',
  'Давыдова', 'Комарова', 'Воронова', 'Алексеева', 'Борисова',
];

const MALE_PATRONYMIC = [
  'Александрович', 'Дмитриевич', 'Сергеевич', 'Андреевич', 'Алексеевич',
  'Максимович', 'Михайлович', 'Евгеньевич', 'Иванович', 'Викторович',
  'Николаевич', 'Павлович', 'Романович', 'Константинович', 'Юрьевич',
];

const FEMALE_PATRONYMIC = [
  'Александровна', 'Дмитриевна', 'Сергеевна', 'Андреевна', 'Алексеевна',
  'Максимовна', 'Михайловна', 'Евгеньевна', 'Ивановна', 'Викторовна',
  'Николаевна', 'Павловна', 'Романовна', 'Константиновна', 'Юрьевна',
];

const POSITIONS = [
  'Специалист по закупкам',
  'Менеджер по закупкам',
  'Ведущий специалист по закупкам',
  'Начальник отдела закупок',
  'Экономист по закупкам',
  'Руководитель отдела снабжения',
  'Специалист контрактной службы',
  'Контрактный управляющий',
  'Специалист по тендерам',
  'Менеджер по государственным закупкам',
  'Специалист по 44-ФЗ',
  'Специалист по 223-ФЗ',
  'Главный специалист по закупкам',
  'Старший менеджер по закупкам',
  'Заместитель начальника отдела закупок',
  'Специалист по снабжению',
  'Категорийный менеджер',
  'Менеджер по стратегическим закупкам',
];

const CITIES: { city: string; region: string }[] = [
  { city: 'Москва', region: 'Москва' },
  { city: 'Москва', region: 'Москва' },
  { city: 'Москва', region: 'Москва' },
  { city: 'Санкт-Петербург', region: 'Санкт-Петербург' },
  { city: 'Санкт-Петербург', region: 'Санкт-Петербург' },
  { city: 'Казань', region: 'Республика Татарстан' },
  { city: 'Новосибирск', region: 'Новосибирская область' },
  { city: 'Екатеринбург', region: 'Свердловская область' },
  { city: 'Краснодар', region: 'Краснодарский край' },
  { city: 'Нижний Новгород', region: 'Нижегородская область' },
  { city: 'Ростов-на-Дону', region: 'Ростовская область' },
  { city: 'Самара', region: 'Самарская область' },
  { city: 'Уфа', region: 'Республика Башкортостан' },
  { city: 'Красноярск', region: 'Красноярский край' },
  { city: 'Пермь', region: 'Пермский край' },
  { city: 'Воронеж', region: 'Воронежская область' },
  { city: 'Иркутск', region: 'Иркутская область' },
  { city: 'Тюмень', region: 'Тюменская область' },
  { city: 'Волгоград', region: 'Волгоградская область' },
  { city: 'Кемерово', region: 'Кемеровская область' },
  { city: 'Тольятти', region: 'Самарская область' },
  { city: 'Барнаул', region: 'Алтайский край' },
  { city: 'Владивосток', region: 'Приморский край' },
  { city: 'Ярославль', region: 'Ярославская область' },
  { city: 'Саратов', region: 'Саратовская область' },
  { city: 'Омск', region: 'Омская область' },
  { city: 'Томск', region: 'Томская область' },
  { city: 'Хабаровск', region: 'Хабаровский край' },
  { city: 'Рязань', region: 'Рязанская область' },
  { city: 'Липецк', region: 'Липецкая область' },
  { city: 'Тула', region: 'Тульская область' },
  { city: 'Ижевск', region: 'Республика Удмуртия' },
  { city: 'Брянск', region: 'Брянская область' },
  { city: 'Чебоксары', region: 'Чувашская Республика' },
];

const GOV_EMPLOYERS = [
  'Администрация города', 'Министерство здравоохранения', 'Министерство образования',
  'Федеральное казначейство', 'Росимущество', 'Росздравнадзор',
  'ФГУП «Почта России»', 'Федеральное агентство по управлению государственным имуществом',
  'МФЦ «Мои документы»', 'Региональное министерство финансов',
  'Департамент государственных закупок', 'Управление делами Администрации',
];

const COMMERCIAL_EMPLOYERS = [
  'ООО «СнабТорг»', 'АО «ТехноСнаб»', 'ГК «ПромСнабжение»',
  'ООО «Закупки Эксперт»', 'ПАО «РусТехнологии»', 'ООО «МегаСнаб»',
  'АО «Торговый дом Восток»', 'ООО «ЛогистикПро»', 'ГК «СтройМаркет»',
  'ООО «ФармаСнаб»', 'АО «Металлторг»', 'ООО «АгроСнабжение»',
  'ПАО «ЭнергоСнаб»', 'ООО «ТендерПлюс»', 'АО «КонтрактСервис»',
  'ООО «Глобал Прокьюремент»', 'ЗАО «СнабКомплект»', 'ООО «ПромТрейд»',
  'АО «РегионСнаб»', 'ООО «ДиректСупплай»',
];

const ABOUT_TEMPLATES = [
  (pos: string, exp: number) =>
    `Опыт работы в сфере закупок — ${exp} ${plural(exp, 'год', 'года', 'лет')}. Специализируюсь на организации и проведении тендерных процедур по 44-ФЗ и 223-ФЗ. Умею работать с большими объёмами закупочной документации, вести переговоры с поставщиками и оптимизировать затраты компании.`,
  (pos: string, exp: number) =>
    `${exp > 5 ? 'Опытный' : 'Активный'} специалист в области закупочной деятельности с опытом ${exp} ${plural(exp, 'год', 'года', 'лет')}. Работал в государственном и коммерческом секторе. Знаю законодательство в сфере закупок, умею выстраивать долгосрочные отношения с поставщиками.`,
  (pos: string, exp: number) =>
    `Специализируюсь на проведении конкурентных закупочных процедур, подготовке тендерной документации и анализе рынка. Опыт ${exp} ${plural(exp, 'год', 'года', 'лет')}. Результативен в снижении закупочных цен: за последний год достиг экономии до 18% от плана.`,
  (pos: string, exp: number) =>
    `${exp > 7 ? 'Эксперт' : 'Специалист'} в сфере государственных и коммерческих закупок. Опыт работы ${exp} ${plural(exp, 'год', 'года', 'лет')}. Знание 44-ФЗ, 223-ФЗ, ГК РФ. Опыт работы с ЕИС, СБИС, Контур.Закупки. Ответственный, аналитический склад ума.`,
  (pos: string, exp: number) =>
    `Ищу интересную работу в сфере закупок. Опыт ${exp} ${plural(exp, 'год', 'года', 'лет')} в должности специалиста/менеджера по закупкам. Умею вести переговоры, работать в условиях многозадачности. Знаю основы 44-ФЗ и 223-ФЗ.`,
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function plural(n: number, one: string, few: string, many: string): string {
  const mod10 = n % 10, mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return one;
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) return few;
  return many;
}

function pick<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

function randInt(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function randBirthDate(expYears: number): Date {
  // Youngest possible: 18 + expYears
  const minAge = Math.max(18, 18 + expYears);
  const maxAge = Math.min(60, 25 + expYears + 15);
  const age = randInt(minAge, maxAge);
  const year = new Date().getFullYear() - age;
  return new Date(year, randInt(0, 11), randInt(1, 28));
}

function randSalary(expYears: number): number {
  if (expYears === 0) return randInt(40, 60) * 1000;
  if (expYears <= 2) return randInt(55, 80) * 1000;
  if (expYears <= 5) return randInt(70, 110) * 1000;
  if (expYears <= 10) return randInt(90, 150) * 1000;
  return randInt(120, 220) * 1000;
}

function randWorkMode(): string {
  const r = Math.random();
  if (r < 0.65) return 'office';
  if (r < 0.85) return 'hybrid';
  return 'remote';
}

function randEducation(): string {
  return Math.random() < 0.72 ? 'higher' : 'secondary_vocational';
}

const MONTHS = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];

function randMonth(year: number): string {
  return `${year}-${pick(MONTHS)}`;
}

function buildWorkExperiences(expYears: number, city: string): {
  company: string; role: string; fromMonth: string; toMonth: string | null; isCurrent: boolean; description: string; sortOrder: number;
}[] {
  if (expYears === 0) return [];

  const now = new Date();
  const nowStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const ROLES = [
    'Специалист по закупкам', 'Менеджер по закупкам', 'Экономист', 'Помощник менеджера',
    'Ведущий специалист по закупкам', 'Специалист контрактной службы',
  ];

  const experiences = [];
  let remainingYears = expYears;
  let endYear = now.getFullYear();
  let endMonth = now.getMonth() + 1;
  let jobIndex = 0;

  while (remainingYears > 0) {
    const jobDuration = Math.min(remainingYears, randInt(1, Math.min(4, remainingYears)));
    const startYear = endYear - jobDuration;
    const fromMonth = randMonth(startYear);
    const isCurrent = jobIndex === 0;
    const toMonth = isCurrent ? null : `${endYear}-${String(endMonth).padStart(2, '0')}`;

    const isGov = Math.random() < 0.4;
    const company = isGov
      ? pick(GOV_EMPLOYERS).replace('города', `${city}`)
      : pick(COMMERCIAL_EMPLOYERS);

    experiences.push({
      company,
      role: pick(ROLES),
      fromMonth,
      toMonth,
      isCurrent,
      description: `Организация и проведение закупочных процедур, подготовка документации, взаимодействие с поставщиками.`,
      sortOrder: jobIndex,
    });

    endYear = startYear;
    endMonth = randInt(1, 12);
    remainingYears -= jobDuration;
    jobIndex++;

    if (jobIndex >= 4) break;
  }

  return experiences;
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const count = parseInt(process.argv[2] ?? '250', 10);
  console.log(`\nSeeding ${count} procurement specialist resumes...\n`);

  const passwordHash = await bcrypt.hash('seed_ghost_account', 4);
  let created = 0, skipped = 0, errors = 0;

  for (let i = 1; i <= count; i++) {
    const isMale = Math.random() < 0.45;
    const firstName = isMale ? pick(MALE_FIRST) : pick(FEMALE_FIRST);
    const lastName = isMale ? pick(MALE_LAST) : pick(FEMALE_LAST);
    const patronymic = isMale ? pick(MALE_PATRONYMIC) : pick(FEMALE_PATRONYMIC);
    const gender: 'MALE' | 'FEMALE' = isMale ? 'MALE' : 'FEMALE';

    const { city, region } = pick(CITIES);
    const position = pick(POSITIONS);
    const expYears = randInt(0, 20);
    const salary = randSalary(expYears);
    const birthDate = randBirthDate(expYears);
    const education = randEducation();
    const workMode = randWorkMode();
    const aboutFn = pick(ABOUT_TEMPLATES);
    const about = aboutFn(position, expYears);
    const workExperiences = buildWorkExperiences(expYears, city);

    const seedId = String(i).padStart(4, '0');
    const email = `seed.${seedId}@prokadry.local`;

    try {
      await db.$transaction(async (tx) => {
        const user = await tx.user.upsert({
          where: { email },
          create: { email, passwordHash, role: 'SEEKER' },
          update: {},
        });

        const existing = await tx.resume.findUnique({ where: { userId: user.id } });
        if (existing) { skipped++; return; }

        const resume = await tx.resume.create({
          data: {
            userId: user.id,
            firstName,
            lastName,
            patronymic,
            gender,
            birthDate,
            city,
            region,
            position,
            salary,
            experience: expYears,
            education,
            workMode,
            about,
            status: 'ACTIVE',
            publishedAt: new Date(Date.now() - randInt(0, 90) * 86400000),
          },
        });

        if (workExperiences.length > 0) {
          await tx.workExperience.createMany({
            data: workExperiences.map(we => ({ resumeId: resume.id, ...we })),
          });
        }

        created++;
      });

      if (i % 25 === 0 || i === count) {
        const pct = Math.round((i / count) * 100);
        process.stdout.write(`\r  [${pct.toString().padStart(3)}%] ${i}/${count} — created: ${created}, skipped: ${skipped}, errors: ${errors}`);
      }
    } catch (e) {
      errors++;
      if (errors <= 5) console.error(`\n  Error on record ${i}:`, (e as Error).message);
    }
  }

  console.log(`\n\nDone! Created: ${created}, Skipped: ${skipped}, Errors: ${errors}\n`);
  process.exit(0);
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
