'use client';

import React, { useState, useEffect } from 'react';
import type { Resume, Employer, Vacancy, AuditLog, AdminStats } from '@/lib/types';
import { DICTIONARIES } from '@/lib/mock-data';
import { fmtDate, fmtDateTime, fmtSalary, fmtExp } from '@/lib/utils';
import { Badge, Btn, Input, StatCard, StatusBadge, Avatar } from './ui';

// ── Admin Dashboard ────────────────────────────────────────────────────────
export function AdminDashboard({ logs }: { logs: AuditLog[] }) {
  const [s, setS] = useState<AdminStats>({ totalResumes: 0, activeResumes: 0, pendingResumes: 0, totalEmployers: 0, approvedEmployers: 0, totalVacancies: 0, activeVacancies: 0, totalInvitations: 0 });
  useEffect(() => {
    fetch('/api/admin/stats').then(r => r.json()).then(setS).catch(() => {});
  }, []);
  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Панель администратора</h1>
        <p className="text-sm text-slate-500 mt-0.5">Обзор системы ПРОкадры</p>
      </div>

      {/* Татарстан интеграция */}
      <div className="mb-6 flex items-start gap-3 px-4 py-3 bg-blue-50 border border-blue-200 rounded-xl">
        <svg className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-blue-800">Интеграция: Портал Службы занятости РТ</p>
          <p className="text-xs text-blue-600 mt-0.5">Синхронизация соискателей с tatartrud.ru запланирована. Текущий статус: настройка API.</p>
        </div>
        <a href="https://portal.tatartrud.ru/ER/JobApplicants" target="_blank" rel="noreferrer"
          className="flex-shrink-0 text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition whitespace-nowrap">
          Открыть портал
        </a>
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
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const filtered = resumes.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (search && !r.fullName.toLowerCase().includes(search.toLowerCase()) &&
        !r.position.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const approve = (id: string) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, status: 'active' } : r));
    fetch(`/api/resumes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'ACTIVE' }) }).catch(() => {});
  };
  const reject = (id: string) => {
    setResumes(prev => prev.map(r => r.id === id ? { ...r, status: 'draft' } : r));
    fetch(`/api/resumes/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'REJECTED' }) }).catch(() => {});
  };

  const confirmStatus = (resumeId: string, value: string, confirmed: boolean) => {
    setResumes(prev => prev.map(r => r.id === resumeId ? {
      ...r,
      specialStatuses: r.specialStatuses.map(s => s.value === value ? { ...s, confirmed } : s),
    } : r));
    fetch(`/api/resumes/${resumeId}/confirm-status`, {
      method: 'PATCH', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value, confirmed }),
    }).catch(() => {});
  };

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
              <React.Fragment key={r.id}>
                <tr className="hover:bg-slate-50 transition">
                  <td className="px-3 py-3"><Avatar src={r.photo} name={r.fullName} size="sm" /></td>
                  <td className="px-3 py-3 font-mono text-xs text-slate-400">{r.id.slice(0, 8)}…</td>
                  <td className="px-3 py-3 font-medium text-slate-800">{r.fullName.split(' ').slice(0, 2).join(' ')}</td>
                  <td className="px-3 py-3 text-slate-600 max-w-[180px] truncate">{r.position}</td>
                  <td className="px-3 py-3 text-slate-500">{r.city}</td>
                  <td className="px-3 py-3 text-slate-500">{fmtExp(r.experience)}</td>
                  <td className="px-3 py-3"><StatusBadge status={r.status} /></td>
                  <td className="px-3 py-3 text-slate-400 text-xs">{fmtDate(r.publishedAt)}</td>
                  <td className="px-3 py-3">
                    <div className="flex gap-1.5 flex-wrap">
                      {r.status !== 'active' && <Btn size="xs" variant="primary" onClick={() => approve(r.id)}>Одобрить</Btn>}
                      {r.status === 'active' && <Btn size="xs" variant="danger" onClick={() => reject(r.id)}>Отклонить</Btn>}
                      {r.specialStatuses.length > 0 && (
                        <Btn size="xs" variant="ghost" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                          Статусы {r.specialStatuses.some(s => !s.confirmed) ? '⚠' : '✓'}
                        </Btn>
                      )}
                    </div>
                  </td>
                </tr>
                {expandedId === r.id && r.specialStatuses.length > 0 && (
                  <tr key={`${r.id}-expand`} className="bg-amber-50">
                    <td colSpan={9} className="px-6 py-3">
                      <div className="text-xs font-semibold text-slate-600 mb-2">Особые статусы — требуют подтверждения:</div>
                      <div className="flex flex-wrap gap-3">
                        {r.specialStatuses.map(s => (
                          <div key={s.value} className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2">
                            <span className={`text-xs font-medium ${s.confirmed ? 'text-emerald-700' : 'text-amber-700'}`}>
                              {s.confirmed ? '✓' : '⏳'} {s.label}
                            </span>
                            {s.docDate && <span className="text-xs text-slate-400">от {s.docDate}</span>}
                            {s.docNumber && <span className="text-xs text-slate-400">№{s.docNumber}</span>}
                            {!s.confirmed
                              ? <Btn size="xs" variant="primary" onClick={() => confirmStatus(r.id, s.value, true)}>Подтвердить</Btn>
                              : <Btn size="xs" variant="ghost" onClick={() => confirmStatus(r.id, s.value, false)}>Снять</Btn>
                            }
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
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

  const approve = (id: string) => {
    setEmployers(prev => prev.map(e => e.id === id ? { ...e, status: 'approved' } : e));
    fetch(`/api/employers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'APPROVED' }),
    }).catch(() => {});
  };
  const reject = (id: string) => {
    setEmployers(prev => prev.map(e => e.id === id ? { ...e, status: 'pending' } : e));
    fetch(`/api/employers/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'SUSPENDED' }),
    }).catch(() => {});
  };

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
                    ? <Btn size="xs" variant="ghost" onClick={() => {
                        setVacancies(prev => prev.map(x => x.id === v.id ? { ...x, status: 'archived' } : x));
                        fetch(`/api/vacancies/${v.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'archived' }) }).catch(() => {});
                      }}>В архив</Btn>
                    : <Btn size="xs" variant="ghost" onClick={() => {
                        setVacancies(prev => prev.map(x => x.id === v.id ? { ...x, status: 'active' } : x));
                        fetch(`/api/vacancies/${v.id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ status: 'active' }) }).catch(() => {});
                      }}>Активировать</Btn>
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
type UserRow = { id: string; name: string; org: string; inn: string; email: string; role: string; isActive: boolean; createdAt: string };

const ROLE_LABELS: Record<string, string> = { employer: 'Работодатель', seeker: 'Соискатель', admin: 'Администратор' };

export function AdminUsers({ employers: _ }: { employers: Employer[] }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState<UserRow[]>([]);
  useEffect(() => {
    fetch('/api/admin/users').then(r => r.json()).then(setUsers).catch(() => {});
  }, []);
  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const toggleActive = (id: string, current: boolean) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !current } : u));
    fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ isActive: !current }),
    }).catch(() => {
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: current } : u));
    });
  };

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
              {['Имя', 'Организация', 'Email', 'Роль', 'Статус', 'Зарегистрирован', ''].map(h => (
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
                  <Badge color={u.role === 'admin' ? 'purple' : u.role === 'employer' ? 'blue' : 'cyan'}>
                    {ROLE_LABELS[u.role] ?? u.role}
                  </Badge>
                </td>
                <td className="px-4 py-3">
                  <StatusBadge status={u.isActive ? 'approved' : 'pending'} />
                </td>
                <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(u.createdAt)}</td>
                <td className="px-4 py-3">
                  {u.role !== 'admin' && (
                    <button
                      onClick={() => toggleActive(u.id, u.isActive)}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition cursor-pointer ${
                        u.isActive
                          ? 'border-red-200 text-red-600 hover:bg-red-50'
                          : 'border-emerald-200 text-emerald-600 hover:bg-emerald-50'
                      }`}
                    >
                      {u.isActive ? 'Заблокировать' : 'Разблокировать'}
                    </button>
                  )}
                </td>
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

// ── Admin Import ───────────────────────────────────────────────────────────

type ImportSummary = {
  source: string; query: string; fetched: number;
  created: number; skipped: number; errors: number;
  results: { sourceId: string; status: string; resumeId?: string; reason?: string }[];
};

export function AdminImport() {
  const [source, setSource] = useState<'hh' | 'avito'>('hh');
  const [query, setQuery] = useState('специалист по закупкам');
  const [limit, setLimit] = useState(20);
  const [loading, setLoading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);
  const [error, setError] = useState('');

  const PROCUREMENT_QUERIES = [
    'специалист по закупкам',
    'контрактный управляющий',
    'тендерный специалист',
    'менеджер по закупкам 44-ФЗ',
    'специалист по 223-ФЗ',
    'юрист по закупкам',
    'руководитель отдела закупок',
  ];

  async function runImport() {
    setLoading(true);
    setError('');
    setSummary(null);
    try {
      const res = await fetch('/api/admin/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source, query, limit }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Ошибка'); return; }
      setSummary(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Сетевая ошибка');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Импорт резюме в базу</h1>
        <p className="text-sm text-slate-500 mt-0.5">Наполнение базы данными с hh.ru и Avito.ru</p>
      </div>

      {/* Config */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 mb-5 space-y-4">
        {/* Source */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Источник</label>
          <div className="flex gap-3">
            <button onClick={() => setSource('hh')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${source === 'hh' ? 'border-red-400 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              <span className="w-3 h-3 rounded-full bg-red-500 inline-block" /> hh.ru
            </button>
            <button onClick={() => setSource('avito')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium transition ${source === 'avito' ? 'border-green-400 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}>
              <span className="w-3 h-3 rounded-full bg-green-500 inline-block" /> Avito
            </button>
          </div>
          {source === 'hh' && (
            <p className="text-xs text-amber-600 mt-2 bg-amber-50 rounded-lg px-3 py-2">
              Требуется <code className="font-mono">HH_EMPLOYER_TOKEN</code> в .env.local — токен аккаунта работодателя hh.ru
            </p>
          )}
        </div>

        {/* Query presets */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">Поисковый запрос</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {PROCUREMENT_QUERIES.map(q => (
              <button key={q} onClick={() => setQuery(q)}
                className={`text-xs px-2.5 py-1 rounded-full border transition ${query === q ? 'border-blue-400 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
                {q}
              </button>
            ))}
          </div>
          <input value={query} onChange={e => setQuery(e.target.value)}
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Поисковый запрос..." />
        </div>

        {/* Limit */}
        <div>
          <label className="text-xs font-semibold text-slate-600 mb-2 block">
            Количество резюме: <span className="text-blue-600">{limit}</span>
          </label>
          <input type="range" min={5} max={100} step={5} value={limit}
            onChange={e => setLimit(Number(e.target.value))}
            className="w-full accent-blue-600" />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>5</span><span>50</span><span>100</span>
          </div>
        </div>

        {error && <div className="px-3 py-2 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">{error}</div>}

        <button onClick={runImport} disabled={loading || !query.trim()}
          className="w-full py-2.5 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? (
            <><span className="animate-spin inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" />Импортируем...</>
          ) : `Запустить импорт (${source === 'hh' ? 'hh.ru' : 'Avito'})`}
        </button>
      </div>

      {/* Results */}
      {summary && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-sm font-bold text-slate-800">Результат:</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">найдено: {summary.fetched}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-700">добавлено: {summary.created}</span>
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-50 text-slate-600">пропущено: {summary.skipped}</span>
            {summary.errors > 0 && <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-red-50 text-red-600">ошибок: {summary.errors}</span>}
          </div>
          <div className="space-y-1.5 max-h-64 overflow-y-auto">
            {summary.results.map((r, i) => (
              <div key={i} className="flex items-center justify-between text-xs px-3 py-1.5 rounded-lg bg-slate-50">
                <span className="font-mono text-slate-500">{r.sourceId}</span>
                <span className={`font-medium ${r.status === 'created' ? 'text-green-600' : r.status === 'skipped' ? 'text-slate-400' : 'text-red-500'}`}>
                  {r.status === 'created' ? '✓ добавлено' : r.status === 'skipped' ? '— дубликат' : `✕ ${r.reason?.slice(0, 40)}`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Region stats helper ────────────────────────────────────────────────────
function computeRegionStatsAdmin(resumes: Resume[], vacancies: Vacancy[]) {
  const map = new Map<string, { city: string; vacs: number; res: Resume[] }>();
  vacancies.filter(v => v.status === 'active').forEach(v => {
    const key = v.region || v.city; if (!key) return;
    const e = map.get(key) ?? { city: v.city, vacs: 0, res: [] }; e.vacs++; map.set(key, e);
  });
  resumes.filter(r => r.status === 'active').forEach(r => {
    const key = r.region || r.city; if (!key) return;
    const e = map.get(key) ?? { city: r.city, vacs: 0, res: [] }; e.res.push(r); map.set(key, e);
  });
  return Array.from(map.entries()).map(([region, d]) => {
    const salaried = d.res.filter(r => r.salary);
    const avgSalary = salaried.length > 0 ? Math.round(salaried.reduce((s, r) => s + (r.salary ?? 0), 0) / salaried.length) : 0;
    const sdi = d.res.length > 0 ? Math.round((d.vacs / d.res.length) * 100) / 100 : 0;
    return { name: d.city || region, region, vacanciesCount: d.vacs, resumesCount: d.res.length, avgSalary, supplyDemandIndex: sdi, rating: Math.min(10, Math.max(1, Math.round(sdi * 3 + Math.min(d.res.length / 3, 7)))) };
  });
}

// ── Admin Regions (Кадровая карта) ─────────────────────────────────────────
export function AdminRegions({ resumes, vacancies, onOpenRegion }: {
  resumes: Resume[]; vacancies: Vacancy[];
  onOpenRegion: (region: string) => void;
}) {
  const [search, setSearch] = useState('');
  const [emailTarget, setEmailTarget] = useState('');
  const [emailSent, setEmailSent] = useState(false);

  const allRegionStats = computeRegionStatsAdmin(resumes, vacancies);
  const stats = allRegionStats.filter(r =>
    !search || r.region.toLowerCase().includes(search.toLowerCase()) || r.name.toLowerCase().includes(search.toLowerCase())
  );

  const totalResumes = resumes.filter(r => r.status === 'active').length;
  const totalVacancies = vacancies.filter(v => v.status === 'active').length;
  const deficitRegions = allRegionStats.filter(r => r.supplyDemandIndex > 1).length;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Кадровая карта регионов</h1>
        <p className="text-sm text-slate-500 mt-0.5">Статистика рынка труда специалистов по закупкам</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <StatCard label="Регионов" value={allRegionStats.length} color="blue" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064" />
          </svg>
        } />
        <StatCard label="Активных резюме" value={totalResumes} color="cyan" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
          </svg>
        } />
        <StatCard label="Активных вакансий" value={totalVacancies} color="green" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745" />
          </svg>
        } />
        <StatCard label="Дефицит кадров" value={deficitRegions} color="amber" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        } />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4 flex items-center gap-3">
        <svg className="w-5 h-5 text-slate-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        <input value={emailTarget} onChange={e => setEmailTarget(e.target.value)}
          placeholder="Email для рассылки статистики..."
          className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <Btn variant="primary" size="sm" onClick={() => { if (emailTarget) { setEmailSent(true); setTimeout(() => setEmailSent(false), 3000); } }}>
          {emailSent ? '✓ Отправлено' : 'Отправить отчёт'}
        </Btn>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-4 p-4">
        <Input value={search} onChange={setSearch} placeholder="Поиск региона..."
          prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-100">
              {['Регион', 'Резюме', 'Вакансии', 'Статус', 'Ср. зарплата', ''].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {stats.map(r => (
              <tr key={r.region} className={`hover:bg-slate-50 transition ${r.region === 'Республика Татарстан' ? 'bg-blue-50/30' : ''}`}>
                <td className="px-4 py-3">
                  <div className="font-medium text-slate-800 flex items-center gap-1.5">
                    {r.region === 'Республика Татарстан' && <span className="px-1.5 py-0.5 rounded text-xs bg-blue-100 text-blue-700 font-medium">РТ</span>}
                    {r.region}
                  </div>
                  <div className="text-xs text-slate-400">{r.name}</div>
                </td>
                <td className="px-4 py-3 text-slate-700">{r.resumesCount}</td>
                <td className="px-4 py-3 text-slate-700">{r.vacanciesCount}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${r.supplyDemandIndex > 1 ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                    {r.supplyDemandIndex > 1 ? 'Дефицит' : 'Норма'}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-700">{r.avgSalary > 0 ? `${r.avgSalary.toLocaleString('ru')} ₽` : '—'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => onOpenRegion(r.region)}
                    className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">Детали →</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
