import { PrismaClient } from '@prisma/client';
import { PrismaLibSql } from '@prisma/adapter-libsql';
import bcrypt from 'bcryptjs';

const adapter = new PrismaLibSql({ url: 'file:./dev.db' });
const db = new PrismaClient({ adapter });

async function main() {
  const hash = (p: string) => bcrypt.hash(p, 12);

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
