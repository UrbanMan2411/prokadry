'use client';

import { useState, useEffect, useRef } from 'react';
import type { Invitation, Message, Vacancy } from '@/lib/types';
import { fmtDate, fmtSalary } from '@/lib/utils';
import { Badge, Btn, Input, Select, Avatar, StatusBadge, StatCard } from './ui';
import { DICTIONARIES } from '@/lib/mock-data';
import { RUSSIA_CITIES, useRussiaMap, type MapCity } from '@/lib/use2gis';

// ── Seeker Dashboard ───────────────────────────────────────────────────────
export function SeekerDashboard({ invitations, messages }: { invitations: Invitation[]; messages: Message[] }) {
  const pendingInv = invitations.filter(i => i.status === 'sent' || i.status === 'viewed').length;
  const unreadMsg = messages.filter(m => !m.isRead).length;

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
        <StatCard label="Статус резюме" value="Активно" color="green" icon={
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

// ── My Resume (multi-resume) ────────────────────────────────────────────────
type ResumeForm = { id: string; position: string; city: string; salary: string; experience: string; education: string; workMode: string; about: string };

const defaultResume = (id: string, position: string): ResumeForm => ({
  id, position, city: 'Москва', salary: '90000', experience: '5',
  education: 'Высшее', workMode: 'Офис',
  about: 'Опытный специалист в сфере государственных и корпоративных закупок.',
});

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

export function MyResume() {
  const [resumes, setResumes] = useState<ResumeForm[]>([
    defaultResume('r1', 'Специалист по закупкам'),
  ]);
  const [active, setActive] = useState('r1');
  const [saved, setSaved] = useState(false);

  const form = resumes.find(r => r.id === active)!;
  const upd = (k: string, v: string) => {
    setResumes(prev => prev.map(r => r.id === active ? { ...r, [k]: v } : r));
    setSaved(false);
  };
  const addResume = () => {
    const id = `r${Date.now()}`;
    const newR = defaultResume(id, 'Новая специализация');
    setResumes(prev => [...prev, newR]);
    setActive(id);
    setSaved(false);
  };

  const importResume = (r: ImportedResume) => {
    const id = `r${Date.now()}`;
    const workModeMap: Record<string, string> = { remote: 'remote', hybrid: 'hybrid', office: 'office' };
    const eduMap: Record<string, string> = { higher: 'higher', secondary_special: 'secondary_special' };
    const newR: ResumeForm = {
      id,
      position: r.position,
      city: r.city,
      salary: r.salaryFrom ? String(r.salaryFrom) : '',
      experience: r.experience,
      education: eduMap[r.education] ?? 'higher',
      workMode: workModeMap[r.workMode] ?? 'office',
      about: [r.about, r.skills.length ? `Навыки: ${r.skills.join(', ')}` : ''].filter(Boolean).join('\n\n'),
    };
    setResumes(prev => [...prev, newR]);
    setActive(id);
    setSaved(false);
  };
  const removeResume = (id: string) => {
    if (resumes.length === 1) return;
    setResumes(prev => prev.filter(r => r.id !== id));
    setActive(resumes.find(r => r.id !== id)?.id ?? 'r1');
  };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Мои резюме</h1>
          <p className="text-sm text-slate-500 mt-0.5">Несколько резюме для разных специализаций</p>
        </div>
        <Btn variant="primary" size="sm" onClick={addResume}>+ Добавить резюме</Btn>
      </div>

      <ResumeImportPanel onImport={importResume} />

      {/* Resume tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4">
        {resumes.map(r => (
          <div key={r.id} className={`flex items-center gap-1.5 flex-shrink-0 px-3 py-1.5 rounded-lg border text-sm cursor-pointer transition ${active === r.id ? 'border-blue-500 bg-blue-50 text-blue-700 font-medium' : 'border-slate-200 text-slate-600 hover:border-slate-300'}`}
            onClick={() => setActive(r.id)}>
            <span className="truncate max-w-[140px]">{r.position}</span>
            {resumes.length > 1 && (
              <button onClick={e => { e.stopPropagation(); removeResume(r.id); }}
                className="text-slate-400 hover:text-red-500 transition ml-1 text-xs leading-none">×</button>
            )}
          </div>
        ))}
      </div>

      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Основная информация</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-medium text-slate-600 mb-1 block">Желаемая должность</label>
              <Input value={form.position} onChange={v => upd('position', v)} placeholder="Специалист по закупкам" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Город</label>
              <Input value={form.city} onChange={v => upd('city', v)} placeholder="Москва" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Желаемая зарплата, ₽</label>
              <Input value={form.salary} onChange={v => upd('salary', v)} placeholder="90 000" type="number" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Опыт работы (лет)</label>
              <Input value={form.experience} onChange={v => upd('experience', v)} placeholder="5" type="number" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Образование</label>
              <Select value={form.education} onChange={v => upd('education', v)} options={DICTIONARIES.educations} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Режим работы</label>
              <Select value={form.workMode} onChange={v => upd('workMode', v)} options={DICTIONARIES.workModes} />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-3">О себе</h3>
          <textarea
            value={form.about} onChange={e => upd('about', e.target.value)} rows={5}
            placeholder="Расскажите о своём опыте и навыках..."
            className="w-full rounded-lg border border-slate-200 text-sm px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 items-center">
          {saved && <span className="text-sm text-emerald-600">✓ Сохранено</span>}
          <Btn variant="secondary">Предпросмотр</Btn>
          <Btn variant="primary" onClick={() => setSaved(true)}>Сохранить изменения</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Seeker Invitations ─────────────────────────────────────────────────────
export function SeekerInvitations({ invitations, setInvitations }: { invitations: Invitation[]; setInvitations: React.Dispatch<React.SetStateAction<Invitation[]>> }) {
  const respond = (id: string, status: 'accepted' | 'rejected') => {
    setInvitations(prev => prev.map(i => i.id === id ? { ...i, status } : i));
    fetch(`/api/invitations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    }).catch(() => {});
  };

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Приглашения</h1>
      {invitations.length === 0 ? (
        <div className="text-center py-16 text-slate-400">Приглашений пока нет</div>
      ) : (
        <div className="space-y-3">
          {invitations.map(inv => (
            <div key={inv.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-start gap-4">
              <Avatar name={inv.employerName} size="md" />
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="font-semibold text-slate-800">{inv.vacancyTitle}</div>
                    <div className="text-sm text-blue-600">{inv.employerName}</div>
                    <p className="text-sm text-slate-500 mt-1 leading-relaxed">{inv.message}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <StatusBadge status={inv.status} />
                    <span className="text-xs text-slate-400">{fmtDate(inv.createdAt)}</span>
                  </div>
                </div>
                {inv.status === 'sent' && (
                  <div className="flex gap-2 mt-3">
                    <Btn size="sm" variant="primary" onClick={() => respond(inv.id, 'accepted')}>Принять</Btn>
                    <Btn size="sm" variant="secondary" onClick={() => respond(inv.id, 'rejected')}>Отклонить</Btn>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Seeker Messages ────────────────────────────────────────────────────────
type ChatMsg = { id: string; fromMe: boolean; text: string; ts: string };
type Thread  = { id: string; name: string; msgs: ChatMsg[]; unread: boolean; counterpartyUserId: string };

function buildSeekerThreads(messages: Message[]): Thread[] {
  return messages.map(m => ({
    id: m.id,
    name: m.fromRole === 'employer' ? m.fromName : m.toName,
    msgs: [{ id: m.id, fromMe: m.fromRole === 'candidate', text: m.text, ts: m.createdAt }],
    unread: !m.isRead,
    counterpartyUserId: m.counterpartyUserId,
  }));
}

export function SeekerMessages({ messages, onMarkRead }: { messages: Message[]; onMarkRead?: (id: string) => void }) {
  const [threads, setThreads] = useState<Thread[]>(() => buildSeekerThreads(messages));
  const [activeId, setActiveId] = useState<string | null>(null);
  const [reply, setReply] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = threads.find(t => t.id === activeId) ?? null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.msgs.length]);

  const send = () => {
    const text = reply.trim();
    if (!activeId || text.length < 2) return;
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
                <div className="text-xs text-slate-400 truncate">{lastMsg(t).text}</div>
                <div className="text-[10px] text-slate-300 mt-1">{fmtDate(lastMsg(t).ts)}</div>
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
            <div className="flex-1 p-4 md:p-5 space-y-3 overflow-y-auto">
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
    firstName: 'Иванова', lastName: 'Мария', email: 'maria.ivanova@example.ru', phone: '+7 (910) 555-12-34',
    notifyInvites: true, notifyMessages: true, notifyNews: false,
  });
  const [saved, setSaved] = useState(false);
  const upd = (k: string, v: string | boolean) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  return (
    <div className="p-4 md:p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold text-slate-800 mb-5">Настройки</h1>
      <div className="space-y-5">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
          <h3 className="text-sm font-semibold text-slate-800 mb-4">Личные данные</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Фамилия</label>
              <Input value={form.lastName} onChange={v => upd('lastName', v)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Имя</label>
              <Input value={form.firstName} onChange={v => upd('firstName', v)} />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Email</label>
              <Input value={form.email} onChange={v => upd('email', v)} type="email" />
            </div>
            <div>
              <label className="text-xs font-medium text-slate-600 mb-1 block">Телефон</label>
              <Input value={form.phone} onChange={v => upd('phone', v)} />
            </div>
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
          <Btn variant="primary" onClick={() => setSaved(true)}>Сохранить</Btn>
        </div>
      </div>
    </div>
  );
}

// ── Seeker Vacancy Registry ────────────────────────────────────────────────
export function SeekerVacancyRegistry({ vacancies }: { vacancies: Vacancy[] }) {
  const [search, setSearch] = useState('');
  const [sphere, setSphere] = useState('');
  const [activity, setActivity] = useState('');
  const [workMode, setWorkMode] = useState('');

  const active = vacancies.filter(v => v.status === 'active').filter(v => {
    if (search && !v.title.toLowerCase().includes(search.toLowerCase()) &&
        !v.employerName.toLowerCase().includes(search.toLowerCase()) &&
        !v.city.toLowerCase().includes(search.toLowerCase())) return false;
    if (sphere && !v.clientSpheres?.includes(sphere)) return false;
    if (activity && !v.specialistActivities?.includes(activity)) return false;
    if (workMode && v.workMode !== workMode) return false;
    return true;
  });

  return (
    <div className="p-4 md:p-6 max-w-5xl mx-auto">
      <div className="mb-5">
        <h1 className="text-xl font-bold text-slate-800">Реестр вакансий</h1>
        <p className="text-sm text-slate-500 mt-0.5">{active.length} активных вакансий по закупкам</p>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
          <select value={workMode} onChange={e => setWorkMode(e.target.value)}
            className="rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-600">
            <option value="">Формат работы</option>
            {DICTIONARIES.workModes.map(m => <option key={m}>{m}</option>)}
          </select>
        </div>
      </div>

      <div className="space-y-3">
        {active.length === 0 && (
          <div className="text-center py-16 text-slate-400">Вакансий не найдено</div>
        )}
        {active.map(v => (
          <div key={v.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 hover:border-blue-200 transition">
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
                <Btn variant="primary" size="sm" onClick={() => {}}>Откликнуться</Btn>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Seeker Map Search ──────────────────────────────────────────────────────
export function SeekerMapSearch({ vacancies }: { vacancies: Vacancy[] }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<MapCity | null>(null);

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
                  <Btn variant="primary" size="sm" onClick={() => {}}>Откликнуться</Btn>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
