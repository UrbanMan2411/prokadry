'use client';

import { useState, useEffect, useRef } from 'react';
import type { Resume, Vacancy, Invitation, Message } from '@/lib/types';
import { fmtSalary, fmtDate, fmtExp } from '@/lib/utils';
import { Badge, Btn, Input, Select, Modal, Avatar, StarBtn, StatusBadge, StatCard, EmptyState } from './ui';
import { InviteModal } from './resume';

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
  const attentionItems = [
    pendingInv > 0 && `${pendingInv} приглашений ждут ответа`,
    unviewedInv > 0 && `${unviewedInv} приглашений просмотрено, но не принято`,
  ].filter(Boolean) as string[];

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
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
        <p className="text-sm text-slate-500 mt-0.5">ООО «ТехноСервис» · Работодатель</p>
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
function VacancyModal({
  open, onClose, vacancy, onSave,
}: {
  open: boolean; onClose: () => void; vacancy: Vacancy | null; onSave: (form: Partial<Vacancy>) => void;
}) {
  const blank = { title: '', department: '', city: '', workMode: 'Офис', salaryFrom: 0, salaryTo: 0, description: '', status: 'active' as const };
  const [form, setForm] = useState<Partial<Vacancy>>(vacancy ?? blank);
  const upd = <K extends keyof Vacancy>(k: K, v: Vacancy[K]) => setForm(f => ({ ...f, [k]: v }));

  useEffect(() => { setForm(vacancy ?? blank); }, [vacancy, open]);

  return (
    <Modal open={open} onClose={onClose} title={vacancy ? 'Редактировать вакансию' : 'Новая вакансия'} size="lg">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
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
            options={[{ value: 'active', label: 'Активна' }, { value: 'archived', label: 'В архиве' }, { value: 'draft', label: 'Черновик' }]}
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
            value={form.description ?? ''} onChange={e => upd('description', e.target.value)} rows={4}
            placeholder="Требования, условия, обязанности..."
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>
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

  const handleSave = (form: Partial<Vacancy>) => {
    if (editing) {
      setVacancies(prev => prev.map(v => v.id === editing.id ? { ...v, ...form } : v));
    } else {
      const newV: Vacancy = {
        ...form as Vacancy,
        id: `VAC-${String(vacancies.length + 1).padStart(3, '0')}`,
        employerId: 'EMP-001', employerName: 'ООО «ТехноСервис»',
        region: 'Москва', createdAt: new Date().toISOString().split('T')[0], skills: [],
      };
      setVacancies(prev => [newV, ...prev]);
    }
    setEditing(null);
  };

  const archive = (id: string) =>
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, status: 'archived' } : v));
  const activate = (id: string) =>
    setVacancies(prev => prev.map(v => v.id === id ? { ...v, status: 'active' } : v));

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
export function EmployerFavorites({
  resumes, setResumes, onOpenResume, vacancies,
}: {
  resumes: Resume[]; setResumes: (fn: (prev: Resume[]) => Resume[]) => void;
  onOpenResume: (r: Resume) => void; vacancies: Vacancy[];
}) {
  const [invOpen, setInvOpen] = useState(false);
  const [selected, setSelected] = useState<Resume | null>(null);
  const favs = resumes.filter(r => r.isFavorite);
  const toggleFav = (id: string) => setResumes(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <InviteModal open={invOpen} onClose={() => setInvOpen(false)} resume={selected} vacancies={vacancies} />
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Избранное</h1>
        <p className="text-sm text-slate-500 mt-0.5">{favs.length} кандидатов</p>
      </div>
      {favs.length === 0 ? (
        <EmptyState icon="⭐" title="Избранных нет" description="Добавляйте кандидатов в избранное прямо из реестра резюме" />
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
                {r.tests.map(t => <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded ring-1 ring-blue-100">{t}</span>)}
                {r.specialStatuses.map(s => <span key={s} className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-medium rounded ring-1 ring-cyan-100">{s}</span>)}
              </div>

              <div className="flex items-center justify-between pt-2.5 border-t border-slate-100">
                <span className={`text-sm font-semibold ${r.salary ? 'text-slate-800' : 'text-slate-300'}`}>{fmtSalary(r.salary)}</span>
                <button
                  onClick={e => { e.stopPropagation(); setSelected(r); setInvOpen(true); }}
                  className="text-xs font-medium px-2.5 py-1 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                >
                  Пригласить
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Messages — improved ────────────────────────────────────────────────────
type ChatMsg = { id: string; fromMe: boolean; text: string; ts: string };
type Thread = { id: string; name: string; msgs: ChatMsg[]; unread: boolean };

function buildThreads(messages: Message[]): Thread[] {
  return messages.map(m => ({
    id: m.id,
    name: m.fromRole === 'candidate' ? m.fromName : m.toName,
    msgs: [{ id: m.id, fromMe: m.fromRole === 'employer', text: m.text, ts: m.createdAt }],
    unread: !m.isRead,
  }));
}

export function EmployerMessages({ messages }: { messages: Message[] }) {
  const [threads, setThreads] = useState<Thread[]>(() => buildThreads(messages));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = threads.find(t => t.id === activeId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.msgs.length]);

  const send = () => {
    if (!activeId || reply.trim().length < 2) return;
    const msg: ChatMsg = { id: Date.now().toString(), fromMe: true, text: reply.trim(), ts: new Date().toISOString() };
    setThreads(prev => prev.map(t => t.id === activeId ? { ...t, msgs: [...t.msgs, msg], unread: false } : t));
    setReply('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
  };

  const lastMsg = (t: Thread) => t.msgs[t.msgs.length - 1];

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
                  key={t.id} onClick={() => setActiveId(t.id)}
                  className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition-colors ${activeId === t.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`font-semibold text-sm truncate flex-1 ${t.unread ? 'text-slate-900' : 'text-slate-700'}`}>{t.name}</span>
                    {t.unread && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
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
              <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3 bg-slate-50/50">
                <button onClick={() => setActiveId(null)} className="md:hidden p-1 -ml-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition" aria-label="Назад">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                </button>
                <Avatar name={active.name} size="sm" />
                <div className="font-semibold text-slate-800 text-sm">{active.name}</div>
              </div>
              <div className="flex-1 p-4 md:p-5 overflow-y-auto space-y-3">
                {active.msgs.map(msg => (
                  <div key={msg.id} className={`flex gap-3 ${msg.fromMe ? 'flex-row-reverse' : ''}`}>
                    <Avatar name={msg.fromMe ? 'Я' : active.name} size="sm" />
                    <div className={`max-w-[75%] md:max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.fromMe ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="p-3 border-t border-slate-100 flex gap-2 items-end">
                <textarea
                  value={reply} onChange={e => setReply(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Написать ответ… (Enter — отправить, Shift+Enter — перенос)"
                  rows={2}
                  className="flex-1 rounded-xl border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <Btn variant="primary" disabled={reply.trim().length < 2} onClick={send}
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
export function EmployerInvitations({ invitations }: { invitations: Invitation[] }) {
  const [filter, setFilter] = useState('');
  const displayed = filter ? invitations.filter(i => i.status === filter) : invitations;

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Приглашения</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Отправлено', status: 'sent', color: 'bg-blue-50 border-blue-200 text-blue-700' },
          { label: 'Просмотрено', status: 'viewed', color: 'bg-purple-50 border-purple-200 text-purple-700' },
          { label: 'Принято', status: 'accepted', color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
          { label: 'Отклонено', status: 'rejected', color: 'bg-red-50 border-red-200 text-red-700' },
        ].map(s => (
          <button
            key={s.status}
            onClick={() => setFilter(filter === s.status ? '' : s.status)}
            className={`p-4 rounded-xl border-2 transition text-left ${filter === s.status ? s.color : 'bg-white border-slate-100 hover:border-slate-200'}`}
          >
            <div className="text-2xl font-bold">{invitations.filter(i => i.status === s.status).length}</div>
            <div className="text-xs mt-0.5">{s.label}</div>
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-slate-50 border-b border-slate-200">
              {['Кандидат', 'Вакансия', 'Статус', 'Дата'].map(h => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {displayed.map(inv => (
              <tr key={inv.id} className="hover:bg-slate-50 transition">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Avatar name={inv.candidateName} size="sm" />
                    <span className="font-medium text-slate-800">{inv.candidateName.split(' ').slice(0, 2).join(' ')}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-slate-600 text-xs">{inv.vacancyTitle}</td>
                <td className="px-4 py-3"><StatusBadge status={inv.status} /></td>
                <td className="px-4 py-3 text-slate-400 text-xs">{fmtDate(inv.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {displayed.length === 0 && (
          <EmptyState icon="📨" title="Нет приглашений" description={filter ? 'Попробуйте снять фильтр' : 'Пригласите кандидатов из реестра'} />
        )}
      </div>
    </div>
  );
}

// ── Company Profile ────────────────────────────────────────────────────────
export function CompanyProfile() {
  const [form, setForm] = useState({
    name: 'ООО «ТехноСервис»', inn: '7700000001', region: 'Москва', city: 'Москва',
    contactName: 'Иванов Алексей Петрович', email: 'hr1@company1.ru',
    phone: '+7 (900) 300-10-20',
    description: 'Ведущая компания в сфере государственных закупок и тендерного сопровождения.',
  });
  const [saved, setSaved] = useState(false);
  const upd = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Профиль компании</h1>
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
            <label className="text-xs font-medium text-slate-600 mb-1 block">Регион</label>
            <Input value={form.region} onChange={v => upd('region', v)} />
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
        <div className="flex justify-end mt-4 pt-4 border-t border-slate-100 gap-2 items-center">
          {saved && <span className="text-sm text-emerald-600">✓ Сохранено</span>}
          <Btn variant="primary" onClick={() => setSaved(true)}>Сохранить изменения</Btn>
        </div>
      </div>
    </div>
  );
}
