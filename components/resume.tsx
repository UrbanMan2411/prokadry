'use client';

import { useState } from 'react';
import type { Resume, Vacancy } from '@/lib/types';
import { fmtSalary, fmtDate, fmtExp } from '@/lib/utils';
import { Badge, Btn, Modal, Avatar } from './ui';

// ── 2-Step InviteModal ──────────────────────────────────────────────────────
const TEMPLATES = [
  'Добрый день! Мы рассмотрели ваше резюме и хотели бы пригласить вас на собеседование.',
  'Здравствуйте! Ваш опыт полностью соответствует нашим требованиям. Готовы предложить конкурентные условия.',
  'Добрый день! Приглашаем рассмотреть нашу вакансию. Обсудим детали в удобное для вас время.',
];

type Step = 1 | 2 | 'done';

export function InviteModal({
  open, onClose, resume, vacancies, onSent,
}: {
  open: boolean; onClose: () => void; resume: Resume | null; vacancies: Vacancy[]; onSent?: () => void;
}) {
  const [step, setStep] = useState<Step>(1);
  const [vacancyId, setVacancyId] = useState('');
  const [message, setMessage] = useState('');
  const len = message.length;

  const reset = () => { setStep(1); setVacancyId(''); setMessage(''); };
  const handleClose = () => { onClose(); reset(); };

  const activeVacancies = vacancies.filter(v => v.status === 'active');
  const selectedVacancy = activeVacancies.find(v => v.id === vacancyId) ?? null;
  const shortName = resume?.fullName.split(' ').slice(0, 2).join(' ') ?? '';

  // Done state
  if (step === 'done') return (
    <Modal open={open} onClose={handleClose} title="Приглашение отправлено">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-slate-800 font-semibold text-base mb-1">Приглашение отправлено!</div>
        {selectedVacancy && (
          <div className="text-sm text-slate-500 mb-1">Вакансия: <span className="font-medium">{selectedVacancy.title}</span></div>
        )}
        <div className="text-sm text-slate-500 mb-6">Кандидат получит уведомление и сможет ответить.</div>
        <div className="flex gap-2 justify-center">
          <Btn variant="secondary" onClick={handleClose}>Закрыть</Btn>
          <Btn variant="primary" onClick={() => { reset(); }}>Пригласить ещё</Btn>
        </div>
      </div>
    </Modal>
  );

  // Step 1 — pick vacancy
  if (step === 1) return (
    <Modal open={open} onClose={handleClose} title={`Пригласить: ${shortName}`} size="md">
      <div className="mb-4">
        <div className="flex items-center gap-3 mb-4 p-3 bg-slate-50 rounded-xl">
          <Avatar src={resume?.photo} name={resume?.fullName} size="sm" />
          <div>
            <div className="font-semibold text-slate-800 text-sm">{resume?.fullName}</div>
            <div className="text-xs text-slate-500">{resume?.position} · {resume?.city}</div>
          </div>
        </div>

        <div className="text-sm font-medium text-slate-700 mb-3">
          Выберите вакансию <span className="text-red-500">*</span>
          <span className="text-xs text-slate-400 font-normal ml-2">активных: {activeVacancies.length}</span>
        </div>

        {activeVacancies.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm">
            Нет активных вакансий. Создайте вакансию в разделе «Вакансии».
          </div>
        ) : (
          <div className="space-y-2 max-h-72 overflow-y-auto">
            {activeVacancies.map(v => (
              <label
                key={v.id}
                className={`flex items-start gap-3 p-3 rounded-xl border-2 cursor-pointer transition ${
                  vacancyId === v.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <input
                  type="radio" name="vacancy" value={v.id}
                  checked={vacancyId === v.id}
                  onChange={() => setVacancyId(v.id)}
                  className="mt-0.5 text-blue-600"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-slate-800 text-sm">{v.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">
                    {v.city} · {v.workMode} · {v.salaryFrom.toLocaleString('ru-RU')}–{v.salaryTo.toLocaleString('ru-RU')} ₽
                  </div>
                  {v.department && <div className="text-xs text-slate-400">{v.department}</div>}
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <Btn variant="secondary" onClick={handleClose}>Отмена</Btn>
        <Btn variant="primary" disabled={!vacancyId} onClick={() => setStep(2)}>
          Далее →
        </Btn>
      </div>
    </Modal>
  );

  // Step 2 — compose message
  return (
    <Modal open={open} onClose={handleClose} title="Сообщение кандидату" size="md">
      {/* Selected vacancy chip */}
      {selectedVacancy && (
        <div className="flex items-center justify-between mb-4 px-3 py-2 bg-blue-50 rounded-lg">
          <div>
            <div className="text-xs text-blue-500 font-medium">Вакансия</div>
            <div className="text-sm font-semibold text-blue-800">{selectedVacancy.title}</div>
          </div>
          <button onClick={() => setStep(1)} className="text-xs text-blue-500 hover:text-blue-700 underline">
            Изменить
          </button>
        </div>
      )}

      <div className="mb-2">
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Сообщение <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {TEMPLATES.map((t, i) => (
            <button
              key={i} onClick={() => setMessage(t)}
              className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-700 transition"
            >
              Шаблон {i + 1}
            </button>
          ))}
        </div>
        <textarea
          value={message} onChange={e => setMessage(e.target.value)} rows={5}
          placeholder="Введите сопроводительное сообщение..."
          className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          autoFocus
        />
        <div className={`text-xs mt-1 text-right ${len < 10 && len > 0 ? 'text-red-500' : len > 2000 ? 'text-red-500' : 'text-slate-400'}`}>
          {len < 10 && len > 0 ? `Минимум 10 символов (ещё ${10 - len})` : `${len} / 2000`}
        </div>
      </div>

      <div className="flex justify-between gap-2 pt-3 border-t border-slate-100">
        <Btn variant="ghost" onClick={() => setStep(1)}>← Назад</Btn>
        <div className="flex gap-2">
          <Btn variant="secondary" onClick={handleClose}>Отмена</Btn>
          <Btn variant="primary" disabled={len < 10 || len > 2000} onClick={async () => {
            if (resume) {
              const res = await fetch('/api/invitations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ resumeId: resume.id, vacancyId, message }),
              }).catch(() => null);
              // 409 = already invited — treat as success
              if (res && !res.ok && res.status !== 409) return;
              onSent?.();
            }
            setStep('done');
          }}>
            Отправить приглашение
          </Btn>
        </div>
      </div>
    </Modal>
  );
}

// ── MessageModal ────────────────────────────────────────────────────────────
export function MessageModal({
  open, onClose, resume,
}: {
  open: boolean; onClose: () => void; resume: Resume | null;
}) {
  const [text, setText] = useState('');
  const [sent, setSent] = useState(false);
  const len = text.length;

  const handleClose = () => { onClose(); setSent(false); setText(''); };

  if (sent) return (
    <Modal open={open} onClose={handleClose} title="Сообщение отправлено">
      <div className="text-center py-6">
        <div className="w-14 h-14 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-7 h-7 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <div className="text-slate-800 font-semibold mb-1">Сообщение отправлено</div>
        <div className="text-slate-500 text-sm mb-5">Кандидат получит уведомление.</div>
        <Btn variant="primary" onClick={handleClose}>Закрыть</Btn>
      </div>
    </Modal>
  );

  const shortName = resume?.fullName.split(' ').slice(0, 2).join(' ') ?? '';

  return (
    <Modal open={open} onClose={handleClose} title={`Написать: ${shortName}`} size="md">
      <textarea
        value={text} onChange={e => setText(e.target.value)} rows={5}
        placeholder="Введите сообщение кандидату..."
        className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none mb-2"
        autoFocus
      />
      <div className={`text-xs text-right mb-3 ${len < 10 && len > 0 ? 'text-red-500' : 'text-slate-400'}`}>
        {len < 10 && len > 0 ? `Слишком коротко (мин. 10)` : `${len} / 2000`}
      </div>
      <div className="flex justify-end gap-2">
        <Btn variant="secondary" onClick={handleClose}>Отмена</Btn>
        <Btn variant="primary" disabled={len < 10 || len > 2000} onClick={async () => {
        if (resume) {
          await fetch('/api/messages', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeId: resume.id, text }),
          }).catch(() => {});
        }
        setSent(true);
      }}>Отправить</Btn>
      </div>
    </Modal>
  );
}

// ── ResumeDetail ────────────────────────────────────────────────────────────
export function ResumeDetail({
  resume, vacancies, onBack,
}: {
  resume: Resume | null; vacancies: Vacancy[]; onBack: () => void; onInvite: (r: Resume) => void;
}) {
  const [msgOpen, setMsgOpen] = useState(false);
  const [invOpen, setInvOpen] = useState(false);

  if (!resume) return null;
  const confirmedStatuses = resume.specialStatuses.filter(s => s.confirmed);
  const hasSVO = confirmedStatuses.length > 0;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <MessageModal open={msgOpen} onClose={() => setMsgOpen(false)} resume={resume} />
      <InviteModal open={invOpen} onClose={() => setInvOpen(false)} resume={resume} vacancies={vacancies} />

      <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition mb-5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Назад к реестру
      </button>

      {/* Summary bar */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 mb-5">
        <div className="flex items-start gap-5">
          <Avatar src={resume.photo} name={resume.fullName} size="xl" />
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-xl font-bold text-slate-800">{resume.fullName}</h1>
                <div className="text-blue-600 font-semibold mt-0.5">{resume.position}</div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-500">
                  <span className="flex items-center gap-1">
                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {resume.city}, {resume.region}
                  </span>
                  <span>{resume.age} лет</span>
                  <span>{resume.gender === 'male' ? 'Мужской' : 'Женский'}</span>
                  <span>{resume.education}</span>
                </div>
                {hasSVO && (
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {confirmedStatuses.map(s => (
                      <span key={s.value} className="inline-flex items-center gap-1.5 px-3 py-1 bg-cyan-50 text-cyan-700 text-xs font-semibold rounded-full ring-1 ring-cyan-200">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        {s.label}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2 flex-shrink-0">
                <Btn
                  variant="cyan" onClick={() => setInvOpen(true)}
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>}
                >
                  Пригласить
                </Btn>
                <Btn
                  variant="secondary" onClick={() => setMsgOpen(true)}
                  icon={<svg fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>}
                >
                  Написать
                </Btn>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left */}
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Ключевые данные</h3>
            <div className="space-y-2.5">
              {[
                { label: 'Зарплата', value: fmtSalary(resume.salary), icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg> },
                { label: 'Опыт', value: fmtExp(resume.experience), icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg> },
                { label: 'Режим', value: resume.workMode, icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg> },
                { label: 'Опубликовано', value: fmtDate(resume.publishedAt), icon: <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0zM15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg> },
              ].map(row => (
                <div key={row.label} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-500 flex items-center gap-1.5">{row.icon}{row.label}</span>
                  <span className="text-sm font-semibold text-slate-700 text-right">{row.value}</span>
                </div>
              ))}
            </div>
          </div>

          {resume.tests.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Сданные тесты</h3>
              <div className="flex flex-wrap gap-1.5">
                {resume.tests.map(t => <Badge key={t.value} color="blue">{t.label}</Badge>)}
              </div>
            </div>
          )}

          {resume.activityAreas.length > 0 && (
            <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
              <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-3">Сферы деятельности</h3>
              <div className="flex flex-wrap gap-1.5">
                {resume.activityAreas.map(a => <Badge key={a} color="slate">{a}</Badge>)}
              </div>
            </div>
          )}

          <div className="text-xs text-slate-400 text-center">{resume.id}</div>
        </div>

        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-4">Опыт работы</h3>
            <div className="space-y-4">
              {resume.workExperiences.map((exp, i) => (
                <div key={exp.id} className={`relative pl-4 ${i < resume.workExperiences.length - 1 ? 'pb-4 border-b border-slate-100' : ''}`}>
                  <div className="absolute left-0 top-1.5 w-2 h-2 rounded-full bg-blue-400" />
                  <div className="text-xs text-slate-400 mb-0.5">{exp.from} — {exp.to}</div>
                  <div className="font-semibold text-slate-800 text-sm">{exp.role}</div>
                  <div className="text-sm text-blue-600 mb-1">{exp.company}</div>
                  <div className="text-xs text-slate-500 leading-relaxed">{exp.description}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-5">
            <h3 className="text-sm font-semibold text-slate-800 mb-3">О себе</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{resume.about}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
