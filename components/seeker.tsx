'use client';

import { useState, useEffect, useRef } from 'react';
import type { Invitation, Message } from '@/lib/types';
import { fmtDate } from '@/lib/utils';
import { Badge, Btn, Input, Select, Avatar, StatusBadge, StatCard } from './ui';
import { DICTIONARIES } from '@/lib/mock-data';

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

// ── My Resume ──────────────────────────────────────────────────────────────
export function MyResume() {
  const [form, setForm] = useState({
    position: 'Специалист по закупкам',
    city: 'Москва',
    salary: '90000',
    experience: '5',
    education: 'Высшее',
    workMode: 'Офис',
    about: 'Опытный специалист в сфере государственных и корпоративных закупок. Отлично разбираюсь в законодательстве 44-ФЗ и 223-ФЗ.',
  });
  const [saved, setSaved] = useState(false);
  const upd = (k: string, v: string) => { setForm(f => ({ ...f, [k]: v })); setSaved(false); };

  return (
    <div className="p-4 md:p-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-5">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Моё резюме</h1>
          <p className="text-sm text-slate-500 mt-0.5">Редактируйте и обновляйте свои данные</p>
        </div>
        <Badge color="green">Активно</Badge>
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
export function SeekerInvitations({ invitations }: { invitations: Invitation[] }) {
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
                    <Btn size="sm" variant="primary">Принять</Btn>
                    <Btn size="sm" variant="secondary">Отклонить</Btn>
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
type Thread  = { id: string; name: string; msgs: ChatMsg[]; unread: boolean };

function buildSeekerThreads(messages: Message[]): Thread[] {
  return messages.map(m => ({
    id: m.id,
    name: m.fromRole === 'employer' ? m.fromName : m.toName,
    msgs: [{ id: m.id, fromMe: m.fromRole === 'candidate', text: m.text, ts: m.createdAt }],
    unread: !m.isRead,
  }));
}

export function SeekerMessages({ messages }: { messages: Message[] }) {
  const [threads, setThreads] = useState<Thread[]>(() => buildSeekerThreads(messages));
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
                key={t.id} onClick={() => setActiveId(t.id)}
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
