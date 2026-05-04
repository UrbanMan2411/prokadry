'use server';

import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from '@/lib/db';
import { createSession, deleteSession } from '@/lib/session';
import { logAction } from '@/lib/audit';

// ── Sign In ──────────────────────────────────────────────────────────────────

export type SignInState = { error?: string } | undefined;

export async function signIn(
  _prev: SignInState,
  formData: FormData,
): Promise<SignInState> {
  const email = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;

  if (!email || !password) return { error: 'Заполните все поля' };

  const user = await db.user.findUnique({ where: { email } });
  if (!user || !user.isActive) return { error: 'Неверный email или пароль' };

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) return { error: 'Неверный email или пароль' };

  try {
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });
  } catch (error) {
    console.warn('[auth] lastLoginAt update skipped:', error);
  }

  logAction(user.id, 'USER_LOGIN', 'User', user.id, user.email);
  await createSession({ userId: user.id, email: user.email, role: user.role });
  redirect('/dashboard');
}

// ── Sign Up — Employer ───────────────────────────────────────────────────────

export type SignUpState = { errors?: Record<string, string>; error?: string } | undefined;

export async function signUpEmployer(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email    = (formData.get('email') as string)?.trim().toLowerCase();
  const password = formData.get('password') as string;
  const confirm  = formData.get('confirm') as string;
  const name     = (formData.get('name') as string)?.trim();
  const inn      = (formData.get('inn') as string)?.trim();
  const region   = (formData.get('region') as string)?.trim();
  const city     = (formData.get('city') as string)?.trim();
  const contact  = (formData.get('contactName') as string)?.trim();
  const phone    = (formData.get('phone') as string)?.trim();

  const errors: Record<string, string> = {};
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Укажите корректный email';
  if (!password || password.length < 6) errors.password = 'Минимум 6 символов';
  if (password !== confirm) errors.confirm = 'Пароли не совпадают';
  if (!name) errors.name = 'Укажите название организации';
  if (!inn || !/^\d{10}(\d{2})?$/.test(inn)) errors.inn = 'ИНН: 10 или 12 цифр';
  if (!region) errors.region = 'Укажите регион';
  if (!city) errors.city = 'Укажите город';
  if (!contact) errors.contactName = 'Укажите контактное лицо';
  if (!phone) errors.phone = 'Укажите телефон';
  if (Object.keys(errors).length) return { errors };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { errors: { email: 'Email уже зарегистрирован' } };

  const existingInn = await db.employer.findUnique({ where: { inn } });
  if (existingInn) return { errors: { inn: 'Организация с таким ИНН уже зарегистрирована' } };

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: 'EMPLOYER',
      employer: {
        create: {
          name,
          inn,
          region,
          city,
          contactName: contact,
          phone,
          status: 'PENDING',
        },
      },
    },
  });

  await createSession({ userId: user.id, email: user.email, role: 'EMPLOYER' });
  redirect('/dashboard');
}

// ── Sign Up — Seeker ─────────────────────────────────────────────────────────

export async function signUpSeeker(
  _prev: SignUpState,
  formData: FormData,
): Promise<SignUpState> {
  const email     = (formData.get('email') as string)?.trim().toLowerCase();
  const password  = formData.get('password') as string;
  const confirm   = formData.get('confirm') as string;
  const firstName = (formData.get('firstName') as string)?.trim();
  const lastName  = (formData.get('lastName') as string)?.trim();
  const gender    = formData.get('gender') as string;
  const birthDate = formData.get('birthDate') as string;
  const city      = (formData.get('city') as string)?.trim();
  const region    = (formData.get('region') as string)?.trim();
  const position  = (formData.get('position') as string)?.trim();

  const errors: Record<string, string> = {};
  if (!email || !/\S+@\S+\.\S+/.test(email)) errors.email = 'Укажите корректный email';
  if (!password || password.length < 6) errors.password = 'Минимум 6 символов';
  if (password !== confirm) errors.confirm = 'Пароли не совпадают';
  if (!firstName) errors.firstName = 'Укажите имя';
  if (!lastName) errors.lastName = 'Укажите фамилию';
  if (!gender || !['MALE', 'FEMALE'].includes(gender)) errors.gender = 'Выберите пол';
  if (!birthDate) errors.birthDate = 'Укажите дату рождения';
  if (!city) errors.city = 'Укажите город';
  if (!region) errors.region = 'Укажите регион';
  if (!position) errors.position = 'Укажите желаемую должность';
  if (Object.keys(errors).length) return { errors };

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) return { errors: { email: 'Email уже зарегистрирован' } };

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      role: 'SEEKER',
      resumes: {
        create: {
          firstName,
          lastName,
          gender: gender as 'MALE' | 'FEMALE',
          birthDate: new Date(birthDate),
          city,
          region,
          position,
          education: 'Высшее',
          workMode: 'Офис',
          status: 'DRAFT',
        },
      },
    },
  });

  await createSession({ userId: user.id, email: user.email, role: 'SEEKER' });
  redirect('/dashboard');
}

// ── Sign Out ─────────────────────────────────────────────────────────────────

export async function signOut() {
  await deleteSession();
  redirect('/auth');
}
