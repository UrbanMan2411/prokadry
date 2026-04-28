'use client';

import { ReactNode, useState, useRef, useEffect } from 'react';
import type { Role } from '@/lib/types';
import { signOut } from '@/app/actions/auth';

type Page = string;

interface NavItem {
  id: string;
  label: string;
  icon: string;
}

const NAV_EMPLOYER: NavItem[] = [
  { id: 'dashboard',   label: 'Обзор',           icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'registry',    label: 'Реестр резюме',   icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'vacancies',   label: 'Вакансии',        icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'favorites',   label: 'Избранное',       icon: 'M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z' },
  { id: 'messages',    label: 'Сообщения',       icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'invitations', label: 'Приглашения',     icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'company',     label: 'Профиль компании', icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'regions',     label: 'Регионы',          icon: 'M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z' },
];

const NAV_SEEKER: NavItem[] = [
  { id: 'seeker-dashboard',   label: 'Обзор',        icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { id: 'my-resume',          label: 'Моё резюме',   icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
  { id: 'seeker-invitations', label: 'Приглашения',  icon: 'M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'seeker-messages',    label: 'Сообщения',    icon: 'M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z' },
  { id: 'seeker-settings',    label: 'Настройки',    icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
];

const NAV_ADMIN: NavItem[] = [
  { id: 'admin-dashboard', label: 'Обзор',          icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z' },
  { id: 'admin-resumes',   label: 'Резюме',          icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { id: 'admin-employers', label: 'Работодатели',    icon: 'M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4' },
  { id: 'admin-vacancies', label: 'Вакансии',        icon: 'M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z' },
  { id: 'admin-users',     label: 'Пользователи',    icon: 'M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z' },
  { id: 'admin-dicts',     label: 'Справочники',     icon: 'M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253' },
  { id: 'admin-logs',      label: 'Журнал событий',  icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
];

function NavIcon({ d }: { d: string }) {
  const paths = d.split(' M').map((p, i) => i === 0 ? p : 'M' + p);
  return (
    <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.6}>
      {paths.map((path, i) => (
        <path key={i} strokeLinecap="round" strokeLinejoin="round" d={path} />
      ))}
    </svg>
  );
}

export function Sidebar({
  role, page, setPage, open, onClose, badges = {},
}: {
  role: Role; page: Page; setPage: (p: Page) => void; open: boolean; onClose: () => void;
  badges?: Record<string, number>;
}) {
  const nav = role === 'employer' ? NAV_EMPLOYER : role === 'seeker' ? NAV_SEEKER : NAV_ADMIN;
  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-200 md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Sidebar panel: fixed overlay on mobile, in-flow on desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-60 flex-shrink-0 bg-slate-900 flex flex-col overflow-y-auto transition-transform duration-200 ease-in-out md:relative md:h-screen md:translate-x-0 md:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-5 py-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center flex-shrink-0 shadow">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">ПРОкадры</div>
              <div className="text-slate-400 text-[10px] leading-tight">ЗаказРФ</div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="md:hidden p-1.5 rounded-lg text-slate-400 hover:bg-slate-700 hover:text-white transition"
            aria-label="Закрыть меню"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <nav className="flex-1 py-4 px-3 space-y-0.5">
          {nav.map(item => {
            const badgeCount = badges[item.id] ?? 0;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); onClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left ${isActive ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
              >
                <NavIcon d={item.icon} />
                <span className="flex-1 truncate">{item.label}</span>
                {badgeCount > 0 && (
                  <span className={`min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full text-[10px] font-bold leading-none flex-shrink-0 ${isActive ? 'bg-white/25 text-white' : 'bg-blue-500 text-white'}`}>
                    {badgeCount > 99 ? '99+' : badgeCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        <div className="px-3 py-4 border-t border-slate-800">
          <div className="text-[10px] text-slate-500 text-center">© 2026 ПРОкадры. ЗаказРФ</div>
        </div>
      </aside>
    </>
  );
}

export function Header({
  role, email, onMenuClick,
}: {
  role: Role; email: string; onMenuClick: () => void;
}) {
  const roleBadge: Record<Role, { label: string; cls: string }> = {
    employer: { label: 'Работодатель', cls: 'bg-blue-100 text-blue-700' },
    seeker:   { label: 'Соискатель',   cls: 'bg-cyan-100 text-cyan-700' },
    admin:    { label: 'Администратор', cls: 'bg-purple-100 text-purple-700' },
  };
  const avatarColors: Record<Role, string> = {
    employer: 'from-blue-500 to-cyan-400',
    seeker:   'from-cyan-500 to-teal-400',
    admin:    'from-purple-500 to-violet-400',
  };
  const initial = email.charAt(0).toUpperCase();
  const { label, cls } = roleBadge[role];

  return (
    <header className="h-14 bg-white border-b border-slate-100 flex items-center px-3 md:px-6 sticky top-0 z-30 shadow-sm gap-2">
      <button
        onClick={onMenuClick}
        className="md:hidden p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 transition flex-shrink-0"
        aria-label="Открыть меню"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <div className="text-sm text-slate-500 flex-1 md:flex-none">
        <span className="text-slate-800 font-semibold">ПРОкадры</span>
      </div>

      <div className="flex items-center gap-2 md:gap-3 ml-auto">
        <span className={`hidden sm:inline px-2.5 py-1 rounded-lg text-xs font-medium ${cls}`}>{label}</span>
        <span className="hidden md:inline text-xs text-slate-500 max-w-[160px] truncate">{email}</span>
        <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${avatarColors[role]} flex items-center justify-center text-white text-xs font-semibold shadow flex-shrink-0`}>
          {initial}
        </div>
        <form action={signOut}>
          <button
            type="submit"
            title="Выйти"
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition flex-shrink-0"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </form>
      </div>
    </header>
  );
}

type ChatMessage = { id: number; role: 'user' | 'ai'; text: string };

function RobotIcon({ size = 36 }: { size?: number }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src="/robot.png" alt="AI ассистент" width={size} height={size} style={{ objectFit: 'contain' }} />
  );
}

function AIChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: 0, role: 'ai', text: 'Здравствуйте! Я ИИ-ассистент ПРОкадры. Помогу найти специалистов по 44-ФЗ / 223-ФЗ или отвечу на вопросы о платформе.' },
  ]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [open, messages]);

  async function send() {
    const text = input.trim();
    if (!text || typing) return;
    const userMsg: ChatMessage = { id: Date.now(), role: 'user', text };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput('');
    setTyping(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: next
            .filter(m => m.role !== 'ai' || m.id !== 0)
            .map(m => ({ role: m.role === 'user' ? 'user' : 'assistant', content: m.text })),
        }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: data.reply ?? 'Ошибка ответа.' }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now() + 1, role: 'ai', text: 'Не удалось подключиться к ассистенту.' }]);
    } finally {
      setTyping(false);
    }
  }

  return (
    <>
      {/* Chat window */}
      <div
        className={`fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-slate-100 flex flex-col overflow-hidden transition-all duration-300 ${open ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 translate-y-4 pointer-events-none'}`}
        style={{ height: 420 }}
      >
        {/* Header */}
        <div className="flex items-center gap-2.5 px-4 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 flex-shrink-0">
          <RobotIcon size={32} />
          <div className="flex-1 min-w-0">
            <div className="text-white font-semibold text-sm leading-tight">ПРОкадры Ассистент</div>
            <div className="text-blue-100 text-[11px] leading-tight flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 inline-block" />
              онлайн
            </div>
          </div>
          <button
            onClick={() => setOpen(false)}
            className="p-1 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition flex-shrink-0"
            aria-label="Закрыть"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-2.5 bg-slate-50">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} gap-2`}>
              {msg.role === 'ai' && (
                <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                  <RobotIcon size={28} />
                </div>
              )}
              <div
                className={`max-w-[220px] px-3 py-2 rounded-2xl text-[13px] leading-snug ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-sm' : 'bg-white text-slate-700 border border-slate-100 shadow-sm rounded-bl-sm'}`}
              >
                {msg.text}
              </div>
            </div>
          ))}
          {typing && (
            <div className="flex justify-start gap-2">
              <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0 mt-0.5">
                <RobotIcon size={28} />
              </div>
              <div className="bg-white border border-slate-100 shadow-sm rounded-2xl rounded-bl-sm px-3 py-2 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-3 py-2.5 border-t border-slate-100 bg-white flex-shrink-0">
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Напишите вопрос…"
            className="flex-1 text-[13px] bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100 placeholder:text-slate-400 transition"
          />
          <button
            onClick={send}
            disabled={!input.trim() || typing}
            className="w-8 h-8 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-40 flex items-center justify-center text-white transition flex-shrink-0 cursor-pointer"
            aria-label="Отправить"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
          </button>
        </div>
      </div>

      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 cursor-pointer overflow-hidden border-2 border-white bg-white"
        aria-label="Открыть ассистента"
      >
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? 'opacity-0 scale-75' : 'opacity-100 scale-100'}`}>
          <RobotIcon size={40} />
        </div>
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-200 ${open ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`}>
          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>
    </>
  );
}

export function AppShell({
  role, email, page, setPage, children, badges,
}: {
  role: Role; email: string; page: Page; setPage: (p: Page) => void; children: ReactNode;
  badges?: Record<string, number>;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar role={role} page={page} setPage={setPage} open={sidebarOpen} onClose={() => setSidebarOpen(false)} badges={badges} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header role={role} email={email} onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
      <AIChatWidget />
    </div>
  );
}
