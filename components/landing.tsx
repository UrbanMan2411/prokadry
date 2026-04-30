'use client';

import { useState, useEffect, useRef, useActionState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type MapCity, RUSSIA_CITIES, useRussiaMap } from '@/lib/use2gis';
import { signIn } from '@/app/actions/auth';
import type { SignInState } from '@/app/actions/auth';

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 1024);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}

const C = {
  navy: '#0F172A',
  blue: '#1E40AF',
  blueL: '#3B82F6',
  blueLighter: '#DBEAFE',
  blueUltraLight: '#EFF6FF',
  slate: '#64748B',
  slateL: '#94A3B8',
  border: '#E2E8F0',
  bg: '#F8FAFC',
  white: '#FFFFFF',
  green: '#059669',
  amber: '#D97706',
  red: '#DC2626',
};

const ICONS: Record<string, string> = {
  building: 'M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21',
  user: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z',
  users: 'M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m.94 3.198l.001.031c0 .225-.012.447-.037.666A11.944 11.944 0 0112 21c-2.17 0-4.207-.576-5.963-1.584A6.062 6.062 0 016 18.719m12 0a5.971 5.971 0 00-.941-3.197m0 0A5.995 5.995 0 0012 12.75a5.995 5.995 0 00-5.058 2.772m0 0a3 3 0 00-4.681 2.72 8.986 8.986 0 003.74.477m.94-3.197a5.971 5.971 0 00-.94 3.197M15 6.75a3 3 0 11-6 0 3 3 0 016 0zm6 3a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0zm-13.5 0a2.25 2.25 0 11-4.5 0 2.25 2.25 0 014.5 0z',
  handshake: 'M10.05 4.575a1.575 1.575 0 10-3.15 0v3m3.15-3v-1.5a1.575 1.575 0 013.15 0v1.5m-3.15 0l.075 5.925m3.075.75V4.575m0 0a1.575 1.575 0 013.15 0V15M6.9 7.575a1.575 1.575 0 10-3.15 0v8.175a6.75 6.75 0 006.75 6.75h2.018a5.25 5.25 0 003.712-1.538l1.732-1.732a5.25 5.25 0 001.538-3.712l.003-2.024a.668.668 0 01.198-.471 1.575 1.575 0 10-2.228-2.228 3.818 3.818 0 00-1.12 2.687M6.9 7.575V12m6.27 4.318A4.49 4.49 0 0116.35 15m0 0a4.49 4.49 0 01.818-2.683M15 12a3 3 0 11-6 0 3 3 0 016 0z',
  clipboard: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01',
  search: 'M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z',
  briefcase: 'M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0M12 12.75h.008v.008H12v-.008z',
  envelope: 'M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75',
  folder: 'M2.25 12.75V12A2.25 2.25 0 014.5 9.75h15A2.25 2.25 0 0121.75 12v.75m-8.69-6.44l-2.12-2.12a1.5 1.5 0 00-1.061-.44H4.5A2.25 2.25 0 002.25 6v12a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9a2.25 2.25 0 00-2.25-2.25h-5.379a1.5 1.5 0 01-1.06-.44z',
  bolt: 'M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z',
  chart: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z',
  shield: 'M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z',
  sparkle: 'M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z',
};

function SvgIcon({ d, size = 20, color = 'currentColor', strokeWidth = 1.5 }: {
  d: string; size?: number; color?: string; strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  );
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <button
      type="button"
      style={{ display: 'inline-flex', alignItems: 'center', background: C.blueUltraLight, color: C.blue, border: `1px solid ${C.blueLighter}`, borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', transition: 'all .15s', fontFamily: 'inherit' }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = C.blueLighter; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = C.blueUltraLight; }}
    >
      {children}
    </button>
  );
}

function Btn({ primary, children, small }: { primary?: boolean; children: React.ReactNode; small?: boolean }) {
  return (
    <button
      style={{
        padding: small ? '8px 18px' : '13px 28px',
        borderRadius: 8,
        border: primary ? 'none' : `1.5px solid ${C.border}`,
        background: primary ? C.blue : C.white,
        color: primary ? C.white : C.navy,
        fontFamily: 'Golos Text, sans-serif',
        fontSize: small ? 13 : 15,
        fontWeight: 600,
        cursor: 'pointer',
        transition: 'all .15s',
        whiteSpace: 'nowrap',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.85'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}
    >
      {children}
    </button>
  );
}

// ── MINI DASHBOARD MOCKUP ────────────────────────────────────

function MiniDashboard() {
  const avColors = [C.blueL, '#059669', '#7C3AED', '#D97706', '#DC2626', '#0891B2'];
  const resumes = [
    { name: 'Специалист по закупкам', sub: 'Москва · Не указана', date: '23.04.2026' },
    { name: 'Контрактный управляющий', sub: 'Санкт-Петербург · 80 000 ₽', date: '26.01.2026' },
    { name: 'Менеджер по закупкам', sub: 'Екатеринбург · 70 000 ₽', date: '08.03.2026' },
    { name: 'Руководитель отдела закупок', sub: 'Новосибирск · 80 000 ₽', date: '19.02.2026' },
    { name: 'Тендерный специалист', sub: 'Казань · 90 000 ₽', date: '03.02.2026' },
  ];
  const vacancies = [
    { title: 'Специалист по закупкам', sub: 'Москва · 60 000 – 80 000 ₽', status: 'Активно', sc: C.green, dot: C.green },
    { title: 'Контрактный управляющий', sub: 'Санкт-Петербург · 70 000 – 100 000 ₽', status: 'Активно', sc: C.green, dot: C.green },
    { title: 'Менеджер по закупкам', sub: 'Екатеринбург · 80 000 – 120 000 ₽', status: 'Активно', sc: C.green, dot: C.green },
    { title: 'Руководитель отдела закупок', sub: 'Новосибирск · 90 000 – 150 000 ₽', status: 'В архиве', sc: C.slate, dot: '#CBD5E1' },
    { title: 'Тендерный специалист', sub: 'Казань · 100 000 – 180 000 ₽', status: 'Черновик', sc: C.slate, dot: '#CBD5E1' },
  ];
  const invites = [
    { name: 'Иванова Александра', spec: 'Специалист по закупкам', init: 'ИА', av: C.blueL, status: 'Отправлено', sc: C.blueL, date: '23.04.2026' },
    { name: 'Смирнова Мария', spec: 'Контрактный управляющий', init: 'СМ', av: '#059669', status: 'Просмотрено', sc: '#7C3AED', date: '24.03.2026' },
    { name: 'Кузнецова Елена', spec: 'Менеджер по закупкам', init: 'КЕ', av: '#D97706', status: 'Принято', sc: C.green, date: '18.04.2026' },
  ];
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 10, overflow: 'hidden', fontFamily: 'Golos Text, sans-serif', fontSize: 11, border: `1px solid ${C.border}`, boxShadow: '0 20px 60px rgba(15,23,42,.12)', background: 'white', display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={{ background: 'white', borderBottom: `1px solid ${C.border}`, padding: '6px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0 }}>
        <span style={{ fontWeight: 700, fontSize: 12, color: C.navy }}>ПРОкадры</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ background: C.blueUltraLight, color: C.blue, borderRadius: 20, padding: '2px 10px', fontSize: 9, fontWeight: 600, border: `1px solid ${C.blueLighter}` }}>Работодатель</span>
          <span style={{ fontSize: 9, color: C.slate }}>employer@demo.ru</span>
          <div style={{ width: 20, height: 20, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 9, fontWeight: 700 }}>Е</div>
        </div>
      </div>
      {/* Notification bar */}
      <div style={{ background: '#FFFBEB', borderBottom: '1px solid #FDE68A', padding: '5px 14px', fontSize: 9, color: '#92400E', flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
        ! 8 приглашений ждут ответа · 4 приглашений просмотрено, но не принято
      </div>
      <div style={{ padding: '10px 14px', overflow: 'hidden', flex: 1, background: '#F8FAFC' }}>
        <div style={{ fontWeight: 700, color: C.navy, fontSize: 13 }}>Добро пожаловать!</div>
        <div style={{ color: C.slate, fontSize: 9, marginBottom: 8 }}>ООО «ТехноСервис» · Работодатель</div>
        {/* Stat cards */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
          {[
            { n: '75', l: 'Резюме в реестре', icon: '▤', c: '#3B82F6', bg: '#EFF6FF' },
            { n: '25', l: 'Избранных', icon: '★', c: '#D97706', bg: '#FFFBEB' },
            { n: '18', l: 'Активных вакансий', icon: '▣', c: '#059669', bg: '#ECFDF5' },
            { n: '8', l: 'Ждут ответа', icon: '✦', c: '#0891B2', bg: '#ECFEFF' },
          ].map(s => (
            <div key={s.n} style={{ flex: 1, background: 'white', borderRadius: 6, padding: '6px 8px', border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 22, height: 22, borderRadius: 6, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, flexShrink: 0 }}>{s.icon}</div>
              <div>
                <div style={{ fontWeight: 800, fontSize: 14, color: s.c, lineHeight: 1 }}>{s.n}</div>
                <div style={{ fontSize: 7, color: C.slate, lineHeight: 1.2 }}>{s.l}</div>
              </div>
            </div>
          ))}
        </div>
        {/* Two cols */}
        <div style={{ display: 'flex', gap: 8 }}>
          {/* New resumes */}
          <div style={{ flex: 1, background: 'white', borderRadius: 6, border: `1px solid ${C.border}`, padding: '7px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontWeight: 600, fontSize: 9, color: C.navy }}>Новые резюме</span>
              <span style={{ fontSize: 8, color: C.blueL }}>Перейти в реестр →</span>
            </div>
            {resumes.map((r, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 0', borderBottom: i < resumes.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 18, height: 18, borderRadius: '50%', background: avColors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 7, fontWeight: 700, flexShrink: 0 }}>{r.name[0]}</div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 600, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.name}</div>
                  <div style={{ fontSize: 7, color: C.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{r.sub}</div>
                </div>
                <span style={{ fontSize: 7, color: C.slateL, flexShrink: 0 }}>{r.date}</span>
              </div>
            ))}
          </div>
          {/* My vacancies */}
          <div style={{ flex: 1, background: 'white', borderRadius: 6, border: `1px solid ${C.border}`, padding: '7px 8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
              <span style={{ fontWeight: 600, fontSize: 9, color: C.navy }}>Мои вакансии</span>
              <span style={{ fontSize: 8, color: C.blueL }}>Управлять →</span>
            </div>
            {vacancies.map((v, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, padding: '3px 0', borderBottom: i < vacancies.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: v.dot, flexShrink: 0 }}></div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 8, fontWeight: 600, color: C.navy, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.title}</div>
                  <div style={{ fontSize: 7, color: C.slate, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{v.sub}</div>
                </div>
                <span style={{ fontSize: 7, color: v.sc, fontWeight: 600, border: `1px solid ${v.sc}22`, background: `${v.sc}11`, borderRadius: 4, padding: '1px 5px', flexShrink: 0 }}>{v.status}</span>
              </div>
            ))}
          </div>
        </div>
        {/* Invites */}
        <div style={{ background: 'white', borderRadius: 6, border: `1px solid ${C.border}`, padding: '7px 8px', marginTop: 8 }}>
          <div style={{ fontWeight: 600, fontSize: 9, color: C.navy, marginBottom: 5 }}>Последние приглашения</div>
          {invites.map((inv, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '3px 0', borderBottom: i < invites.length - 1 ? `1px solid ${C.border}` : 'none' }}>
              <div style={{ width: 18, height: 18, borderRadius: '50%', background: inv.av, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 7, fontWeight: 700, flexShrink: 0 }}>{inv.init}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 8, fontWeight: 600, color: C.navy }}>{inv.name}</div>
                <div style={{ fontSize: 7, color: C.slate }}>{inv.spec}</div>
              </div>
              <span style={{ fontSize: 7, color: inv.sc, fontWeight: 600, border: `1px solid ${inv.sc}44`, background: `${inv.sc}11`, borderRadius: 4, padding: '1px 6px', flexShrink: 0 }}>{inv.status}</span>
              <span style={{ fontSize: 7, color: C.slateL, flexShrink: 0 }}>{inv.date}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── AI CHAT MOCKUP ───────────────────────────────────────────

function AIChatMockup() {
  return (
    <div style={{ background: 'white', borderRadius: 10, border: `1px solid ${C.border}`, overflow: 'hidden', boxShadow: '0 8px 30px rgba(15,23,42,.08)', fontFamily: 'Golos Text, sans-serif' }}>
      <div style={{ background: C.navy, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }}></div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#F59E0B' }}></div>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></div>
        <span style={{ color: 'rgba(255,255,255,.6)', fontSize: 11, marginLeft: 8 }}>ИИ-помощник ПРОкадры</span>
      </div>
      <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg,${C.blue},${C.blueL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>ИИ</span>
          </div>
          <div style={{ background: C.blueUltraLight, borderRadius: '4px 12px 12px 12px', padding: '8px 12px', fontSize: 12, color: C.navy, maxWidth: 240, lineHeight: 1.5 }}>
            Здравствуйте! Я помогу подобрать специалистов по 44-ФЗ и 223-ФЗ. Опишите вашу задачу.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start', flexDirection: 'row-reverse' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: '#E2E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ fontSize: 10 }}>Р</span>
          </div>
          <div style={{ background: '#F1F5F9', borderRadius: '12px 4px 12px 12px', padding: '8px 12px', fontSize: 12, color: C.navy, maxWidth: 220, lineHeight: 1.5 }}>
            Ищу контрактного управляющего в Москве, опыт от 2 лет, знание ЕИС
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', background: `linear-gradient(135deg,${C.blue},${C.blueL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <span style={{ color: 'white', fontSize: 10, fontWeight: 700 }}>ИИ</span>
          </div>
          <div style={{ background: C.blueUltraLight, borderRadius: '4px 12px 12px 12px', padding: '8px 12px', fontSize: 12, color: C.navy, maxWidth: 240, lineHeight: 1.5 }}>
            Нашёл <strong>34 кандидата</strong> по вашим критериям. Показать топ-5 с релевантным опытом?
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, borderTop: `1px solid ${C.border}`, paddingTop: 10 }}>
          <input readOnly placeholder="Задайте вопрос или опишите задачу..." style={{ flex: 1, border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', fontSize: 12, outline: 'none', color: C.slate, fontFamily: 'Golos Text, sans-serif' }} />
          <button style={{ background: C.blue, border: 'none', borderRadius: 8, padding: '7px 14px', color: 'white', fontSize: 12, cursor: 'pointer', fontWeight: 600 }}>→</button>
        </div>
      </div>
    </div>
  );
}

// ── HEADER ───────────────────────────────────────────────────

function QuickLoginForm({ onRegister, onClose }: { onRegister: () => void; onClose: () => void }) {
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, undefined);
  return (
    <form action={action}>
      <div style={{ fontWeight: 700, fontSize: 14, color: C.navy, marginBottom: 12 }}>Войти в аккаунт</div>
      <input
        name="email"
        type="email"
        placeholder="Email"
        required
        style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'Golos Text, sans-serif', marginBottom: 8, boxSizing: 'border-box', color: C.navy }}
      />
      <input
        name="password"
        type="password"
        placeholder="Пароль"
        required
        style={{ width: '100%', border: `1px solid ${C.border}`, borderRadius: 8, padding: '9px 12px', fontSize: 13, outline: 'none', fontFamily: 'Golos Text, sans-serif', marginBottom: 8, boxSizing: 'border-box', color: C.navy }}
      />
      {state?.error && <div style={{ fontSize: 12, color: C.red, marginBottom: 8 }}>{state.error}</div>}
      <button
        type="submit"
        disabled={pending}
        style={{ width: '100%', background: pending ? C.slate : C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: pending ? 'default' : 'pointer', fontFamily: 'Golos Text, sans-serif', marginBottom: 10 }}>
        {pending ? 'Входим...' : 'Войти'}
      </button>
      <div style={{ textAlign: 'center', fontSize: 12, color: C.slate }}>
        Нет аккаунта?{' '}
        <button type="button" onClick={onRegister} style={{ background: 'none', border: 'none', color: C.blue, fontWeight: 600, cursor: 'pointer', fontSize: 12, fontFamily: 'Golos Text, sans-serif', padding: 0 }}>
          Зарегистрироваться
        </button>
      </div>
    </form>
  );
}

function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const router = useRouter();
  const isMobile = useIsMobile();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);

  const nav = [
    { label: 'Возможности', href: '#features' },
    { label: 'Работодателям', href: '#for-whom' },
    { label: 'Соискателям', href: '#for-whom' },
    { label: 'ИИ', href: '#ai' },
    { label: 'Демо', href: '/dashboard' },
    { label: 'Контакты', href: '#footer' },
  ];

  const navLinkStyle: React.CSSProperties = { fontSize: 13, fontWeight: 500, color: C.slate, textDecoration: 'none', padding: '6px 12px', borderRadius: 6, transition: 'all .15s', whiteSpace: 'nowrap' };

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 100, background: scrolled || menuOpen ? 'rgba(255,255,255,0.97)' : C.white, backdropFilter: 'blur(8px)', borderBottom: `1px solid ${scrolled || menuOpen ? C.border : 'transparent'}`, transition: 'all .2s' }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: isMobile ? '0 20px' : '0 32px', height: 60, display: 'flex', alignItems: 'center', gap: 16 }}>
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${C.blue},${C.blueL})`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>П</span>
          </div>
          <div>
            <div style={{ fontWeight: 700, fontSize: 16, color: C.navy, lineHeight: 1.1 }}>ПРОкадры</div>
            {!isMobile && <div style={{ fontSize: 10, color: C.slate, lineHeight: 1 }}>Подбор специалистов</div>}
          </div>
        </div>

        {/* Desktop Nav */}
        {!isMobile && (
          <nav aria-label="Основная навигация" style={{ display: 'flex', gap: 2, flex: 1, justifyContent: 'center' }}>
            {nav.map(n => (
              <a key={n.label} href={n.href} style={navLinkStyle}
                onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.blue; el.style.background = C.blueUltraLight; }}
                onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.color = C.slate; el.style.background = 'transparent'; }}>
                {n.label}
              </a>
            ))}
          </nav>
        )}

        {/* Desktop auth */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: 8, flexShrink: 0, position: 'relative' }}>
            {/* Quick login dropdown */}
            <div style={{ position: 'relative' }}>
              <button
                onClick={() => setLoginOpen(o => !o)}
                style={{ padding: '8px 18px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: loginOpen ? C.blueUltraLight : C.white, color: C.navy, fontFamily: 'Golos Text, sans-serif', fontSize: 13, fontWeight: 600, cursor: 'pointer', transition: 'all .15s', whiteSpace: 'nowrap' }}>
                Войти
              </button>
              {loginOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 280, background: C.white, border: `1px solid ${C.border}`, borderRadius: 12, boxShadow: '0 12px 40px rgba(15,23,42,.14)', padding: 16, zIndex: 200 }}>
                  <QuickLoginForm
                    onRegister={() => { setLoginOpen(false); router.push('/auth'); }}
                    onClose={() => setLoginOpen(false)}
                  />
                </div>
              )}
            </div>
            <Link href="/auth" style={{ textDecoration: 'none' }}><Btn small primary>Зарегистрироваться</Btn></Link>
          </div>
        )}

        {/* Mobile: login + hamburger */}
        {isMobile && (
          <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Link href="/auth" style={{ textDecoration: 'none' }}><Btn small primary>Войти</Btn></Link>
            <button
              aria-label={menuOpen ? 'Закрыть меню' : 'Открыть меню'}
              aria-expanded={menuOpen}
              onClick={() => setMenuOpen(o => !o)}
              style={{ width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'transparent', border: `1px solid ${C.border}`, borderRadius: 8, cursor: 'pointer', color: C.navy, flexShrink: 0 }}
            >
              {menuOpen
                ? <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                : <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" /></svg>
              }
            </button>
          </div>
        )}
      </div>

      {/* Mobile dropdown */}
      {isMobile && menuOpen && (
        <nav aria-label="Основная навигация" style={{ background: C.white, borderTop: `1px solid ${C.border}`, padding: '8px 20px 24px' }}>
          {nav.map(n => (
            <a key={n.label} href={n.href} onClick={() => setMenuOpen(false)}
              style={{ display: 'flex', alignItems: 'center', fontSize: 16, fontWeight: 500, color: C.navy, textDecoration: 'none', padding: '14px 4px', borderBottom: `1px solid ${C.border}`, transition: 'color .15s' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = C.blue; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = C.navy; }}>
              {n.label}
            </a>
          ))}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 20 }}>
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '13px', borderRadius: 8, border: `1.5px solid ${C.border}`, background: C.white, color: C.navy, fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Войти</button>
            </Link>
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <button style={{ width: '100%', padding: '13px', borderRadius: 8, border: 'none', background: C.blue, color: 'white', fontFamily: 'inherit', fontSize: 15, fontWeight: 600, cursor: 'pointer' }}>Зарегистрироваться</button>
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}

// ── HERO ─────────────────────────────────────────────────────

const ROTATING_WORDS = ['по закупкам', 'по 44-ФЗ и 223-ФЗ', 'в тендерах', 'в госзакупках', 'по контрактной системе'];

function Hero() {
  const isMobile = useIsMobile();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [seekerQuery, setSeekerQuery] = useState('');
  const [wordIdx, setWordIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const chips = ['Контрактный управляющий', 'Специалист по 44-ФЗ', 'Юрист по закупкам', 'Экономист', 'Тендерный специалист'];

  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => { setWordIdx(i => (i + 1) % ROTATING_WORDS.length); setFade(true); }, 300);
    }, 3000);
    return () => clearInterval(timer);
  }, []);
  const rotatingWord = ROTATING_WORDS[wordIdx];

  return (
    <section style={{ background: C.white, padding: isMobile ? '48px 20px 32px' : '72px 24px 48px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Badge */}
        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: C.blueUltraLight, border: `1px solid ${C.blueLighter}`, borderRadius: 20, padding: '5px 14px', fontSize: 12, color: C.blue, fontWeight: 600 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block', opacity: 0.6 }}></span> HR-платформа для закупок
          </div>
        </div>

        {/* Main headline */}
        <h1 style={{ textAlign: 'center', fontSize: isMobile ? 28 : 46, fontWeight: 900, color: C.navy, lineHeight: 1.1, marginBottom: 12, letterSpacing: '-0.5px' }}>
          Работа в сфере закупок —<br />
          <span
            style={{ color: C.blue, display: 'inline-block', transition: 'opacity 0.3s', opacity: fade ? 1 : 0, minWidth: isMobile ? 200 : 380, textAlign: 'center' }}>
            {rotatingWord}
          </span>
          {' '}быстрее
        </h1>
        <p style={{ textAlign: 'center', fontSize: 15, color: C.slate, lineHeight: 1.65, marginBottom: 40, maxWidth: 560, margin: '0 auto 40px' }}>
          Специализированная HR-платформа для 44-ФЗ, 223-ФЗ и тендеров. Работодатели находят специалистов, соискатели — работу.
        </p>

        {/* Dual CTA cards */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 40, maxWidth: 900, margin: '0 auto 40px' }}>
          {/* Employer card */}
          <div style={{ background: C.white, border: `2px solid ${C.blueLighter}`, borderRadius: 16, padding: '28px', boxShadow: '0 4px 24px rgba(30,64,175,.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueUltraLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SvgIcon d={ICONS.building} size={20} color={C.blue} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Работодателям</div>
                <div style={{ fontSize: 12, color: C.slate }}>Находите специалистов по закупкам</div>
              </div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 6, display: 'flex', marginBottom: 16, gap: 4 }}>
              <input
                value={query} onChange={e => setQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && router.push('/dashboard')}
                placeholder="Должность или навык..."
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 12px', fontSize: 13, outline: 'none', color: C.navy, fontFamily: 'Golos Text, sans-serif' }}
              />
              <button onClick={() => router.push('/dashboard')} style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', whiteSpace: 'nowrap' }}>Найти</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {chips.map(c => <Chip key={c}>{c}</Chip>)}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/auth" style={{ textDecoration: 'none', flex: 1 }}><button style={{ width: '100%', background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif' }}>Начать поиск</button></Link>
              <Link href="/dashboard" style={{ textDecoration: 'none' }}><button style={{ background: 'transparent', color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '11px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', whiteSpace: 'nowrap' }}>Демо →</button></Link>
            </div>
          </div>

          {/* Seeker card */}
          <div style={{ background: C.white, border: '2px solid #A7F3D0', borderRadius: 16, padding: '28px', boxShadow: '0 4px 24px rgba(5,150,105,.08)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <SvgIcon d={ICONS.user} size={20} color={C.green} />
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16, color: C.navy }}>Соискателям</div>
                <div style={{ fontSize: 12, color: C.slate }}>Находите работу по закупкам</div>
              </div>
            </div>
            <div style={{ background: C.bg, border: `1px solid ${C.border}`, borderRadius: 10, padding: 6, display: 'flex', marginBottom: 16, gap: 4 }}>
              <input
                value={seekerQuery} onChange={e => setSeekerQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && router.push('/auth')}
                placeholder="Должность или специализация..."
                style={{ flex: 1, border: 'none', background: 'transparent', padding: '8px 12px', fontSize: 13, outline: 'none', color: C.navy, fontFamily: 'Golos Text, sans-serif' }}
              />
              <button onClick={() => router.push('/auth')} style={{ background: C.green, color: 'white', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', whiteSpace: 'nowrap' }}>Найти</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {['Специалист по закупкам', 'Контрактный управляющий', 'Тендерный менеджер'].map(c => (
                <button key={c} type="button" style={{ display: 'inline-flex', alignItems: 'center', background: '#ECFDF5', color: C.green, border: '1px solid #A7F3D0', borderRadius: 20, padding: '4px 12px', fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap', cursor: 'pointer', fontFamily: 'inherit' }}>{c}</button>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Link href="/auth" style={{ textDecoration: 'none', flex: 1 }}><button style={{ width: '100%', background: C.green, color: 'white', border: 'none', borderRadius: 8, padding: '11px', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif' }}>Разместить резюме</button></Link>
              <Link href="/auth" style={{ textDecoration: 'none' }}><button style={{ background: 'transparent', color: C.navy, border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '11px 16px', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', whiteSpace: 'nowrap' }}>Вакансии →</button></Link>
            </div>
          </div>
        </div>

        {/* Stats strip */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 24 : 48, flexWrap: 'wrap' }}>
          {[
            { n: '1 000+', l: 'резюме в базе' },
            { n: '100+', l: 'вакансий по закупкам' },
            { n: '20', l: 'регионов России' },
            { n: 'AI', l: 'умный поиск' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, color: C.navy }}>{s.n}</div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── BANNER CAROUSEL ──────────────────────────────────────────

const BANNER_SLIDES = [
  { bg: '#0F172A', accent: '#3B82F6', tag: 'Новое', title: 'Поиск по закупочной карте России', sub: 'Смотрите дефицит кадров по регионам — находите там, где нужны больше всего', cta: 'Смотреть карту', href: '/dashboard' },
  { bg: '#1E3A5F', accent: '#10B981', tag: 'Для соискателей', title: 'Разместите резюме — вас найдут быстрее', sub: 'Более 100 работодателей ищут специалистов по 44-ФЗ и 223-ФЗ прямо сейчас', cta: 'Разместить резюме', href: '/auth' },
  { bg: '#312E81', accent: '#F59E0B', tag: 'ИИ-поиск', title: 'Умный подбор за 5 минут', sub: 'Опишите задачу — ИИ-помощник подберёт кандидатов с нужной специализацией', cta: 'Попробовать', href: '/dashboard' },
  { bg: '#134E4A', accent: '#60A5FA', tag: 'Для работодателей', title: 'Реестр резюме специалистов по закупкам', sub: 'Верифицированная база: контрактные управляющие, тендерные специалисты, юристы', cta: 'В реестр', href: '/dashboard' },
];

function BannerCarousel() {
  const [idx, setIdx] = useState(0);
  const [fade, setFade] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const t = setInterval(() => {
      setFade(false);
      setTimeout(() => { setIdx(i => (i + 1) % BANNER_SLIDES.length); setFade(true); }, 250);
    }, 4500);
    return () => clearInterval(t);
  }, []);

  const slide = BANNER_SLIDES[idx];

  return (
    <section style={{ background: slide.bg, transition: 'background 0.5s', overflow: 'hidden', position: 'relative' }}>
      {/* Decorative circles */}
      <div style={{ position: 'absolute', right: -60, top: -60, width: 260, height: 260, borderRadius: '50%', background: `${slide.accent}18`, pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', right: 80, bottom: -40, width: 140, height: 140, borderRadius: '50%', background: `${slide.accent}10`, pointerEvents: 'none' }} />

      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 24, minHeight: 88, opacity: fade ? 1 : 0, transition: 'opacity 0.25s', position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flex: 1, minWidth: 0 }}>
          <span style={{ background: slide.accent, color: '#fff', borderRadius: 20, padding: '3px 12px', fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap', flexShrink: 0 }}>{slide.tag}</span>
          <div style={{ minWidth: 0 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#fff', lineHeight: 1.2, marginBottom: 3, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.title}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.65)', lineHeight: 1.4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{slide.sub}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexShrink: 0 }}>
          <button onClick={() => router.push(slide.href)} style={{ background: slide.accent, color: '#fff', border: 'none', borderRadius: 8, padding: '9px 20px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', whiteSpace: 'nowrap' }}>{slide.cta} →</button>
          {/* Dot indicators */}
          <div style={{ display: 'flex', gap: 5 }}>
            {BANNER_SLIDES.map((_, i) => (
              <button key={i} onClick={() => { setFade(false); setTimeout(() => { setIdx(i); setFade(true); }, 150); }}
                style={{ width: i === idx ? 18 : 6, height: 6, borderRadius: 3, background: i === idx ? slide.accent : 'rgba(255,255,255,0.3)', border: 'none', cursor: 'pointer', padding: 0, transition: 'all 0.3s' }} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── RUSSIA MAP SECTION ───────────────────────────────────────

function RussiaMapSection() {
  const isMobile = useIsMobile();
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedCity, setSelectedCity] = useState<MapCity | null>(null);
  const maxVac = Math.max(...RUSSIA_CITIES.map(c => c.vacancies));

  useRussiaMap({
    containerRef,
    cities: RUSSIA_CITIES,
    center: [60, 60],
    zoom: 3,
    onCityClick: setSelectedCity,
  });

  return (
    <section style={{ background: '#0F172A', padding: isMobile ? '48px 20px' : '72px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(59,130,246,0.15)', border: '1px solid rgba(59,130,246,0.3)', borderRadius: 20, padding: '5px 14px', fontSize: 12, color: '#93C5FD', fontWeight: 600, marginBottom: 16 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'currentColor', display: 'inline-block' }}></span> Карта рынка труда
          </div>
          <h2 style={{ fontSize: isMobile ? 22 : 34, fontWeight: 800, color: '#fff', marginBottom: 10, letterSpacing: '-0.5px' }}>
            Специалисты по закупкам по всей России
          </h2>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.55)', maxWidth: 500, margin: '0 auto' }}>
            Более 20 регионов. Нажмите на пузырёк — узнайте данные по городу.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 300px', gap: 32, alignItems: 'start' }}>
          {/* 2GIS Map */}
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', height: isMobile ? 320 : 480 }}>
            <div ref={containerRef} style={{ width: '100%', height: '100%' }} />
            {/* Selected city overlay */}
            {selectedCity && (
              <div style={{ position: 'absolute', top: 12, left: 12, background: '#1E293B', border: '1px solid #3B82F6', borderRadius: 10, padding: '10px 14px', zIndex: 10 }}>
                <div style={{ fontWeight: 700, fontSize: 13, color: '#fff', marginBottom: 4 }}>{selectedCity.name}</div>
                <div style={{ fontSize: 12, color: '#93C5FD' }}>{selectedCity.vacancies} вакансий · {selectedCity.resumes} резюме</div>
                <button onClick={() => setSelectedCity(null)} style={{ marginTop: 6, fontSize: 11, color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'Golos Text, sans-serif' }}>закрыть ✕</button>
              </div>
            )}
            <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'rgba(15,23,42,0.75)', borderRadius: 6, padding: '4px 10px', fontSize: 10, color: 'rgba(255,255,255,0.5)' }}>
              Размер пузырька = число вакансий
            </div>
          </div>

          {/* Stats sidebar */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#3B82F6', letterSpacing: '-1px' }}>1 000+</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>резюме в базе</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#10B981', letterSpacing: '-1px' }}>100+</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>вакансий по закупкам</div>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#F59E0B', letterSpacing: '-1px' }}>20+</div>
              <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 2 }}>регионов охвата</div>
            </div>
            {/* Top cities */}
            <div style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '16px 20px' }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: 0.5 }}>Топ городов</div>
              {RUSSIA_CITIES.slice(0, 5).map((city, i) => (
                <div key={city.name} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: i < 4 ? 8 : 0 }}>
                  <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)', width: 14, textAlign: 'right', flexShrink: 0 }}>#{i + 1}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 12, color: '#fff', fontWeight: 500 }}>{city.name}</div>
                    <div style={{ height: 3, background: 'rgba(255,255,255,0.1)', borderRadius: 2, marginTop: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(city.vacancies / maxVac) * 100}%`, background: '#3B82F6', borderRadius: 2 }} />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#93C5FD', flexShrink: 0 }}>{city.vacancies}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── SOCIAL PROOF ─────────────────────────────────────────────

function SocialProof() {
  const isMobile = useIsMobile();
  const testimonials = [
    { text: 'Нашли контрактного управляющего за 3 дня. Платформа знает специфику 44-ФЗ — не нужно объяснять что такое ЕИС.', name: 'Анна М.', role: 'HR-директор, ООО «ТехноСервис»', init: 'АМ', color: C.blue },
    { text: 'Разместила резюме и получила приглашение на следующий день. Удобно, что работодатели специализируются именно на закупках.', name: 'Светлана П.', role: 'Контрактный управляющий', init: 'СП', color: '#059669' },
    { text: 'AI-помощник помог сформулировать требования к вакансии правильно. Отклики пошли сразу от профильных специалистов.', name: 'Дмитрий К.', role: 'Руководитель отдела закупок', init: 'ДК', color: '#7C3AED' },
  ];
  return (
    <section style={{ padding: isMobile ? '56px 20px' : '80px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {/* Trust stats */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: isMobile ? 28 : 56, marginBottom: 56, flexWrap: 'wrap' }}>
          {[
            { n: '500+', l: 'организаций' },
            { n: '4.9★', l: 'средняя оценка' },
            { n: '98%', l: 'резюме верифицированы' },
            { n: '3 дня', l: 'средний срок подбора' },
          ].map(s => (
            <div key={s.n} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: C.navy, letterSpacing: '-0.5px' }}>{s.n}</div>
              <div style={{ fontSize: 12, color: C.slate, marginTop: 2 }}>{s.l}</div>
            </div>
          ))}
        </div>
        {/* Testimonials */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
          {testimonials.map((t, i) => (
            <div key={i} style={{ background: C.white, border: `1.5px solid ${C.border}`, borderRadius: 16, padding: '24px', display: 'flex', flexDirection: 'column', gap: 0 }}>
              <div style={{ fontSize: 40, color: t.color, lineHeight: 1, marginBottom: 10, opacity: 0.6, fontFamily: 'Georgia, serif' }}>"</div>
              <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.75, marginBottom: 20, flex: 1 }}>{t.text}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: t.color, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>{t.init}</div>
                <div>
                  <div style={{ fontWeight: 600, color: C.navy, fontSize: 13 }}>{t.name}</div>
                  <div style={{ fontSize: 12, color: C.slate }}>{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FOR WHOM ─────────────────────────────────────────────────

function ForWhom() {
  const isMobile = useIsMobile();
  const cards = [
    {
      icon: 'building', color: C.blue, bg: C.blueUltraLight,
      title: 'Работодателям',
      desc: 'Быстрый поиск профильных специалистов в сфере закупок и контрактной системы.',
      items: ['Поиск по резюме с умными фильтрами', 'Публикация вакансий и отбор откликов', 'Приглашения кандидатам напрямую', 'Быстрый shortlist и сравнение кандидатов', 'Личный кабинет работодателя'],
      cta: 'Разместить вакансию',
    },
    {
      icon: 'user', color: '#059669', bg: '#ECFDF5',
      title: 'Соискателям',
      desc: 'Удобный поиск вакансий и инструменты для карьеры в сфере закупок и тендеров.',
      items: ['Размещение резюме за несколько минут', 'Поиск вакансий по специализации', 'Отклики и входящие приглашения', 'Сообщения с работодателями', 'Карьерные возможности в закупках'],
      cta: 'Разместить резюме',
    },
    {
      icon: 'handshake', color: '#7C3AED', bg: '#F5F3FF',
      title: 'Организациям и партнёрам',
      desc: 'Оцените платформу как готовый продукт для цифровизации подбора персонала.',
      items: ['Демонстрация возможностей системы', 'Настройка под задачи организации', 'Цифровизация процессов подбора', 'AI-аналитика и smart-поиск', 'Интеграция и партнёрские условия'],
      cta: 'Запросить демо',
    },
  ];
  return (
    <section id="for-whom" style={{ padding: '96px 24px', background: C.white }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 52 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Для кого</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: C.navy, letterSpacing: '-0.3px' }}>Платформа работает для всех участников рынка закупок</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap: 20 }}>
          {cards.map(card => (
            <div key={card.title}
              style={{ border: `1.5px solid ${C.border}`, borderRadius: 16, padding: '28px', display: 'flex', flexDirection: 'column', gap: 18, transition: 'all .2s', background: C.white }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.boxShadow = '0 12px 40px rgba(15,23,42,.1)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.boxShadow = 'none'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SvgIcon d={ICONS[card.icon] || ICONS.building} size={20} color={card.color} />
              </div>
              <div>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: C.navy, marginBottom: 8 }}>{card.title}</h3>
                <p style={{ fontSize: 14, color: C.slate, lineHeight: 1.6 }}>{card.desc}</p>
              </div>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 8 }}>
                {card.items.map(it => (
                  <li key={it} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: C.navy }}>
                    <span style={{ width: 18, height: 18, borderRadius: '50%', background: card.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: card.color, flexShrink: 0, fontWeight: 700 }}>✓</span>
                    {it}
                  </li>
                ))}
              </ul>
              <Link href="/auth" style={{ textDecoration: 'none', marginTop: 'auto' }}>
                <button
                  style={{ width: '100%', border: `1.5px solid ${card.color}`, borderRadius: 8, padding: '10px 20px', background: 'transparent', color: card.color, fontFamily: 'Golos Text, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', transition: 'all .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = card.bg; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent'; }}>
                  {card.cta}
                </button>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FEATURES ─────────────────────────────────────────────────

function Features() {
  const isMobile = useIsMobile();
  const feats = [
    { icon: 'clipboard', col: '#1E40AF', bg: '#EFF6FF', title: 'Реестр резюме', desc: 'База специалистов с фильтрами по специализации, опыту, региону, знанию 44-ФЗ / 223-ФЗ' },
    { icon: 'search', col: '#0891B2', bg: '#ECFEFF', title: 'Умный поиск', desc: 'Фильтры по должности, компетенциям, городу, типу занятости и ключевым навыкам' },
    { icon: 'briefcase', col: '#059669', bg: '#ECFDF5', title: 'Вакансии и отклики', desc: 'Публикация вакансий, приём откликов, статусы рассмотрения — всё в одном месте' },
    { icon: 'envelope', col: '#7C3AED', bg: '#F5F3FF', title: 'Приглашения и сообщения', desc: 'Прямой контакт с кандидатами и работодателями внутри системы' },
    { icon: 'folder', col: '#1E40AF', bg: '#EFF6FF', title: 'Кабинеты по ролям', desc: 'Отдельные интерфейсы для работодателя, соискателя и администратора' },
    { icon: 'bolt', col: '#D97706', bg: '#FFFBEB', title: 'AI-помощник', desc: 'Подбор кандидатов на естественном языке, генерация вакансий, анализ резюме' },
    { icon: 'chart', col: '#059669', bg: '#ECFDF5', title: 'Аналитика', desc: 'Статистика откликов, активность резюме, эффективность вакансий в реальном времени' },
    { icon: 'shield', col: '#0891B2', bg: '#ECFEFF', title: 'Надёжность', desc: 'Данные хранятся на российских серверах, соответствие требованиям 152-ФЗ' },
  ];
  return (
    <section id="features" style={{ padding: '88px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Возможности</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: C.navy, letterSpacing: '-0.3px' }}>Всё для подбора в одной системе</h2>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? 'repeat(2,1fr)' : 'repeat(3,1fr)', gap: 16 }}>
          {feats.slice(0, 6).map(f => (
            <div key={f.title}
              style={{ background: C.white, border: `1px solid ${C.border}`, borderRadius: 14, padding: '24px', transition: 'all .22s', cursor: 'default' }}
              onMouseEnter={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = '0 8px 28px rgba(15,23,42,.09)'; el.style.borderColor = f.col + '55'; el.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { const el = e.currentTarget as HTMLElement; el.style.boxShadow = 'none'; el.style.borderColor = C.border; el.style.transform = 'none'; }}>
              <div style={{ width: 44, height: 44, borderRadius: 10, background: f.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                <SvgIcon d={ICONS[f.icon] || ICONS.clipboard} size={20} color={f.col} />
              </div>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginBottom: 6 }}>{f.title}</div>
              <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AI TOOLS ─────────────────────────────────────────────────

function AITools() {
  const isMobile = useIsMobile();
  const tools = [
    { title: 'Поиск на естественном языке', desc: 'Опишите задачу словами — AI найдёт подходящих кандидатов или вакансии без сложных фильтров' },
    { title: 'AI-помощник по 44-ФЗ и 223-ФЗ', desc: 'Ответы на вопросы по контрактной системе, разъяснение норм и требований в режиме чата' },
    { title: 'Генерация вакансий', desc: 'Укажите должность и требования — AI создаст профессиональное описание вакансии за секунды' },
    { title: 'Улучшение резюме', desc: 'AI анализирует резюме и предлагает конкретные улучшения для повышения отклика работодателей' },
    { title: 'Помощник по документам', desc: 'Создание и редактирование рабочих документов: шаблоны, письма, технические задания' },
    { title: 'Чат-бот поддержки', desc: 'Ответы на вопросы о работе платформы, навигация по функциям и помощь в любое время' },
  ];
  return (
    <section id="ai" style={{ padding: '96px 24px', background: C.navy, position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle at 70% 50%, rgba(59,130,246,.12) 0%, transparent 60%)`, pointerEvents: 'none' }}></div>
      <div style={{ maxWidth: 1200, margin: '0 auto', position: 'relative', display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? 40 : 80, alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.blueL, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>ИИ-инструменты</div>
          <h2 style={{ fontSize: 30, fontWeight: 800, color: 'white', letterSpacing: '-0.3px', marginBottom: 20, lineHeight: 1.2 }}>Умные инструменты внутри каждого кабинета</h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.55)', lineHeight: 1.7, marginBottom: 36 }}>
            AI не заменяет специалиста — он помогает работать быстрее. Поиск, документы, вакансии и ответы на вопросы по 44-ФЗ.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {tools.slice(0, 4).map(t => (
              <div key={t.title} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{ width: 6, height: 6, borderRadius: '50%', background: C.blueL, marginTop: 8, flexShrink: 0 }}></div>
                <div>
                  <div style={{ fontWeight: 600, color: 'white', fontSize: 14, marginBottom: 2 }}>{t.title}</div>
                  <div style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.5 }}>{t.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <AIChatMockup />
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: 12, marginTop: 16 }}>
            {tools.slice(4).map(t => (
              <div key={t.title} style={{ flex: 1, background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 10, padding: 16 }}>
                <div style={{ fontWeight: 600, color: 'white', fontSize: 13, marginBottom: 4 }}>{t.title}</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,.4)', lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── INTERFACE PREVIEWS ───────────────────────────────────────

function InterfacePreviews() {
  const [active, setActive] = useState(0);
  const isMobile = useIsMobile();
  const tabs = ['Кабинет работодателя', 'Реестр резюме', 'Карточка кандидата', 'Вакансии'];
  const resumes = [
    { name: 'Иванова Светлана П.', spec: 'Контрактный управляющий', exp: '8 лет', loc: 'Москва', tags: ['44-ФЗ', 'ЕИС', 'Госзакупки'] },
    { name: 'Петров Алексей М.', spec: 'Специалист по 44-ФЗ', exp: '5 лет', loc: 'СПб', tags: ['44-ФЗ', '223-ФЗ', 'Тендеры'] },
    { name: 'Смирнова Ольга К.', spec: 'Юрист по закупкам', exp: '6 лет', loc: 'Казань', tags: ['Юриспруденция', '44-ФЗ', 'ФАС'] },
    { name: 'Козлов Дмитрий В.', spec: 'Тендерный специалист', exp: '4 года', loc: 'Москва', tags: ['Тендеры', '223-ФЗ', 'ЭТП'] },
    { name: 'Новикова Анна С.', spec: 'Экономист по закупкам', exp: '7 лет', loc: 'Ростов', tags: ['Экономика', 'НМЦК', '44-ФЗ'] },
  ];
  const avColors = [C.blue, '#7C3AED', C.green, '#D97706', '#DC2626'];
  const vacancies = [
    { title: 'Контрактный управляющий', org: 'ООО «ТехноСервис»', loc: 'Москва', salary: '90 000 — 130 000 ₽', tags: ['44-ФЗ', 'ЕИС'], isNew: true },
    { title: 'Специалист по 223-ФЗ', org: 'АО «ГородСтрой»', loc: 'Санкт-Петербург', salary: '70 000 — 100 000 ₽', tags: ['223-ФЗ', 'Закупки'], isNew: false },
    { title: 'Тендерный менеджер', org: 'ФГУП «РосТех»', loc: 'Удалённо', salary: '80 000 — 110 000 ₽', tags: ['Тендеры', 'Удалённо'], isNew: true },
    { title: 'Юрист по закупкам', org: 'ГБУ «Медцентр»', loc: 'Москва', salary: '95 000 — 140 000 ₽', tags: ['44-ФЗ', 'ФАС'], isNew: false },
  ];

  const renderTab = () => {
    if (active === 0) return <div style={{ height: 320, overflow: 'hidden' }}><MiniDashboard /></div>;
    if (active === 1) return (
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Реестр резюме</h3>
          <div style={{ display: 'flex', gap: 8 }}>
            <input readOnly placeholder="Поиск по базе..." style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', fontSize: 13, width: 220, outline: 'none', fontFamily: 'Golos Text, sans-serif' }} />
            <select style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', fontSize: 13, outline: 'none', fontFamily: 'Golos Text, sans-serif', color: C.slate }}>
              <option>Специализация</option>
            </select>
          </div>
        </div>
        {resumes.map((r, i) => (
          <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: `1px solid ${C.border}` }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', background: avColors[i], display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{r.name[0]}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, color: C.navy, fontSize: 14 }}>{r.name}</div>
              <div style={{ fontSize: 13, color: C.slate }}>{r.spec} · {r.exp} · {r.loc}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              {r.tags.map(t => <span key={t} style={{ background: C.blueUltraLight, color: C.blue, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 500 }}>{t}</span>)}
            </div>
            <button style={{ border: `1px solid ${C.border}`, borderRadius: 7, padding: '6px 14px', fontSize: 12, cursor: 'pointer', background: 'transparent', fontFamily: 'Golos Text, sans-serif', color: C.navy }}>Пригласить</button>
          </div>
        ))}
      </div>
    );
    if (active === 2) return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', height: 320 }}>
        <div style={{ padding: 24, borderRight: `1px solid ${C.border}` }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', marginBottom: 20 }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 24 }}>И</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 18, color: C.navy }}>Иванова Светлана П.</div>
              <div style={{ fontSize: 14, color: C.slate }}>Контрактный управляющий</div>
              <div style={{ fontSize: 13, color: C.green, fontWeight: 600, marginTop: 2 }}>● Активно ищет работу</div>
            </div>
          </div>
          {[['Опыт', '8 лет в госзакупках'], ['Локация', 'Москва, возможен переезд'], ['Занятость', 'Полная, удалённо'], ['Зарплата', 'от 120 000 ₽']].map(([k, v]) => (
            <div key={k} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
              <span style={{ fontSize: 13, color: C.slate, width: 80, flexShrink: 0 }}>{k}</span>
              <span style={{ fontSize: 13, color: C.navy, fontWeight: 500 }}>{v}</span>
            </div>
          ))}
        </div>
        <div style={{ padding: 24 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 10 }}>Ключевые навыки</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {['44-ФЗ', '223-ФЗ', 'ЕИС', 'Контрактная система', 'Госзакупки', 'Тендеры', 'НМЦК', 'ФАС'].map(t => (
              <span key={t} style={{ background: C.blueUltraLight, color: C.blue, borderRadius: 20, padding: '3px 10px', fontSize: 12, fontWeight: 500 }}>{t}</span>
            ))}
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: C.navy, marginBottom: 6 }}>О себе</div>
          <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6, marginBottom: 20 }}>Опытный специалист в сфере государственных закупок. Сопровождала более 200 контрактов по 44-ФЗ, опыт работы с ЕИС, ФАС и контрольными органами.</div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button style={{ flex: 1, background: C.blue, color: 'white', border: 'none', borderRadius: 8, padding: '10px', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif' }}>Пригласить</button>
            <button style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '10px 16px', fontSize: 13, cursor: 'pointer', background: 'transparent', fontFamily: 'Golos Text, sans-serif', color: C.navy }}>Сохранить</button>
          </div>
        </div>
      </div>
    );
    if (active === 3) return (
      <div style={{ padding: '20px 24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: C.navy }}>Вакансии в закупках</h3>
          <input readOnly placeholder="Поиск вакансий..." style={{ border: `1px solid ${C.border}`, borderRadius: 8, padding: '7px 12px', fontSize: 13, width: 220, outline: 'none', fontFamily: 'Golos Text, sans-serif' }} />
        </div>
        {vacancies.map(v => (
          <div key={v.title}
            style={{ border: `1px solid ${C.border}`, borderRadius: 10, padding: 16, marginBottom: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: 'border-color .15s' }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.borderColor = C.blueL; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.borderColor = C.border; }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontWeight: 600, fontSize: 15, color: C.navy }}>{v.title}</span>
                {v.isNew && <span style={{ background: '#ECFDF5', color: C.green, borderRadius: 20, padding: '1px 8px', fontSize: 10, fontWeight: 600 }}>Новое</span>}
              </div>
              <div style={{ fontSize: 13, color: C.slate, marginBottom: 6 }}>{v.org} · {v.loc}</div>
              <div style={{ display: 'flex', gap: 6 }}>
                {v.tags.map(t => <span key={t} style={{ background: C.blueUltraLight, color: C.blue, borderRadius: 20, padding: '2px 8px', fontSize: 11 }}>{t}</span>)}
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 700, color: C.navy, fontSize: 14, marginBottom: 8 }}>{v.salary}</div>
              <button style={{ background: C.blue, color: 'white', border: 'none', borderRadius: 7, padding: '7px 16px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif' }}>Откликнуться</button>
            </div>
          </div>
        ))}
      </div>
    );
    return null;
  };

  return (
    <section style={{ padding: '96px 24px', background: C.white }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 48 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Интерфейс</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: C.navy, letterSpacing: '-0.3px' }}>Посмотрите, как это устроено</h2>
        </div>
        {isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10, color: C.slate, fontSize: 12 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M7 16l-4-4m0 0l4-4m-4 4h18" /></svg>
            <span>Прокрутите содержимое влево–вправо</span>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
          </div>
        )}
        <div style={{ border: `1.5px solid ${C.border}`, borderRadius: 16, overflow: 'hidden', boxShadow: '0 16px 48px rgba(15,23,42,.08)', position: 'relative' }}>
          {isMobile && <div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, width: 40, background: 'linear-gradient(to right, transparent, rgba(255,255,255,0.9))', zIndex: 10, pointerEvents: 'none', borderRadius: '0 16px 16px 0' }} />}
          <div style={{ overflowX: isMobile ? 'auto' : 'visible' }}>
            <div style={{ minWidth: isMobile ? 680 : 'auto' }}>
              <div style={{ display: 'flex', borderBottom: `1px solid ${C.border}`, background: C.bg }}>
                {tabs.map((t, i) => (
                  <button key={t} onClick={() => setActive(i)}
                    style={{ padding: '14px 24px', fontSize: 13, fontWeight: active === i ? 600 : 400, color: active === i ? C.blue : C.slate, background: active === i ? C.white : 'transparent', border: 'none', cursor: 'pointer', borderBottom: active === i ? `2px solid ${C.blue}` : '2px solid transparent', transition: 'all .15s', fontFamily: 'Golos Text, sans-serif', whiteSpace: 'nowrap' }}>
                    {t}
                  </button>
                ))}
              </div>
              <div style={{ minHeight: 320 }}>
                {renderTab()}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── HOW IT WORKS ─────────────────────────────────────────────

function HowItWorks() {
  const isMobile = useIsMobile();
  const steps = [
    { title: 'Создайте аккаунт или запросите демо', desc: 'Регистрация занимает несколько минут. Или запросите демо-доступ, чтобы сначала посмотреть платформу в действии.' },
    { title: 'Разместите вакансию или резюме', desc: 'Работодатели публикуют вакансии с требованиями, соискатели создают профессиональное резюме с помощью AI-помощника.' },
    { title: 'Найдите совпадения через фильтры и AI-поиск', desc: 'Умный поиск на естественном языке и гибкие фильтры помогут быстро найти нужных кандидатов или подходящие вакансии.' },
    { title: 'Свяжитесь напрямую в системе', desc: 'Отправляйте приглашения, обменивайтесь сообщениями и принимайте решения — всё внутри платформы, без сторонних инструментов.' },
  ];
  return (
    <section style={{ padding: '96px 24px', background: C.bg }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: 64 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: C.blue, letterSpacing: '0.1em', textTransform: 'uppercase', marginBottom: 12 }}>Как это работает</div>
          <h2 style={{ fontSize: 34, fontWeight: 800, color: C.navy, letterSpacing: '-0.3px' }}>Четыре шага до результата</h2>
        </div>
        {isMobile ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {steps.map((s, i) => (
              <div key={s.title} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: `linear-gradient(135deg,${C.blue},${C.blueL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15, boxShadow: '0 4px 16px rgba(30,64,175,.25)', flexShrink: 0 }}>
                    {i + 1}
                  </div>
                  {i < steps.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 32, background: `linear-gradient(${C.blue},${C.blueL})`, opacity: 0.2, margin: '4px 0' }}></div>}
                </div>
                <div style={{ paddingBottom: i < steps.length - 1 ? 28 : 0, paddingTop: 10 }}>
                  <div style={{ fontWeight: 700, color: C.navy, fontSize: 15, marginBottom: 6 }}>{s.title}</div>
                  <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{s.desc}</div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 8, position: 'relative' }}>
            <div style={{ position: 'absolute', top: 24, left: '12.5%', right: '12.5%', height: 2, background: `linear-gradient(90deg,${C.blue},${C.blueL})`, zIndex: 0, opacity: 0.2 }}></div>
            {steps.map((s, i) => (
              <div key={s.title} style={{ position: 'relative', zIndex: 1, textAlign: 'center', padding: '0 16px' }}>
                <div style={{ width: 48, height: 48, borderRadius: '50%', background: `linear-gradient(135deg,${C.blue},${C.blueL})`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 800, fontSize: 15, margin: '0 auto 20px', boxShadow: '0 4px 16px rgba(30,64,175,.25)' }}>
                  {i + 1}
                </div>
                <div style={{ fontWeight: 700, color: C.navy, fontSize: 15, marginBottom: 8 }}>{s.title}</div>
                <div style={{ fontSize: 13, color: C.slate, lineHeight: 1.6 }}>{s.desc}</div>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

// ── CTA FINAL ────────────────────────────────────────────────

function CTAFinal() {
  const isMobile = useIsMobile();
  return (
    <section style={{ padding: isMobile ? '64px 20px' : '96px 24px', background: C.white }}>
      <div style={{ maxWidth: 720, margin: '0 auto', textAlign: 'center' }}>
        <div style={{ background: `linear-gradient(135deg,${C.blue} 0%,#1D4ED8 100%)`, borderRadius: 24, padding: isMobile ? '40px 20px' : '64px 48px', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle at 80% 20%, rgba(255,255,255,.08) 0%,transparent 50%)', pointerEvents: 'none' }}></div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,.6)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>Начните прямо сейчас</div>
          <h2 style={{ fontSize: isMobile ? 26 : 36, fontWeight: 900, color: 'white', marginBottom: 16, lineHeight: 1.15, letterSpacing: '-0.3px' }}>
            Ваша следующая точка входа в кадры сферы закупок
          </h2>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,.65)', lineHeight: 1.7, marginBottom: 40 }}>
            Войдите в систему, зарегистрируйтесь или посмотрите демо — и убедитесь, что подбор специалистов по 44-ФЗ и 223-ФЗ может быть быстрым и удобным.
          </p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/dashboard" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'white', color: C.blue, border: 'none', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', transition: 'opacity .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.opacity = '0.9'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = '1'; }}>
                Попробовать демо
              </button>
            </Link>
            <Link href="/auth" style={{ textDecoration: 'none' }}>
              <button style={{ background: 'rgba(255,255,255,.12)', color: 'white', border: '1.5px solid rgba(255,255,255,.3)', borderRadius: 10, padding: '14px 32px', fontSize: 15, fontWeight: 600, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', transition: 'all .15s' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.2)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,.12)'; }}>
                Зарегистрироваться
              </button>
            </Link>
            <button style={{ background: 'transparent', color: 'rgba(255,255,255,.65)', border: 'none', borderRadius: 10, padding: '14px 20px', fontSize: 14, cursor: 'pointer', fontFamily: 'Golos Text, sans-serif', textDecoration: 'underline', textDecorationColor: 'rgba(255,255,255,.3)' }}>
              Запросить презентацию
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── FOOTER ───────────────────────────────────────────────────

function Footer() {
  const isMobile = useIsMobile();
  return (
    <footer id="footer" style={{ background: C.navy, padding: isMobile ? '40px 20px 24px' : '48px 24px 32px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr 1fr 1fr', gap: isMobile ? 32 : 48, marginBottom: 48 }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
              <div style={{ width: 32, height: 32, background: `linear-gradient(135deg,${C.blue},${C.blueL})`, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span style={{ color: 'white', fontWeight: 800, fontSize: 14 }}>П</span>
              </div>
              <span style={{ fontWeight: 700, fontSize: 16, color: 'white' }}>ПРОкадры</span>
            </div>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,.45)', lineHeight: 1.7, maxWidth: 260 }}>
              Специализированная платформа подбора кадров для сферы закупок, тендерного сопровождения и контрактной системы.
            </p>
          </div>
          {[
            { title: 'Сервис', links: [{ l: 'О платформе', h: '#' }, { l: 'Возможности', h: '#features' }, { l: 'ИИ-инструменты', h: '#ai' }, { l: 'Демо', h: '/dashboard' }] },
            { title: 'Пользователям', links: [{ l: 'Работодателям', h: '#for-whom' }, { l: 'Соискателям', h: '#for-whom' }, { l: 'Партнёрам', h: '#' }, { l: 'Контакты', h: '#footer' }] },
            { title: 'Юридическое', links: [{ l: 'Политика конфиденциальности', h: '#' }, { l: 'Пользовательское соглашение', h: '#' }, { l: 'Обработка данных', h: '#' }] },
          ].map(col => (
            <div key={col.title}>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'rgba(255,255,255,.35)', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: 16 }}>{col.title}</div>
              {col.links.map(l => (
                <a key={l.l} href={l.h} style={{ display: 'block', fontSize: 13, color: 'rgba(255,255,255,.55)', textDecoration: 'none', marginBottom: 10, transition: 'color .15s' }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'white'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,.55)'; }}>
                  {l.l}
                </a>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: '1px solid rgba(255,255,255,.08)', paddingTop: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,.3)' }}>© 2026 ПРОкадры. Все права защищены.</div>
          <div style={{ display: 'flex', gap: 16 }}>
            <a href="mailto:email@prokadry.ru" style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>email@prokadry.ru</a>
            <a href="#" style={{ fontSize: 12, color: 'rgba(255,255,255,.35)', textDecoration: 'none' }}>Telegram</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

// ── STICKY MOBILE CTA ────────────────────────────────────────

function StickyMobileCTA() {
  const isMobile = useIsMobile();
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const check = () => setVisible(window.scrollY > 500);
    window.addEventListener('scroll', check, { passive: true });
    return () => window.removeEventListener('scroll', check);
  }, []);
  if (!isMobile || !visible) return null;
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: C.white, borderTop: `1px solid ${C.border}`, padding: '12px 16px', zIndex: 200, display: 'flex', gap: 10, boxShadow: '0 -4px 20px rgba(15,23,42,.08)' }}>
      <Link href="/auth" style={{ textDecoration: 'none', flex: 1 }}>
        <button style={{ width: '100%', background: C.blue, color: 'white', border: 'none', borderRadius: 10, padding: '13px', fontFamily: 'Golos Text, sans-serif', fontSize: 15, fontWeight: 700, cursor: 'pointer' }}>
          Начать поиск
        </button>
      </Link>
      <Link href="/dashboard" style={{ textDecoration: 'none', flexShrink: 0 }}>
        <button style={{ background: C.bg, color: C.navy, border: `1px solid ${C.border}`, borderRadius: 10, padding: '13px 16px', fontFamily: 'Golos Text, sans-serif', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Демо →
        </button>
      </Link>
    </div>
  );
}

// ── PAGE ─────────────────────────────────────────────────────

export default function LandingPage() {
  return (
    <>
      <Header />
      <main id="main-content">
        <Hero />
        <BannerCarousel />
        <RussiaMapSection />
        <ForWhom />
        <Features />
        <AITools />
        <InterfacePreviews />
        <HowItWorks />
        <CTAFinal />
      </main>
      <Footer />
      <StickyMobileCTA />
    </>
  );
}
