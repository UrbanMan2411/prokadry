'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import { signIn, signUpEmployer, signUpSeeker } from '@/app/actions/auth';
import type { SignInState, SignUpState } from '@/app/actions/auth';

// ── Icons ────────────────────────────────────────────────────────────────────

function EyeIcon({ open }: { open: boolean }) {
  return open ? (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>
  ) : (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
      <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
    </svg>
  );
}

// ── Shared primitives ────────────────────────────────────────────────────────

function Field({
  label, name, type = 'text', placeholder, error, required = true, value, onChange, autoComplete, verified,
}: {
  label: string; name: string; type?: string; placeholder?: string; error?: string; required?: boolean;
  value?: string; onChange?: (v: string) => void; autoComplete?: string; verified?: boolean;
}) {
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-600 mb-1 flex items-center gap-1.5">
        <span>{label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}</span>
        {verified && <span className="text-emerald-600 text-xs font-medium">· из ИНН</span>}
      </label>
      <input
        id={id}
        name={name} type={type} placeholder={placeholder} required={required}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-err` : undefined}
        {...(value !== undefined ? { value, onChange: (e: React.ChangeEvent<HTMLInputElement>) => onChange?.(e.target.value) } : {})}
        className={`w-full rounded-lg border text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${
          verified ? 'border-emerald-300 bg-emerald-50/40' : error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'
        }`}
      />
      {error && <p id={`${id}-err`} role="alert" className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function PasswordField({
  label, name, placeholder, error, required = true, autoComplete,
}: {
  label: string; name: string; placeholder?: string; error?: string; required?: boolean; autoComplete?: string;
}) {
  const [show, setShow] = useState(false);
  const id = `field-${name}`;
  return (
    <div>
      <label htmlFor={id} className="text-xs font-medium text-slate-600 mb-1 block">
        {label}{required && <span className="text-red-500 ml-0.5" aria-hidden="true">*</span>}
      </label>
      <div className="relative">
        <input
          id={id} name={name} type={show ? 'text' : 'password'}
          placeholder={placeholder} required={required} autoComplete={autoComplete}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
          className={`w-full rounded-lg border text-sm px-3 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${error ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          aria-label={show ? 'Скрыть пароль' : 'Показать пароль'}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          <EyeIcon open={show} />
        </button>
      </div>
      {error && <p id={`${id}-err`} role="alert" className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  );
}

function SubmitBtn({ pending, label }: { pending: boolean; label: string }) {
  return (
    <button
      type="submit" disabled={pending} aria-busy={pending}
      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-[0.98] text-white text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-sm cursor-pointer"
    >
      {pending ? 'Подождите...' : label}
    </button>
  );
}

// ── Sign In form ─────────────────────────────────────────────────────────────

function SignInForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, undefined);
  return (
    <form action={action} className="space-y-4" noValidate>
      <Field label="Email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
      <div className="space-y-1">
        <PasswordField label="Пароль" name="password" placeholder="••••••••" autoComplete="current-password" />
        <div className="text-right">
          <button type="button" className="text-xs text-blue-600 hover:text-blue-700 transition cursor-pointer">
            Забыли пароль?
          </button>
        </div>
      </div>
      {state?.error && (
        <div role="alert" className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <SubmitBtn pending={pending} label="Войти" />
      <p className="text-center text-xs text-slate-500">
        Нет аккаунта?{' '}
        <button type="button" onClick={onSwitchTab} className="text-blue-600 font-medium hover:underline cursor-pointer">
          Зарегистрироваться
        </button>
      </p>
    </form>
  );
}

// ── Role selector ─────────────────────────────────────────────────────────────

type SignUpRole = 'employer' | 'seeker' | 'region_map';

function RoleCard({
  value, selected, onClick, title, description, icon,
}: {
  value: SignUpRole; selected: boolean; onClick: () => void;
  title: string; description: string; icon: React.ReactNode;
}) {
  return (
    <button
      type="button" onClick={onClick} aria-pressed={selected}
      className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all text-center cursor-pointer ${
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

const INN_DB: Record<string, { name: string; region: string; city: string }> = {
  '7700000001': { name: 'ООО «ТехноСервис»', region: 'Москва', city: 'Москва' },
  '7800000001': { name: 'АО «ГородСтрой»', region: 'Санкт-Петербург', city: 'Санкт-Петербург' },
  '6600000001': { name: 'ФГУП «РосТех»', region: 'Свердловская область', city: 'Екатеринбург' },
};

function EmployerForm() {
  const [state, action, pending] = useActionState<SignUpState, FormData>(signUpEmployer, undefined);
  const errs = state?.errors ?? {};

  const [inn, setInn] = useState('');
  const [orgName, setOrgName] = useState('');
  const [region, setRegion] = useState('');
  const [city, setCity] = useState('');
  const [innStatus, setInnStatus] = useState<'idle' | 'loading' | 'found' | 'not_found' | 'invalid'>('idle');
  const [innResult, setInnResult] = useState<{ name: string; region: string; city: string } | null>(null);
  const [innFilled, setInnFilled] = useState(false);

  const lookupInn = (val?: string) => {
    const target = val ?? inn;
    if (!/^\d{10}(\d{2})?$/.test(target)) { setInnStatus('invalid'); return; }
    setInnStatus('loading');
    setTimeout(() => {
      const found = INN_DB[target] ?? null;
      setInnResult(found);
      setInnStatus(found ? 'found' : 'not_found');
    }, 800);
  };

  const applyInn = () => {
    if (!innResult) return;
    setOrgName(innResult.name);
    setRegion(innResult.region);
    setCity(innResult.city);
    setInnFilled(true);
    setInnStatus('idle');
  };

  return (
    <form action={action} className="space-y-3" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Email" name="email" type="email" placeholder="hr@company.ru" error={errs.email} autoComplete="email" />
        </div>
        <PasswordField label="Пароль" name="password" placeholder="Минимум 6 символов" error={errs.password} autoComplete="new-password" />
        <PasswordField label="Повторите пароль" name="confirm" placeholder="••••••••" error={errs.confirm} autoComplete="new-password" />

        {/* INN with lookup */}
        <div className="sm:col-span-2">
          <label htmlFor="field-inn" className="text-xs font-medium text-slate-600 mb-1 block">
            ИНН<span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
          </label>
          <div className="flex gap-2">
            <input
              id="field-inn"
              name="inn" value={inn} onChange={ev => {
                const v = ev.target.value.replace(/\D/g, '').slice(0, 12);
                setInn(v); setInnStatus('idle'); setInnFilled(false);
                if (v.length === 10 || v.length === 12) lookupInn(v);
              }}
              placeholder="7700000001" required
              autoComplete="off"
              aria-invalid={errs.inn ? true : undefined}
              aria-describedby={errs.inn ? 'field-inn-err' : innStatus === 'invalid' ? 'inn-fmt-err' : innStatus === 'not_found' ? 'inn-notfound' : undefined}
              className={`flex-1 rounded-lg border text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition ${errs.inn ? 'border-red-400 bg-red-50' : 'border-slate-200 bg-white'}`}
            />
            <button
              type="button" onClick={() => lookupInn()} disabled={innStatus === 'loading'}
              className="px-3 py-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-sm text-slate-700 font-medium transition disabled:opacity-60 whitespace-nowrap cursor-pointer"
            >
              {innStatus === 'loading' ? '...' : 'Найти'}
            </button>
          </div>
          {errs.inn && <p id="field-inn-err" role="alert" className="text-xs text-red-500 mt-1">{errs.inn}</p>}
          {innStatus === 'invalid' && <p id="inn-fmt-err" role="alert" className="text-xs text-red-500 mt-1">ИНН: 10 или 12 цифр</p>}
          {innStatus === 'not_found' && <p id="inn-notfound" role="status" className="text-xs text-amber-600 mt-1">Организация не найдена — заполните вручную</p>}
          {innStatus === 'found' && innResult && (
            <div role="status" className="mt-2 px-3 py-2 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs font-semibold text-emerald-800">{innResult.name}</p>
                <p className="text-xs text-emerald-600">{innResult.city}, {innResult.region}</p>
              </div>
              <button
                type="button" onClick={applyInn}
                className="text-xs px-2.5 py-1 rounded-md bg-emerald-600 text-white font-medium hover:bg-emerald-700 transition whitespace-nowrap cursor-pointer"
              >
                Заполнить
              </button>
            </div>
          )}
        </div>

        <div className="sm:col-span-2">
          <Field label="Название организации" name="name" placeholder='ООО «ТехноСервис»' error={errs.name}
            value={orgName} onChange={v => { setOrgName(v); setInnFilled(false); }} autoComplete="organization" verified={innFilled && !!orgName} />
        </div>
        <Field label="Регион" name="region" placeholder="Москва" error={errs.region}
          value={region} onChange={v => { setRegion(v); setInnFilled(false); }} autoComplete="address-level1" verified={innFilled && !!region} />
        <Field label="Город" name="city" placeholder="Москва" error={errs.city}
          value={city} onChange={v => { setCity(v); setInnFilled(false); }} autoComplete="address-level2" verified={innFilled && !!city} />
        <Field label="Контактное лицо" name="contactName" placeholder="Иванов Алексей" error={errs.contactName} autoComplete="name" />
        <div className="sm:col-span-2">
          <Field label="Телефон" name="phone" type="tel" placeholder="+7 (900) 000-00-00" error={errs.phone} autoComplete="tel" />
        </div>
      </div>
      {state?.error && (
        <div role="alert" className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
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
  const errs = state?.errors ?? {};
  return (
    <form action={action} className="space-y-3" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="sm:col-span-2">
          <Field label="Email" name="email" type="email" placeholder="you@example.ru" error={errs.email} autoComplete="email" />
        </div>
        <PasswordField label="Пароль" name="password" placeholder="Минимум 6 символов" error={errs.password} autoComplete="new-password" />
        <PasswordField label="Повторите пароль" name="confirm" placeholder="••••••••" error={errs.confirm} autoComplete="new-password" />
        <Field label="Фамилия" name="lastName" placeholder="Иванова" error={errs.lastName} autoComplete="family-name" />
        <Field label="Имя" name="firstName" placeholder="Мария" error={errs.firstName} autoComplete="given-name" />

        {/* Gender */}
        <div className="sm:col-span-2">
          <fieldset>
            <legend className="text-xs font-medium text-slate-600 mb-1.5 block">
              Пол<span className="text-red-500 ml-0.5" aria-hidden="true">*</span>
            </legend>
            <div role="radiogroup" aria-label="Пол" className="flex gap-3">
              {([['MALE', 'Мужской'], ['FEMALE', 'Женский']] as const).map(([val, label]) => (
                <label key={val} className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="gender" value={val} className="text-blue-600 border-slate-300" />
                  <span className="text-sm text-slate-700">{label}</span>
                </label>
              ))}
            </div>
            {errs.gender && <p role="alert" className="text-xs text-red-500 mt-1">{errs.gender}</p>}
          </fieldset>
        </div>

        <Field label="Дата рождения" name="birthDate" type="date" error={errs.birthDate} autoComplete="bday" />
        <Field label="Желаемая должность" name="position" placeholder="Специалист по закупкам" error={errs.position} />
        <Field label="Город" name="city" placeholder="Москва" error={errs.city} autoComplete="address-level2" />
        <Field label="Регион" name="region" placeholder="Москва" error={errs.region} autoComplete="address-level1" />
      </div>
      {state?.error && (
        <div role="alert" className="px-3 py-2.5 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
          {state.error}
        </div>
      )}
      <SubmitBtn pending={pending} label="Создать аккаунт" />
      <p className="text-xs text-slate-400 text-center">Регистрация для соискателей бесплатна</p>
    </form>
  );
}

// ── Sign Up wrapper ───────────────────────────────────────────────────────────

function SignUpForm({ onSwitchTab }: { onSwitchTab: () => void }) {
  const [role, setRole] = useState<SignUpRole>('employer');
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Тип аккаунта">
        <RoleCard
          value="employer" selected={role === 'employer'} onClick={() => setRole('employer')}
          title="Работодатель" description="Ищу специалистов"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          }
        />
        <RoleCard
          value="seeker" selected={role === 'seeker'} onClick={() => setRole('seeker')}
          title="Соискатель" description="Ищу работу"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />
        <RoleCard
          value="region_map" selected={role === 'region_map'} onClick={() => setRole('region_map')}
          title="Кадровая карта" description="Статистика региона"
          icon={
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
      </div>
      {role === 'region_map' && (
        <div className="px-4 py-3 rounded-lg bg-blue-50 border border-blue-200 text-sm text-blue-800 space-y-1">
          <p className="font-semibold">Кадровая карта региона</p>
          <p className="text-xs text-blue-600">Доступ к статистике рынка труда по муниципалитетам, дашбордам, выгрузке данных и рассылке отчётов. Для органов власти и региональных структур.</p>
        </div>
      )}
      {role === 'employer' ? <EmployerForm /> : role === 'seeker' ? <SeekerForm /> : <EmployerForm />}
      <p className="text-center text-xs text-slate-500">
        Уже есть аккаунт?{' '}
        <button type="button" onClick={onSwitchTab} className="text-blue-600 font-medium hover:underline cursor-pointer">
          Войти
        </button>
      </p>
    </div>
  );
}

// ── Left panel (desktop) ──────────────────────────────────────────────────────

function LeftPanel() {
  return (
    <div className="hidden lg:flex lg:w-[420px] xl:w-[460px] flex-col bg-gradient-to-br from-blue-950 to-blue-700 p-10 relative overflow-hidden shrink-0">
      <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full bg-blue-500 opacity-20 pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-blue-900 opacity-40 pointer-events-none" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 relative z-10 no-underline" style={{ textDecoration: 'none' }}>
        <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <span className="text-white font-bold text-xl">ПРОкадры</span>
      </Link>

      {/* Main copy */}
      <div className="relative z-10 mt-auto">
        <h2 className="text-white text-2xl xl:text-3xl font-bold leading-tight mb-3">
          HR-платформа для сферы закупок
        </h2>
        <p className="text-blue-200 text-sm leading-relaxed mb-10">
          Умный поиск, AI-помощник и рабочие кабинеты для работодателей и соискателей по 44-ФЗ и 223-ФЗ.
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { n: '1 000+', l: 'резюме в базе' },
            { n: '100+', l: 'компаний' },
            { n: 'AI', l: 'умный поиск' },
          ].map(s => (
            <div key={s.n}>
              <div className="text-white font-bold text-xl xl:text-2xl">{s.n}</div>
              <div className="text-blue-300 text-xs mt-0.5">{s.l}</div>
            </div>
          ))}
        </div>

        {/* Testimonial */}
        <div className="bg-white/10 rounded-2xl p-5 border border-white/10">
          <div className="text-blue-200 text-2xl leading-none mb-3 font-serif">"</div>
          <p className="text-white/80 text-sm leading-relaxed mb-4">
            Нашли контрактного управляющего за 3 дня. Платформа знает специфику 44-ФЗ — не нужно объяснять что такое ЕИС.
          </p>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-blue-400/30 border border-blue-300/20 flex items-center justify-center text-xs text-white font-bold shrink-0">АМ</div>
            <div>
              <div className="text-white text-xs font-semibold">Анна М.</div>
              <div className="text-blue-300 text-xs">HR-директор, ООО «ТехноСервис»</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AuthPage() {
  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  return (
    <div className="min-h-screen bg-slate-50 flex">
      <LeftPanel />

      {/* Right: form */}
      <div className="flex-1 flex items-start lg:items-center justify-center p-6 overflow-y-auto">
        <div className="w-full max-w-lg py-8 lg:py-0">

          {/* Mobile logo */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <Link href="/" className="flex flex-col items-center" style={{ textDecoration: 'none' }}>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center shadow-lg mb-3" aria-hidden="true">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-slate-800">ПРОкадры</h1>
              <p className="text-sm text-slate-500 mt-0.5">HR-платформа для закупок</p>
            </Link>
          </div>

          {/* Card */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            {/* Tabs */}
            <div role="tablist" className="flex border-b border-slate-100">
              {([['signin', 'Войти'], ['signup', 'Регистрация']] as const).map(([key, label]) => (
                <button
                  key={key}
                  role="tab"
                  aria-selected={tab === key}
                  aria-controls={`tabpanel-${key}`}
                  id={`tab-${key}`}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-3.5 text-sm font-semibold transition-all cursor-pointer ${
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
            <div
              role="tabpanel"
              id={`tabpanel-${tab}`}
              aria-labelledby={`tab-${tab}`}
              className="p-6 md:p-8"
            >
              {tab === 'signin'
                ? <SignInForm onSwitchTab={() => setTab('signup')} />
                : <SignUpForm onSwitchTab={() => setTab('signin')} />
              }
            </div>
          </div>

          <p className="text-center text-xs text-slate-400 mt-6">
            © 2026 ПРОкадры · Платформа для специалистов по закупкам
          </p>
        </div>
      </div>
    </div>
  );
}
