// hh.ru official API integration
// Register app at: https://dev.hh.ru/admin

const HH_BASE = 'https://api.hh.ru';
const HH_AUTH_URL = 'https://hh.ru/oauth/authorize';
const HH_TOKEN_URL = 'https://hh.ru/oauth/token';

const USER_AGENT = 'ПРОкадры/1.0 (prokadry@urbanman2411@gmail.com)';

// ── Types ─────────────────────────────────────────────────────────────────────

export interface HhToken {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
}

interface HhArea { name: string }
interface HhSalary { amount: number; currency: string }
interface HhExperience {
  start: string;
  end: string | null;
  company: string;
  position: string;
  description: string | null;
}
interface HhEducation {
  level: { name: string };
  primary: { name: string; year: number }[];
}
interface HhSkill { name: string }
interface HhWorkMode { name: string }

export interface HhResume {
  id: string;
  title: string;
  area: HhArea;
  salary: HhSalary | null;
  total_experience: { months: number } | null;
  education: HhEducation;
  skills: HhSkill[];
  experience: HhExperience[];
  working_time_modes: HhWorkMode[];
  specialization?: { name: string }[];
  professional_roles?: { name: string }[];
  about?: string;
}

export interface ParsedResume {
  source: 'hh' | 'avito';
  sourceId: string;
  position: string;
  city: string;
  salaryFrom: number | null;
  experience: string;
  education: string;
  workMode: string;
  skills: string[];
  about: string;
  raw?: unknown;
}

export interface ParsedResumeForDB {
  source: 'hh' | 'avito';
  sourceId: string;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  gender: 'MALE' | 'FEMALE';
  birthDate: Date;
  position: string;
  city: string;
  region: string;
  salaryFrom: number | null;
  experienceYears: number;
  education: string;
  workMode: string;
  about: string;
  workExperiences: {
    company: string;
    role: string;
    fromMonth: string;
    toMonth: string | null;
    isCurrent: boolean;
    description: string | null;
  }[];
}

// ── Employer resume search ────────────────────────────────────────────────────

export interface HhResumeSearchItem {
  id: string;
  title: string;
  url: string;
  age?: number;
  area?: HhArea;
  salary?: HhSalary | null;
  gender?: { id: string; name: string };
  total_experience?: { months: number };
  education?: HhEducation;
  skills?: HhSkill[];
  experience?: HhExperience[];
  working_time_modes?: HhWorkMode[];
  first_name?: string | null;
  last_name?: string | null;
  middle_name?: string | null;
  about?: string;
}

export async function searchHhResumes(opts: {
  query: string;
  areaId?: string;
  perPage?: number;
  page?: number;
}): Promise<{ items: HhResumeSearchItem[]; found: number; pages: number }> {
  const token = process.env.HH_EMPLOYER_TOKEN;
  if (!token) throw new Error('HH_EMPLOYER_TOKEN not configured');

  const params = new URLSearchParams({
    text: opts.query,
    area: opts.areaId ?? '113',        // 113 = Russia
    per_page: String(opts.perPage ?? 20),
    page: String(opts.page ?? 0),
    order_by: 'relevance',
  });

  const res = await fetch(`${HH_BASE}/resumes?${params}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': USER_AGENT,
    },
  });
  if (res.status === 403) throw new Error('Employer token lacks resume search permission');
  if (!res.ok) throw new Error(`hh resume search failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  return { items: data.items ?? [], found: data.found ?? 0, pages: data.pages ?? 0 };
}

const CITY_TO_REGION: Record<string, string> = {
  'Москва': 'Москва', 'Санкт-Петербург': 'Санкт-Петербург',
  'Казань': 'Республика Татарстан', 'Набережные Челны': 'Республика Татарстан',
  'Новосибирск': 'Новосибирская область', 'Екатеринбург': 'Свердловская область',
  'Краснодар': 'Краснодарский край', 'Нижний Новгород': 'Нижегородская область',
  'Ростов-на-Дону': 'Ростовская область', 'Самара': 'Самарская область',
  'Уфа': 'Республика Башкортостан', 'Красноярск': 'Красноярский край',
  'Пермь': 'Пермский край', 'Воронеж': 'Воронежская область',
  'Иркутск': 'Иркутская область', 'Владивосток': 'Приморский край',
  'Тюмень': 'Тюменская область', 'Омск': 'Омская область',
  'Челябинск': 'Челябинская область', 'Саратов': 'Саратовская область',
};

export function mapHhSearchItemToDb(r: HhResumeSearchItem): ParsedResumeForDB {
  const months = r.total_experience?.months ?? 0;
  const years = Math.round(months / 12);

  const edLevel = r.education?.level?.name ?? '';
  const education =
    edLevel.toLowerCase().includes('высш') ? 'higher' :
    edLevel.toLowerCase().includes('средн') ? 'secondary_special' :
    'higher';

  const workModes = r.working_time_modes?.map(m => m.name) ?? [];
  const workMode =
    workModes.some(m => m.toLowerCase().includes('удал')) ? 'remote' :
    workModes.some(m => m.toLowerCase().includes('гибр')) ? 'hybrid' :
    'office';

  const city = r.area?.name ?? 'Не указан';
  const region = CITY_TO_REGION[city] ?? city;

  const gender: 'MALE' | 'FEMALE' =
    r.gender?.id === 'female' ? 'FEMALE' : 'MALE';

  const birthYear = r.age ? new Date().getFullYear() - r.age : 1985;
  const birthDate = new Date(birthYear, 0, 1);

  const workExperiences = (r.experience ?? []).map(e => {
    const [fromY, fromM] = (e.start ?? '').split('-');
    const [toY, toM] = (e.end ?? '').split('-') ?? [];
    return {
      company: e.company ?? 'Компания',
      role: e.position ?? r.title,
      fromMonth: `${fromY ?? '2020'}-${fromM ?? '01'}`,
      toMonth: e.end ? `${toY}-${toM}` : null,
      isCurrent: !e.end,
      description: e.description ?? null,
    };
  });

  return {
    source: 'hh',
    sourceId: r.id,
    firstName: r.first_name ?? 'Соискатель',
    lastName: r.last_name ?? `hh${r.id.slice(-6)}`,
    patronymic: r.middle_name ?? null,
    gender,
    birthDate,
    position: r.title,
    city,
    region,
    salaryFrom: r.salary?.amount ?? null,
    experienceYears: years,
    education,
    workMode,
    about: r.about ?? '',
    workExperiences,
  };
}

// ── OAuth ─────────────────────────────────────────────────────────────────────

export function buildHhAuthUrl(redirectUri: string, state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.HH_CLIENT_ID ?? '',
    redirect_uri: redirectUri,
    state,
  });
  return `${HH_AUTH_URL}?${params}`;
}

export async function exchangeHhCode(code: string, redirectUri: string): Promise<HhToken> {
  const res = await fetch(HH_TOKEN_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': USER_AGENT,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: process.env.HH_CLIENT_ID ?? '',
      client_secret: process.env.HH_CLIENT_SECRET ?? '',
      code,
      redirect_uri: redirectUri,
    }),
  });
  if (!res.ok) throw new Error(`hh token exchange failed: ${res.status}`);
  return res.json();
}

// ── Resume API ────────────────────────────────────────────────────────────────

export async function fetchHhResumes(accessToken: string): Promise<HhResume[]> {
  const res = await fetch(`${HH_BASE}/resumes/mine`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': USER_AGENT,
    },
  });
  if (!res.ok) throw new Error(`hh resumes fetch failed: ${res.status}`);
  const data = await res.json();
  return data.items ?? [];
}

export async function fetchHhResumeDetail(accessToken: string, id: string): Promise<HhResume> {
  const res = await fetch(`${HH_BASE}/resumes/${id}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'User-Agent': USER_AGENT,
    },
  });
  if (!res.ok) throw new Error(`hh resume detail failed: ${res.status}`);
  return res.json();
}

// ── Mapper ────────────────────────────────────────────────────────────────────

export function mapHhResume(r: HhResume): ParsedResume {
  const months = r.total_experience?.months ?? 0;
  const years = Math.floor(months / 12);
  const expLabel =
    years === 0 ? 'Без опыта' :
    years === 1 ? '1 год' :
    years < 5  ? `${years} года` :
    `${years} лет`;

  const workModes = r.working_time_modes?.map(m => m.name) ?? [];
  const workMode =
    workModes.some(m => m.toLowerCase().includes('удал')) ? 'remote' :
    workModes.some(m => m.toLowerCase().includes('гибр')) ? 'hybrid' :
    'office';

  const edLevel = r.education?.level?.name ?? '';
  const education =
    edLevel.toLowerCase().includes('высш') ? 'higher' :
    edLevel.toLowerCase().includes('средн') ? 'secondary_special' :
    'higher';

  return {
    source: 'hh',
    sourceId: r.id,
    position: r.title,
    city: r.area?.name ?? '',
    salaryFrom: r.salary?.amount ?? null,
    experience: expLabel,
    education,
    workMode,
    skills: r.skills?.map(s => s.name) ?? [],
    about: r.about ?? '',
    raw: r,
  };
}
