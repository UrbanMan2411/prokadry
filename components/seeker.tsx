'use client';

import { useState, useEffect, useRef } from 'react';
import type { Invitation, Message, Vacancy } from '@/lib/types';
import { fmtDate, fmtSalary } from '@/lib/utils';
import { loadAiMsgs, saveAiMsgs, subscribeAiMsgs } from '@/lib/ai-chat-store';
import { Badge, Btn, Input, Select, Avatar, StatusBadge, StatCard } from './ui';
import { DICTIONARIES } from '@/lib/mock-data';
import { RUSSIA_CITIES, useRussiaMap, type MapCity } from '@/lib/use2gis';

// ── Seeker Dashboard ───────────────────────────────────────────────────────
export function SeekerDashboard({ invitations, messages, resumeStatus }: { invitations: Invitation[]; messages: Message[]; resumeStatus?: string }) {
  const pendingInv = invitations.filter(i => i.status === 'sent').length;
  const unreadMsg = messages.filter(m => !m.isRead).length;
  const resumeStatusLabel: Record<string, string> = { active: 'Активно', pending: 'На проверке', draft: 'Черновик', rejected: 'Отклонено', archived: 'В архиве' };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Добро пожаловать!</h1>
        <p className="text-sm text-slate-500 mt-0.5">Ваш личный кабинет соискателя</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <StatCard label="Активных приглашений" value={pendingInv} color="cyan" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        } />
        <StatCard label="Непрочитанных сообщений" value={unreadMsg} color="blue" icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        } />
        <StatCard label="Статус резюме" value={resumeStatus ? (resumeStatusLabel[resumeStatus] ?? resumeStatus) : '—'} color={resumeStatus === 'active' ? 'green' : resumeStatus === 'pending' ? 'amber' : 'blue'} icon={
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        } />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Последние приглашения</h2>
            <Badge color="cyan">{pendingInv} новых</Badge>
          </div>
          <div className="divide-y divide-slate-100">
            {invitations.slice(0, 5).map(inv => (
              <div key={inv.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={inv.employerName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{inv.vacancyTitle}</div>
                  <div className="text-xs text-slate-400">{inv.employerName}</div>
                </div>
                <StatusBadge status={inv.status} />
              </div>
            ))}
            {invitations.length === 0 && (
              <div className="px-5 py-6 text-center text-sm text-slate-400">Приглашений пока нет</div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Последние сообщения</h2>
          </div>
          <div className="divide-y divide-slate-100">
            {messages.slice(0, 5).map(m => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3">
                <Avatar name={m.fromName} size="sm" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{m.fromName}</div>
                  <div className="text-xs text-slate-400 truncate">{m.text}</div>
                </div>
                {!m.isRead && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── My Resume ──────────────────────────────────────────────────────────────
type WorkExpEntry = { _id: string; company: string; role: string; fromMonth: string; toMonth: string; isCurrent: boolean; description: string };
type SpecialStatusEntry = { value: string; docDate: string; docNumber: string; documentRef: string; disabilityGroup: string };
type TestEntry = { value: string; passedAt: string };

type ResumeFormFull = {
  dbId: string; dbStatus: string; rejectReason: string;
  firstName: string; lastName: string; patronymic: string; gender: string; birthDate: string;
  city: string; phone: string; email: string; photoUrl: string;
  position: string; positionValid: boolean; salary: string; workMode: string;
  experience: string; education: string; educationInstitution: string; educationYears: string;
  workExperiences: WorkExpEntry[];
  activityAreas: string[]; skills: string[]; purchaseTypes: string[];
  specialStatuses: SpecialStatusEntry[];
  tests: TestEntry[];
  about: string;
  region: string;
};

const emptyForm = (): ResumeFormFull => ({
  dbId: '', dbStatus: 'draft', rejectReason: '',
  firstName: '', lastName: '', patronymic: '', gender: 'FEMALE', birthDate: '',
  city: '', region: '', phone: '', email: '', photoUrl: '',
  position: '', positionValid: true, salary: '', workMode: 'Офис',
  experience: '0', education: 'Высшее', educationInstitution: '', educationYears: '',
  workExperiences: [],
  activityAreas: [], skills: [], purchaseTypes: [],
  specialStatuses: [],
  tests: [],
  about: '',
});

type DictOption = { id: string; value: string; label: string };

function PositionAutocomplete({ value, valid, onChange, onValidChange }: { value: string; valid: boolean; onChange: (v: string) => void; onValidChange: (v: boolean) => void }) {
  const [positions, setPositions] = useState<DictOption[]>([]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState(value);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetch('/api/dict?category=POSITION').then(r => r.json()).then(setPositions).catch(() => {});
  }, []);

  useEffect(() => { setQuery(value); }, [value]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        // on blur: if typed text doesn't match any option exactly → invalid
        const matched = positions.find(p => p.label.toLowerCase() === query.toLowerCase());
        if (query && !matched) { onValidChange(false); }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [query, positions, onValidChange]);

  // startsWith filter (doc requirement), fallback to includes if no startsWith match
  const startsWith = positions.filter(p => p.label.toLowerCase().startsWith(query.toLowerCase()));
  const filtered = startsWith.length > 0 ? startsWith : positions.filter(p => p.label.toLowerCase().includes(query.toLowerCase()));

  const isInvalid = !valid && query.length > 0;

  return (
    <div ref={ref} className="relative">
      <input
        value={query}
        onChange={e => { setQuery(e.target.value); setOpen(true); onValidChange(false); onChange(e.target.value); }}
        onFocus={() => setOpen(true)}
        placeholder="Начните вводить должность..."
        className={`w-full rounded-lg border bg-white text-sm text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 transition ${isInvalid ? 'border-red-400 focus:ring-red-400' : 'border-slate-200 focus:ring-blue-500'}`}
      />
      {isInvalid && <p className="text-xs text-red-500 mt-1">Выберите должность из списка</p>}
      {open && filtered.length > 0 && (
        <div className="absolute z-50 left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg max-h-56 overflow-y-auto">
          {filtered.map(p => (
            <button key={p.id} type="button"
              className="w-full text-left px-3 py-2 text-sm hover:bg-blue-50 hover:text-blue-700 transition"
              onMouseDown={() => { onChange(p.label); setQuery(p.label); onValidChange(true); setOpen(false); }}>
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TagsSelect({ label, category, selected, onChange }: { label: string; category: string; selected: string[]; onChange: (v: string[]) => void }) {
  const [options, setOptions] = useState<DictOption[]>([]);
  useEffect(() => {
    fetch(`/api/dict?category=${category}`).then(r => r.json()).then(setOptions).catch(() => {});
  }, [category]);
  const toggle = (v: string) => onChange(selected.includes(v) ? selected.filter(x => x !== v) : [...selected, v]);
  return (
    <div>
      <label className="text-xs font-medium text-slate-600 mb-2 block">{label}</label>
      <div className="flex flex-wrap gap-2">
        {options.map(o => (
          <button key={o.id} type="button" onClick={() => toggle(o.value)}
            className={`px-3 py-1 rounded-full text-xs border transition ${selected.includes(o.value) ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-slate-600 border-slate-200 hover:border-blue-400'}`}>
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

const defaultResume = (_id: string, _position: string): ResumeFormFull => emptyForm();

type ImportedResume = {
  source: 'hh' | 'avito';
  sourceId: string;
  position: string;
  city: string;
  salaryFrom: number | null;
  experience: string;
  education: string;
  workMode: string;
  skills: string[];
  about: string;
};

type AvitoCard = { id: string; title: string; city: string; salary: string; url: string };

function ResumeImportPanel({ onImport }: { onImport: (r: ImportedResume) => void }) {
  const [open, setOpen] = useState<'hh' | 'avito' | null>(null);
  const [hhStatus, setHhStatus] = useState<'idle' | 'loading' | 'connected' | 'error'>('idle');
  const [hhList, setHhList] = useState<{ id: string; title: string; area: string }[]>([]);
  const [avitoQuery, setAvitoQuery] = useState('специалист по закупкам');
  const [avitoUrl, setAvitoUrl] = useState('');
  const [avitoResults, setAvitoResults] = useState<AvitoCard[]>([]);
  const [avitoLoading, setAvitoLoading] = useState(false);
  const [avitoError, setAvitoError] = useState('');

  // Check if hh.ru connected after OAuth redirect
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('hh_connected') === '1') {
      setOpen('hh');
      fetchHhList();
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  async function fetchHhList() {
    setHhStatus('loading');
    try {
      const res = await fetch('/api/hh/resumes');
      if (res.status === 401) { setHhStatus('idle'); return; }
      const data = await res.json();
      if (data.error) { setHhStatus('error'); return; }
      setHhList(data);
      setHhStatus('connected');
    } catch {
      setHhStatus('error');
    }
  }

  async function importHhResume(id: string) {
    const res = await fetch(`/api/hh/resumes?id=${id}`);
    const data: ImportedResume = await res.json();
    onImport(data);
    setOpen(null);
  }

  async function searchAvito() {
    setAvitoLoading(true);
    setAvitoError('');
    try {
      const url = avitoUrl.trim()
        ? `/api/avito/resumes?url=${encodeURIComponent(avitoUrl)}`
        : `/api/avito/resumes?q=${encodeURIComponent(avitoQuery)}`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.error) { setAvitoError(data.error); return; }
      if (avitoUrl.trim()) {
        onImport(data as ImportedResume);
        setOpen(null);
      } else {
        setAvitoResults(data as AvitoCard[]);
      }
    } catch (e: unknown) {
      setAvitoError(e instanceof Error ? e.message : 'Ошибка');
    } finally {
      setAvitoLoading(false);
    }
  }

  async function importAvitoByUrl(url: string) {
    setAvitoLoading(true);
    try {
      const res = await fetch(`/api/avito/resumes?url=${encodeURIComponent(url)}`);
      const data: ImportedResume = await res.json();
      onImport(data);
      setOpen(null);
    } catch {
      setAvitoError('Не удалось загрузить резюме');
    } finally {
      setAvitoLoading(false);
    }
  }

  return (
    <div className="bg-gradient-to-r from-blue-50 to-slate-50 border border-blue-100 rounded-xl p-4 mb-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="text-sm font-semibold text-slate-800">Импорт резюме</div>
          <div className="text-xs text-slate-500">Загрузите данные с job-портала автоматически</div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setOpen(open === 'hh' ? null : 'hh'); if (open !== 'hh' && hhStatus === 'idle') fetchHhList(); }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-red-200 bg-white text-xs font-semibold text-red-700 hover:bg-red-50 transition">
            <span className="text-base leading-none">🔴</span> hh.ru
          </button>
          <button
            onClick={() => setOpen(open === 'avito' ? null : 'avito')}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-green-200 bg-white text-xs font-semibold text-green-700 hover:bg-green-50 transition">
            <span className="text-base leading-none">🟢</span> Avito
          </button>
        </div>
      </div>

      {/* hh.ru panel */}
      {open === 'hh' && (
        <div className="mt-4 pt-4 border-t border-blue-100">
          {hhStatus === 'idle' && (
            <div className="text-center py-2">
              <p className="text-sm text-slate-600 mb-3">Авторизуйтесь через hh.ru для импорта резюме</p>
              <a href="/api/hh/auth"
                className="inline-block px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition">
                Войти через hh.ru
              </a>
            </div>
          )}
          {hhStatus === 'loading' && <div className="text-sm text-slate-500 text-center py-2">Загрузка резюме...</div>}
          {hhStatus === 'error' && <div className="text-sm text-red-500 text-center py-2">Ошибка подключения к hh.ru</div>}
          {hhStatus === 'connected' && (
            <div className="space-y-2">
              <div className="text-xs font-medium text-slate-600 mb-2">Ваши резюме на hh.ru:</div>
              {hhList.length === 0 && <div className="text-sm text-slate-400">Резюме не найдены</div>}
              {hhList.map(r => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.area}</div>
                  </div>
                  <button onClick={() => importHhResume(r.id)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition">
                    Импортировать
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Avito panel */}
      {open === 'avito' && (
        <div className="mt-4 pt-4 border-t border-blue-100 space-y-3">
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Поиск по ключевым словам</div>
            <div className="flex gap-2">
              <input
                value={avitoQuery} onChange={e => setAvitoQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && searchAvito()}
                placeholder="специалист по закупкам"
                className="flex-1 rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button onClick={searchAvito} disabled={avitoLoading}
                className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60">
                {avitoLoading ? '...' : 'Найти'}
              </button>
            </div>
          </div>
          <div>
            <div className="text-xs font-medium text-slate-600 mb-1">Или вставьте ссылку на резюме</div>
            <div className="flex gap-2">
              <input
                value={avitoUrl} onChange={e => setAvitoUrl(e.target.value)}
                placeholder="https://www.avito.ru/..."
                className="flex-1 rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-400"
              />
              <button onClick={searchAvito} disabled={avitoLoading || !avitoUrl.trim()}
                className="px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition disabled:opacity-60">
                Загрузить
              </button>
            </div>
          </div>
          {avitoError && <div className="text-xs text-red-500">{avitoError}</div>}
          {avitoResults.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {avitoResults.map(r => (
                <div key={r.id} className="flex items-center justify-between px-3 py-2 bg-white rounded-lg border border-slate-100">
                  <div>
                    <div className="text-sm font-medium text-slate-800">{r.title}</div>
                    <div className="text-xs text-slate-500">{r.city} · {r.salary}</div>
                  </div>
                  <button onClick={() => importAvitoByUrl(r.url)}
                    className="text-xs px-3 py-1.5 rounded-lg bg-green-600 text-white font-medium hover:bg-green-700 transition">
                    Импорт
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Черновик', pending: 'На проверке', active: 'Опубликовано', rejected: 'Отклонено', archived: 'В архиве',
};
const STATUS_COLORS: Record<string, string> = {
  draft: 'text-slate-500 bg-slate-100',
  pending: 'text-amber-700 bg-amber-50',
  active: 'text-emerald-700 bg-emerald-50',
  rejected: 'text-red-700 bg-red-50',
};

type MatchedVacancy = { id: string; title: string; employerName: string; city: string; workMode: string; salaryFrom: number | null; salaryTo: number | null };

function MatchedVacanciesModal({ vacancies, onClose }: { vacancies: MatchedVacancy[]; onClose: () => void }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-800">Резюме опубликовано!</h2>
            <p className="text-sm text-slate-500 mt-0.5">Подходящие вакансии по вашему профилю</p>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 text-xl leading-none">×</button>
        </div>
        {vacancies.length === 0 ? (
          <p className="text-sm text-slate-500 py-4 text-center">Подходящих вакансий пока нет. Следите за обновлениями.</p>
        ) : (
          <div className="space-y-2 max-h-80 overflow-y-auto">
            {vacancies.map(v => (
              <div key={v.id} className="border border-slate-100 rounded-xl p-3 hover:border-blue-200 transition">
                <div className="font-medium text-slate-800 text-sm">{v.title}</div>
                <div className="text-xs text-slate-500 mt-0.5">{v.employerName} · {v.city} · {v.workMode}</div>
                {(v.salaryFrom || v.salaryTo) && (
                  <div className="text-xs text-emerald-700 font-medium mt-1">
                    {v.salaryFrom ? `от ${v.salaryFrom.toLocaleString('ru-RU')} ₽` : ''}{v.salaryTo ? ` до ${v.salaryTo.toLocaleString('ru-RU')} ₽` : ''}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 flex justify-end">
          <Btn variant="primary" onClick={onClose}>Отлично</Btn>
        </div>
      </div>
    </div>
  );
}

function resumeToForm(r: import('@/lib/types').Resume): ResumeFormFull {
  return {
    dbId: r.id, dbStatus: r.status, rejectReason: r.rejectReason ?? '',
    firstName: r.firstName, lastName: r.lastName, patronymic: r.patronymic ?? '', gender: r.gender,
    birthDate: r.birthDate ?? '',
    city: r.city, region: r.region ?? '', phone: '', email: '', photoUrl: r.photo ?? '',
    position: r.position, positionValid: true, salary: r.salary ? String(r.salary) : '', workMode: r.workMode,
    experience: String(r.experience), education: r.education,
    educationInstitution: r.educationInstitution ?? '', educationYears: r.educationYears ?? '',
    workExperiences: r.workExperiences.map(w => ({
      _id: String(w.id), company: w.company, role: w.role,
      fromMonth: w.from, toMonth: w.to === 'по настоящее время' ? '' : w.to,
      isCurrent: w.to === 'по настоящее время', description: w.description,
    })),
    activityAreas: r.activityAreas,
    skills: r.skills,
    purchaseTypes: r.purchaseTypes,
    specialStatuses: r.specialStatuses.map(s => ({
      value: s.value, docDate: s.docDate, docNumber: s.docNumber,
      documentRef: s.documentRef, disabilityGroup: s.disabilityGroup,
    })),
    tests: r.tests.map(t => ({ value: t.value, passedAt: t.passedAt ?? '' })),
    about: r.about,
  };
}

export function MyResume() {
  const [resumeList, setResumeList] = useState<import('@/lib/types').Resume[]>([]);
  const [form, setForm] = useState<ResumeFormFull>(emptyForm());
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [creating, setCreating] = useState(false);
  const [matchedVacancies, setMatchedVacancies] = useState<MatchedVacancy[] | null>(null);

  const loadResumes = (selectId?: string) => {
    fetch('/api/resumes').then(r => r.json())
      .then((data: import('@/lib/types').Resume[]) => {
        setResumeList(data);
        if (data.length > 0) {
          const target = selectId ? data.find(r => r.id === selectId) ?? data[0] : data[0];
          setForm(resumeToForm(target));
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadResumes();
    fetch('/api/users/me').then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setForm(f => ({ ...f, phone: d.phone ?? '', email: d.email ?? '' })); })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (!saved && form.dbId) { e.preventDefault(); e.returnValue = ''; }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [saved, form.dbId]);

  const upd = (k: keyof ResumeFormFull, v: unknown) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  const createNewResume = async () => {
    setCreating(true);
    try {
      const res = await fetch('/api/resumes', { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        loadResumes(data.id);
        setSaved(false);
      }
    } finally { setCreating(false); }
  };

  const deleteResume = async () => {
    if (!form.dbId) return;
    if (!confirm('Удалить это резюме? Это действие необратимо.')) return;
    const res = await fetch(`/api/resumes/${form.dbId}`, { method: 'DELETE' });
    if (res.ok) {
      loadResumes();
      setForm(emptyForm());
      setSaved(false);
    } else {
      const d = await res.json().catch(() => ({}));
      alert(d.error ?? 'Ошибка удаления');
    }
  };

  const saveToDb = async (newStatus?: string) => {
    if (!form.dbId) return;
    if (!form.positionValid && form.position) { upd('positionValid', false); return; }
    setSaving(true);
    try {
      const body: Record<string, unknown> = {
        firstName: form.firstName, lastName: form.lastName, patronymic: form.patronymic,
        gender: form.gender, birthDate: form.birthDate || undefined,
        position: form.position, city: form.city, region: form.region,
        photoUrl: form.photoUrl || null,
        salary: form.salary || null, experience: form.experience,
        education: form.education, educationInstitution: form.educationInstitution,
        educationYears: form.educationYears, workMode: form.workMode, about: form.about,
        workExperiences: form.workExperiences.map(w => ({
          company: w.company, role: w.role, fromMonth: w.fromMonth,
          toMonth: w.isCurrent ? null : w.toMonth || null,
          isCurrent: w.isCurrent, description: w.description,
        })),
        specialStatuses: form.specialStatuses,
        activityAreas: form.activityAreas,
        skills: form.skills,
        purchaseTypes: form.purchaseTypes,
        tests: form.tests,
      };
      if (newStatus) body.status = newStatus;
      const res = await fetch(`/api/resumes/${form.dbId}`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        const data = await res.json();
        setForm(f => ({ ...f, dbStatus: data.status }));
        setSaved(true);
        if (data.matchedVacancies) setMatchedVacancies(data.matchedVacancies);
      }
    } finally { setSaving(false); }
  };

  const addWorkExp = () => upd('workExperiences', [...form.workExperiences, {
    _id: String(Date.now()), company: '', role: '', fromMonth: '', toMonth: '', isCurrent: false, description: '',
  }]);
  const updWorkExp = (idx: number, k: keyof WorkExpEntry, v: unknown) => {
    const next = form.workExperiences.map((w, i) => i === idx ? { ...w, [k]: v } : w);
    upd('workExperiences', next);
  };
  const removeWorkExp = (idx: number) => upd('workExperiences', form.workExperiences.filter((_, i) => i !== idx));

  const toggleSpecialStatus = (value: string) => {
    const has = form.specialStatuses.find(s => s.value === value);
    if (has) upd('specialStatuses', form.specialStatuses.filter(s => s.value !== value));
    else upd('specialStatuses', [...form.specialStatuses, { value, docDate: '', docNumber: '', documentRef: '', disabilityGroup: '' }]);
  };
  const updSpecialStatus = (value: string, k: keyof SpecialStatusEntry, v: string) => {
    upd('specialStatuses', form.specialStatuses.map(s => s.value === value ? { ...s, [k]: v } : s));
  };

  const getTest = (value: string) => form.tests.find(t => t.value === value);
  const toggleTest = (value: string, passedAt: string) => {
    const has = form.tests.find(t => t.value === value);
    if (has) upd('tests', form.tests.map(t => t.value === value ? { ...t, passedAt } : t));
    else upd('tests', [...form.tests, { value, passedAt }]);
  };

  const TEST_LINKS: Record<string, string> = {
    etp_zakaz_rf: 'https://zakaz.rf/education',
    test_44fz_customer: 'https://zakaz.rf/test/44fz-customer',
    test_44fz_supplier: 'https://zakaz.rf/test/44fz-supplier',
    test_223fz_customer: 'https://zakaz.rf/test/223fz-customer',
    test_223fz_supplier: 'https://zakaz.rf/test/223fz-supplier',
  };

  const SPECIAL_STATUS_LABELS: Record<string, string> = {
    svo_participant: 'Участник СВО', svo_family: 'Член семьи участника СВО', disabled: 'Человек с ОВЗ',
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      {matchedVacancies !== null && (
        <MatchedVacanciesModal vacancies={matchedVacancies} onClose={() => setMatchedVacancies(null)} />
      )}
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Моё резюме</h1>
          <p className="text-sm text-slate-500 mt-0.5">Ваш профиль для работодателей</p>
        </div>
        <div className="flex items-center gap-2">
          {resumeList.length > 1 && (
            <select
              value={form.dbId}
              onChange={e => {
                const r = resumeList.find(x => x.id === e.target.value);
                if (r) { setForm(resumeToForm(r)); setSaved(false); }
              }}
              className="text-xs border border-slate-200 rounded-lg px-2 py-1.5 bg-white text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {resumeList.map(r => (
                <option key={r.id} value={r.id}>
                  {r.position || 'Без названия'} ({STATUS_LABELS[r.status] ?? r.status})
                </option>
              ))}
            </select>
          )}
          <button
            onClick={createNewResume}
            disabled={creating}
            className="text-xs font-medium px-3 py-1.5 rounded-lg border border-blue-200 text-blue-600 hover:bg-blue-50 transition disabled:opacity-50"
          >
            {creating ? '...' : '+ Новое резюме'}
          </button>
          {form.dbId && form.dbStatus !== 'active' && (
            <button
              onClick={deleteResume}
              className="text-xs font-medium px-3 py-1.5 rounded-lg border border-red-200 text-red-500 hover:bg-red-50 transition"
            >
              Удалить
            </button>
          )}
          {form.dbStatus && (
            <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${STATUS_COLORS[form.dbStatus] ?? 'text-slate-500 bg-slate-100'}`}>
              {STATUS_LABELS[form.dbStatus] ?? form.dbStatus}
            </span>
          )}
        </div>
      </div>

      <ResumeImportPanel onImport={r => {
        setForm(f => ({
          ...f,
          position: r.position || f.position,
          city: r.city || f.city,
          salary: r.salaryFrom ? String(r.salaryFrom) : f.salary,
          experience: r.experience || f.experience,
          education: r.education || f.education,
          workMode: r.workMode || f.workMode,
          about: [r.about, r.skills.length ? `Навыки: ${r.skills.join(', ')}` : ''].filter(Boolean).join('\n\n') || f.about,
        }));
        setSaved(false);
      }} />

      <div className="space-y-4 mt-4">

        {/* Block 1 — Общая информация */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Общая информация</h3>
          <div className="flex gap-4 mb-4 items-start">
            <div className="flex-shrink-0 flex flex-col items-center gap-1">
              <label className="cursor-pointer group relative" title="Нажмите для загрузки фото">
                {form.photoUrl
                  ? <img src={form.photoUrl} alt="фото" className="w-24 h-24 rounded-full object-cover ring-2 ring-white shadow group-hover:brightness-90 transition" />
                  : <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-3xl font-semibold ring-2 ring-white shadow group-hover:brightness-90 transition">
                      {[form.firstName, form.lastName].filter(Boolean).map(w => w[0]).join('') || '?'}
                    </div>
                }
                <div className="absolute inset-0 rounded-full flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition">
                  <span className="text-white text-xs font-medium">Загрузить</span>
                </div>
                <input type="file" accept="image/*" className="hidden" onChange={e => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 2 * 1024 * 1024) { alert('Файл слишком большой. Максимум 2 МБ.'); return; }
                  const reader = new FileReader();
                  reader.onload = ev => { upd('photoUrl', ev.target?.result as string); };
                  reader.readAsDataURL(file);
                }} />
              </label>
              <p className="text-xs text-slate-400">Фото</p>
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Фамилия</label>
                <Input value={form.lastName} onChange={v => upd('lastName', v)} placeholder="Иванова" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Имя</label>
                <Input value={form.firstName} onChange={v => upd('firstName', v)} placeholder="Мария" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Отчество</label>
                <Input value={form.patronymic} onChange={v => upd('patronymic', v)} placeholder="Ивановна" />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Пол</label>
                <Select value={form.gender} onChange={v => upd('gender', v)}
                  options={[{ value: 'FEMALE', label: 'Женский' }, { value: 'MALE', label: 'Мужской' }]} />
              </div>
              <div>
                <label className="text-xs font-medium text-slate-600 mb-1 block">Дата рождения</label>
                <input type="date" value={form.birthDate} onChange={e => upd('birthDate', e.target.value)}
                  max={new Date().toISOString().slice(0, 10)}
                  className="w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-800 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Город</label>
              <Input value={form.city} onChange={v => upd('city', v)} placeholder="Москва" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Регион</label>
              <Input value={form.region} onChange={v => upd('region', v)} placeholder="Республика Татарстан" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Телефон</label>
              <Input value={form.phone} onChange={v => upd('phone', v)} placeholder="+7 (900) 000-00-00" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <Input value={form.email} onChange={() => {}} disabled placeholder="из профиля" />
            </div>
          </div>
        </div>

        {/* Block 2 — Требования к работе */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Требования к работе</h3>
          <div className="mb-3">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Желаемая должность</label>
            <PositionAutocomplete value={form.position} valid={form.positionValid}
              onChange={v => upd('position', v)} onValidChange={v => upd('positionValid', v)} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Желаемая зарплата, ₽</label>
              <Input value={form.salary} onChange={v => upd('salary', v)} placeholder="90 000" type="number" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Режим работы</label>
              <Select value={form.workMode} onChange={v => upd('workMode', v)} options={DICTIONARIES.workModes} />
            </div>
          </div>
        </div>

        {/* Block 3 — Образование */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Образование</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Уровень образования</label>
              <Select value={form.education} onChange={v => upd('education', v)} options={DICTIONARIES.educations} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Годы обучения</label>
              <Input value={form.educationYears} onChange={v => upd('educationYears', v)} placeholder="2010–2015" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Учебное заведение</label>
              <Input value={form.educationInstitution} onChange={v => upd('educationInstitution', v)} placeholder="МГУ им. Ломоносова" />
            </div>
          </div>
        </div>

        {/* Block 4 — Опыт работы */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-800">Опыт работы</h3>
            <Btn variant="ghost" size="sm" onClick={addWorkExp}>+ Добавить</Btn>
          </div>
          <div className="mb-3">
            <label className="text-xs font-medium text-slate-600 mb-1 block">Общий стаж (лет)</label>
            <Input value={form.experience} onChange={v => upd('experience', v)} placeholder="5" type="number" className="max-w-[120px]" />
          </div>
          {form.workExperiences.length === 0 && (
            <p className="text-xs text-slate-400">Не добавлено. Нажмите «+ Добавить» для конкретного места работы.</p>
          )}
          <div className="space-y-3">
            {form.workExperiences.map((w, idx) => (
              <div key={w._id} className="border border-slate-200 rounded-lg p-3 space-y-2 relative">
                <button onClick={() => removeWorkExp(idx)}
                  className="absolute top-2 right-2 text-slate-300 hover:text-red-400 text-xs">✕</button>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-0.5 block">Организация</label>
                    <Input value={w.company} onChange={v => updWorkExp(idx, 'company', v)} placeholder="ООО «Ромашка»" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-0.5 block">Должность</label>
                    <Input value={w.role} onChange={v => updWorkExp(idx, 'role', v)} placeholder="Специалист по закупкам" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-0.5 block">С (мм.гггг)</label>
                    <Input value={w.fromMonth} onChange={v => updWorkExp(idx, 'fromMonth', v)} placeholder="01.2020" />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-slate-500 mb-0.5 block">По (мм.гггг)</label>
                    <Input value={w.isCurrent ? '' : w.toMonth} onChange={v => updWorkExp(idx, 'toMonth', v)} placeholder="01.2024" disabled={w.isCurrent} />
                    <label className="flex items-center gap-1.5 mt-1 cursor-pointer">
                      <input type="checkbox" checked={w.isCurrent} onChange={e => updWorkExp(idx, 'isCurrent', e.target.checked)} className="rounded border-slate-300 w-3.5 h-3.5" />
                      <span className="text-xs text-slate-500">По настоящее время</span>
                    </label>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-medium text-slate-500 mb-0.5 block">Описание обязанностей</label>
                    <textarea value={w.description} onChange={e => updWorkExp(idx, 'description', e.target.value)} rows={2}
                      className="w-full rounded-lg border border-slate-200 text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Block 5 — Сферы и навыки */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5 space-y-4">
          <h3 className="text-sm font-semibold text-slate-800">Сферы и навыки</h3>
          <TagsSelect label="Сфера деятельности заказчика" category="ACTIVITY_AREA" selected={form.activityAreas} onChange={v => upd('activityAreas', v)} />
          <TagsSelect label="Области закупок" category="PURCHASE_TYPE" selected={form.purchaseTypes} onChange={v => upd('purchaseTypes', v)} />
          <TagsSelect label="Профессиональные навыки" category="SKILL" selected={form.skills} onChange={v => upd('skills', v)} />
        </div>

        {/* Block 6 — Особые статусы */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-1">Особые статусы</h3>
          <p className="text-xs text-slate-400 mb-4">Отображаются в резюме только после подтверждения администратором</p>
          <div className="space-y-3">
            {(['svo_participant', 'svo_family', 'disabled'] as const).map(val => {
              const active = form.specialStatuses.find(s => s.value === val);
              return (
                <div key={val}>
                  <label className="flex items-center gap-2 cursor-pointer mb-2">
                    <input type="checkbox" checked={!!active} onChange={() => toggleSpecialStatus(val)}
                      className="rounded border-slate-300 w-4 h-4 text-blue-600" />
                    <span className="text-sm text-slate-700 font-medium">{SPECIAL_STATUS_LABELS[val]}</span>
                  </label>
                  {active && (
                    <div className={`ml-6 grid grid-cols-1 sm:grid-cols-2 gap-2 p-3 bg-slate-50 rounded-lg border border-slate-200`}>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-0.5 block">Дата справки</label>
                        <Input value={active.docDate} onChange={v => updSpecialStatus(val, 'docDate', v)} placeholder="01.01.2024" />
                      </div>
                      <div>
                        <label className="text-xs font-medium text-slate-500 mb-0.5 block">Номер справки</label>
                        <Input value={active.docNumber} onChange={v => updSpecialStatus(val, 'docNumber', v)} placeholder="№ 12345" />
                      </div>
                      {val === 'disabled' && (
                        <div>
                          <label className="text-xs font-medium text-slate-500 mb-0.5 block">Группа инвалидности</label>
                          <Select value={active.disabilityGroup} onChange={v => updSpecialStatus(val, 'disabilityGroup', v)}
                            options={[{ value: '1', label: 'I группа' }, { value: '2', label: 'II группа' }, { value: '3', label: 'III группа' }]} />
                        </div>
                      )}
                      <div className={val === 'disabled' ? '' : 'sm:col-span-2'}>
                        <label className="text-xs font-medium text-slate-500 mb-0.5 block">Ссылка / реквизиты документа</label>
                        <Input value={active.documentRef} onChange={v => updSpecialStatus(val, 'documentRef', v)} placeholder="Файл или описание" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Block 7 — Квалификационные маркеры */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Квалификация и тесты</h3>
          <div className="space-y-3">
            {[
              { value: 'etp_zakaz_rf', label: 'Курс повышения квалификации ЭТП ЗаказРФ', type: 'course' as const },
              { value: 'test_44fz_customer', label: 'Тест: 44-ФЗ для заказчиков', type: 'test' as const },
              { value: 'test_44fz_supplier', label: 'Тест: 44-ФЗ для поставщиков', type: 'test' as const },
              { value: 'test_223fz_customer', label: 'Тест: 223-ФЗ для заказчиков', type: 'test' as const },
              { value: 'test_223fz_supplier', label: 'Тест: 223-ФЗ для поставщиков', type: 'test' as const },
            ].map(item => {
              const entry = getTest(item.value);
              const passed = entry && entry.passedAt;
              return (
                <div key={item.value} className="flex items-center justify-between gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="flex items-center gap-2 min-w-0">
                    {passed
                      ? <span className="text-emerald-500 text-base flex-shrink-0">✓</span>
                      : <span className="text-slate-300 text-base flex-shrink-0">○</span>}
                    <span className="text-sm text-slate-700 truncate">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {passed ? (
                      <button onClick={() => toggleTest(item.value, '')}
                        className="text-xs text-slate-400 hover:text-red-400 transition">Снять</button>
                    ) : (
                      <>
                        <a href={TEST_LINKS[item.value]} target="_blank" rel="noopener noreferrer"
                          className="text-xs text-blue-600 hover:underline">
                          {item.type === 'course' ? 'Пройти курс' : 'Пройти тест'} →
                        </a>
                        <button onClick={() => toggleTest(item.value, new Date().toISOString())}
                          className="text-xs text-emerald-600 border border-emerald-200 px-2 py-0.5 rounded hover:bg-emerald-50 transition">
                          Отметить как пройденный
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* О себе */}
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">О себе</h3>
          <textarea value={form.about} onChange={e => upd('about', e.target.value)} rows={5}
            placeholder="Расскажите о своём опыте и навыках..."
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none" />
        </div>

        {/* Actions */}
        <div className="flex justify-between gap-2 items-center flex-wrap pb-4">
          <div className="flex items-center gap-2">
            {saved && <span className="text-sm text-emerald-600">✓ Сохранено</span>}
            {form.dbId && (
              <Btn variant="ghost" size="sm" onClick={() => window.print()}>
                <svg className="w-4 h-4 mr-1 inline" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                </svg>
                Печать
              </Btn>
            )}
          </div>
          <div className="flex gap-2 flex-wrap">
            {form.dbId && form.dbStatus === 'rejected' && form.rejectReason && (
              <div className="w-full mb-1 flex items-start gap-2 px-3 py-2 bg-red-50 border border-red-200 rounded-lg">
                <svg className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-red-700"><span className="font-semibold">Причина отклонения:</span> {form.rejectReason}</p>
              </div>
            )}
            {form.dbId && form.dbStatus === 'pending' && (
              <div className="w-full mb-1 flex items-center gap-2 px-3 py-2 bg-amber-50 border border-amber-200 rounded-lg">
                <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <p className="text-xs text-amber-700">Резюме отправлено на проверку — ожидайте одобрения администратора.</p>
                <button onClick={() => saveToDb('DRAFT')} className="ml-auto text-xs text-amber-600 hover:text-amber-800 font-medium underline underline-offset-2">Отозвать</button>
              </div>
            )}
            {form.dbId && (form.dbStatus === 'draft' || form.dbStatus === 'rejected') && (
              <Btn variant="secondary" onClick={() => saveToDb('PENDING')} disabled={saving}>Отправить на проверку</Btn>
            )}
            {form.dbId && form.dbStatus === 'active' && (
              <Btn variant="ghost" onClick={() => saveToDb('DRAFT')} disabled={saving}>Снять с публикации</Btn>
            )}
            <Btn variant="primary" onClick={() => saveToDb()} disabled={saving || !form.dbId}>
              {saving ? 'Сохранение…' : 'Сохранить изменения'}
            </Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Seeker Invitations ─────────────────────────────────────────────────────
type EmployerPublicInfo = { name: string; region: string; city: string; description: string; website: string; phone: string; contactName: string };

export function SeekerInvitations({ invitations, setInvitations }: { invitations: Invitation[]; setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>> }) {
  const [empModal, setEmpModal] = useState<EmployerPublicInfo | null>(null);
  const [empLoading, setEmpLoading] = useState('');
  const [replyMsgs, setReplyMsgs] = useState<Record<string, string>>({});

  const showEmployer = async (employerId: string) => {
    setEmpLoading(employerId);
    try {
      const res = await fetch(`/api/employers/${employerId}`);
      if (res.ok) setEmpModal(await res.json());
    } finally { setEmpLoading(''); }
  };

  useEffect(() => {
    const toView = invitations.filter(i => i.status === 'sent' && !i.fromSeeker);
    if (toView.length === 0) return;
    setInvitations(prev => prev.map(i => toView.some(v => v.id === i.id) ? { ...i, status: 'viewed' as const } : i));
    toView.forEach(i => {
      fetch(`/api/invitations/${i.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'viewed' }),
      }).catch(() => {});
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const respond = (id: string, status: 'accepted' | 'rejected') => {
    const replyMessage = replyMsgs[id]?.trim() || undefined;
    setInvitations(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    fetch(`/api/invitations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, replyMessage }),
    }).catch(() => {});
  };

  const employerInvites = invitations.filter(i => !i.fromSeeker);
  const myApplies = invitations.filter(i => i.fromSeeker);

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Приглашения и отклики</h1>
      {invitations.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Приглашений и откликов пока нет</div>
      ) : (
        <>
          {employerInvites.length > 0 && (
            <div className="mb-6">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Приглашения от работодателей ({employerInvites.length})</h2>
              <div className="space-y-3">
                {employerInvites.map(inv => (
                  <div key={inv.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-4">
                    <Avatar name={inv.employerName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-800">{inv.vacancyTitle}</div>
                          <button
                            className="text-sm text-blue-600 hover:underline text-left"
                            onClick={() => inv.employerId && showEmployer(inv.employerId)}
                            disabled={!inv.employerId || empLoading === inv.employerId}
                          >
                            {empLoading === inv.employerId ? 'Загрузка…' : inv.employerName}
                          </button>
                          <p className="text-sm text-slate-500 mt-1 leading-relaxed">{inv.message}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <StatusBadge status={inv.status} />
                          <span className="text-xs text-slate-400">{fmtDate(inv.createdAt)}</span>
                        </div>
                      </div>
                      {(inv.status === 'sent' || inv.status === 'viewed') && (
                        <div className="mt-3 space-y-2">
                          <textarea
                            value={replyMsgs[inv.id] ?? ''}
                            onChange={e => setReplyMsgs(prev => ({ ...prev, [inv.id]: e.target.value }))}
                            placeholder="Ответное сообщение (необязательно)..."
                            rows={2}
                            className="w-full rounded-lg border border-slate-200 text-xs px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                          />
                          <div className="flex gap-2">
                            <Btn size="sm" variant="primary" onClick={() => respond(inv.id, 'accepted')}>Принять</Btn>
                            <Btn size="sm" variant="secondary" onClick={() => respond(inv.id, 'rejected')}>Отклонить</Btn>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          {myApplies.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-3">Мои отклики ({myApplies.length})</h2>
              <div className="space-y-3">
                {myApplies.map(inv => (
                  <div key={inv.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-4">
                    <Avatar name={inv.employerName} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-semibold text-slate-800">{inv.vacancyTitle}</div>
                          <div className="text-sm text-blue-600">{inv.employerName}</div>
                        </div>
                        <div className="flex flex-col items-end gap-2 flex-shrink-0">
                          <StatusBadge status={inv.status} />
                          <span className="text-xs text-slate-400">{fmtDate(inv.createdAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {empModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setEmpModal(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <h2 className="text-lg font-bold text-slate-800">{empModal.name}</h2>
              <button onClick={() => setEmpModal(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none">✕</button>
            </div>
            <div className="p-5 space-y-3 text-sm text-slate-700">
              {(empModal.city || empModal.region) && (
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 flex-shrink-0">Адрес</span>
                  <span>{[empModal.city, empModal.region].filter(Boolean).join(', ')}</span>
                </div>
              )}
              {empModal.contactName && (
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 flex-shrink-0">Контакт</span>
                  <span>{empModal.contactName}</span>
                </div>
              )}
              {empModal.phone && (
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 flex-shrink-0">Телефон</span>
                  <a href={`tel:${empModal.phone}`} className="text-blue-600 hover:underline">{empModal.phone}</a>
                </div>
              )}
              {empModal.website && (
                <div className="flex gap-2">
                  <span className="text-slate-400 w-20 flex-shrink-0">Сайт</span>
                  <a href={empModal.website.startsWith('http') ? empModal.website : `https://${empModal.website}`}
                    target="_blank" rel="noreferrer" className="text-blue-600 hover:underline truncate">{empModal.website}</a>
                </div>
              )}
              {empModal.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">О компании</p>
                  <p className="text-slate-600 whitespace-pre-line">{empModal.description}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Seeker Messages ────────────────────────────────────────────────────────
const AI_THREAD_ID = '__ai_assistant__';
type ChatMsg = { id: string; fromMe: boolean; text: string; ts: string };
type Thread  = { id: string; name: string; msgs: ChatMsg[]; unread: boolean; counterpartyUserId: string; hasContactRequest?: boolean };

function buildSeekerThreads(messages: Message[]): Thread[] {
  const aiMsgs = loadAiMsgs();
  const aiThread: Thread = {
    id: AI_THREAD_ID,
    name: 'ПРОкадры Ассистент',
    msgs: aiMsgs.map(m => ({ id: m.id, fromMe: m.fromMe, text: m.text, ts: m.ts })),
    unread: false,
    counterpartyUserId: AI_THREAD_ID,
  };
  const map = new Map<string, Thread>();
  for (const m of [...messages].sort((a, b) => a.createdAt.localeCompare(b.createdAt))) {
    const cpId = m.counterpartyUserId;
    if (!cpId) continue;
    if (!map.has(cpId)) {
      map.set(cpId, { id: cpId, name: m.fromRole === 'employer' ? m.fromName : m.toName, msgs: [], unread: false, counterpartyUserId: cpId });
    }
    const t = map.get(cpId)!;
    if (m.text === '__contact_request__') {
      t.hasContactRequest = true;
    } else if (m.text.startsWith('__contact_share__:')) {
      t.hasContactRequest = false;
    } else {
      t.msgs.push({ id: m.id, fromMe: m.fromRole === 'candidate', text: m.text, ts: m.createdAt });
    }
    if (!m.isRead && m.fromRole === 'employer') t.unread = true;
  }
  return [aiThread, ...Array.from(map.values())];
}

export function SeekerMessages({ messages, onMarkRead, email }: { messages: Message[]; onMarkRead?: (id: string) => void; email?: string }) {
  const [threads, setThreads] = useState<Thread[]>(() => buildSeekerThreads(messages));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const [aiTyping, setAiTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setThreads(buildSeekerThreads(messages)); }, [messages]);
  useEffect(() => subscribeAiMsgs(() => {
    const aiMsgs = loadAiMsgs();
    setThreads(prev => prev.map(t =>
      t.id === AI_THREAD_ID
        ? { ...t, msgs: aiMsgs.map(m => ({ id: m.id, fromMe: m.fromMe, text: m.text, ts: m.ts })) }
        : t
    ));
  }), []);

  const active = threads.find(t => t.id === activeId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.msgs.length]);

  const shareContacts = () => {
    if (!active?.counterpartyUserId || !email) return;
    const shareText = `__contact_share__:${email}`;
    fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ recipientUserId: active.counterpartyUserId, text: shareText }),
    }).then(() => {
      setThreads(prev => prev.map(t => t.id === activeId ? { ...t, hasContactRequest: false } : t));
    }).catch(() => {});
  };

  const send = async () => {
    const text = reply.trim();
    if (!activeId || text.length < 2) return;

    if (activeId === AI_THREAD_ID) {
      const msg: ChatMsg = { id: Date.now().toString(), fromMe: true, text, ts: new Date().toISOString() };
      const currentMsgs = threads.find(t => t.id === AI_THREAD_ID)?.msgs ?? [];
      setThreads(prev => prev.map(t => t.id === AI_THREAD_ID ? { ...t, msgs: [...t.msgs, msg] } : t));
      setReply('');
      setAiTyping(true);
      try {
        const apiMessages = [...currentMsgs, msg].map(m => ({ role: m.fromMe ? 'user' : 'assistant', content: m.text }));
        const res = await fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: apiMessages.slice(-10) }) });
        const data = await res.json();
        const aiMsg: ChatMsg = { id: `ai-${Date.now()}`, fromMe: false, text: data.reply ?? 'Ошибка ответа.', ts: new Date().toISOString() };
        setThreads(prev => prev.map(t => t.id === AI_THREAD_ID ? { ...t, msgs: [...t.msgs, aiMsg] } : t));
        saveAiMsgs([...currentMsgs, msg, aiMsg].map(m => ({ id: m.id, fromMe: m.fromMe, text: m.text, ts: m.ts })));
      } catch {
        const errMsg: ChatMsg = { id: `ai-err-${Date.now()}`, fromMe: false, text: 'Не удалось подключиться к ассистенту.', ts: new Date().toISOString() };
        setThreads(prev => prev.map(t => t.id === AI_THREAD_ID ? { ...t, msgs: [...t.msgs, errMsg] } : t));
        saveAiMsgs([...currentMsgs, msg, errMsg].map(m => ({ id: m.id, fromMe: m.fromMe, text: m.text, ts: m.ts })));
      } finally {
        setAiTyping(false);
      }
      return;
    }

    const t = threads.find(thr => thr.id === activeId);
    const msg: ChatMsg = { id: Date.now().toString(), fromMe: true, text, ts: new Date().toISOString() };
    setThreads(prev => prev.map(thr => thr.id === activeId ? { ...thr, msgs: [...thr.msgs, msg], unread: false } : thr));
    setReply('');
    if (t?.counterpartyUserId) {
      fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientUserId: t.counterpartyUserId, text }),
      }).catch(() => {});
    }
  };

  const lastMsg = (t: Thread) => t.msgs[t.msgs.length - 1];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Сообщения</h1>
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex overflow-hidden h-[70vh] min-h-[360px]">
        {/* Thread list */}
        <div className={`w-full md:w-72 border-r border-slate-100 flex flex-col flex-shrink-0 ${active ? 'hidden md:flex' : 'flex'}`}>
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
            {threads.map(t => (
              <button
                key={t.id} onClick={() => {
                  setActiveId(t.id);
                  if (t.unread) {
                    setThreads(prev => prev.map(th => th.id === t.id ? { ...th, unread: false } : th));
                    onMarkRead?.(t.id);
                  }
                }}
                className={`w-full text-left px-4 py-3 hover:bg-slate-50 transition ${activeId === t.id ? 'bg-blue-50 border-l-2 border-blue-500' : ''}`}
              >
                <div className="flex items-center gap-2 mb-0.5">
                  <span className={`font-semibold text-sm truncate flex-1 ${t.unread ? 'text-slate-900' : 'text-slate-700'}`}>{t.name}</span>
                  {t.unread && <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />}
                </div>
                <div className="text-xs text-slate-400 truncate">{lastMsg(t)?.text ?? (t.hasContactRequest ? '📞 Запрос контактных данных' : '')}</div>
                <div className="text-[10px] text-slate-300 mt-1">{lastMsg(t) ? fmtDate(lastMsg(t).ts) : ''}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Chat pane */}
        {active ? (
          <div className="flex-1 flex flex-col min-w-0">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="md:hidden p-1 -ml-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition" aria-label="Назад">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
              </button>
              <Avatar name={active.name} size="sm" />
              <div className="font-semibold text-slate-800 text-sm">{active.name}</div>
            </div>
            {active.hasContactRequest && (
              <div className="px-4 py-2.5 border-b border-amber-100 bg-amber-50 flex items-center justify-between gap-3">
                <span className="text-xs text-amber-800 flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                  Работодатель запрашивает ваши контактные данные
                </span>
                <button onClick={shareContacts}
                  className="text-xs px-3 py-1 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 transition whitespace-nowrap cursor-pointer">
                  Поделиться email
                </button>
              </div>
            )}
            <div className="flex-1 p-4 md:p-5 space-y-3 overflow-y-auto">
              {active.msgs.map(msg => (
                <div key={msg.id} className={`flex gap-3 ${msg.fromMe ? 'flex-row-reverse' : ''}`}>
                  <Avatar name={msg.fromMe ? 'Я' : active.name} size="sm" />
                  <div className={`max-w-[75%] md:max-w-sm rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${msg.fromMe ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700'}`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              {active.id === AI_THREAD_ID && aiTyping && (
                <div className="flex gap-3">
                  <Avatar name="ПРОкадры Ассистент" size="sm" />
                  <div className="bg-slate-100 text-slate-700 rounded-2xl px-4 py-2.5 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
            <div className="p-3 border-t border-slate-100 flex gap-2 items-end">
              <textarea
                value={reply} onChange={e => setReply(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Написать ответ… (Enter — отправить, Shift+Enter — перенос)"
                rows={2}
                className="flex-1 rounded-xl border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
              <Btn variant="primary" disabled={reply.trim().length < 2} onClick={send}>Отправить</Btn>
            </div>
          </div>
        ) : (
          <div className="hidden md:flex flex-1 items-center justify-center text-slate-400 text-sm">Выберите диалог</div>
        )}
      </div>
    </div>
  );
}

// ── Seeker Settings ────────────────────────────────────────────────────────
export function SeekerSettings() {
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '',
    notifyInvites: true, notifyMessages: true, notifyNews: false,
  });
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pwForm, setPwForm] = useState({ current: '', next: '', confirm: '' });
  const [pwError, setPwError] = useState('');
  const [pwSaved, setPwSaved] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const upd = (k: string, v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  useEffect(() => {
    fetch('/api/users/me').then(r => r.ok ? r.json() : null).then(data => {
      if (data) setForm(f => ({ ...f, firstName: data.firstName ?? '', lastName: data.lastName ?? '', email: data.email ?? '', phone: data.phone ?? '' }));
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setSaving(true);
    await fetch('/api/users/me', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone: form.phone }),
    }).catch(() => {});
    setSaving(false);
    setSaved(true);
  };

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

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Настройки</h1>
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Личные данные</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Фамилия</label>
              <Input value={form.lastName} onChange={v => upd('lastName', v)} disabled />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Имя</label>
              <Input value={form.firstName} onChange={v => upd('firstName', v)} disabled />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <Input value={form.email} onChange={v => upd('email', v)} type="email" disabled />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Телефон</label>
              <Input value={form.phone} onChange={v => upd('phone', v)} />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3">Имя, фамилия и email редактируются в разделе «Моё резюме».</p>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
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

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Уведомления</h3>
          <div className="space-y-3">
            {[
              { key: 'notifyInvites', label: 'Приглашения на работу' },
              { key: 'notifyMessages', label: 'Новые сообщения' },
              { key: 'notifyNews', label: 'Новости платформы' },
            ].map(n => (
              <label key={n.key} className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox" checked={form[n.key as keyof typeof form] as boolean}
                  onChange={e => upd(n.key, e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 w-4 h-4"
                />
                <span className="text-sm text-slate-700">{n.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-2 items-center">
          {saved && <span className="text-sm text-emerald-600">✓ Сохранено</span>}
          <Btn variant="primary" onClick={handleSave} disabled={saving}>{saving ? 'Сохранение…' : 'Сохранить'}</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Seeker Vacancy Registry ────────────────────────────────────────────────
export function SeekerVacancyRegistry({ vacancies, invitations = [] }: { vacancies: Vacancy[]; invitations?: Invitation[] }) {
  const [search, setSearch] = useState('');
  const [sphere, setSphere] = useState('');
  const [activity, setActivity] = useState('');
  const [skill, setSkill] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [salaryMin, setSalaryMin] = useState('');
  const [salaryMax, setSalaryMax] = useState('');
  const [modalVacancy, setModalVacancy] = useState<Vacancy | null>(null);

  // pre-seed apply status from existing invitations
  const [applyStatus, setApplyStatus] = useState<Record<string, 'loading' | 'done' | 'error' | 'rejected'>>(() => {
    const init: Record<string, 'loading' | 'done' | 'error' | 'rejected'> = {};
    for (const inv of invitations) {
      if (!inv.fromSeeker) continue;
      if (inv.status === 'rejected') init[inv.vacancyId] = 'rejected';
      else if (inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'accepted') init[inv.vacancyId] = 'done';
    }
    return init;
  });

  // re-sync when parent invitations prop updates (initial load completes after mount)
  useEffect(() => {
    setApplyStatus(prev => {
      const next = { ...prev };
      for (const inv of invitations) {
        if (!inv.fromSeeker) continue;
        if (next[inv.vacancyId] === 'loading') continue;
        if (inv.status === 'rejected') next[inv.vacancyId] = 'rejected';
        else if (inv.status === 'sent' || inv.status === 'viewed' || inv.status === 'accepted') next[inv.vacancyId] = 'done';
      }
      return next;
    });
  }, [invitations]);

  const handleApply = async (vacancyId: string) => {
    setApplyStatus(prev => ({ ...prev, [vacancyId]: 'loading' }));
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancyId }),
      });
      setApplyStatus(prev => ({ ...prev, [vacancyId]: res.ok || res.status === 409 ? 'done' : 'error' }));
    } catch {
      setApplyStatus(prev => ({ ...prev, [vacancyId]: 'error' }));
    }
  };

  const allActive = vacancies.filter(v => v.status === 'active');
  const allSkills = [...new Set(allActive.flatMap(v => v.skills ?? []))].sort((a, b) => a.localeCompare(b, 'ru'));

  const active = allActive.filter(v => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) &&
        !v.employerName.toLowerCase().includes(search.toLowerCase()) &&
        !v.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (sphere && !v.clientSpheres?.includes(sphere)) return false;
    if (activity && !v.specialistActivities?.includes(activity)) return false;
    if (skill && !v.skills?.includes(skill)) return false;
    if (workMode && v.workMode !== workMode) return false;
    if (salaryMin && v.salaryFrom && v.salaryFrom < Number(salaryMin)) return false;
    if (salaryMax && v.salaryTo && v.salaryTo > Number(salaryMax)) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Реестр вакансий</h1>
        <p className="text-sm text-slate-500 mt-0.5">{active.length} активных вакансий по закупкам</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Должность, организация, город..."
            className="col-span-1 sm:col-span-2 lg:col-span-1 rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          <select value={sphere} onChange={e => setSphere(e.target.value)}
            className="rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
            <option value="">Сфера заказчика</option>
            {DICTIONARIES.clientSpheres.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={activity} onChange={e => setActivity(e.target.value)}
            className="rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
            <option value="">Вид деятельности</option>
            {DICTIONARIES.specialistActivities.map(a => <option key={a}>{a}</option>)}
          </select>
          <select value={skill} onChange={e => setSkill(e.target.value)}
            className="rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
            <option value="">Навык / специализация</option>
            {allSkills.map(s => <option key={s}>{s}</option>)}
          </select>
          <select value={workMode} onChange={e => setWorkMode(e.target.value)}
            className="rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
            <option value="">Формат работы</option>
            {DICTIONARIES.workModes.map(m => <option key={m}>{m}</option>)}
          </select>
          <div className="flex gap-2">
            <input value={salaryMin} onChange={e => setSalaryMin(e.target.value)} type="number" placeholder="Зарплата от, ₽"
              className="flex-1 rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            <input value={salaryMax} onChange={e => setSalaryMax(e.target.value)} type="number" placeholder="до, ₽"
              className="flex-1 rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500" />
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {active.length === 0 && (
          <div className="text-center py-16 text-slate-400">Вакансий не найдено</div>
        )}
        {active.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-blue-200 transition cursor-pointer"
            onClick={() => setModalVacancy(v)}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-slate-800 text-base">{v.title}</div>
                <div className="text-sm text-blue-600 mt-0.5">{v.employerName}</div>
                <div className="text-xs text-slate-400 mt-0.5">{v.city} · {v.workMode}</div>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {v.clientSpheres?.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs border border-purple-100">{s}</span>
                  ))}
                  {v.specialistActivities?.slice(0, 3).map(a => (
                    <span key={a} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100">{a}</span>
                  ))}
                  {v.skills.map(s => (
                    <span key={s} className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 text-xs border border-slate-100">{s}</span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-shrink-0">
                <div className="font-bold text-slate-800 text-sm whitespace-nowrap">{fmtSalary(v.salaryFrom)}</div>
                <Btn
                  variant={applyStatus[v.id] === 'done' ? 'secondary' : 'primary'}
                  size="sm"
                  disabled={applyStatus[v.id] === 'loading' || applyStatus[v.id] === 'done'}
                  onClick={e => { e.stopPropagation(); handleApply(v.id); }}
                >
                  {applyStatus[v.id] === 'loading' ? '...' : applyStatus[v.id] === 'done' ? 'Отклик отправлен' : applyStatus[v.id] === 'rejected' ? 'Откликнуться снова' : applyStatus[v.id] === 'error' ? 'Ошибка' : 'Откликнуться'}
                </Btn>
              </div>
            </div>
          </div>
        ))}
      </div>

      {modalVacancy && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" onClick={() => setModalVacancy(null)}>
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-5 border-b border-slate-100 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">{modalVacancy.title}</h2>
                <div className="text-sm text-blue-600 mt-0.5">{modalVacancy.employerName}</div>
              </div>
              <button onClick={() => setModalVacancy(null)} className="text-slate-400 hover:text-slate-600 text-xl leading-none mt-0.5">✕</button>
            </div>
            <div className="p-5 space-y-4">
              <div className="flex flex-wrap gap-3 text-sm text-slate-600">
                <span>{modalVacancy.city}{modalVacancy.region ? `, ${modalVacancy.region}` : ''}</span>
                <span>·</span>
                <span>{modalVacancy.workMode}</span>
                {(modalVacancy.salaryFrom || modalVacancy.salaryTo) && (
                  <>
                    <span>·</span>
                    <span className="font-semibold text-slate-800">{fmtSalary(modalVacancy.salaryFrom)}{modalVacancy.salaryTo ? ` – ${fmtSalary(modalVacancy.salaryTo)}` : ''}</span>
                  </>
                )}
              </div>
              {modalVacancy.description && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Описание</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{modalVacancy.description}</p>
                </div>
              )}
              {modalVacancy.clientSpheres?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Сферы заказчика</p>
                  <div className="flex flex-wrap gap-1.5">
                    {modalVacancy.clientSpheres.map(s => <span key={s} className="px-2 py-0.5 rounded-full bg-purple-50 text-purple-700 text-xs border border-purple-100">{s}</span>)}
                  </div>
                </div>
              )}
              {modalVacancy.specialistActivities?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Виды деятельности</p>
                  <div className="flex flex-wrap gap-1.5">
                    {modalVacancy.specialistActivities.map(a => <span key={a} className="px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 text-xs border border-blue-100">{a}</span>)}
                  </div>
                </div>
              )}
              {modalVacancy.skills?.length > 0 && (
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">Навыки</p>
                  <div className="flex flex-wrap gap-1.5">
                    {modalVacancy.skills.map(s => <span key={s} className="px-2 py-0.5 rounded-full bg-slate-50 text-slate-600 text-xs border border-slate-100">{s}</span>)}
                  </div>
                </div>
              )}
              <div className="pt-2">
                <Btn
                  variant={applyStatus[modalVacancy.id] === 'done' ? 'secondary' : 'primary'}
                  disabled={applyStatus[modalVacancy.id] === 'loading' || applyStatus[modalVacancy.id] === 'done'}
                  onClick={() => handleApply(modalVacancy.id)}
                >
                  {applyStatus[modalVacancy.id] === 'loading' ? '...' : applyStatus[modalVacancy.id] === 'done' ? 'Отклик отправлен' : applyStatus[modalVacancy.id] === 'rejected' ? 'Откликнуться снова' : applyStatus[modalVacancy.id] === 'error' ? 'Ошибка' : 'Откликнуться'}
                </Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Seeker Map Search ──────────────────────────────────────────────────────
export function SeekerMapSearch({ vacancies }: { vacancies: Vacancy[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<MapCity | null>(null);
  const [applyStatus, setApplyStatus] = useState<Record<string, 'loading' | 'done' | 'error'>>({});

  const handleApply = async (vacancyId: string) => {
    setApplyStatus(prev => ({ ...prev, [vacancyId]: 'loading' }));
    try {
      const res = await fetch('/api/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vacancyId }),
      });
      setApplyStatus(prev => ({ ...prev, [vacancyId]: res.ok || res.status === 409 ? 'done' : 'error' }));
    } catch {
      setApplyStatus(prev => ({ ...prev, [vacancyId]: 'error' }));
    }
  };

  const cityVacs = vacancies.filter(v => v.status === 'active').reduce<Record<string, number>>((acc, v) => {
    acc[v.city] = (acc[v.city] ?? 0) + 1;
    return acc;
  }, {});

  // Merge real vacancy counts into RUSSIA_CITIES data
  const cities = RUSSIA_CITIES.map(c => ({ ...c, vacancies: cityVacs[c.name] ?? c.vacancies }));

  useRussiaMap({
    containerRef,
    cities,
    center: [55, 57],
    zoom: 4,
    onCityClick: setSelectedCity,
  });

  const filtered = selectedCity
    ? vacancies.filter(v => v.status === 'active' && v.city === selectedCity.name)
    : [];

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Поиск по карте</h1>
        <p className="text-sm text-slate-500 mt-0.5">Нажмите на пузырёк города, чтобы увидеть вакансии</p>
      </div>

      {/* 2GIS Map */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm overflow-hidden mb-4 relative" style={{ height: 420 }}>
        <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
        {selectedCity && (
          <div className="absolute top-3 left-3 bg-slate-800 text-white rounded-lg px-3 py-2 text-xs z-10 shadow-lg">
            <span className="font-semibold">{selectedCity.name}</span>
            <span className="text-slate-400 ml-2">{selectedCity.vacancies} вак.</span>
            <button onClick={() => setSelectedCity(null)} className="ml-3 text-slate-400 hover:text-white">✕</button>
          </div>
        )}
        <div className="absolute bottom-3 left-3 bg-slate-800/70 rounded px-2 py-1 text-xs text-slate-300">
          Размер = число вакансий
        </div>
      </div>

      {selectedCity && (
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-800">Вакансии: {selectedCity.name} ({filtered.length})</h2>
            <button onClick={() => setSelectedCity(null)} className="text-xs text-slate-400 hover:text-slate-600">Закрыть</button>
          </div>
          <div className="divide-y divide-slate-100">
            {filtered.length === 0 && <div className="px-5 py-6 text-center text-sm text-slate-400">Нет активных вакансий</div>}
            {filtered.map(v => (
              <div key={v.id} className="px-5 py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-slate-800 text-sm">{v.title}</div>
                  <div className="text-xs text-slate-500">{v.employerName} · {v.workMode}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-slate-700">{fmtSalary(v.salaryFrom)}</div>
                  <Btn
                    variant={applyStatus[v.id] === 'done' ? 'secondary' : 'primary'}
                    size="sm"
                    disabled={!!applyStatus[v.id]}
                    onClick={() => handleApply(v.id)}
                  >
                    {applyStatus[v.id] === 'loading' ? '...' : applyStatus[v.id] === 'done' ? 'Отклик отправлен' : applyStatus[v.id] === 'error' ? 'Ошибка' : 'Откликнуться'}
                  </Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
