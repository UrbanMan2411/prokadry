'use client';

import { useState } from 'react';
import type { Resume, Employer, Vacancy, AuditLog } from '@/lib/types';
import { ADMIN_STATS, DICTIONARIES } from '@/lib/mock-data';
import { fmtDate, fmtDateTime, fmtSalary, fmtExp } from '@/lib/utils';
import { Badge, Btn, Input, StatCard, StatusBadge, Avatar } from './ui';

// ── Admin Dashboard ────────────────────────────────────────────────────────
export function AdminDashboard({ logs }: { logs: AuditLog[] }) {
  const s = ADMIN_STATS;
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Панель администратора</h1>
        <p className="text-sm text-slate-500 mt-0.5">Обзор системы ПРОкадры</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Резюме всего" value={s.totalResumes} color="blue" sub={`${s.activeResumes} активных`} icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        } />
        <StatCard label="На проверке" value={s.pendingResumes} color="amber" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
        <StatCard label="Работодатели" value={s.totalEmployers} color="purple" sub={`${s.approvedEmployers} одобрено`} icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
        } />
        <StatCard label="Вакансии" value={s.totalVacancies} color="green" sub={`${s.activeVacancies} активных`} icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        } />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Последние события</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {logs.slice(0, 10).map(log => (
            <div key={log.id} className="flex items-center gap-4 px-5 py-3">
              <div className="w-2 h-2 rounded-full bg-blue-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-slate-800">{log.action}</span>
                <span className="text-xs text-slate-400 ml-2">{log.details}</span>
              </div>
              <div className="text-xs text-slate-500">{log.user}</div>
              <div className="text-xs text-slate-400 whitespace-nowrap">{fmtDateTime(log.timestamp)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Admin Resumes ──────────────────────────────────────────────────────────
export function AdminResumes({ resumes, setResumes }: {
  resumes: Resume[]; setResumes: (fn: (prev: Resume[]) => Resume[]) => void;
}) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const filtered = resumes.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search && !r.fullName.toLowerCase().includes(search.toLowerCase()) &&
        !r.position.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const approve = (id: string) => setResumes(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r));
  const reject = (id: string) => setResumes(prev => prev.map(r => r.id === id ? { ...r, status: 'draft' } : r));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Модерация резюме</h1>
          <p className="text-sm text-slate-500 mt-0.5">{filtered.length} из {resumes.length}</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <Input value={search} onChange={setSearch} placeholder="Поиск по имени, должности..."
          className="flex-1"
          prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
          className="rounded-lg border border-slate-200 bg-white text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Все статусы</option>
          <option value="active">Активные</option>
          <option value="pending">На проверке</option>
          <option value="draft">Черновик</option>
        </select>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['', 'ID', 'Кандидат', 'Должность', 'Город', 'Опыт', 'Статус', 'Дата', 'Действия'].map(h => (
                <th key={h} className="px-3 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(r => (
              <tr key={r.id} className="hover:bg-slate-50 transition">
                <td className="px-3 py-3"><Avatar src={r.photo} name={r.fullName} size="sm" /></td>
                <td className="px-3 py-3 font-mono text-xs text-slate-400">{r.id}</td>
                <td className="px-3 py-3 font-medium text-slate-800">{r.fullName.split(' ').slice(0, 2).join(' ')}</td>
                <td className="px-3 py-3 text-slate-600 max-w-[180px] truncate">{r.position}</td>
                <td className="px-3 py-3 text-slate-500">{r.city}</td>
                <td className="px-3 py-3 text-slate-500">{fmtExp(r.experience)}</td>
                <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                <td className="px-3 py-3 text-slate-400 text-xs">{fmtDate(r.publishedAt)}</td>
                <td className="px-3 py-3">
                  <div className="flex gap-1.5">
                    {r.status === 'pending' && (
                      <>
                        <Btn size="xs" variant="primary" onClick={() => approve(r.id)}>Одобрить</Btn>
                        <Btn size="xs" variant="danger" onClick={() => reject(r.id)}>Отклонить</Btn>
                      </>
                    )}
                    {r.status !== 'pending' && (
                      <Btn size="xs" variant="ghost" onClick={() => setResumes(prev => prev.map(x => x.id === r.id ? { ...x, status: 'pending' } : x))}>
                        На проверку
                      </Btn>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Employers ────────────────────────────────────────────────────────
export function AdminEmployers({ employers, setEmployers }: {
  employers: Employer[]; setEmployers: (fn: (prev: Employer[]) => Employer[]) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = employers.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.contactName.toLowerCase().includes(search.toLowerCase())
  );

  const approve = (id: string) => setEmployers(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
  const reject = (id: string) => setEmployers(prev => prev.map(e => e.id === id ? { ...e, status: 'pending' } : e));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Работодатели</h1>
        <p className="text-sm text-slate-500 mt-0.5">{employers.filter(e => e.status === 'approved').length} одобрено, {employers.filter(e => e.status === 'pending').length} ожидают</p>
      </div>
      <div className="mb-4">
        <Input value={search} onChange={setSearch} placeholder="Поиск по названию, контакту..."
          prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Организация', 'ИНН', 'Регион', 'Контакт', 'Email', 'Вакансии', 'Статус', 'Действия'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(e => (
              <tr key={e.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3 font-semibold text-slate-800 max-w-[200px] truncate">{e.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-slate-500">{e.inn}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{e.region}</td>
                <td className="px-4 py-3 text-slate-600">{e.contactName}</td>
                <td className="px-4 py-3 text-slate-400 text-xs">{e.email}</td>
                <td className="px-4 py-3 text-center">
                  <Badge color="blue">{e.vacancyCount}</Badge>
                </td>
                <td className="px-4 py-3"><StatusBadge status={e.status} /></td>
                <td className="px-4 py-3">
                  {e.status === 'pending'
                    ? <Btn size="xs" variant="primary" onClick={() => approve(e.id)}>Одобрить</Btn>
                    : <Btn size="xs" variant="ghost" onClick={() => reject(e.id)}>Снять</Btn>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Vacancies ────────────────────────────────────────────────────────
export function AdminVacancies({ vacancies, setVacancies }: {
  vacancies: Vacancy[]; setVacancies: (fn: (prev: Vacancy[]) => Vacancy[]) => void;
}) {
  const [search, setSearch] = useState('');
  const filtered = vacancies.filter(v => v.title.toLowerCase().includes(search.toLowerCase()) || v.employerName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Все вакансии</h1>
        <p className="text-sm text-slate-500 mt-0.5">{vacancies.filter(v => v.status === 'active').length} активных</p>
      </div>
      <div className="mb-4">
        <Input value={search} onChange={setSearch} placeholder="Поиск по вакансии, работодателю..."
          prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Вакансия', 'Работодатель', 'Город', 'Зарплата', 'Режим', 'Статус', 'Создана', 'Действия'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(v => (
              <tr key={v.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="font-semibold text-slate-800">{v.title}</div>
                  <div className="text-xs text-slate-400">{v.department}</div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-[160px] truncate">{v.employerName}</td>
                <td className="px-4 py-3 text-slate-600">{v.city}</td>
                <td className="px-4 py-3 text-slate-700 whitespace-nowrap text-xs">
                  {v.salaryFrom.toLocaleString('ru-RU')}–{v.salaryTo.toLocaleString('ru-RU')} ₽
                </td>
                <td className="px-4 py-3"><Badge color="slate">{v.workMode}</Badge></td>
                <td className="px-4 py-3"><StatusBadge status={v.status} /></td>
                <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(v.createdAt)}</td>
                <td className="px-4 py-3">
                  {v.status === 'active'
                    ? <Btn size="xs" variant="ghost" onClick={() => setVacancies(prev => prev.map(x => x.id === v.id ? { ...x, status: 'archived' } : x))}>В архив</Btn>
                    : <Btn size="xs" variant="ghost" onClick={() => setVacancies(prev => prev.map(x => x.id === v.id ? { ...x, status: 'active' } : x))}>Активировать</Btn>
                  }
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Users ────────────────────────────────────────────────────────────
export function AdminUsers({ employers }: { employers: Employer[] }) {
  const [search, setSearch] = useState('');
  const users = [
    ...employers.map(e => ({ id: e.id, name: e.contactName, org: e.name, email: e.email, role: 'Работодатель', status: e.status, date: e.registeredAt })),
    { id: 'USR-001', name: 'Иванова Мария Сергеевна', org: '', email: 'maria@example.ru', role: 'Соискатель', status: 'approved', date: '2026-01-15' },
    { id: 'USR-002', name: 'Петров Александр Иванович', org: '', email: 'petrov@example.ru', role: 'Соискатель', status: 'approved', date: '2026-02-03' },
    { id: 'ADMIN', name: 'Администратор', org: 'ЗаказРФ', email: 'admin@zakaz.rf', role: 'Администратор', status: 'approved', date: '2025-01-01' },
  ];
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Пользователи</h1>
        <p className="text-sm text-slate-500 mt-0.5">{users.length} всего</p>
      </div>
      <div className="mb-4">
        <Input value={search} onChange={setSearch} placeholder="Поиск по имени, email..."
          prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Имя', 'Организация', 'Email', 'Роль', 'Статус', 'Зарегистрирован'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(u => (
              <tr key={u.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={u.name} size="sm" />
                    <span className="font-medium text-slate-800">{u.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-500 text-xs max-w-[160px] truncate">{u.org || '—'}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{u.email}</td>
                <td className="px-4 py-3">
                  <Badge color={u.role === 'Администратор' ? 'purple' : u.role === 'Работодатель' ? 'blue' : 'cyan'}>
                    {u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3"><StatusBadge status={u.status} /></td>
                <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(u.date)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Admin Dictionaries ─────────────────────────────────────────────────────
export function AdminDicts() {
  const [dicts, setDicts] = useState({ ...DICTIONARIES });
  const [newItem, setNewItem] = useState<Record<string, string>>({});
  const [saved, setSaved] = useState(false);

  const addItem = (key: keyof typeof dicts) => {
    const val = newItem[key]?.trim();
    if (!val) return;
    setDicts(d => ({ ...d, [key]: [...d[key], val] }));
    setNewItem(n => ({ ...n, [key]: '' }));
    setSaved(false);
  };

  const removeItem = (key: keyof typeof dicts, idx: number) => {
    setDicts(d => ({ ...d, [key]: d[key].filter((_, i) => i !== idx) }));
    setSaved(false);
  };

  const sections = [
    { key: 'positions' as const, label: 'Должности' },
    { key: 'activityAreas' as const, label: 'Сферы деятельности' },
    { key: 'workModes' as const, label: 'Режимы работы' },
    { key: 'educations' as const, label: 'Образование' },
    { key: 'tests' as const, label: 'Тесты' },
    { key: 'specialStatuses' as const, label: 'Особые статусы' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Справочники</h1>
          <p className="text-sm text-slate-500 mt-0.5">Управление классификаторами платформы</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && <span className="text-sm text-emerald-600">✓ Сохранено</span>}
          <Btn variant="primary" onClick={() => setSaved(true)}>Сохранить изменения</Btn>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {sections.map(({ key, label }) => (
          <div key={key} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">{label}</h3>
            <div className="space-y-1 mb-3 max-h-48 overflow-y-auto">
              {dicts[key].map((item, i) => (
                <div key={i} className="flex items-center justify-between gap-2 px-2 py-1 rounded hover:bg-slate-50 group">
                  <span className="text-sm text-slate-700">{item}</span>
                  <button
                    onClick={() => removeItem(key, i)}
                    aria-label={`Удалить «${item}»`}
                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition focus-visible:opacity-100 focus-visible:outline-none focus-visible:text-red-500"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newItem[key] ?? ''}
                onChange={v => setNewItem(n => ({ ...n, [key]: v }))}
                placeholder="Добавить..."
                className="flex-1"
              />
              <Btn size="sm" variant="secondary" onClick={() => addItem(key)}>+</Btn>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Admin Logs ─────────────────────────────────────────────────────────────
export function AdminLogs({ logs }: { logs: AuditLog[] }) {
  const [search, setSearch] = useState('');
  const filtered = logs.filter(l =>
    l.action.toLowerCase().includes(search.toLowerCase()) ||
    l.user.toLowerCase().includes(search.toLowerCase())
  );

  const actionColors: Record<string, string> = {
    'Резюме добавлено': 'blue',
    'Резюме одобрено': 'green',
    'Резюме отклонено': 'red',
    'Работодатель зарегистрирован': 'purple',
    'Вакансия создана': 'cyan',
    'Приглашение отправлено': 'amber',
    'Сообщение отправлено': 'slate',
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Журнал событий</h1>
        <p className="text-sm text-slate-500 mt-0.5">{logs.length} событий</p>
      </div>
      <div className="mb-4">
        <Input value={search} onChange={setSearch} placeholder="Поиск по действию, пользователю..."
          prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </div>
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Событие', 'Пользователь', 'Роль', 'Детали', 'Время'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map(log => (
              <tr key={log.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <Badge color={(actionColors[log.action] ?? 'slate') as 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'slate' | 'purple'}>
                    {log.action}
                  </Badge>
                </td>
                <td className="px-4 py-3 font-medium text-slate-800">{log.user}</td>
                <td className="px-4 py-3 text-slate-500 text-xs">{log.role}</td>
                <td className="px-4 py-3 text-slate-400 text-xs font-mono">{log.details}</td>
                <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDateTime(log.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
