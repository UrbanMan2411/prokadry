import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const db = new PrismaClient({ adapter });

const upsertDict = (category: string, items: { value: string; label: string; sortOrder?: number }[]) =>
  Promise.all(
    items.map((item, i) =>
      db.dictItem.upsert({
        where: { category_value: { category: category as never, value: item.value } },
        update: { label: item.label, sortOrder: item.sortOrder ?? i },
        create: { category: category as never, value: item.value, label: item.label, sortOrder: item.sortOrder ?? i },
      }),
    ),
  );

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 12);

  // ── Dictionaries ───────────────────────────────────────────────────────────
  await upsertDict('POSITION', [
    { value: 'specialist_zakupok', label: 'Специалист по закупкам' },
    { value: 'vedushchiy_specialist', label: 'Ведущий специалист по закупкам' },
    { value: 'nachalnik_otdela', label: 'Начальник отдела закупок' },
    { value: 'zamnachalnika_otdela', label: 'Заместитель начальника отдела закупок' },
    { value: 'kontraktnyy_upravlyayushchiy', label: 'Контрактный управляющий' },
    { value: 'specialist_kontraktnoy_sluzhby', label: 'Специалист контрактной службы' },
    { value: 'rukovoditel_kontraktnoy_sluzhby', label: 'Руководитель контрактной службы' },
    { value: 'ekspert_po_zakupkam', label: 'Эксперт по закупкам' },
    { value: 'analitik_po_zakupkam', label: 'Аналитик по закупкам' },
    { value: 'specialist_44fz', label: 'Специалист по 44-ФЗ' },
    { value: 'specialist_223fz', label: 'Специалист по 223-ФЗ' },
    { value: 'specialist_nmck', label: 'Специалист по обоснованию НМЦК' },
    { value: 'specialist_postavshchiki', label: 'Специалист по работе с поставщиками' },
    { value: 'menedzher_zakupok', label: 'Менеджер по закупкам' },
    { value: 'yurist_zakupok', label: 'Юрист по закупкам' },
    { value: 'ekonomist_zakupok', label: 'Экономист по закупкам' },
    { value: 'nachalnik_upravleniya', label: 'Начальник управления закупок' },
    { value: 'delovoditel', label: 'Делопроизводитель' },
    { value: 'normirovshhik', label: 'Нормировщик' },
    { value: 'specialist_kommercheskie', label: 'Специалист по коммерческим закупкам' },
    { value: 'tender_manager', label: 'Тендер-менеджер' },
    { value: 'specialist_etp', label: 'Специалист по работе с ЭТП' },
  ]);

  await upsertDict('ACTIVITY_AREA', [
    { value: 'goszakaz', label: 'Государственный заказ' },
    { value: 'medicine', label: 'Медицина и здравоохранение' },
    { value: 'construction', label: 'Строительство и ЖКХ' },
    { value: 'education', label: 'Образование' },
    { value: 'it', label: 'Информационные технологии' },
    { value: 'defense', label: 'Оборона и безопасность' },
    { value: 'transport', label: 'Транспорт и логистика' },
    { value: 'energy', label: 'Энергетика и ЖКХ' },
    { value: 'agriculture', label: 'Сельское хозяйство' },
    { value: 'culture', label: 'Культура и искусство' },
    { value: 'science', label: 'Наука и исследования' },
    { value: 'social', label: 'Социальная сфера' },
    { value: 'commercial', label: 'Коммерческие закупки' },
  ]);

  await upsertDict('SKILL', [
    { value: 'nmck', label: 'Обоснование НМЦК' },
    { value: '44fz', label: '44-ФЗ' },
    { value: '223fz', label: '223-ФЗ' },
    { value: 'commercial_tender', label: 'Коммерческие тендеры' },
    { value: 'etp', label: 'Работа на ЭТП' },
    { value: 'gis_zakupki', label: 'ЕИС Закупки' },
    { value: 'contract_drafting', label: 'Составление контрактов' },
    { value: 'claim_work', label: 'Претензионная работа' },
    { value: 'supplier_analysis', label: 'Анализ поставщиков' },
    { value: 'budget_planning', label: 'Бюджетное планирование' },
    { value: 'excel', label: 'Excel / таблицы' },
    { value: 'legal_expertise', label: 'Правовая экспертиза' },
    { value: 'audit', label: 'Аудит закупочной деятельности' },
  ]);

  await upsertDict('PURCHASE_TYPE', [
    { value: '44fz', label: '44-ФЗ (госзакупки)' },
    { value: '223fz', label: '223-ФЗ (закупки госкомпаний)' },
    { value: 'commercial', label: 'Коммерческие закупки' },
  ]);

  await upsertDict('SPECIAL_STATUS', [
    { value: 'svo_participant', label: 'Участник СВО' },
    { value: 'svo_family', label: 'Член семьи участника СВО' },
    { value: 'disabled', label: 'Человек с ОВЗ' },
  ]);

  await upsertDict('TEST', [
    { value: 'etp_zakaz_rf', label: 'Курс повышения квалификации ЭТП ЗаказРФ' },
    { value: 'test_44fz_customer', label: 'Тест: 44-ФЗ для заказчиков' },
    { value: 'test_44fz_supplier', label: 'Тест: 44-ФЗ для поставщиков' },
    { value: 'test_223fz_customer', label: 'Тест: 223-ФЗ для заказчиков' },
    { value: 'test_223fz_supplier', label: 'Тест: 223-ФЗ для поставщиков' },
  ]);

  // ── Admin ──────────────────────────────────────────────────────────────────
  await db.user.upsert({
    where: { email: 'admin@prokadry.ru' },
    update: {},
    create: {
      email: 'admin@prokadry.ru',
      passwordHash: await hash('admin123'),
      role: 'ADMIN',
      isActive: true,
    },
  });

  // ── Employer ───────────────────────────────────────────────────────────────
  await db.user.upsert({
    where: { email: 'employer@demo.ru' },
    update: {},
    create: {
      email: 'employer@demo.ru',
      passwordHash: await hash('demo123'),
      role: 'EMPLOYER',
      isActive: true,
      employer: {
        create: {
          name: 'ООО «ТехноЗакупки»',
          inn: '7700000001',
          region: 'Москва',
          city: 'Москва',
          contactName: 'Алексей Иванов',
          phone: '+7 (900) 000-00-01',
          description: 'Ведущий поставщик IT-решений для государственных закупок по 44-ФЗ и 223-ФЗ.',
          status: 'APPROVED',
        },
      },
    },
  });

  // ── Seeker ─────────────────────────────────────────────────────────────────
  await db.user.upsert({
    where: { email: 'seeker@demo.ru' },
    update: {},
    create: {
      email: 'seeker@demo.ru',
      passwordHash: await hash('demo123'),
      role: 'SEEKER',
      isActive: true,
      resume: {
        create: {
          firstName: 'Мария',
          lastName: 'Петрова',
          gender: 'FEMALE',
          birthDate: new Date('1992-05-15'),
          city: 'Москва',
          region: 'Москва',
          position: 'Специалист по закупкам',
          salary: 120000,
          experience: 5,
          education: 'Высшее',
          workMode: 'Офис',
          about: 'Опыт работы в сфере государственных закупок по 44-ФЗ и 223-ФЗ более 5 лет.',
          status: 'ACTIVE',
          publishedAt: new Date(),
        },
      },
    },
  });

  console.log('✅ Seed complete. Demo accounts:');
  console.log('   admin@prokadry.ru  / admin123  (Администратор)');
  console.log('   employer@demo.ru   / demo123   (Работодатель)');
  console.log('   seeker@demo.ru     / demo123   (Соискатель)');
}

main()
  .catch(console.error)
  .finally(() => db.$disconnect());
