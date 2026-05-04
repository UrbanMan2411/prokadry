'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { Resume, Vacancy, Invitation, Message } from '@/lib/types';
import { fmtSalary, fmtDate, fmtExp } from '@/lib/utils';
import { Badge, Btn, Input, Select, Modal, Avatar, StarBtn, StatusBadge, StatCard, EmptyState } from './ui';
import { InviteModal, MessageModal } from './resume';
import { DICTIONARIES } from '@/lib/mock-data';

// ── Employer Dashboard ─────────────────────────────────────────────────────
export function EmployerDashboard({
  resumes, vacancies, invitations, onGoToRegistry, onGoToVacancies,
}: {
  resumes: Resume[]; vacancies: Vacancy[]; invitations: Invitation[];
  onGoToRegistry?: () => void; onGoToVacancies?: () => void;
}) {
  const favCount = resumes.filter(r => r.isFavorite).length;
  const activeVac = vacancies.filter(v => v.status === 'active').length;
  const pendingInv = invitations.filter(i => i.status === 'sent').length;
  const unviewedInv = invitations.filter(i => i.status === 'viewed').length;
  const [empStatus, setEmpStatus] = useState('');
  const [empName, setEmpName] = useState('');
  useEffect(() => {
    fetch('/api/employers/me').then(r => r.json()).then((d: { status?: string; name?: string }) => {
      setEmpStatus(d.status ?? '');
      setEmpName(d.name ?? '');
    }).catch(() => {});
  }, []);
  const attentionItems = [
    pendingInv > 0 && `${pendingInv} приглашений ждут ответа`,
    unviewedInv > 0 && `${unviewedInv} приглашений просмотрено, но не принято`,
  ].filter(Boolean) as string[];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      {empStatus === 'pending' && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <svg className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <div>
            <p className="text-sm font-semibold text-amber-800">Аккаунт ожидает проверки</p>
            <p className="text-xs text-amber-700 mt-0.5">После одобрения администратором вы сможете публиковать вакансии и просматривать резюме.</p>
          </div>
        </div>
      )}
      {/* Attention bar */}
      {attentionItems.length > 0 && (
        <div className="mb-5 flex items-center gap-3 px-4 py-3 bg-amber-50 border border-amber-200 rounded-xl">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-amber-800">
            {attentionItems.map((item, i) => (
              <span key={i} className="flex items-center gap-1">
                <span className="w-1 h-1 rounded-full bg-amber-500" />
                {item}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Добро пожаловать!</h1>
        <p className="text-sm text-slate-500 mt-0.5">{empName || 'Работодатель'}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <StatCard label="Резюме в реестре" value={resumes.length} color="blue" sub="всего специалистов" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        } />
        <StatCard label="Избранных" value={favCount} color="amber" sub="кандидатов" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        } />
        <StatCard label="Активных вакансий" value={activeVac} color="green" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        } />
        <StatCard label="Ждут ответа" value={pendingInv} color="cyan" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Recent resumes */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Новые резюме</h2>
            {onGoToRegistry && (
              <button onClick={onGoToRegistry} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">
                Перейти в реестр →
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {resumes.slice(0, 5).map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                <Avatar src={r.photo} name={r.fullName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{r.position}</div>
                  <div className="text-xs text-slate-400">{r.city} · {fmtSalary(r.salary)}</div>
                </div>
                <div className="text-xs text-slate-400 flex-shrink-0">{fmtDate(r.publishedAt)}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Active vacancies */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Мои вакансии</h2>
            {onGoToVacancies && (
              <button onClick={onGoToVacancies} className="text-xs text-blue-600 hover:text-blue-800 font-medium transition">
                Управлять →
              </button>
            )}
          </div>
          <div className="divide-y divide-slate-100">
            {vacancies.slice(0, 5).map(v => (
              <div key={v.id} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50 transition">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${v.status === 'active' ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{v.title}</div>
                  <div className="text-xs text-slate-400">
                    {v.city} · {v.salaryFrom?.toLocaleString('ru-RU')} – {v.salaryTo?.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
                <StatusBadge status={v.status} />
              </div>
            ))}
            {vacancies.length === 0 && (
              <div className="px-5 py-8 text-center">
                <p className="text-sm text-slate-400 mb-3">Вакансий пока нет</p>
                {onGoToVacancies && (
                  <button onClick={onGoToVacancies} className="text-sm font-medium text-blue-600 hover:text-blue-800">
                    Создать вакансию →
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent invitations */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Последние приглашения</h2>
        </div>
        <div className="divide-y divide-slate-100">
          {invitations.slice(0, 5).map(inv => (
            <div key={inv.id} className="flex items-center gap-4 px-5 py-3">
              <Avatar name={inv.candidateName} size="sm" />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-800 truncate">{inv.candidateName.split(' ').slice(0, 2).join(' ')}</div>
                <div className="text-xs text-slate-400 truncate">{inv.vacancyTitle}</div>
              </div>
              <StatusBadge status={inv.status} />
              <div className="text-xs text-slate-400 flex-shrink-0">{fmtDate(inv.createdAt)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Vacancies — card layout ────────────────────────────────────────────────
type DictOpt = { value: string; label: string };

function TagPicker({ label, options, selected, onChange }: {
  label: string; options: DictOpt[]; selected: string[]; onChange: (v: string[]) => void;
}) {
  return (
    <div className="col-span-2">
      <label className="text-xs font-medium text-slate-600 mb-1.5 block">{label}</label>
      <div className="flex flex-wrap gap-1.5 min-h-[28px]">
        {options.length === 0 && <span className="text-xs text-slate-400 italic">Нет элементов</span>}
        {options.map(opt => {
          const active = selected.includes(opt.label);
          return (
            <button
              key={opt.value} type="button"
              onClick={() => onChange(active ? selected.filter(s => s !== opt.label) : [...selected, opt.label])}
              className={`text-xs px-2.5 py-1 rounded-full border transition ${active ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function VacancyModal({
  open, onClose, vacancy, onSave,
}: {
  open: boolean; onClose: () => void; vacancy: Vacancy | null; onSave: (form: Partial<Vacancy>) => void;
}) {
  const blank: Partial<Vacancy> = { title: '', department: '', city: '', workMode: 'Офис', salaryFrom: 0, salaryTo: 0, description: '', status: 'active' as const, skills: [], clientSpheres: [], specialistActivities: [] };
  const [form, setForm] = useState<Partial<Vacancy>>(vacancy ?? blank);
  const upd = <K extends keyof Vacancy>(k: K, v: Vacancy[K]) => setForm(f => ({ ...f, [k]: v }));

  const [dictSkills, setDictSkills] = useState<DictOpt[]>([]);
  const [dictAreas, setDictAreas] = useState<DictOpt[]>([]);
  const [dictPurchase, setDictPurchase] = useState<DictOpt[]>([]);
  const [empStatus, setEmpStatus] = useState('');

  useEffect(() => { setForm(vacancy ?? blank); }, [vacancy, open]);

  useEffect(() => {
    if (!open) return;
    fetch('/api/dict?category=SKILL').then(r => r.ok ? r.json() : []).then(setDictSkills).catch(() => {});
    fetch('/api/dict?category=ACTIVITY_AREA').then(r => r.ok ? r.json() : []).then(setDictAreas).catch(() => {});
    fetch('/api/dict?category=PURCHASE_TYPE').then(r => r.ok ? r.json() : []).then(setDictPurchase).catch(() => {});
    fetch('/api/employers/me').then(r => r.ok ? r.json() : {}).then((d: { status?: string }) => {
      const s = d.status ?? '';
      setEmpStatus(s);
      if (s === 'pending') setForm(f => ({ ...f, status: 'draft' }));
    }).catch(() => {});
  }, [open]);

  return (
    <Modal open={open} onClose={onClose} title={vacancy ? 'Редактировать вакансию' : 'Новая вакансия'} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {empStatus === 'pending' && (
          <div className="col-span-2 flex items-start gap-2 px-3 py-2.5 bg-amber-50 border border-amber-200 rounded-lg">
            <svg className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            </svg>
            <p className="text-xs text-amber-700">Аккаунт ожидает проверки — вакансия сохранится как черновик до одобрения администратором.</p>
          </div>
        )}
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-600 mb-1 block">Название вакансии</label>
          <Input value={form.title ?? ''} onChange={v => upd('title', v)} placeholder="Специалист по закупкам" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Отдел</label>
          <Input value={form.department ?? ''} onChange={v => upd('department', v)} placeholder="Отдел закупок" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Город</label>
          <Input value={form.city ?? ''} onChange={v => upd('city', v)} placeholder="Москва" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Режим работы</label>
          <Select value={form.workMode ?? 'Офис'} onChange={v => upd('workMode', v)} options={['Офис', 'Удалённо', 'Гибрид']} />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Статус</label>
          <Select
            value={form.status ?? 'active'} onChange={v => upd('status', v as Vacancy['status'])}
            options={[
              ...(empStatus !== 'pending' ? [{ value: 'active', label: 'Активна' }] : []),
              { value: 'draft', label: 'Черновик' },
              { value: 'archived', label: 'В архиве' },
            ]}
          />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Зарплата от, ₽</label>
          <Input value={String(form.salaryFrom ?? '')} onChange={v => upd('salaryFrom', parseInt(v) || 0)} placeholder="80 000" type="number" />
        </div>
        <div>
          <label className="text-xs font-medium text-slate-600 mb-1 block">Зарплата до, ₽</label>
          <Input value={String(form.salaryTo ?? '')} onChange={v => upd('salaryTo', parseInt(v) || 0)} placeholder="150 000" type="number" />
        </div>
        <div className="col-span-2">
          <label className="text-xs font-medium text-slate-600 mb-1 block">Описание</label>
          <textarea
            value={form.description ?? ''} onChange={e => upd('description', e.target.value)} rows={3}
            placeholder="Требования, условия, обязанности..."
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
        <TagPicker label="Навыки / специализации" options={dictSkills} selected={form.skills ?? []} onChange={v => upd('skills', v)} />
        <TagPicker label="Сферы деятельности клиентов" options={dictAreas} selected={form.clientSpheres ?? []} onChange={v => upd('clientSpheres', v)} />
        <TagPicker label="Виды закупок" options={dictPurchase} selected={form.specialistActivities ?? []} onChange={v => upd('specialistActivities', v)} />
      </div>
      <div className="flex justify-end gap-2">
        <Btn variant="secondary" onClick={onClose}>Отмена</Btn>
        <Btn variant="primary" onClick={() => { onSave(form); onClose(); }}>Сохранить</Btn>
      </div>
    </Modal>
  );
}

export function EmployerVacancies({
  vacancies, setVacancies, onFindCandidates,
}: {
  vacancies: Vacancy[];
  setVacancies: (fn: (prev: Vacancy[]) => Vacancy[]) => void;
  onFindCandidates?: (position: string) => void;
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Vacancy | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'archived'>('all');

  const displayed = vacancies.filter(v => {
    if (filter === 'active') return v.status === 'active';
    if (filter === 'archived') return v.status !== 'active';
    return true;
  });

  const handleSave = async (form: Partial<Vacancy>) => {
    const body = {
      ...form,
      activityAreas: form.clientSpheres ?? [],
      purchaseTypes: form.specialistActivities ?? [],
    };
    if (editing) {
      setVacancies(prev => prev.map(v => v.id === editing.id ? { ...v, ...form } : v));
      const res = await fetch(`/api/vacancies/${editing.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const updated: Vacancy = await res.json();
        setVacancies(prev => prev.map(v => v.id === editing.id ? updated : v));
      }
    } else {
      const res = await fetch('/api/vacancies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const newV: Vacancy = await res.json();
        setVacancies(prev => [newV, ...prev]);
      } else {
        const d = await res.json().catch(() => ({}));
        alert(d.error ?? 'Не удалось создать вакансию. Попробуйте снова.');
      }
    }
    setEditing(null);
  };

  const archive = (id: string) => {
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, status: 'archived' } : v));
    fetch(`/api/vacancies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'archived' }),
    }).catch(() => {});
  };
  const activate = (id: string) => {
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, status: 'active' } : v));
    fetch(`/api/vacancies/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'active' }),
    }).catch(() => {});
  };

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <VacancyModal open={modalOpen} onClose={() => { setModalOpen(false); setEditing(null); }} vacancy={editing} onSave={handleSave} />

      <div className="flex items-start justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Вакансии</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {vacancies.filter(v => v.status === 'active').length} активных · {vacancies.filter(v => v.status === 'archived').length} в архиве
          </p>
        </div>
        <Btn
          variant="primary" onClick={() => { setEditing(null); setModalOpen(true); }}
          icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>}
        >
          <span className="hidden sm:inline">Создать вакансию</span>
          <span className="sm:hidden">Создать</span>
        </Btn>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 bg-slate-100 p-1 rounded-lg w-fit">
        {([['all', 'Все'], ['active', 'Активные'], ['archived', 'Архив']] as const).map(([k, label]) => (
          <button
            key={k} onClick={() => setFilter(k)}
            className={`px-4 py-1.5 rounded-md text-sm font-medium transition ${filter === k ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
          >
            {label}
          </button>
        ))}
      </div>

      {displayed.length === 0 ? (
        <EmptyState
          icon="💼" title="Вакансий нет"
          description={filter === 'archived' ? 'Нет вакансий в архиве' : 'Создайте первую вакансию'}
          action={filter === 'all' ? <Btn variant="primary" onClick={() => setModalOpen(true)}>Создать вакансию</Btn> : undefined}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayed.map(v => {
            const isActive = v.status === 'active';
            return (
              <div key={v.id} className={`bg-white rounded-xl border shadow-sm p-5 flex flex-col gap-3 ${isActive ? 'border-slate-100' : 'border-slate-100 opacity-75'}`}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${isActive ? 'bg-emerald-500' : 'bg-slate-300'}`} />
                      <h3 className="font-semibold text-slate-800 text-sm leading-tight truncate">{v.title}</h3>
                    </div>
                    <div className="text-xs text-slate-400 pl-4">{v.department}</div>
                  </div>
                  <StatusBadge status={v.status} />
                </div>

                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {v.city}
                  </span>
                  <span>{v.workMode}</span>
                  <span className="font-medium text-slate-700">{v.salaryFrom.toLocaleString('ru-RU')} – {v.salaryTo.toLocaleString('ru-RU')} ₽</span>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setEditing(v); setModalOpen(true); }}
                      className="text-xs text-slate-500 hover:text-slate-800 transition font-medium flex items-center gap-1"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                      Редактировать
                    </button>
                    {isActive ? (
                      <button onClick={() => archive(v.id)} className="text-xs text-slate-400 hover:text-slate-600 transition">В архив</button>
                    ) : (
                      <button onClick={() => activate(v.id)} className="text-xs text-emerald-600 hover:text-emerald-800 transition font-medium">Активировать</button>
                    )}
                  </div>
                  {isActive && onFindCandidates && (
                    <button
                      onClick={() => onFindCandidates(v.title)}
                      className="text-xs font-semibold px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition flex items-center gap-1"
                    >
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                      Найти кандидатов
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Favorites ──────────────────────────────────────────────────────────────
const SPECIALIZATIONS = ['', '44-ФЗ', '223-ФЗ', 'Коммерческие закупки'];
const SOCIAL_STATUSES = ['', 'Участник СВО', 'Член семьи участника СВО', 'Инвалид'];
const SORT_OPTIONS = [
  { value: 'date', label: 'По дате добавления' },
  { value: 'salary', label: 'По зарплате (убыв.)' },
  { value: 'experience', label: 'По опыту (убыв.)' },
  { value: 'alpha', label: 'По алфавиту' },
];

export function EmployerFavorites({
  resumes, setResumes, onOpenResume, vacancies,
}: {
  resumes: Resume[]; setResumes: (fn: (prev: Resume[]) => Resume[]) => void;
  onOpenResume: (r: Resume) => void; vacancies: Vacancy[];
}) {
  const [invOpen, setInvOpen] = useState(false);
  const [msgOpen, setMsgOpen] = useState(false);
  const [selected, setSelected] = useState<Resume | null>(null);
  const [position, setPosition] = useState('');
  const [region, setRegion] = useState('');
  const [expFrom, setExpFrom] = useState('');
  const [expTo, setExpTo] = useState('');
  const [salaryFrom, setSalaryFrom] = useState('');
  const [salaryTo, setSalaryTo] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [socialStatus, setSocialStatus] = useState('');
  const [sort, setSort] = useState('date');

  const toggleFav = (id: string) => setResumes(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));

  let favs = resumes.filter(r => r.isFavorite);
  if (position) favs = favs.filter(r => r.position.toLowerCase().includes(position.toLowerCase()) || r.fullName.toLowerCase().includes(position.toLowerCase()));
  if (region) favs = favs.filter(r => r.region === region || r.city === region);
  if (expFrom) favs = favs.filter(r => r.experience >= parseInt(expFrom));
  if (expTo) favs = favs.filter(r => r.experience <= parseInt(expTo));
  if (salaryFrom) favs = favs.filter(r => r.salary !== null && r.salary >= parseInt(salaryFrom) * 1000);
  if (salaryTo) favs = favs.filter(r => r.salary !== null && r.salary <= parseInt(salaryTo) * 1000);
  if (specialization) favs = favs.filter(r => r.activityAreas.includes(specialization));
  if (socialStatus) favs = favs.filter(r => r.specialStatuses.some(s => s.value === socialStatus || s.label === socialStatus));

  if (sort === 'salary') favs = [...favs].sort((a, b) => (b.salary ?? 0) - (a.salary ?? 0));
  else if (sort === 'experience') favs = [...favs].sort((a, b) => b.experience - a.experience);
  else if (sort === 'alpha') favs = [...favs].sort((a, b) => a.fullName.localeCompare(b.fullName, 'ru'));
  else favs = [...favs].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

  const isFiltered = !!(position || region || expFrom || expTo || salaryFrom || salaryTo || specialization || socialStatus);
  const resetFilters = () => { setPosition(''); setRegion(''); setExpFrom(''); setExpTo(''); setSalaryFrom(''); setSalaryTo(''); setSpecialization(''); setSocialStatus(''); };

  const totalFavs = resumes.filter(r => r.isFavorite).length;

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <InviteModal open={invOpen} onClose={() => setInvOpen(false)} resume={selected} vacancies={vacancies} />
      <MessageModal open={msgOpen} onClose={() => setMsgOpen(false)} resume={selected} />

      <div className="mb-5 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Избранное</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {isFiltered ? `${favs.length} из ${totalFavs} кандидатов` : `${totalFavs} кандидатов`}
          </p>
        </div>
      </div>

      {/* Filter panel */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-5 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="sm:col-span-2 lg:col-span-2">
            <Input
              value={position} onChange={setPosition} placeholder="Должность или ФИО..."
              prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
            />
          </div>
          <Select
            value={region} onChange={setRegion}
            options={[{ value: '', label: 'Все регионы' }, ...DICTIONARIES.regions.map(r => ({ value: r, label: r }))]}
          />
          <Select
            value={specialization} onChange={setSpecialization}
            options={[{ value: '', label: 'Специализация' }, ...SPECIALIZATIONS.slice(1).map(s => ({ value: s, label: s }))]}
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3 items-end">
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block">Опыт от (лет)</label>
            <Input value={expFrom} onChange={setExpFrom} placeholder="0" type="number" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block">до (лет)</label>
            <Input value={expTo} onChange={setExpTo} placeholder="30" type="number" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block">Зарплата от (тыс.)</label>
            <Input value={salaryFrom} onChange={setSalaryFrom} placeholder="60" type="number" />
          </div>
          <div>
            <label className="text-[10px] font-medium text-slate-500 mb-1 block">до (тыс.)</label>
            <Input value={salaryTo} onChange={setSalaryTo} placeholder="300" type="number" />
          </div>
          <Select
            value={socialStatus} onChange={setSocialStatus}
            options={[{ value: '', label: 'Соц. статус' }, ...SOCIAL_STATUSES.slice(1).map(s => ({ value: s, label: s }))]}
          />
          <div className="flex gap-2">
            <Select
              value={sort} onChange={setSort}
              options={SORT_OPTIONS.map(o => ({ value: o.value, label: o.label }))}
              className="flex-1"
            />
            {isFiltered && (
              <button
                onClick={resetFilters}
                className="px-3 py-2 text-xs text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg hover:border-red-200 transition whitespace-nowrap"
                title="Сбросить фильтры"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {favs.length === 0 ? (
        isFiltered
          ? <EmptyState icon="🔍" title="Ничего не найдено" description="Попробуйте изменить параметры фильтрации" action={<Btn variant="secondary" onClick={resetFilters}>Сбросить фильтры</Btn>} />
          : <EmptyState icon="⭐" title="Избранных нет" description="Добавляйте кандидатов в избранное прямо из реестра резюме" />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {favs.map(r => (
            <div
              key={r.id} onClick={() => onOpenResume(r)}
              className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:shadow-md hover:border-blue-200 transition cursor-pointer"
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar src={r.photo} name={r.fullName} size="md" />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm line-clamp-2">{r.position}</div>
                  <div className="text-xs text-slate-400">{r.fullName.split(' ').slice(0, 2).join(' ')}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{r.city} · {fmtExp(r.experience)}</div>
                </div>
                <StarBtn active={true} onToggle={() => toggleFav(r.id)} />
              </div>

              <div className="flex flex-wrap gap-1 mb-3">
                {r.tests.map(t => <span key={t.value} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded ring-1 ring-blue-100">{t.label}</span>)}
                {r.specialStatuses.map(s => <span key={s.value} className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-medium rounded ring-1 ring-cyan-100">{s.label}</span>)}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <span className={`text-sm font-semibold ${r.salary ? 'text-slate-800' : 'text-slate-300'}`}>{fmtSalary(r.salary)}</span>
                <div className="flex gap-1.5">
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(r); setMsgOpen(true); }}
                    className="text-xs font-medium px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition"
                  >
                    Написать
                  </button>
                  <button
                    onClick={e => { e.stopPropagation(); setSelected(r); setInvOpen(true); }}
                    className="text-xs font-medium px-2.5 py-1 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                  >
                    Пригласить
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Messages — with contact exchange ──────────────────────────────────────
type ChatMsg = { id: string; fromMe: boolean; text: string; ts: string; isSystem?: boolean };
type ContactState = 'hidden' | 'requested' | 'opened';
type Thread = {
  id: string; name: string; msgs: ChatMsg[]; unread: boolean;
  contactState: ContactState;
  contactInfo: { phone: string; email: string; telegram: string };
  counterpartyUserId?: string;
};

function detectContactInText(text: string): 'phone' | 'email' | 'messenger' | 'link' | null {
  if (/(\+7|8)[\s(]?\d{3}[\s)]?[\s-]?\d{3}[\s-]?\d{2}[\s-]?\d{2}/.test(text)) return 'phone';
  if (/[\w.+-]+@[\w.-]+\.\w{2,}/.test(text)) return 'email';
  if (/t\.me\/\w+|@[a-zA-Z]\w{3,}|telegram|whatsapp/i.test(text)) return 'messenger';
  if (/https?:\/\/[^\s]+/.test(text)) return 'link';
  return null;
}

const DETECTED_LABELS: Record<string, string> = {
  phone: 'телефон', email: 'email', messenger: 'мессенджер', link: 'ссылка',
};

const AI_THREAD_ID = '__ai_assistant__';

const AI_THREAD: Thread = {
  id: AI_THREAD_ID,
  name: 'ПРОкадры Ассистент',
  msgs: [{ id: 'ai-0', fromMe: false, text: 'Здравствуйте! Я ИИ-ассистент ПРОкадры. Помогу найти специалистов по 44-ФЗ / 223-ФЗ или отвечу на вопросы о платформе.', ts: new Date().toISOString() }],
  unread: false,
  contactState: 'hidden',
  contactInfo: { phone: '', email: '', telegram: '' },
};

function buildThreads(messages: Message[]): Thread[] {
  const map = new Map<string, Thread>();
  for (const m of [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const cpId = m.counterpartyUserId;
    if (!cpId) continue;
    if (!map.has(cpId)) {
      map.set(cpId, {
        id: cpId,
        name: m.fromRole === 'candidate' ? m.fromName : m.toName,
        msgs: [],
        unread: false,
        contactState: 'hidden',
        contactInfo: { phone: '', email: '', telegram: '' },
        counterpartyUserId: cpId,
      });
    }
    const t = map.get(cpId)!;
    if (m.text === '__contact_request__') {
      if (t.contactState === 'hidden') t.contactState = 'requested';
    } else if (m.text.startsWith('__contact_share__:')) {
      const email = m.text.slice('__contact_share__:'.length);
      t.contactInfo = { phone: '', email, telegram: '' };
      t.contactState = 'opened';
    } else {
      t.msgs.push({ id: m.id, fromMe: m.fromRole === 'employer', text: m.text, ts: m.createdAt });
    }
    if (!m.isRead && m.fromRole === 'candidate') t.unread = true;
  }
  return [AI_THREAD, ...Array.from(map.values())];
}

export function EmployerMessages({ messages, onMarkRead }: { messages: Message[]; onMarkRead?: (id: string) => void }) {
  const [threads, setThreads] = useState<Thread[]>(() => buildThreads(messages));
  const [activeId, setActiveId] = useState<string | null>(null);
  useEffect(() => { setThreads(buildThreads(messages)); }, [messages]);
  const [reply, setReply] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = threads.find(t => t.id === activeId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.msgs.length, aiTyping]);

  const send = async () => {
    if (!activeId || reply.trim().length < 2) return;
    const text = reply.trim();
    const msg: ChatMsg = { id: Date.now().toString(), fromMe: true, text, ts: new Date().toISOString() };
    setThreads(prev => prev.map(t => t.id === activeId ? { ...t, msgs: [...t.msgs, msg], unread: false } : t));
    setReply('');

    if (activeId === AI_THREAD_ID) {
      setAiTyping(true);
      try {
        const currentMsgs = threads.find(t => t.id === AI_THREAD_ID)?.msgs ?? [];
        const apiMessages = [...currentMsgs, msg].map(m => ({
          role: m.fromMe ? 'user' : 'assistant',
          content: m.text,
        }));
        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ messages: apiMessages.slice(-10) }),
        });
        const data = await res.json();
        const aiMsg: ChatMsg = { id: `ai-${Date.now()}`, fromMe: false, text: data.reply ?? 'Ошибка ответа.', ts: new Date().toISOString() };
        setThreads(prev => prev.map(t => t.id === AI_THREAD_ID ? { ...t, msgs: [...t.msgs, aiMsg] } : t));
      } catch {
        const errMsg: ChatMsg = { id: `ai-err-${Date.now()}`, fromMe: false, text: 'Не удалось подключиться к ассистенту.', ts: new Date().toISOString() };
        setThreads(prev => prev.map(t => t.id === AI_THREAD_ID ? { ...t, msgs: [...t.msgs, errMsg] } : t));
      } finally {
        setAiTyping(false);
      }
    } else {
      const t = threads.find(thr => thr.id === activeId);
      if (t?.counterpartyUserId) {
        fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ recipientUserId: t.counterpartyUserId, text }),
        }).catch(() => {});
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const handleRequestContacts = () => {
    if (!activeId || !active?.counterpartyUserId) return;
    setThreads(prev => prev.map(t => t.id === activeId ? { ...t, contactState: 'requested' } : t));
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientUserId: active.counterpartyUserId, text: '__contact_request__' }),
    }).catch(() => {
      setThreads(prev => prev.map(t => t.id === activeId ? { ...t, contactState: 'hidden' } : t));
    });
  };

  const lastMsg = (t: Thread) => t.msgs.filter(m => !m.isSystem).at(-1) ?? t.msgs.at(-1)!;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Сообщения</h1>
      {threads.length === 0 ? (
        <EmptyState icon="💬" title="Сообщений нет" description="Напишите кандидату прямо из реестра резюме" />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden h-[70vh] min-h-[360px]">
          {/* Thread list */}
          <div className={`w-full md:w-72 border-r border-slate-100 flex flex-col flex-shrink-0 ${active ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-3 border-b border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide px-1">Диалоги</div>
            </div>
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
              {threads.map(t => (
                <button
                  key={t.id} onClick={() => {
                    setActiveId(t.id);
                    if (t.unread) {
                      setThreads(prev => prev.map(th => th.id === t.id ? { ...th, unread: false } : th));
                      if (t.id !== AI_THREAD_ID) onMarkRead?.(t.id);
                    }
                  }}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${activeId === t.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    {t.id === AI_THREAD_ID && (
                      <img src="/robot.png" alt="AI" className="w-6 h-6 rounded-full object-contain flex-shrink-0" />
                    )}
                    <span className={`font-semibold text-sm truncate flex-1 ${t.unread ? 'text-slate-900' : 'text-slate-700'}`}>{t.name}</span>
                    {t.id === AI_THREAD_ID && <span className="text-[10px] font-bold px-1.5 py-0.5 bg-blue-100 text-blue-600 rounded-full flex-shrink-0">AI</span>}
                    {t.unread && t.id !== AI_THREAD_ID && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                    {t.contactState === 'opened' && t.id !== AI_THREAD_ID && <span className="text-[10px] text-emerald-600 font-bold">📞</span>}
                  </div>
                  <div className="text-xs text-slate-400 truncate leading-relaxed">{lastMsg(t).text}</div>
                  <div className="text-[10px] text-slate-300 mt-1">{fmtDate(lastMsg(t).ts)}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Chat pane */}
          {active ? (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Header */}
              <div className={`px-4 py-3 border-b border-slate-100 flex items-center gap-3 ${active.id === AI_THREAD_ID ? 'bg-gradient-to-r from-blue-600 to-cyan-500' : 'bg-slate-50/50'}`}>
                <button onClick={() => setActiveId(null)} className={`md:hidden p-1 -ml-1 rounded-lg transition ${active.id === AI_THREAD_ID ? 'text-white/70 hover:text-white hover:bg-white/10' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`} aria-label="Назад">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                {active.id === AI_THREAD_ID
                  ? <img src="/robot.png" alt="AI" className="w-8 h-8 rounded-full object-contain flex-shrink-0" />
                  : <Avatar name={active.name} size="sm" />
                }
                <div className="flex-1 min-w-0">
                  <div className={`font-semibold text-sm ${active.id === AI_THREAD_ID ? 'text-white' : 'text-slate-800'}`}>{active.name}</div>
                  {active.id === AI_THREAD_ID && (
                    <div className="text-blue-100 text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
                      онлайн
                    </div>
                  )}
                </div>
              </div>

              {/* Contact exchange panel — hidden for AI thread */}
              {active.id !== AI_THREAD_ID && (
              <div className="px-4 py-2 border-b border-slate-100 bg-slate-50/40 flex items-center gap-2 min-h-[40px]">
                {active.contactState === 'hidden' && (
                  <button
                    onClick={handleRequestContacts}
                    className="flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                    Запросить контактные данные
                  </button>
                )}
                {active.contactState === 'requested' && (
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">
                    <svg className="w-3.5 h-3.5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    Запрос контактов отправлен — ожидаем ответа
                  </span>
                )}
                {active.contactState === 'opened' && (
                  <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-slate-700">
                    <span className="flex items-center gap-1 font-medium">
                      <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                      {active.contactInfo.phone}
                    </span>
                    <span className="flex items-center gap-1">✉ {active.contactInfo.email}</span>
                    <span className="flex items-center gap-1">✈ {active.contactInfo.telegram}</span>
                  </div>
                )}
              </div>
              )}

              {/* Messages */}
              <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-2">
                {active.msgs.map(msg => {
                  const detected = !msg.isSystem && !msg.fromMe ? detectContactInText(msg.text) : null;
                  return (
                    <div key={msg.id}>
                      {msg.isSystem ? (
                        <div className="text-center text-xs text-slate-400 italic my-2 px-6">{msg.text}</div>
                      ) : (
                        <div className={`flex gap-3 ${msg.fromMe ? 'flex-row-reverse' : ''}`}>
                          {active.id === AI_THREAD_ID && !msg.fromMe
                            ? <img src="/robot.png" alt="AI" className="w-8 h-8 rounded-full object-contain flex-shrink-0 mt-0.5" />
                            : <Avatar name={msg.fromMe ? 'Я' : active.name} size="sm" />
                          }
                          <div className={`max-w-[75%] md:max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.fromMe ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                            {msg.text}
                          </div>
                        </div>
                      )}
                      {detected && active.id !== AI_THREAD_ID && (
                        <div className="ml-11 mt-0.5 text-[10px] text-amber-600 bg-amber-50 border border-amber-100 rounded-lg px-3 py-1.5">
                          ⚠ Обнаружен {DETECTED_LABELS[detected]} — используйте встроенный обмен контактами выше
                        </div>
                      )}
                    </div>
                  );
                })}
                {aiTyping && active.id === AI_THREAD_ID && (
                  <div className="flex gap-3">
                    <img src="/robot.png" alt="AI" className="w-8 h-8 rounded-full object-contain flex-shrink-0 mt-0.5" />
                    <div className="bg-slate-100 rounded-2xl px-4 py-3 flex items-center gap-1">
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="p-3 border-t border-slate-100 flex gap-2 items-end">
                <textarea
                  value={reply} onChange={e => setReply(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder={active.id === AI_THREAD_ID ? 'Задать вопрос ассистенту…' : 'Написать ответ… (Enter — отправить, Shift+Enter — перенос)'}
                  rows={2}
                  className="flex-1 rounded-xl border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  disabled={aiTyping && active.id === AI_THREAD_ID}
                />
                <Btn variant="primary" disabled={reply.trim().length < 2 || (aiTyping && active.id === AI_THREAD_ID)} onClick={send}
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>}
                >
                  <span className="sr-only">Отправить</span>
                </Btn>
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 text-sm">Выберите диалог</div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Invitations ────────────────────────────────────────────────────────────
type InvSortCol = 'candidateName' | 'vacancyTitle' | 'status' | 'createdAt' | null;
type InvSortDir = 'asc' | 'desc';

function InvSortIcon({ col, sortCol, sortDir }: { col: InvSortCol; sortCol: InvSortCol; sortDir: InvSortDir }) {
  if (sortCol !== col) return <span className="ml-1 text-slate-300 text-xs">↕</span>;
  return <span className="ml-1 text-blue-500 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export function EmployerInvitations({ invitations, setInvitations }: { invitations: Invitation[]; setInvitations?: React.Dispatch<React.SetStateAction<Invitation[]>> }) {
  const [statusFilter, setStatusFilter] = useState('');
  const [candidateSearch, setCandidateSearch] = useState('');
  const [vacancyFilter, setVacancyFilter] = useState('');
  const [sortCol, setSortCol] = useState<InvSortCol>(null);
  const [sortDir, setSortDir] = useState<InvSortDir>('asc');
  const [sortClickCount, setSortClickCount] = useState<Record<string, number>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const respond = (id: string, status: 'accepted' | 'rejected') => {
    setInvitations?.(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    fetch(`/api/invitations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {
      setInvitations?.(prev => prev.map(i => i.id === id ? { ...i, status: 'sent' } : i));
    });
  };

  const handleSort = (col: InvSortCol) => {
    if (!col) return;
    const count = (sortClickCount[col] ?? 0) + 1;
    setSortClickCount(prev => ({ ...prev, [col]: count % 3 }));
    if (count % 3 === 0) { setSortCol(null); }
    else if (count % 3 === 1) { setSortCol(col); setSortDir('asc'); }
    else { setSortCol(col); setSortDir('desc'); }
  };

  const vacancyNames = [...new Set(invitations.map(i => i.vacancyTitle).filter(Boolean))].sort((a, b) => a.localeCompare(b, 'ru'));

  let displayed = statusFilter ? invitations.filter(i => i.status === statusFilter) : invitations;
  if (candidateSearch) displayed = displayed.filter(i => i.candidateName.toLowerCase().includes(candidateSearch.toLowerCase()));
  if (vacancyFilter) displayed = displayed.filter(i => i.vacancyTitle === vacancyFilter);

  if (sortCol) {
    displayed = [...displayed].sort((a, b) => {
      const av = a[sortCol] as string;
      const bv = b[sortCol] as string;
      const cmp = av.localeCompare(bv, 'ru');
      return sortDir === 'asc' ? cmp : -cmp;
    });
  }

  const SortHeader = ({ col, label }: { col: InvSortCol; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
    >
      {label}<InvSortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Приглашения</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Отправлено', status: 'sent', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Просмотрено', status: 'viewed', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'Принято', status: 'accepted', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Отклонено', status: 'rejected', color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(s => (
          <button
            key={s.status}
            onClick={() => setStatusFilter(statusFilter === s.status ? '' : s.status)}
            className={`p-4 rounded-xl border-2 transition text-left ${statusFilter === s.status ? s.color : 'bg-white border-slate-100 hover:border-slate-200'}`}
          >
            <div className="text-2xl font-bold">{invitations.filter(i => i.status === s.status).length}</div>
            <div className="text-xs mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      {/* Search + filter row */}
      <div className="flex flex-col sm:flex-row gap-2 mb-4">
        <Input
          value={candidateSearch} onChange={setCandidateSearch}
          placeholder="Поиск по кандидату..."
          prefix={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>}
          className="flex-1 max-w-xs"
        />
        <select value={vacancyFilter} onChange={e => setVacancyFilter(e.target.value)}
          className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500">
          <option value="">Все вакансии</option>
          {vacancyNames.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {(statusFilter || candidateSearch || vacancyFilter || sortCol) && (
          <button
            onClick={() => { setStatusFilter(''); setCandidateSearch(''); setVacancyFilter(''); setSortCol(null); setSortClickCount({}); }}
            className="px-3 py-2 text-xs text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg hover:border-red-200 transition"
          >
            Сбросить всё
          </button>
        )}
        <div className="text-xs text-slate-400 self-center ml-auto whitespace-nowrap">
          {displayed.length} из {invitations.length} · клик заголовок = сортировка
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <SortHeader col="candidateName" label="Кандидат" />
                <SortHeader col="vacancyTitle" label="Вакансия" />
                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">Тип</th>
                <SortHeader col="status" label="Статус" />
                <SortHeader col="createdAt" label="Дата" />
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {displayed.map(inv => (
                <React.Fragment key={inv.id}>
                  <tr className="hover:bg-slate-50 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Avatar name={inv.candidateName} size="sm" />
                        <span className="font-medium text-slate-800">{inv.candidateName.split(' ').slice(0, 2).join(' ')}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600 text-xs max-w-[180px]">
                      <div className="truncate">{inv.vacancyTitle}</div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={inv.fromSeeker ? 'cyan' : 'blue'}>{inv.fromSeeker ? 'Отклик' : 'Приглашение'}</Badge>
                    </td>
                    <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                    <td className="px-4 py-3 text-slate-400 text-xs whitespace-nowrap">{fmtDate(inv.createdAt)}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 flex-wrap items-center">
                        {inv.fromSeeker && inv.status === 'sent' && (
                          <>
                            <button onClick={() => respond(inv.id, 'accepted')}
                              className="text-xs px-2.5 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition cursor-pointer">Принять</button>
                            <button onClick={() => respond(inv.id, 'rejected')}
                              className="text-xs px-2.5 py-1 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer">Отклонить</button>
                          </>
                        )}
                        {(inv.message || inv.replyMessage) && (
                          <button
                            onClick={() => setExpandedId(expandedId === inv.id ? null : inv.id)}
                            className="text-xs px-2 py-1 rounded-lg border border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-600 transition cursor-pointer"
                          >
                            {expandedId === inv.id ? '▲' : '▼'} Сообщение{inv.replyMessage ? ' (+ответ)' : ''}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {expandedId === inv.id && (
                    <tr className="bg-slate-50">
                      <td colSpan={6} className="px-6 py-3 space-y-2">
                        {inv.message && inv.message !== 'Отклик соискателя' && (
                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-0.5">Сообщение работодателя:</div>
                            <div className="text-sm text-slate-700 bg-white border border-slate-200 rounded-lg px-3 py-2">{inv.message}</div>
                          </div>
                        )}
                        {inv.replyMessage && (
                          <div>
                            <div className="text-xs font-semibold text-slate-500 mb-0.5">Ответ кандидата:</div>
                            <div className="text-sm text-slate-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">{inv.replyMessage}</div>
                          </div>
                        )}
                        {inv.fromSeeker && !inv.replyMessage && (
                          <div className="text-xs text-slate-400 italic">Кандидат откликнулся без сопроводительного письма</div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        {displayed.length === 0 && (
          <EmptyState icon="📨" title="Нет приглашений" description={statusFilter || candidateSearch ? 'Попробуйте изменить фильтры' : 'Пригласите кандидатов из реестра'} />
        )}
      </div>
    </div>
  );
}

// ── Company Profile with INN autofill ─────────────────────────────────────
type InnData = {
  name: string; fullName?: string; inn: string; kpp?: string; ogrn?: string;
  legalAddress?: string; region?: string; city?: string; okved?: string;
  orgStatus?: string; head?: string; registrationDate?: string;
};

type InnLookupState = 'idle' | 'loading' | 'found' | 'not_found' | 'invalid' | 'error';

function validateINN(inn: string): boolean {
  return /^\d{10}(\d{2})?$/.test(inn.trim());
}

export function CompanyProfile() {
  const [form, setForm] = useState({
    name: '', inn: '', kpp: '', ogrn: '',
    legalAddress: '',
    region: '', city: '', okved: '',
    orgStatus: '', head: '', registrationDate: '',
    contactName: '', email: '',
    phone: '',
    description: '',
  });
  const [empStatus, setEmpStatus] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  const handlePasswordChange = async () => {
    setPwError('');
    if (!pwForm.current) { setPwError('Введите текущий пароль'); return; }
    if (pwForm.next.length < 6) { setPwError('Минимум 6 символов'); return; }
    if (pwForm.next !== pwForm.confirm) { setPwError('Пароли не совпадают'); return; }
    setPwSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword: pwForm.current, newPassword: pwForm.next }),
      });
      if (res.ok) { setPwForm({ current: '', next: '', confirm: '' }); setPwSaved(true); setTimeout(() => setPwSaved(false), 3000); }
      else { const d = await res.json().catch(() => ({})); setPwError(d.error ?? 'Ошибка'); }
    } finally { setPwSaving(false); }
  };

  useEffect(() => {
    fetch('/api/employers/me')
      .then(r => r.json())
      .then(d => {
        setForm(f => ({
          ...f,
          name: d.name ?? '',
          inn: d.inn ?? '',
          ogrn: d.ogrn ?? '',
          region: d.region ?? '',
          city: d.city ?? '',
          legalAddress: d.address ?? '',
          contactName: d.contactName ?? '',
          phone: d.phone ?? '',
          description: d.description ?? '',
          email: d.email ?? '',
        }));
        setEmpStatus(d.status ?? '');
      })
      .catch(() => {});
  }, []);
  const [innLookupState, setInnLookupState] = useState<InnLookupState>('idle');
  const [innResult, setInnResult] = useState<InnData | null>(null);

  const upd = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const handleInnLookup = async () => {
    const inn = form.inn.trim();
    if (!validateINN(inn)) { setInnLookupState('invalid'); setInnResult(null); return; }
    setInnLookupState('loading');
    setInnResult(null);
    try {
      const res = await fetch(`/api/inn-lookup?inn=${inn}`);
      if (res.status === 503) { setInnLookupState('error'); return; }
      if (res.status === 404) { setInnLookupState('not_found'); return; }
      if (!res.ok) { setInnLookupState('error'); return; }
      const d = await res.json();
      setInnResult(d);
      setInnLookupState('found');
    } catch {
      setInnLookupState('error');
    }
  };

  const handleFillProfile = () => {
    if (!innResult) return;
    setForm(f => ({
      ...f,
      name: innResult.name,
      inn: innResult.inn, kpp: innResult.kpp ?? '', ogrn: innResult.ogrn ?? '',
      legalAddress: innResult.legalAddress ?? '', region: innResult.region ?? '',
      city: innResult.city ?? f.city,
      okved: innResult.okved ?? '', orgStatus: innResult.orgStatus ?? '',
      head: innResult.head ?? '', registrationDate: innResult.registrationDate ?? '',
    }));
    setSaved(false);
    setInnLookupState('idle');
    setInnResult(null);
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Профиль компании</h1>

      {/* INN lookup */}
      <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-5">
        <div className="text-sm font-semibold text-slate-700 mb-2">Заполнить по ИНН</div>
        <div className="flex gap-2 mb-2">
          <Input
            value={form.inn} onChange={v => { upd('inn', v); setInnLookupState('idle'); setInnResult(null); }}
            placeholder="10 или 12 цифр"
            className="flex-1 max-w-xs"
          />
          <Btn variant="primary" onClick={handleInnLookup} disabled={innLookupState === 'loading'}>
            {innLookupState === 'loading' ? 'Поиск…' : 'Найти по ИНН'}
          </Btn>
        </div>

        {innLookupState === 'invalid' && (
          <p className="text-xs text-red-600">ИНН должен содержать 10 или 12 цифр</p>
        )}
        {innLookupState === 'not_found' && (
          <p className="text-xs text-amber-600">Организация по ИНН {form.inn} не найдена</p>
        )}
        {innLookupState === 'error' && (
          <p className="text-xs text-red-600">Ошибка запроса. Попробуйте снова.</p>
        )}
        {innLookupState === 'found' && innResult && (
          <div className="bg-white rounded-lg border border-blue-200 p-3 mt-1">
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="font-semibold text-slate-800 text-sm">{innResult.name}</div>
                <div className="text-xs text-slate-500 mt-0.5">{innResult.fullName}</div>
                <div className="mt-1.5 grid grid-cols-2 gap-x-4 gap-y-0.5 text-xs text-slate-600">
                  <span>КПП: {innResult.kpp}</span>
                  <span>ОГРН: {innResult.ogrn}</span>
                  <span>Регион: {innResult.region}</span>
                  <span>Статус: {innResult.orgStatus}</span>
                  <span className="col-span-2">Адрес: {innResult.legalAddress}</span>
                  <span className="col-span-2">Руководитель: {innResult.head}</span>
                </div>
              </div>
              <Btn variant="cyan" size="sm" onClick={handleFillProfile}>Заполнить профиль</Btn>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 md:p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Название организации</label>
            <Input value={form.name} onChange={v => upd('name', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">ИНН</label>
            <Input value={form.inn} onChange={v => upd('inn', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">КПП</label>
            <Input value={form.kpp} onChange={v => upd('kpp', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">ОГРН</label>
            <Input value={form.ogrn} onChange={v => upd('ogrn', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Регион</label>
            <Input value={form.region} onChange={v => upd('region', v)} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Юридический адрес</label>
            <Input value={form.legalAddress} onChange={v => upd('legalAddress', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">ОКВЭД</label>
            <Input value={form.okved} onChange={v => upd('okved', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Статус организации</label>
            <Input value={form.orgStatus} onChange={v => upd('orgStatus', v)} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Руководитель</label>
            <Input value={form.head} onChange={v => upd('head', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Контактное лицо</label>
            <Input value={form.contactName} onChange={v => upd('contactName', v)} />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
            <Input value={form.email} onChange={v => upd('email', v)} type="email" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Телефон</label>
            <Input value={form.phone} onChange={v => upd('phone', v)} />
          </div>
          <div className="col-span-2">
            <label className="text-xs font-medium text-slate-600 mb-1 block">О компании</label>
            <textarea
              value={form.description} onChange={e => upd('description', e.target.value)} rows={3}
              className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
        </div>
        <div className="flex justify-between mt-4 pt-4 border-t border-slate-100 gap-2 items-center flex-wrap">
          <div>
            {empStatus === 'pending' && (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full text-amber-700 bg-amber-50">
                Аккаунт ожидает одобрения администратором
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {saved && <span className="text-sm text-emerald-600">✓ Сохранено</span>}
            <Btn variant="primary" disabled={saving} onClick={async () => {
              setSaving(true);
              const res = await fetch('/api/employers/me', {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  name: form.name, ogrn: form.ogrn, region: form.region,
                  city: form.city, address: form.legalAddress,
                  contactName: form.contactName, phone: form.phone,
                  description: form.description,
                }),
              }).catch(() => null);
              setSaving(false);
              if (res?.ok) setSaved(true);
            }}>
              {saving ? 'Сохранение…' : 'Сохранить изменения'}
            </Btn>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 md:p-6 mt-5">
        <h3 className="text-sm font-semibold text-slate-800 mb-4">Смена пароля</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Текущий пароль</label>
            <Input value={pwForm.current} onChange={v => setPwForm(f => ({ ...f, current: v }))} type="password" placeholder="••••••" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Новый пароль</label>
            <Input value={pwForm.next} onChange={v => setPwForm(f => ({ ...f, next: v }))} type="password" placeholder="••••••" />
          </div>
          <div>
            <label className="text-xs font-medium text-slate-600 mb-1 block">Повторите пароль</label>
            <Input value={pwForm.confirm} onChange={v => setPwForm(f => ({ ...f, confirm: v }))} type="password" placeholder="••••••" />
          </div>
        </div>
        {pwError && <p className="text-xs text-red-500 mt-2">{pwError}</p>}
        <div className="flex items-center gap-3 mt-3">
          {pwSaved && <span className="text-sm text-emerald-600">✓ Пароль изменён</span>}
          <Btn variant="secondary" onClick={handlePasswordChange} disabled={pwSaving}>{pwSaving ? 'Сохранение…' : 'Изменить пароль'}</Btn>
        </div>
      </div>
    </div>
  );
}
