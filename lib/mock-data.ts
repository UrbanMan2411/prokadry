import type { Resume, Employer, Vacancy, Invitation, Message, AdminStats, AuditLog, Dictionaries, WorkExperience, ParsedSource, RegionStat } from './types';

const _firstNames = ['Александр','Михаил','Сергей','Дмитрий','Андрей','Иван','Алексей','Николай','Артём','Владимир','Анна','Мария','Елена','Наталья','Ольга','Татьяна','Екатерина','Ирина','Светлана','Юлия','Евгений','Павел','Роман','Максим','Кирилл','Виктор','Денис','Антон','Станислав','Владислав','Ксения','Дарья','Валерия','Алина','Полина'];
const _lastNames = ['Иванов','Смирнов','Кузнецов','Попов','Васильев','Петров','Соколов','Михайлов','Новиков','Федоров','Морозов','Волков','Алексеев','Лебедев','Семёнов','Егоров','Павлов','Козлов','Степанов','Николаев','Орлова','Зайцева','Борисова','Королёва','Соловьёва','Кириллова','Тихонова','Макарова','Беляева','Захарова'];
const _cities = ['Москва','Санкт-Петербург','Екатеринбург','Новосибирск','Казань','Нижний Новгород','Самара','Уфа','Краснодар','Ростов-на-Дону','Пермь','Воронеж','Челябинск','Красноярск','Саратов','Тюмень','Омск','Ижевск','Барнаул','Томск'];
const _regions = ['Москва','Санкт-Петербург','Свердловская область','Новосибирская область','Республика Татарстан','Нижегородская область','Самарская область','Республика Башкортостан','Краснодарский край','Ростовская область','Пермский край','Воронежская область','Челябинская область','Красноярский край','Саратовская область','Тюменская область','Омская область','Удмуртская Республика','Алтайский край','Томская область'];
const _positions = ['Специалист по закупкам','Контрактный управляющий','Менеджер по закупкам','Руководитель отдела закупок','Тендерный специалист','Экономист','Юрист по контрактной системе','Аналитик закупок','Специалист по контрактной системе','Главный специалист по закупкам','Ведущий специалист по закупкам','Эксперт в сфере закупок','Специалист ЕИС','Бухгалтер-экономист'];
const _companies = ['ООО «ТехноСервис»','АО «ГородСтрой»','ФГУП «РосТех»','МУП «Городской транспорт»','ГБУ «Медцентр»','ООО «ПромСнаб»','АО «Энергосбыт»','ООО «СтройКомплекс»','ФГБУ «НИИ Управления»','ГКУ «Дирекция заказчика»','ООО «ЛогистикПро»','АО «ЦифраТех»','МКУ «Горзеленхоз»','ООО «АвтоТрансСервис»'];
const _activityAreas = ['Закупки по 44-ФЗ','Закупки по 223-ФЗ','Коммерческие закупки'];
const _clientSpheres = ['Медицина','Строительство','Образование','Энергетика','ИТ и цифровизация','Транспорт','Промышленность'];
const _specialistActivities = ['Инициирование закупок','Планирование закупок','Обоснование НМЦК','Составление технического задания','Опубликование извещения','Рассмотрение заявок','Исполнение контракта'];
const _workModes = ['Офис','Удалённо','Гибрид'];
const _educations = ['Высшее','Среднее профессиональное','Среднее'];
const _specialStatuses = ['Участник СВО','Член семьи участника СВО','Инвалид'];
const _tests = ['44-ФЗ','223-ФЗ'];

function rndInt(min: number, max: number, seed: number) {
  return Math.floor(Math.abs(Math.sin(seed * 137.5)) * (max - min + 1)) + min;
}

function pick<T>(arr: T[], n: number, seed: number): T[] {
  const shuffled = [...arr].sort((a, b) => Math.sin(seed + arr.indexOf(a)) - Math.sin(seed + arr.indexOf(b)));
  return shuffled.slice(0, n);
}

function rndDate(daysAgo: number, seed: number): string {
  const d = new Date('2026-04-23');
  d.setDate(d.getDate() - rndInt(0, daysAgo, seed));
  return d.toISOString().split('T')[0];
}

export const RESUMES: Resume[] = Array.from({ length: 75 }, (_, i): Resume => {
  const isFemale = Math.sin(i * 7.3) > 0;
  const femaleFirst = ['Анна','Мария','Елена','Наталья','Ольга','Татьяна','Екатерина','Ирина','Светлана','Юлия','Ксения','Дарья','Валерия','Алина','Полина'];
  const maleFirst = ['Александр','Михаил','Сергей','Дмитрий','Андрей','Иван','Алексей','Николай','Артём','Владимир','Евгений','Павел','Роман','Максим','Кирилл'];
  const firstName = isFemale ? femaleFirst[i % femaleFirst.length] : maleFirst[i % maleFirst.length];
  const lastName = _lastNames[i % _lastNames.length] + (isFemale ? 'а' : '');
  const patronymic = isFemale
    ? ['Александровна','Сергеевна','Ивановна','Николаевна','Петровна'][i % 5]
    : ['Александрович','Сергеевич','Иванович','Николаевич','Петрович'][i % 5];
  const cityIdx = i % _cities.length;
  const hasPhoto = Math.cos(i * 3.1) > -0.3;
  const hasSpecial = Math.sin(i * 11.7) > 0.6;
  const testsCount = Math.floor(Math.abs(Math.sin(i * 5.3)) * 3);
  const areaCount = 1 + Math.floor(Math.abs(Math.cos(i * 2.1)) * 2);
  const exp = rndInt(0, 20, i * 3);
  const salary = [0, 60000, 70000, 80000, 90000, 100000, 120000, 150000, 180000, 200000][i % 10];
  const age = rndInt(22, 58, i * 7);

  const workExps: WorkExperience[] = Array.from({ length: rndInt(1, 4, i * 11) }, (_, j) => ({
    id: j,
    company: _companies[(i + j) % _companies.length],
    role: _positions[(i + j + 1) % _positions.length],
    from: `${2018 - j * 3}-01`,
    to: j === 0 ? 'настоящее время' : `${2021 - j * 3}-06`,
    description: 'Проведение конкурентных закупок, подготовка контрактной документации, работа в ЕИС, сопровождение контрактов на всех этапах исполнения.',
  }));

  return {
    id: `CV-${String(i + 1).padStart(4, '0')}`,
    firstName, lastName, patronymic,
    fullName: `${lastName} ${firstName} ${patronymic}`,
    gender: isFemale ? 'female' : 'male',
    age,
    city: _cities[cityIdx],
    region: _regions[cityIdx],
    position: _positions[i % _positions.length],
    salary: salary || null,
    experience: exp,
    education: _educations[i % _educations.length],
    workMode: _workModes[i % _workModes.length],
    activityAreas: pick(_activityAreas, areaCount, i * 13),
    tests: pick(_tests, testsCount, i * 17),
    specialStatuses: hasSpecial ? [_specialStatuses[i % _specialStatuses.length]] : [],
    hasPhoto,
    photo: hasPhoto ? `https://i.pravatar.cc/120?img=${(i % 70) + 1}` : null,
    publishedAt: rndDate(90, i * 19),
    about: 'Опытный специалист в сфере государственных и корпоративных закупок. Отлично разбираюсь в законодательстве 44-ФЗ и 223-ФЗ. Умею работать с большими объёмами документации, опыт работы в ЕИС. Ответственный, внимательный к деталям.',
    workExperiences: workExps,
    isFavorite: Math.sin(i * 19.3) > 0.5,
    status: (['active','active','active','pending','draft'] as const)[i % 5],
  };
});

export const EMPLOYERS: Employer[] = Array.from({ length: 15 }, (_, i): Employer => ({
  id: `EMP-${String(i + 1).padStart(3, '0')}`,
  name: _companies[i % _companies.length],
  inn: `${7700000000 + i * 123456}`,
  region: _regions[i % _regions.length],
  city: _cities[i % _cities.length],
  contactName: `${_firstNames[(i * 3) % _firstNames.length]} ${_lastNames[(i * 2) % _lastNames.length]}`,
  email: `hr${i + 1}@company${i + 1}.ru`,
  phone: `+7 (${900 + i}) ${300 + i * 7}-${10 + i * 3}-${20 + i}`,
  status: i < 12 ? 'approved' : 'pending',
  registeredAt: rndDate(180, i * 23),
  vacancyCount: rndInt(1, 8, i * 29),
}));

export const VACANCIES: Vacancy[] = Array.from({ length: 30 }, (_, i): Vacancy => ({
  id: `VAC-${String(i + 1).padStart(3, '0')}`,
  employerId: EMPLOYERS[i % EMPLOYERS.length].id,
  employerName: EMPLOYERS[i % EMPLOYERS.length].name,
  title: _positions[i % _positions.length],
  department: ['Отдел закупок','Финансовый отдел','Юридический отдел','Отдел снабжения'][i % 4],
  city: _cities[i % _cities.length],
  region: _regions[i % _regions.length],
  workMode: _workModes[i % _workModes.length],
  salaryFrom: [60000,70000,80000,90000,100000][i % 5],
  salaryTo: [90000,100000,120000,150000,180000][i % 5],
  description: 'Ищем опытного специалиста по закупкам для работы в нашей организации. Требуется знание 44-ФЗ, опыт работы в ЕИС, умение работать с тендерной документацией.',
  skills: pick(['44-ФЗ','223-ФЗ','ЕИС','Тендер','Excel','1С','Контракты','ГИС'], 3, i * 31),
  clientSpheres: pick(_clientSpheres, rndInt(1, 3, i * 43), i * 43),
  specialistActivities: pick(_specialistActivities, rndInt(2, 4, i * 47), i * 47),
  status: (['active','active','active','archived','draft'] as const)[i % 5],
  createdAt: rndDate(60, i * 37),
}));

export const INVITATIONS: Invitation[] = Array.from({ length: 20 }, (_, i): Invitation => ({
  id: `INV-${String(i + 1).padStart(3, '0')}`,
  resumeId: RESUMES[i % RESUMES.length].id,
  vacancyId: VACANCIES[i % VACANCIES.length].id,
  candidateName: RESUMES[i % RESUMES.length].fullName,
  vacancyTitle: VACANCIES[i % VACANCIES.length].title,
  employerName: VACANCIES[i % VACANCIES.length].employerName,
  message: 'Добрый день! Мы рассмотрели ваше резюме и хотели бы пригласить вас на собеседование по вакансии.',
  status: (['sent','viewed','accepted','rejected','sent'] as const)[i % 5],
  createdAt: rndDate(30, i * 41),
}));

export const MESSAGES: Message[] = Array.from({ length: 15 }, (_, i): Message => ({
  id: `MSG-${String(i + 1).padStart(3, '0')}`,
  fromRole: i % 2 === 0 ? 'employer' : 'candidate',
  fromName: i % 2 === 0 ? EMPLOYERS[i % EMPLOYERS.length].name : RESUMES[i % RESUMES.length].fullName,
  toName: i % 2 === 0 ? RESUMES[i % RESUMES.length].fullName : EMPLOYERS[i % EMPLOYERS.length].name,
  counterpartyUserId: '',
  text: i % 2 === 0
    ? 'Добрый день! Мы заинтересованы в вашей кандидатуре. Можем ли мы договориться о звонке?'
    : 'Здравствуйте! Да, я готов обсудить детали. Удобное время — любой будний день с 10 до 18.',
  createdAt: rndDate(14, i * 43),
  isRead: i % 3 !== 0,
}));

export const ADMIN_STATS: AdminStats = {
  totalResumes: RESUMES.length,
  activeResumes: RESUMES.filter(r => r.status === 'active').length,
  pendingResumes: RESUMES.filter(r => r.status === 'pending').length,
  totalEmployers: EMPLOYERS.length,
  approvedEmployers: EMPLOYERS.filter(e => e.status === 'approved').length,
  totalVacancies: VACANCIES.length,
  activeVacancies: VACANCIES.filter(v => v.status === 'active').length,
  totalInvitations: INVITATIONS.length,
};

export const DICTIONARIES: Dictionaries = {
  positions: _positions,
  regions: _regions,
  educations: _educations,
  workModes: _workModes,
  activityAreas: _activityAreas,
  tests: _tests,
  specialStatuses: _specialStatuses,
  clientSpheres: _clientSpheres,
  specialistActivities: _specialistActivities,
};

export const AUDIT_LOGS: AuditLog[] = Array.from({ length: 25 }, (_, i): AuditLog => ({
  id: i + 1,
  action: ['Резюме добавлено','Резюме одобрено','Работодатель зарегистрирован','Вакансия создана','Приглашение отправлено','Резюме отклонено','Сообщение отправлено'][i % 7],
  user: i % 2 === 0 ? EMPLOYERS[i % EMPLOYERS.length].contactName : 'Администратор',
  role: i % 2 === 0 ? 'Работодатель' : 'Администратор',
  timestamp: new Date(Date.now() - i * 3600000).toISOString(),
  details: `ID объекта: ${['CV','EMP','VAC'][i % 3]}-${String(rndInt(1, 50, i * 47)).padStart(3, '0')}`,
}));

export const REGION_STATS: RegionStat[] = _regions.map((region, i) => {
  const rvacs = VACANCIES.filter(v => v.region === region && v.status === 'active');
  const rresumes = RESUMES.filter(r => r.region === region && r.status === 'active');
  const salaried = rresumes.filter(r => r.salary);
  const avgSalary = salaried.length > 0
    ? Math.round(salaried.reduce((s, r) => s + (r.salary ?? 0), 0) / salaried.length)
    : 65000 + rndInt(0, 35000, i * 71);
  return {
    name: _cities[i],
    region,
    vacanciesCount: rvacs.length,
    resumesCount: rresumes.length,
    avgSalary,
    supplyDemandIndex: rresumes.length > 0
      ? Math.round((rvacs.length / rresumes.length) * 100) / 100
      : 0,
    rating: rndInt(1, 10, i * 53),
  };
});

export const PARSING_SOURCES: ParsedSource[] = [
  {
    id: 'PS-001', name: 'hh.ru — Вакансии', type: 'vacancies',
    url: 'https://api.hh.ru/vacancies', status: 'active',
    lastSyncAt: '2026-04-25T06:00:00Z', updateFrequency: 'каждые 2 часа',
    legalNotes: 'Некоммерческое агрегирование по ToS hh.ru.',
  },
  {
    id: 'PS-002', name: 'Работа.ру — Вакансии', type: 'vacancies',
    url: 'https://api.rabota.ru/vacancies', status: 'active',
    lastSyncAt: '2026-04-25T04:30:00Z', updateFrequency: 'каждые 3 часа',
    legalNotes: 'Лицензионный договор № 2024/HR-001 с партнёрским API-ключом.',
  },
  {
    id: 'PS-003', name: 'ЕИС Закупок — Тендеры', type: 'eis',
    url: 'https://zakupki.gov.ru/epz/order/extendedsearch/results.html', status: 'active',
    lastSyncAt: '2026-04-25T05:00:00Z', updateFrequency: 'ежедневно',
    legalNotes: 'Открытые данные ЕИС. Постановление Правительства РФ № 1224.',
  },
  {
    id: 'PS-004', name: 'Портал Работы России', type: 'regional_employment',
    url: 'https://trudvsem.ru/vacancy/search', status: 'active',
    lastSyncAt: '2026-04-24T18:00:00Z', updateFrequency: 'каждые 6 часов',
    legalNotes: 'Открытые данные Минтруда РФ. Соглашение об информационном взаимодействии.',
  },
  {
    id: 'PS-005', name: 'ФАС России — Реестр поставщиков', type: 'regulatory',
    url: 'https://fas.gov.ru/registers', status: 'active',
    lastSyncAt: '2026-04-24T12:00:00Z', updateFrequency: 'еженедельно',
    legalNotes: 'Открытые данные ФАС. Федеральный закон № 135-ФЗ.',
  },
  {
    id: 'PS-006', name: 'DaData — Обогащение данных', type: 'enrichment',
    url: 'https://dadata.ru/api/', status: 'active',
    lastSyncAt: '2026-04-25T07:00:00Z', updateFrequency: 'по запросу',
    legalNotes: 'Коммерческий API. Данные ФНС и ФМС по лицензии DaData.',
  },
  {
    id: 'PS-007', name: 'Росстат — Рынок труда', type: 'statistics',
    url: 'https://rosstat.gov.ru/labour_market', status: 'active',
    lastSyncAt: '2026-04-20T00:00:00Z', updateFrequency: 'ежемесячно',
    legalNotes: 'Открытые статистические данные. Приказ Росстата № 415.',
  },
  {
    id: 'PS-008', name: 'СФР — Социальная поддержка', type: 'social_support',
    url: 'https://sfr.gov.ru/grazhdanam/lgoty', status: 'testing',
    lastSyncAt: null, updateFrequency: 'ежеквартально',
    legalNotes: 'В разработке. Соглашение с СФР на согласовании.',
  },
];
