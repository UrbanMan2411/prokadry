'use client';

import { useActionState, useState } from 'react';
import { signIn, signUpEmployer, signUpSeeker } from '@/app/actions/auth';
import type { SignInState, SignUpState } from '@/app/actions/auth';

// ── Shared primitives ────────────────────────────────────────────────────────

function Field({
  label, name, type = 'text', placeholder, error, required = true,
}: {
  label: string; name: string; type?: string; placeholder?: string; error?: string; required?: boolean;
}) {
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        name={name} type={type} placeholder={placeholder} required={required}
        className={`w-full rounded-lg border text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SubmitBtn({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit" disabled={pending}
      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm"
    >
      {pending ? 'Подождите...' : label}
    </button>
  );
}

// ── Sign In form ─────────────────────────────────────────────────────────────

function SignInForm() {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, undefined);
  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" type="email" placeholder="you@example.com" error={undefined} />
      <Field label="Пароль" name="password" type="password" placeholder="••••••••" error={undefined} />
      {state?.error && (
        <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <SubmitBtn pending={pending} label="Войти" />
    </form>
  );
}

// ── Role selector ─────────────────────────────────────────────────────────────

type SignUpRole = 'employer' | 'seeker';

function RoleCard({
  value, selected, onClick, title, description, icon,
}: {
  value: SignUpRole; selected: boolean; onClick: () => void;
  title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <button
      type="button" onClick={onClick}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center ${
        selected
          ? 'border-blue-500 bg-blue-50 text-blue-700'
          : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
      }`}
    >
      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${selected ? 'bg-blue-100' : 'bg-slate-100'}`}>
        {icon}
      </div>
      <div>
        <div className="text-sm font-semibold leading-tight">{title}</div>
        <div className="text-xs mt-0.5 opacity-75">{description}</div>
      </div>
    </button>
  );
}

// ── Employer sign-up form ─────────────────────────────────────────────────────

function EmployerForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUpEmployer, undefined);
  const e = state?.errors ?? {};
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Email" name="email" type="email" placeholder="hr@company.ru" error={e.email} />
        </div>
        <Field label="Пароль" name="password" type="password" placeholder="Минимум 6 символов" error={e.password} />
        <Field label="Повторите пароль" name="confirm" type="password" placeholder="••••••••" error={e.confirm} />
        <div className="sm:col-span-2">
          <Field label="Название организации" name="name" placeholder='ООО «ТехноСервис»' error={e.name} />
        </div>
        <Field label="ИНН" name="inn" placeholder="7700000001" error={e.inn} />
        <Field label="Регион" name="region" placeholder="Москва" error={e.region} />
        <Field label="Город" name="city" placeholder="Москва" error={e.city} />
        <Field label="Контактное лицо" name="contactName" placeholder="Иванов Алексей" error={e.contactName} />
        <div className="sm:col-span-2">
          <Field label="Телефон" name="phone" type="tel" placeholder="+7 (900) 000-00-00" error={e.phone} />
        </div>
      </div>
      {state?.error && (
        <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <SubmitBtn pending={pending} label="Зарегистрироваться" />
      <p className="text-xs text-slate-400 text-center">
        После регистрации аккаунт проходит проверку администратора
      </p>
    </form>
  );
}

// ── Seeker sign-up form ───────────────────────────────────────────────────────

function SeekerForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUpSeeker, undefined);
  const e = state?.errors ?? {};
  return (
    <form action={action} className="space-y-3">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Email" name="email" type="email" placeholder="you@example.ru" error={e.email} />
        </div>
        <Field label="Пароль" name="password" type="password" placeholder="Минимум 6 символов" error={e.password} />
        <Field label="Повторите пароль" name="confirm" type="password" placeholder="••••••••" error={e.confirm} />
        <Field label="Фамилия" name="lastName" placeholder="Иванова" error={e.lastName} />
        <Field label="Имя" name="firstName" placeholder="Мария" error={e.firstName} />

        {/* Gender */}
        <div className="sm:col-span-2">
          <label className="text-xs font-medium text-slate-600 mb-1.5 block">
            Пол<span className="text-red-500 ml-0.5">*</span>
          </label>
          <div className="flex gap-3">
            {([['MALE', 'Мужской'], ['FEMALE', 'Женский']] as const).map(([val, label]) => (
              <label key={val} className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="gender" value={val} className="text-blue-600 border-slate-300" />
                <span className="text-sm text-slate-700">{label}</span>
              </label>
            ))}
          </div>
          {e.gender && <p className="text-xs text-red-500 mt-1">{e.gender}</p>}
        </div>

        <Field label="Дата рождения" name="birthDate" type="date" error={e.birthDate} />
        <Field label="Желаемая должность" name="position" placeholder="Специалист по закупкам" error={e.position} />
        <Field label="Город" name="city" placeholder="Москва" error={e.city} />
        <Field label="Регион" name="region" placeholder="Москва" error={e.region} />
      </div>
      {state?.error && (
        <div className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <SubmitBtn pending={pending} label="Создать аккаунт" />
    </form>
  );
}

// ── Sign Up wrapper ───────────────────────────────────────────────────────────

function SignUpForm() {
  const [role, setRole] = useState<SignUpRole>('employer');
  return (
    <div className="space-y-5">
      <div className="flex gap-3">
        <RoleCard
          value="employer" selected={role === 'employer'} onClick={() => setRole('employer')}
          title="Работодатель" description="Ищу специалистов"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <RoleCard
          value="seeker" selected={role === 'seeker'} onClick={() => setRole('seeker')}
          title="Соискатель" description="Ищу работу"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
      </div>
      {role === 'employer' ? <EmployerForm /> : <SeekerForm />}
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg mb-3">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
          <h1 className="text-xl font-bold text-slate-800">ПРОкадры</h1>
          <p className="text-sm text-slate-500">ЗаказРФ · Закупки и специалисты</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-slate-100">
            {([['signin', 'Войти'], ['signup', 'Регистрация']] as const).map(([key, label]) => (
              <button
                key={key}
                onClick={() => setTab(key)}
                className={`flex-1 py-3.5 text-sm font-semibold transition-all ${
                  tab === key
                    ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/30'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Form body */}
          <div className="p-6 md:p-8">
            {tab === 'signin' ? <SignInForm /> : <SignUpForm />}
          </div>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          © 2026 ПРОкадры · Платформа для специалистов по закупкам
        </p>
      </div>
    </div>
  );
}
