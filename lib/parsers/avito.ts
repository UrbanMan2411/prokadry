// Avito.ru resume parser
// NOTE: Subject to Avito ToS — use for internal tooling only.
// Avito actively blocks scrapers — uses JS rendering + WAF.
// This parser works on a best-effort basis with realistic browser headers + retry.

import * as cheerio from 'cheerio';
import type { ParsedResume, ParsedResumeForDB } from './hh';

const AVITO_BASE = 'https://www.avito.ru';
const AVITO_SEARCH = `${AVITO_BASE}/rossiya/vakansii_i_rezume/rezume`;

// Rotate UA strings to reduce fingerprinting
const USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36 Edg/123.0.0.0',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:125.0) Gecko/20100101 Firefox/125.0',
  'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
];

function randomUA() { return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)]; }

function buildHeaders(referer?: string): Record<string, string> {
  return {
    'User-Agent': randomUA(),
    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
    'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
    'Accept-Encoding': 'gzip, deflate, br',
    'Cache-Control': 'no-cache',
    'Pragma': 'no-cache',
    'Sec-Fetch-Dest': 'document',
    'Sec-Fetch-Mode': 'navigate',
    'Sec-Fetch-Site': referer ? 'same-origin' : 'none',
    'Sec-Fetch-User': '?1',
    'Upgrade-Insecure-Requests': '1',
    ...(referer ? { Referer: referer } : {}),
  };
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function fetchWithRetry(
  url: string,
  opts: { referer?: string; retries?: number } = {},
): Promise<string> {
  const { retries = 3 } = opts;

  for (let attempt = 0; attempt < retries; attempt++) {
    if (attempt > 0) await sleep(2000 * attempt + Math.random() * 1000);

    const res = await fetch(url, {
      headers: buildHeaders(opts.referer),
      redirect: 'follow',
    });

    if (res.status === 429) {
      if (attempt === retries - 1) {
        throw new Error(
          `Avito заблокировал запрос (429 Too Many Requests). ` +
          `Авито активно блокирует автоматические запросы. ` +
          `Подождите несколько минут и попробуйте снова.`
        );
      }
      await sleep(5000 + attempt * 3000);
      continue;
    }

    if (res.status === 403) {
      throw new Error(
        `Avito вернул 403 Forbidden. Сайт использует JavaScript-рендеринг и WAF. ` +
        `Парсинг через HTTP-запросы ненадёжен — см. альтернативы ниже.`
      );
    }

    if (!res.ok) throw new Error(`avito fetch failed: ${res.status} ${res.statusText}`);

    const html = await res.text();

    // Detect Cloudflare / captcha challenge page
    if (html.includes('cf-browser-verification') || html.includes('__cf_chl') || html.includes('captcha')) {
      throw new Error(
        `Avito показал страницу проверки (Cloudflare/captcha). ` +
        `Используйте puppeteer или playwright для обхода.`
      );
    }

    return html;
  }

  throw new Error('fetchWithRetry: max retries exceeded');
}

export interface AvitoResumeCard {
  id: string;
  title: string;
  city: string;
  salary: string;
  url: string;
}

// ── Search listings ───────────────────────────────────────────────────────────

export async function searchAvitoResumes(query: string, city?: string): Promise<AvitoResumeCard[]> {
  const params = new URLSearchParams({ q: query });
  if (city) params.set('location', city);
  const url = `${AVITO_SEARCH}?${params}`;

  const html = await fetchWithRetry(url, { referer: AVITO_BASE });
  return parseAvitoListingPage(html);
}

function parseAvitoListingPage(html: string): AvitoResumeCard[] {
  const $ = cheerio.load(html);
  const results: AvitoResumeCard[] = [];

  // Try multiple selector strategies as Avito changes markup
  const selectors = [
    '[data-marker="item"]',
    '[class*="item-root"]',
    'article[data-item-id]',
  ];

  let found = false;
  for (const sel of selectors) {
    $(sel).each((_, el) => {
      const $el = $(el);
      const id = $el.attr('data-item-id') ?? `gen_${Math.random().toString(36).slice(2)}`;
      const titleEl = $el.find('[itemprop="name"], [data-marker="item-title"], h3, h2').first();
      const title = titleEl.text().trim();
      const linkEl = $el.find('a[href*="/vakansii_i_rezume/"]').first();
      const href = linkEl.attr('href') ?? '';
      const cityText = $el.find('[data-marker="item-location"], [class*="geo"]').first().text().trim();
      const salaryText = $el.find('[data-marker="item-price"], [class*="price"]').first().text().trim();

      if (title && href) {
        results.push({
          id,
          title,
          city: cityText,
          salary: salaryText,
          url: href.startsWith('http') ? href : `${AVITO_BASE}${href}`,
        });
        found = true;
      }
    });
    if (found) break;
  }

  return results;
}

// ── Parse individual resume page ──────────────────────────────────────────────

export async function parseAvitoResumeUrl(url: string): Promise<ParsedResume> {
  const html = await fetchWithRetry(url, { referer: AVITO_SEARCH });
  return parseAvitoResumePage(html, url);
}

function parseAvitoResumePage(html: string, url: string): ParsedResume {
  const $ = cheerio.load(html);

  const position =
    $('[data-marker="page-title/title"]').text().trim() ||
    $('h1').first().text().trim();

  const city =
    $('[data-marker="delivery-location"]').text().trim() ||
    $('[class*="address"]').first().text().trim() ||
    $('[itemprop="addressLocality"]').text().trim();

  const salaryText = $('[data-marker="price-value"], [itemprop="price"]').first().text().trim();
  const salaryMatch = salaryText.replace(/\s/g, '').match(/\d+/);
  const salaryFrom = salaryMatch ? parseInt(salaryMatch[0], 10) || null : null;

  const about =
    $('[data-marker="item-description/text"]').text().trim() ||
    $('[class*="description"]').first().text().trim() ||
    $('[itemprop="description"]').text().trim();

  const skills: string[] = [];
  $('[data-marker*="tag"], [class*="param"], [class*="tag"]').each((_, el) => {
    const t = $(el).text().trim();
    if (t.length > 1 && t.length < 80 && !t.includes('\n')) skills.push(t);
  });

  const expText = ($('[data-marker*="experience"]').text() || about).toLowerCase();
  const expYearMatch = expText.match(/(\d+)\s*(лет|год|года)/);
  const experience = expText.includes('без опыта') ? 'Без опыта'
    : expYearMatch ? `${expYearMatch[1]} ${expYearMatch[2]}`
    : 'Не указан';

  const id = url.split('/').filter(Boolean).pop()?.split('?')[0] ?? url;

  return {
    source: 'avito',
    sourceId: id,
    position,
    city,
    salaryFrom,
    experience,
    education: 'higher',
    workMode: 'office',
    skills: [...new Set(skills)].slice(0, 15),
    about,
    raw: { url },
  };
}

// ── Map to DB format ──────────────────────────────────────────────────────────

const CITY_REGION: Record<string, string> = {
  'Москва': 'Москва', 'Санкт-Петербург': 'Санкт-Петербург',
  'Казань': 'Республика Татарстан', 'Новосибирск': 'Новосибирская область',
  'Екатеринбург': 'Свердловская область', 'Краснодар': 'Краснодарский край',
  'Нижний Новгород': 'Нижегородская область', 'Ростов-на-Дону': 'Ростовская область',
  'Самара': 'Самарская область', 'Уфа': 'Республика Башкортостан',
  'Красноярск': 'Красноярский край', 'Пермь': 'Пермский край',
  'Воронеж': 'Воронежская область', 'Иркутск': 'Иркутская область',
};

export function mapAvitoToDb(r: ParsedResume): ParsedResumeForDB {
  const expMatch = r.experience.match(/(\d+)/);
  const city = r.city?.split(',')[0].trim() || 'Москва';

  return {
    source: 'avito',
    sourceId: r.sourceId,
    firstName: 'Соискатель',
    lastName: `avito${r.sourceId.slice(-6)}`,
    patronymic: null,
    gender: 'MALE',
    birthDate: new Date(1985, 0, 1),
    position: r.position || 'Специалист по закупкам',
    city,
    region: CITY_REGION[city] ?? city,
    salaryFrom: r.salaryFrom,
    experienceYears: expMatch ? parseInt(expMatch[1], 10) : 0,
    education: 'higher',
    workMode: 'office',
    about: [r.about, r.skills.length ? `Навыки: ${r.skills.join(', ')}` : ''].filter(Boolean).join('\n\n'),
    workExperiences: [],
  };
}
