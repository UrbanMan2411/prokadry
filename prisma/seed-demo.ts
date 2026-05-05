import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const databaseUrl = process.env.DATABASE_URL?.trim() || process.env.TURSO_DATABASE_URL?.trim() || 'file:./dev.db';
const authToken = process.env.TURSO_AUTH_TOKEN?.trim();
const adapter = new PrismaLibSql({
  url: databaseUrl,
  ...(authToken ? { authToken } : {}),
});
const db = new PrismaClient({ adapter });

const hash = (p: string) => bcrypt.hash(p, 12);

async function getDictId(category: string, value: string) {
  const item = await db.dictItem.findFirst({ where: { category: category as never, value } });
  return item?.id ?? null;
}

async function addResumeTags(resumeId: string, tags: { category: string; value: string }[]) {
  for (const t of tags) {
    const id = await getDictId(t.category, t.value);
    if (id) {
      await db.resumeActivityArea.upsert({
        where: { resumeId_dictItemId: { resumeId, dictItemId: id } },
        update: {},
        create: { resumeId, dictItemId: id },
      }).catch(() => {});
    }
  }
}

async function addVacancyTags(vacancyId: string, tags: { category: string; value: string }[]) {
  for (const t of tags) {
    const id = await getDictId(t.category, t.value);
    if (id) {
      await db.vacancyActivityArea.upsert({
        where: { vacancyId_dictItemId: { vacancyId, dictItemId: id } },
        update: {},
        create: { vacancyId, dictItemId: id },
      }).catch(() => {});
    }
  }
}

async function main() {
  // ── 10 Employers ────────────────────────────────────────────────────────────
  const employers = [
    {
      email: 'hr@gkb40.mos.ru',
      name: 'ГБУЗ «Городская клиническая больница №40»',
      inn: '7720543210',
      region: 'Москва', city: 'Москва',
      contactName: 'Соколова Наталья Викторовна',
      phone: '+7 (495) 324-10-40',
      description: 'Крупнейшая многопрофильная городская больница Москвы. Осуществляем закупки медикаментов, оборудования и расходных материалов по 44-ФЗ.',
    },
    {
      email: 'zakupki@msk-metro.ru',
      name: 'ГУП «Московский метрополитен»',
      inn: '7702038150',
      region: 'Москва', city: 'Москва',
      contactName: 'Громов Алексей Петрович',
      phone: '+7 (495) 623-03-10',
      description: 'Государственное унитарное предприятие. Закупки по 223-ФЗ: подвижной состав, запасные части, услуги технического обслуживания.',
    },
    {
      email: 'tender@spb-vodokanal.ru',
      name: 'ГУП «Водоканал Санкт-Петербурга»',
      inn: '7830000426',
      region: 'Санкт-Петербург', city: 'Санкт-Петербург',
      contactName: 'Белова Ирина Сергеевна',
      phone: '+7 (812) 305-80-00',
      description: 'Водоснабжение и водоотведение города. Проводим закупки строительных работ, химических реагентов и оборудования по 223-ФЗ.',
    },
    {
      email: 'hr@ural-energo.ru',
      name: 'АО «Россети Урал»',
      inn: '6671163452',
      region: 'Свердловская область', city: 'Екатеринбург',
      contactName: 'Козлов Дмитрий Андреевич',
      phone: '+7 (343) 359-45-00',
      description: 'Электросетевая компания Уральского региона. Закупки оборудования, строительно-монтажных работ по 223-ФЗ объёмом более 15 млрд рублей в год.',
    },
    {
      email: 'zakupki@nsk-edu.ru',
      name: 'Департамент образования г. Новосибирска',
      inn: '5406013792',
      region: 'Новосибирская область', city: 'Новосибирск',
      contactName: 'Морозова Елена Владимировна',
      phone: '+7 (383) 227-58-00',
      description: 'Муниципальный заказчик в сфере образования. Закупки мебели, учебников, оборудования для 250 образовательных учреждений по 44-ФЗ.',
    },
    {
      email: 'tender@krsk-zdrav.ru',
      name: 'КГБУЗ «Краевая клиническая больница»',
      inn: '2460072412',
      region: 'Красноярский край', city: 'Красноярск',
      contactName: 'Ефимова Татьяна Николаевна',
      phone: '+7 (391) 220-16-00',
      description: 'Ведущее медицинское учреждение края. Специализируемся на закупках высокотехнологичного медицинского оборудования и лекарственных препаратов.',
    },
    {
      email: 'hr@kazan-stroycenter.ru',
      name: 'ООО «КазаньСтройЦентр»',
      inn: '1655123456',
      region: 'Республика Татарстан', city: 'Казань',
      contactName: 'Хасанов Рустам Ильдарович',
      phone: '+7 (843) 276-44-00',
      description: 'Подрядная организация в сфере строительства и ЖКХ. Участвуем в тендерах по строительству и реконструкции объектов социальной инфраструктуры.',
    },
    {
      email: 'zakupki@samara-it.ru',
      name: 'АО «Самара-ИТ»',
      inn: '6316012890',
      region: 'Самарская область', city: 'Самара',
      contactName: 'Виноградова Ольга Александровна',
      phone: '+7 (846) 270-08-00',
      description: 'IT-компания, специализирующаяся на цифровизации государственного управления. Закупки программного обеспечения и вычислительной техники по 44-ФЗ и 223-ФЗ.',
    },
    {
      email: 'tender@vld-agro.ru',
      name: 'ФГУП «Владивостокский агрокомплекс»',
      inn: '2536012345',
      region: 'Приморский край', city: 'Владивосток',
      contactName: 'Захаров Николай Борисович',
      phone: '+7 (423) 265-32-00',
      description: 'Федеральное предприятие агропромышленного комплекса. Проводим закупки сельскохозяйственной техники, семян и удобрений по 223-ФЗ.',
    },
    {
      email: 'hr@rostov-kultura.ru',
      name: 'ГБУК «Ростовский областной музей краеведения»',
      inn: '6163012678',
      region: 'Ростовская область', city: 'Ростов-на-Дону',
      contactName: 'Степанова Людмила Ивановна',
      phone: '+7 (863) 263-85-16',
      description: 'Государственное бюджетное учреждение культуры. Закупки реставрационных материалов, музейного оборудования и услуг по 44-ФЗ.',
    },
  ];

  for (const emp of employers) {
    await db.user.upsert({
      where: { email: emp.email },
      update: {},
      create: {
        email: emp.email,
        passwordHash: await hash('demo123'),
        role: 'EMPLOYER',
        isActive: true,
        employer: {
          create: {
            name: emp.name,
            inn: emp.inn,
            region: emp.region,
            city: emp.city,
            contactName: emp.contactName,
            phone: emp.phone,
            description: emp.description,
            status: 'APPROVED',
          },
        },
      },
    });
    console.log(`✓ Employer: ${emp.name}`);
  }

  // ── 10 Seekers / Resumes ─────────────────────────────────────────────────────
  const seekers = [
    {
      email: 'ivanova.marina@mail.ru',
      firstName: 'Марина', lastName: 'Иванова', patronymic: 'Сергеевна',
      gender: 'FEMALE' as const, birthDate: new Date('1988-03-14'),
      city: 'Москва', region: 'Москва',
      position: 'Ведущий специалист по закупкам',
      salary: 130000, experience: 8,
      education: 'Высшее', educationInstitution: 'МГУ им. М.В. Ломоносова', educationYears: '2005–2010',
      workMode: 'Офис',
      about: 'Опыт работы в сфере государственных закупок более 8 лет. Специализируюсь на закупках медицинского оборудования и лекарственных препаратов по 44-ФЗ. Имею опыт ведения полного цикла закупочных процедур — от планирования до заключения контракта и контроля исполнения. Уверенный пользователь ЕИС, ЭТП.',
      skills: ['44fz', 'nmck', 'gis_zakupki', 'etp', 'contract_drafting'],
      areas: ['medicine', 'goszakaz'],
      purchases: ['44fz'],
    },
    {
      email: 'petrov.andrey@yandex.ru',
      firstName: 'Андрей', lastName: 'Петров', patronymic: 'Николаевич',
      gender: 'MALE' as const, birthDate: new Date('1985-11-28'),
      city: 'Санкт-Петербург', region: 'Санкт-Петербург',
      position: 'Начальник отдела закупок',
      salary: 180000, experience: 12,
      education: 'Высшее', educationInstitution: 'СПбГУ', educationYears: '2002–2007',
      workMode: 'Гибрид',
      about: 'Руководил отделом закупок в ГУП «Водоканал» 7 лет. Опыт управления командой из 6 специалистов. Выстроил систему планирования закупок с нуля, сократив сроки проведения процедур на 30%. Эксперт в области 223-ФЗ и коммерческих закупок. Регулярно прохожу повышение квалификации.',
      skills: ['223fz', '44fz', 'budget_planning', 'supplier_analysis', 'audit', 'legal_expertise'],
      areas: ['energy', 'construction', 'goszakaz'],
      purchases: ['223fz', '44fz'],
    },
    {
      email: 'sokolova.elena@gmail.com',
      firstName: 'Елена', lastName: 'Соколова', patronymic: 'Дмитриевна',
      gender: 'FEMALE' as const, birthDate: new Date('1993-07-05'),
      city: 'Екатеринбург', region: 'Свердловская область',
      position: 'Контрактный управляющий',
      salary: 90000, experience: 4,
      education: 'Высшее', educationInstitution: 'УрФУ', educationYears: '2010–2015',
      workMode: 'Офис',
      about: 'Работаю контрактным управляющим в учреждении здравоохранения. Веду закупки от 100 тыс. до 50 млн рублей. Прошла профессиональную переподготовку по программе «Управление государственными и муниципальными закупками». Ответственная, внимательна к деталям.',
      skills: ['44fz', 'nmck', 'contract_drafting', 'excel', 'gis_zakupki'],
      areas: ['medicine', 'goszakaz'],
      purchases: ['44fz'],
    },
    {
      email: 'kozlov.dmitry@mail.ru',
      firstName: 'Дмитрий', lastName: 'Козлов', patronymic: 'Александрович',
      gender: 'MALE' as const, birthDate: new Date('1990-02-20'),
      city: 'Новосибирск', region: 'Новосибирская область',
      position: 'Тендер-менеджер',
      salary: 110000, experience: 6,
      education: 'Высшее', educationInstitution: 'НГТУ', educationYears: '2007–2012',
      workMode: 'Удалённо',
      about: 'Специализируюсь на коммерческих тендерах и закупках по 223-ФЗ. Работал в IT и строительной сфере. Умею быстро анализировать конкурентную среду, готовить заявки и вести переговоры с заказчиками. Удалённая работа — 4 года без нареканий.',
      skills: ['223fz', 'commercial_tender', 'etp', 'supplier_analysis', 'excel'],
      areas: ['it', 'construction', 'commercial'],
      purchases: ['223fz', 'commercial'],
    },
    {
      email: 'morozova.olga@yandex.ru',
      firstName: 'Ольга', lastName: 'Морозова', patronymic: 'Павловна',
      gender: 'FEMALE' as const, birthDate: new Date('1995-09-12'),
      city: 'Казань', region: 'Республика Татарстан',
      position: 'Специалист по 44-ФЗ',
      salary: 75000, experience: 2,
      education: 'Высшее', educationInstitution: 'КФУ', educationYears: '2013–2018',
      workMode: 'Офис',
      about: 'Молодой специалист с двухлетним опытом работы в муниципальном учреждении образования. Самостоятельно провела более 80 закупок малого объёма и 15 конкурентных процедур. Стремлюсь к профессиональному росту, готова к обучению и новым задачам.',
      skills: ['44fz', 'nmck', 'gis_zakupki', 'excel'],
      areas: ['education', 'goszakaz'],
      purchases: ['44fz'],
    },
    {
      email: 'fedorov.ivan@mail.ru',
      firstName: 'Иван', lastName: 'Фёдоров', patronymic: 'Михайлович',
      gender: 'MALE' as const, birthDate: new Date('1982-06-03'),
      city: 'Краснодар', region: 'Краснодарский край',
      position: 'Эксперт по закупкам',
      salary: 150000, experience: 15,
      education: 'Высшее', educationInstitution: 'КубГУ', educationYears: '1999–2004',
      workMode: 'Гибрид',
      about: 'Эксперт с 15-летним опытом в сфере закупок. Консультировал более 30 организаций по построению закупочных систем. Проводил аудит закупочной деятельности и разрабатывал положения о закупках по 223-ФЗ. Имею статус профессионального эксперта в нескольких ЭТП.',
      skills: ['44fz', '223fz', 'audit', 'legal_expertise', 'budget_planning', 'contract_drafting', 'claim_work'],
      areas: ['goszakaz', 'commercial', 'agriculture'],
      purchases: ['44fz', '223fz', 'commercial'],
    },
    {
      email: 'smirnova.natalia@gmail.com',
      firstName: 'Наталья', lastName: 'Смирнова', patronymic: 'Геннадьевна',
      gender: 'FEMALE' as const, birthDate: new Date('1987-12-25'),
      city: 'Самара', region: 'Самарская область',
      position: 'Специалист контрактной службы',
      salary: 95000, experience: 7,
      education: 'Высшее', educationInstitution: 'СГЭУ', educationYears: '2004–2009',
      workMode: 'Офис',
      about: 'Специалист контрактной службы в крупном государственном учреждении здравоохранения Самарской области. Опыт проведения аукционов, конкурсов и запросов котировок. Умею грамотно составлять техническое задание и контракт. Опыт работы с жалобами и претензиями.',
      skills: ['44fz', 'nmck', 'contract_drafting', 'claim_work', 'gis_zakupki', 'etp'],
      areas: ['medicine', 'social', 'goszakaz'],
      purchases: ['44fz'],
    },
    {
      email: 'volkov.sergey@yandex.ru',
      firstName: 'Сергей', lastName: 'Волков', patronymic: 'Олегович',
      gender: 'MALE' as const, birthDate: new Date('1991-04-17'),
      city: 'Ростов-на-Дону', region: 'Ростовская область',
      position: 'Юрист по закупкам',
      salary: 120000, experience: 5,
      education: 'Высшее', educationInstitution: 'ЮФУ (юридический факультет)', educationYears: '2008–2013',
      workMode: 'Гибрид',
      about: 'Юрист, специализирующийся на договорном праве и государственных закупках. Опыт сопровождения закупочных процедур, разработки документации, защиты интересов заказчика в ФАС и арбитражном суде. Провёл успешную защиту в 12 из 14 рассмотренных жалоб.',
      skills: ['44fz', '223fz', 'legal_expertise', 'claim_work', 'contract_drafting'],
      areas: ['goszakaz', 'construction', 'culture'],
      purchases: ['44fz', '223fz'],
    },
    {
      email: 'alekseeva.yulia@mail.ru',
      firstName: 'Юлия', lastName: 'Алексеева', patronymic: 'Романовна',
      gender: 'FEMALE' as const, birthDate: new Date('1996-08-30'),
      city: 'Владивосток', region: 'Приморский край',
      position: 'Специалист по закупкам',
      salary: 70000, experience: 2,
      education: 'Высшее', educationInstitution: 'ДВФУ', educationYears: '2014–2019',
      workMode: 'Офис',
      about: 'Начинающий специалист, активно развиваюсь в сфере государственных закупок. Прошла профессиональную переподготовку по 44-ФЗ. Опыт самостоятельного проведения закупок малого объёма и работы в ЕИС. Внимательна, организована, умею работать в режиме многозадачности.',
      skills: ['44fz', 'gis_zakupki', 'excel', 'etp'],
      areas: ['agriculture', 'goszakaz'],
      purchases: ['44fz'],
    },
    {
      email: 'nikitin.pavel@gmail.com',
      firstName: 'Павел', lastName: 'Никитин', patronymic: 'Анатольевич',
      gender: 'MALE' as const, birthDate: new Date('1983-01-09'),
      city: 'Красноярск', region: 'Красноярский край',
      position: 'Заместитель начальника отдела закупок',
      salary: 160000, experience: 11,
      education: 'Высшее', educationInstitution: 'СФУ', educationYears: '2000–2005',
      workMode: 'Офис',
      about: 'Опытный руководитель в сфере закупок, имею опыт работы в энергетической компании и сфере транспорта. Организую работу отдела, наставляю молодых специалистов. Участвовал в разработке нормативной базы для перехода компании с 44-ФЗ на 223-ФЗ. Готов к переезду.',
      skills: ['44fz', '223fz', 'budget_planning', 'audit', 'legal_expertise', 'supplier_analysis', 'nmck'],
      areas: ['energy', 'transport', 'goszakaz'],
      purchases: ['44fz', '223fz'],
    },
  ];

  for (const s of seekers) {
    const user = await db.user.upsert({
      where: { email: s.email },
      update: {},
      create: {
        email: s.email,
        passwordHash: await hash('demo123'),
        role: 'SEEKER',
        isActive: true,
      },
    });

    let resume = await db.resume.findFirst({ where: { userId: user.id } });
    if (!resume) {
      resume = await db.resume.create({
        data: {
          userId: user.id,
          firstName: s.firstName,
          lastName: s.lastName,
          patronymic: s.patronymic,
          gender: s.gender,
          birthDate: s.birthDate,
          city: s.city,
          region: s.region,
          position: s.position,
          salary: s.salary,
          experience: s.experience,
          education: s.education,
          educationInstitution: s.educationInstitution,
          educationYears: s.educationYears,
          workMode: s.workMode,
          about: s.about,
          status: 'ACTIVE',
          publishedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
        },
      });
    }

    await addResumeTags(resume.id, [
      ...s.skills.map(v => ({ category: 'SKILL', value: v })),
      ...s.areas.map(v => ({ category: 'ACTIVITY_AREA', value: v })),
      ...s.purchases.map(v => ({ category: 'PURCHASE_TYPE', value: v })),
    ]);

    console.log(`✓ Seeker: ${s.lastName} ${s.firstName} — ${s.position}`);
  }

  // ── Vacancies for first 5 employers ────────────────────────────────────────
  const vacancyData = [
    {
      empEmail: 'hr@gkb40.mos.ru',
      title: 'Специалист по закупкам медицинского оборудования',
      department: 'Отдел материально-технического снабжения',
      city: 'Москва', region: 'Москва', workMode: 'Офис',
      salaryFrom: 100000, salaryTo: 130000,
      description: 'Ищем опытного специалиста по закупкам для ведения закупочных процедур по 44-ФЗ. Основной предмет закупки — медицинское оборудование и расходные материалы.\n\nОбязанности:\n— Планирование и проведение закупок (аукционы, конкурсы, запросы котировок)\n— Подготовка закупочной документации и технических заданий\n— Работа в ЕИС и на ЭТП\n— Заключение и сопровождение контрактов\n\nТребования:\n— Опыт работы по 44-ФЗ от 3 лет\n— Знание ЕИС, Сбербанк-АСТ, ЕЭТП\n— Профессиональная переподготовка приветствуется',
      skills: ['44fz', 'nmck', 'gis_zakupki', 'etp', 'contract_drafting'],
      areas: ['medicine', 'goszakaz'],
      purchases: ['44fz'],
    },
    {
      empEmail: 'zakupki@msk-metro.ru',
      title: 'Ведущий специалист по закупкам (223-ФЗ)',
      department: 'Управление закупок',
      city: 'Москва', region: 'Москва', workMode: 'Гибрид',
      salaryFrom: 140000, salaryTo: 180000,
      description: 'Приглашаем ведущего специалиста в Управление закупок ГУП «Московский метрополитен».\n\nОбязанности:\n— Организация и проведение конкурентных закупок по 223-ФЗ\n— Формирование плана закупок и план-графика\n— Взаимодействие с поставщиками и подрядчиками\n— Сопровождение контрактов, контроль исполнения\n\nТребования:\n— Опыт работы по 223-ФЗ от 5 лет\n— Знание технических аспектов транспортного оборудования\n— Умение работать с большим объёмом данных',
      skills: ['223fz', 'supplier_analysis', 'budget_planning', 'contract_drafting'],
      areas: ['transport', 'goszakaz'],
      purchases: ['223fz'],
    },
    {
      empEmail: 'tender@spb-vodokanal.ru',
      title: 'Контрактный управляющий',
      department: 'Служба закупок',
      city: 'Санкт-Петербург', region: 'Санкт-Петербург', workMode: 'Офис',
      salaryFrom: 85000, salaryTo: 110000,
      description: 'ГУП «Водоканал Санкт-Петербурга» открывает вакансию контрактного управляющего.\n\nОбязанности:\n— Ведение плана-графика закупок\n— Проведение закупок малого объёма и конкурентных процедур\n— Подготовка проектов контрактов\n— Претензионная работа\n\nМы предлагаем:\n— Стабильную зарплату, официальное трудоустройство\n— ДМС, корпоративное питание\n— Профессиональное развитие и обучение',
      skills: ['44fz', '223fz', 'contract_drafting', 'claim_work', 'gis_zakupki'],
      areas: ['energy', 'construction'],
      purchases: ['223fz', '44fz'],
    },
    {
      empEmail: 'hr@ural-energo.ru',
      title: 'Тендер-менеджер',
      department: 'Дирекция по закупкам',
      city: 'Екатеринбург', region: 'Свердловская область', workMode: 'Гибрид',
      salaryFrom: 120000, salaryTo: 155000,
      description: 'АО «Россети Урал» приглашает тендер-менеджера для участия в закупках на стороне поставщика и организации собственных закупочных процедур.\n\nОбязанности:\n— Мониторинг тендерных площадок\n— Подготовка заявок на участие в конкурсах\n— Анализ конкурентной среды\n— Ведение реестра тендеров\n\nТребования:\n— Опыт от 3 лет\n— Знание 223-ФЗ, опыт на ЭТП\n— Аналитический склад ума',
      skills: ['223fz', 'commercial_tender', 'etp', 'supplier_analysis', 'excel'],
      areas: ['energy', 'commercial'],
      purchases: ['223fz', 'commercial'],
    },
    {
      empEmail: 'zakupki@nsk-edu.ru',
      title: 'Специалист по 44-ФЗ',
      department: 'Отдел муниципального заказа',
      city: 'Новосибирск', region: 'Новосибирская область', workMode: 'Офис',
      salaryFrom: 65000, salaryTo: 85000,
      description: 'Департамент образования г. Новосибирска объявляет конкурс на замещение должности специалиста по закупкам.\n\nОбязанности:\n— Организация закупок для учреждений образования\n— Ведение документооборота\n— Взаимодействие с поставщиками\n— Работа в ЕИС\n\nТребования:\n— Образование: высшее (юридическое, экономическое)\n— Опыт работы по 44-ФЗ от 1 года\n— Знание MS Office, 1С',
      skills: ['44fz', 'nmck', 'gis_zakupki', 'excel'],
      areas: ['education', 'goszakaz'],
      purchases: ['44fz'],
    },
  ];

  for (const v of vacancyData) {
    const empUser = await db.user.findFirst({ where: { email: v.empEmail }, include: { employer: true } });
    if (!empUser?.employer) continue;

    const vacancy = await db.vacancy.create({
      data: {
        employerId: empUser.employer.id,
        title: v.title,
        department: v.department,
        city: v.city,
        region: v.region,
        workMode: v.workMode,
        salaryFrom: v.salaryFrom,
        salaryTo: v.salaryTo,
        description: v.description,
        status: 'ACTIVE',
      },
    });

    await addVacancyTags(vacancy.id, [
      ...v.skills.map(val => ({ category: 'SKILL', value: val })),
      ...v.areas.map(val => ({ category: 'ACTIVITY_AREA', value: val })),
      ...v.purchases.map(val => ({ category: 'PURCHASE_TYPE', value: val })),
    ]);

    console.log(`✓ Vacancy: ${v.title} @ ${v.empEmail}`);
  }

  console.log('\n✅ Demo data seeded: 10 employers, 10 resumes, 5 vacancies');
  console.log('   All passwords: demo123');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
