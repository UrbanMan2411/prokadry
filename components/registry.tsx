'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import type { Resume, Vacancy } from '@/lib/types';
import { DICTIONARIES, RESUMES } from '@/lib/mock-data';
import { fmtSalary, fmtDate, fmtExp } from '@/lib/utils';
import { Badge, Btn, Avatar, StarBtn, EmptyState, Modal } from './ui';

// ── Debounce hook ───────────────────────────────────────────────────────────
function useDebounce(value: string, delay: number) {
  const [deb, setDeb] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDeb(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return deb;
}

// ── Filter state ────────────────────────────────────────────────────────────
interface Filters {
  region: string;
  position: string;
  test: string;
  activityArea: string;
  specialStatus: string;
  workMode: string;
  education: string;
  gender: string;
  salaryFrom: string;
  salaryTo: string;
  expMin: string;
  ageFrom: string;
  ageTo: string;
  onlyPhoto: boolean;
  onlyFavorites: boolean;
}

const EMPTY: Filters = {
  region: '', position: '', test: '', activityArea: '', specialStatus: '',
  workMode: '', education: '', gender: '', salaryFrom: '', salaryTo: '',
  expMin: '', ageFrom: '', ageTo: '', onlyPhoto: false, onlyFavorites: false,
};

type SortKey = 'publishedAt' | 'salary' | 'experience' | 'age';
type SortDir = 'asc' | 'desc';

// ── FilterSidebar ───────────────────────────────────────────────────────────
function FilterSection({ title, children, defaultOpen = true }: {
  title: string; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-b border-slate-100 last:border-0">
      <button
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-2.5 text-xs font-semibold text-slate-600 uppercase tracking-wide hover:text-slate-800 transition"
      >
        {title}
        <svg className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && <div className="pb-3 space-y-1.5">{children}</div>}
    </div>
  );
}

function ChipGroup({ options, value, onChange }: {
  options: string[]; value: string; onChange: (v: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {options.map(o => (
        <button
          key={o}
          onClick={() => onChange(value === o ? '' : o)}
          className={`px-2 py-0.5 rounded-full text-xs font-medium transition ${value === o
            ? 'bg-blue-600 text-white'
            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function CheckList({ options, value, onChange, groupName }: {
  options: string[]; value: string; onChange: (v: string) => void; groupName: string;
}) {
  return (
    <div className="space-y-1">
      {options.map(o => (
        <label key={o} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="radio" name={groupName} checked={value === o}
            onChange={() => onChange(value === o ? '' : o)}
            className="text-blue-600 border-slate-300"
          />
          <span className="text-xs text-slate-600 group-hover:text-slate-800 transition leading-tight">{o}</span>
        </label>
      ))}
    </div>
  );
}

function RangeInputs({ labelFrom, labelTo, valueFrom, valueTo, onFrom, onTo, placeholder }: {
  labelFrom: string; labelTo: string; valueFrom: string; valueTo: string;
  onFrom: (v: string) => void; onTo: (v: string) => void; placeholder?: [string, string];
}) {
  return (
    <div className="flex gap-1.5 items-center">
      <input
        type="number" value={valueFrom} onChange={e => onFrom(e.target.value)}
        placeholder={placeholder?.[0] ?? 'От'}
        className="w-full rounded-md border border-slate-200 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
      <span className="text-slate-300 flex-shrink-0">—</span>
      <input
        type="number" value={valueTo} onChange={e => onTo(e.target.value)}
        placeholder={placeholder?.[1] ?? 'До'}
        className="w-full rounded-md border border-slate-200 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
      />
    </div>
  );
}

function FilterSidebar({ filters, onChange, onReset, activeCount, open, onClose }: {
  filters: Filters;
  onChange: <K extends keyof Filters>(k: K, v: Filters[K]) => void;
  onReset: () => void;
  activeCount: number;
  open: boolean;
  onClose: () => void;
}) {
  const regions = [...new Set(RESUMES.map(r => r.region))].sort();

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className={`fixed inset-0 bg-black/40 z-30 transition-opacity duration-200 md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      <aside className={`fixed inset-y-0 left-0 z-40 w-72 flex flex-col bg-white overflow-y-auto shadow-xl transition-transform duration-200 ease-in-out md:relative md:w-56 md:translate-x-0 md:z-auto md:shadow-none md:border-r md:border-slate-100 md:flex-shrink-0 ${open ? 'translate-x-0' : '-translate-x-full'}`}>
      <div className="px-4 pt-4 pb-3 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
        <span className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          Фильтры
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">{activeCount}</span>
          )}
        </span>
        <div className="flex items-center gap-2">
          {activeCount > 0 && (
            <button onClick={onReset} className="text-[11px] text-blue-600 hover:text-blue-800 transition font-medium">
              Сбросить
            </button>
          )}
          <button
            onClick={onClose}
            className="md:hidden p-1 rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
            aria-label="Закрыть фильтры"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 py-3 space-y-0">
        <FilterSection title="Регион">
          <select
            value={filters.region}
            onChange={e => onChange('region', e.target.value)}
            className="w-full rounded-md border border-slate-200 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Все регионы</option>
            {regions.map(r => <option key={r} value={r}>{r}</option>)}
          </select>
        </FilterSection>

        <FilterSection title="Должность">
          <select
            value={filters.position}
            onChange={e => onChange('position', e.target.value)}
            className="w-full rounded-md border border-slate-200 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 bg-white"
          >
            <option value="">Любая</option>
            {DICTIONARIES.positions.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </FilterSection>

        <FilterSection title="Зарплата, ₽">
          <RangeInputs
            labelFrom="от" labelTo="до"
            valueFrom={filters.salaryFrom} valueTo={filters.salaryTo}
            onFrom={v => onChange('salaryFrom', v)} onTo={v => onChange('salaryTo', v)}
            placeholder={['60 000', '200 000']}
          />
        </FilterSection>

        <FilterSection title="Опыт (лет)">
          <input
            type="number" min={0} max={30}
            value={filters.expMin}
            onChange={e => onChange('expMin', e.target.value)}
            placeholder="Минимум"
            className="w-full rounded-md border border-slate-200 text-xs px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
        </FilterSection>

        <FilterSection title="Тесты">
          <CheckList groupName="filter-test" options={DICTIONARIES.tests} value={filters.test} onChange={v => onChange('test', v)} />
        </FilterSection>

        <FilterSection title="Режим работы">
          <ChipGroup options={DICTIONARIES.workModes} value={filters.workMode} onChange={v => onChange('workMode', v)} />
        </FilterSection>

        <FilterSection title="Сфера деятельности">
          <CheckList groupName="filter-area" options={DICTIONARIES.activityAreas} value={filters.activityArea} onChange={v => onChange('activityArea', v)} />
        </FilterSection>

        <FilterSection title="Особый статус">
          <CheckList groupName="filter-status" options={DICTIONARIES.specialStatuses} value={filters.specialStatus} onChange={v => onChange('specialStatus', v)} />
        </FilterSection>

        <FilterSection title="Образование">
          <CheckList groupName="filter-edu" options={DICTIONARIES.educations} value={filters.education} onChange={v => onChange('education', v)} />
        </FilterSection>

        <FilterSection title="Пол" defaultOpen={false}>
          <ChipGroup
            options={['Мужской', 'Женский']}
            value={filters.gender === 'male' ? 'Мужской' : filters.gender === 'female' ? 'Женский' : ''}
            onChange={v => onChange('gender', v === 'Мужской' ? 'male' : v === 'Женский' ? 'female' : '')}
          />
        </FilterSection>

        <FilterSection title="Возраст" defaultOpen={false}>
          <RangeInputs
            labelFrom="от" labelTo="до"
            valueFrom={filters.ageFrom} valueTo={filters.ageTo}
            onFrom={v => onChange('ageFrom', v)} onTo={v => onChange('ageTo', v)}
            placeholder={['22', '60']}
          />
        </FilterSection>

        <div className="pt-2 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={filters.onlyPhoto}
              onChange={e => onChange('onlyPhoto', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-600">Только с фото</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox" checked={filters.onlyFavorites}
              onChange={e => onChange('onlyFavorites', e.target.checked)}
              className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5"
            />
            <span className="text-xs text-slate-600">Только избранное</span>
          </label>
        </div>
      </div>
      </aside>
    </>
  );
}

// ── Sort header cell ────────────────────────────────────────────────────────
function SortTh({ label, sortKey, currentKey, dir, onSort }: {
  label: string; sortKey: SortKey; currentKey: SortKey; dir: SortDir;
  onSort: (k: SortKey) => void;
}) {
  const active = sortKey === currentKey;
  return (
    <th
      className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap cursor-pointer select-none hover:text-slate-700 transition"
      onClick={() => onSort(sortKey)}
    >
      <span className="flex items-center gap-1">
        {label}
        <span className={`${active ? 'text-blue-500' : 'text-slate-300'}`}>
          {active && dir === 'desc' ? '↓' : active && dir === 'asc' ? '↑' : '↕'}
        </span>
      </span>
    </th>
  );
}

// ── Expandable table row ────────────────────────────────────────────────────
function ResumeRow({ resume, expanded, onExpand, onOpen, onInvite, onToggleFav, selected, onSelect }: {
  resume: Resume; expanded: boolean; onExpand: () => void;
  onOpen: (r: Resume) => void; onInvite: (r: Resume) => void;
  onToggleFav: (id: string) => void; selected: boolean; onSelect: () => void;
}) {
  const hasSVO = resume.specialStatuses.length > 0;
  const salaryColor = resume.salary
    ? resume.salary >= 100000 ? 'text-emerald-700 font-semibold' : 'text-slate-700'
    : 'text-slate-300';

  return (
    <>
      <tr
        className={`transition-colors cursor-pointer group ${expanded ? 'bg-blue-50/60' : 'hover:bg-slate-50'}`}
        onClick={onExpand}
      >
        <td className="pl-3 pr-1 py-2.5" onClick={e => e.stopPropagation()}>
          <input
            type="checkbox" checked={selected} onChange={onSelect}
            className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5 cursor-pointer"
          />
        </td>
        <td className="px-2 py-2.5"><Avatar src={resume.photo} name={resume.fullName} size="sm" /></td>
        <td className="px-3 py-2.5 min-w-[160px]">
          <div className="font-semibold text-slate-800 text-sm leading-tight">{resume.position}</div>
          <div className="text-[11px] text-slate-400 mt-0.5">{resume.fullName.split(' ').slice(0, 2).join(' ')}</div>
        </td>
        <td className="px-3 py-2.5 whitespace-nowrap">
          <div className="text-xs text-slate-700 font-medium">{resume.city}</div>
          <div className="text-[11px] text-slate-400">{resume.age} л. · {resume.gender === 'male' ? 'М' : 'Ж'}</div>
        </td>
        <td className={`px-3 py-2.5 whitespace-nowrap text-sm ${salaryColor}`}>{fmtSalary(resume.salary)}</td>
        <td className="px-3 py-2.5 text-sm text-slate-600 whitespace-nowrap">{fmtExp(resume.experience)}</td>
        <td className="px-3 py-2.5">
          <div className="flex flex-wrap gap-0.5 max-w-[120px]">
            {resume.tests.slice(0, 2).map(t => (
              <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded ring-1 ring-blue-100">{t}</span>
            ))}
            {hasSVO && (
              <span className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-medium rounded ring-1 ring-cyan-100">СВО</span>
            )}
            {resume.activityAreas.slice(0, 1).map(a => (
              <span key={a} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded ring-1 ring-slate-200 max-w-[80px] truncate">{a}</span>
            ))}
            {(resume.activityAreas.length - 1) > 0 && (
              <span className="px-1.5 py-0.5 bg-slate-100 text-slate-400 text-[10px] rounded">+{resume.activityAreas.length - 1}</span>
            )}
          </div>
        </td>
        <td className="px-3 py-2.5 text-[11px] text-slate-400 whitespace-nowrap">{fmtDate(resume.publishedAt)}</td>
        <td className="px-2 py-2.5" onClick={e => e.stopPropagation()}>
          <StarBtn active={resume.isFavorite} onToggle={() => onToggleFav(resume.id)} />
        </td>
        <td className="px-3 py-2.5" onClick={e => e.stopPropagation()}>
          <div className="flex items-center gap-1">
            <button
              onClick={() => onOpen(resume)}
              className="p-1.5 rounded-md text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition"
              title="Открыть резюме"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </button>
            <button
              onClick={() => onInvite(resume)}
              className="p-1.5 rounded-md text-slate-400 hover:text-cyan-600 hover:bg-cyan-50 transition"
              title="Пригласить"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </td>
      </tr>

      {/* Inline expanded preview */}
      {expanded && (
        <tr className="bg-blue-50/40">
          <td colSpan={10} className="px-4 pb-4 pt-1">
            <div className="grid grid-cols-3 gap-5 text-sm">
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">О себе</div>
                <p className="text-slate-600 text-xs leading-relaxed line-clamp-3">{resume.about}</p>
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Последнее место работы</div>
                {resume.workExperiences[0] && (
                  <div>
                    <div className="font-semibold text-slate-800 text-xs">{resume.workExperiences[0].role}</div>
                    <div className="text-blue-600 text-xs">{resume.workExperiences[0].company}</div>
                    <div className="text-slate-400 text-[11px] mt-0.5">{resume.workExperiences[0].from} — {resume.workExperiences[0].to}</div>
                  </div>
                )}
              </div>
              <div>
                <div className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide mb-1.5">Детали</div>
                <div className="space-y-1 text-xs text-slate-600">
                  <div className="flex justify-between"><span>Образование</span><span className="text-slate-800 font-medium">{resume.education}</span></div>
                  <div className="flex justify-between"><span>Режим работы</span><span className="text-slate-800 font-medium">{resume.workMode}</span></div>
                  <div className="flex justify-between"><span>Регион</span><span className="text-slate-800 font-medium text-right max-w-[120px] truncate">{resume.region}</span></div>
                </div>
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => onOpen(resume)}
                    className="text-xs font-medium text-blue-600 hover:text-blue-800 transition"
                  >
                    Полное резюме →
                  </button>
                  <button
                    onClick={() => onInvite(resume)}
                    className="text-xs font-medium px-2.5 py-1 bg-cyan-500 text-white rounded-lg hover:bg-cyan-600 transition"
                  >
                    Пригласить
                  </button>
                </div>
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ── Skeleton loading ────────────────────────────────────────────────────────
function SkeletonRows() {
  return (
    <>
      {Array.from({ length: 6 }).map((_, i) => (
        <tr key={i} className="border-b border-slate-100">
          {[3, 8, 24, 14, 10, 8, 18, 10, 4, 6].map((w, j) => (
            <td key={j} className="px-3 py-3">
              <div className={`h-3 bg-slate-200 rounded animate-pulse w-${w}`} style={{ width: `${w * 6}px` }} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}

// ── Resume Cards view ───────────────────────────────────────────────────────
function ResumeCards({ resumes, onOpen, onInvite, onToggleFav }: {
  resumes: Resume[]; onOpen: (r: Resume) => void; onInvite: (r: Resume) => void; onToggleFav: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
      {resumes.map(r => (
        <div
          key={r.id}
          className="bg-white rounded-xl border border-slate-100 p-4 shadow-sm hover:shadow-md hover:border-blue-200 transition-all"
        >
          <div className="flex items-start gap-3 mb-3">
            <Avatar src={r.photo} name={r.fullName} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-slate-800 text-sm leading-tight line-clamp-2">{r.position}</div>
              <div className="text-xs text-slate-400 mt-0.5">{r.fullName.split(' ').slice(0, 2).join(' ')}</div>
              <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
                <svg className="w-3 h-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                {r.city} · {r.age} л.
              </div>
            </div>
            <StarBtn active={r.isFavorite} onToggle={() => onToggleFav(r.id)} />
          </div>

          <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-3">{r.about}</p>

          <div className="flex flex-wrap gap-1 mb-3">
            {r.tests.map(t => <span key={t} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded ring-1 ring-blue-100">{t}</span>)}
            {r.specialStatuses.map(s => <span key={s} className="px-1.5 py-0.5 bg-cyan-50 text-cyan-700 text-[10px] font-medium rounded ring-1 ring-cyan-100">{s}</span>)}
            {r.activityAreas.slice(0, 2).map(a => <span key={a} className="px-1.5 py-0.5 bg-slate-100 text-slate-600 text-[10px] font-medium rounded">{a}</span>)}
          </div>

          <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 mb-3">
            <span className={`text-sm font-semibold ${r.salary ? (r.salary >= 100000 ? 'text-emerald-700' : 'text-slate-800') : 'text-slate-300'}`}>
              {fmtSalary(r.salary)}
            </span>
            <span className="text-xs text-slate-400">{fmtExp(r.experience)}</span>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onOpen(r)}
              className="flex-1 text-xs font-medium py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition"
            >
              Открыть
            </button>
            <button
              onClick={() => onInvite(r)}
              className="flex-1 text-xs font-medium py-1.5 rounded-lg bg-cyan-500 text-white hover:bg-cyan-600 transition"
            >
              Пригласить
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Batch action bar ────────────────────────────────────────────────────────
function BatchBar({ count, onInviteAll, onFavAll, onClear }: {
  count: number; onInviteAll: () => void; onFavAll: () => void; onClear: () => void;
}) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 flex items-center gap-3 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl">
      <span className="text-sm font-medium">Выбрано: {count}</span>
      <div className="w-px h-4 bg-slate-700" />
      <button onClick={onFavAll} className="text-sm text-slate-300 hover:text-amber-400 transition flex items-center gap-1.5">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
        В избранное
      </button>
      <button onClick={onInviteAll} className="text-sm bg-cyan-500 hover:bg-cyan-400 transition px-3 py-1.5 rounded-lg font-medium">
        Пригласить всех
      </button>
      <button onClick={onClear} className="text-slate-500 hover:text-slate-300 transition">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

// ── Bulk Invite Modal ───────────────────────────────────────────────────────
const BULK_TEMPLATES = [
  'Добрый день! Мы рассмотрели ваше резюме и хотели бы пригласить вас на собеседование.',
  'Здравствуйте! Ваш опыт полностью соответствует нашим требованиям. Готовы предложить конкурентные условия.',
  'Добрый день! Приглашаем рассмотреть нашу вакансию. Обсудим детали в удобное для вас время.',
];

function BulkInviteModal({ open, onClose, resumes, vacancies }: {
  open: boolean; onClose: () => void; resumes: Resume[]; vacancies: Vacancy[];
}) {
  const [done, setDone] = useState(false);
  const [vacancyId, setVacancyId] = useState('');
  const [message, setMessage] = useState('');
  const activeVacancies = vacancies.filter(v => v.status === 'active');
  const len = message.length;

  const reset = () => { setDone(false); setVacancyId(''); setMessage(''); };
  const handleClose = () => { onClose(); reset(); };

  if (done) return (
    <Modal open={open} onClose={handleClose} title="Приглашения отправлены">
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div className="text-slate-800 font-semibold text-base mb-1">{resumes.length} приглашений отправлено</div>
        <div className="text-sm text-slate-500 mb-6">Кандидаты получат уведомления и смогут ответить.</div>
        <Btn variant="primary" onClick={handleClose}>Закрыть</Btn>
      </div>
    </Modal>
  );

  return (
    <Modal open={open} onClose={handleClose} title={`Пригласить ${resumes.length} кандидатов`} size="md">
      <div className="mb-4">
        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">
          Кандидаты ({resumes.length})
        </div>
        <div className="max-h-28 overflow-y-auto space-y-1 bg-slate-50 rounded-lg p-2">
          {resumes.map(r => (
            <div key={r.id} className="flex items-center gap-2 text-xs text-slate-700">
              <Avatar name={r.fullName} size="sm" />
              <span className="font-medium">{r.fullName.split(' ').slice(0, 2).join(' ')}</span>
              <span className="text-slate-400 truncate">· {r.position}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <div className="text-sm font-medium text-slate-700 mb-2">
          Вакансия <span className="text-red-500">*</span>
          <span className="text-xs text-slate-400 font-normal ml-2">активных: {activeVacancies.length}</span>
        </div>
        {activeVacancies.length === 0 ? (
          <div className="text-sm text-slate-400 py-3 text-center">Нет активных вакансий.</div>
        ) : (
          <div className="space-y-1.5 max-h-44 overflow-y-auto">
            {activeVacancies.map(v => (
              <label
                key={v.id}
                className={`flex items-center gap-3 p-2.5 rounded-xl border-2 cursor-pointer transition ${
                  vacancyId === v.id ? 'border-blue-500 bg-blue-50' : 'border-slate-100 hover:border-slate-300 bg-white'
                }`}
              >
                <input type="radio" name="bulk-vacancy" checked={vacancyId === v.id} onChange={() => setVacancyId(v.id)} className="text-blue-600" />
                <div>
                  <div className="text-sm font-semibold text-slate-800">{v.title}</div>
                  <div className="text-xs text-slate-500">{v.city} · {v.workMode}</div>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      <div className="mb-4">
        <label className="text-sm font-medium text-slate-700 mb-2 block">
          Сообщение <span className="text-red-500">*</span>
        </label>
        <div className="flex flex-wrap gap-1.5 mb-2">
          {BULK_TEMPLATES.map((t, i) => (
            <button
              key={i} onClick={() => setMessage(t)}
              className="text-xs px-2.5 py-1 bg-slate-100 text-slate-600 rounded-full hover:bg-blue-50 hover:text-blue-700 transition"
            >
              Шаблон {i + 1}
            </button>
          ))}
        </div>
        <textarea
          value={message} onChange={e => setMessage(e.target.value)} rows={4}
          placeholder="Введите сопроводительное сообщение..."
          className="w-full rounded-xl border border-slate-200 text-sm text-slate-800 placeholder-slate-400 px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
        />
        <div className={`text-xs mt-1 text-right ${len > 0 && len < 10 ? 'text-red-500' : 'text-slate-400'}`}>
          {len > 0 && len < 10 ? `Ещё ${10 - len} символов` : `${len} / 2000`}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
        <Btn variant="secondary" onClick={handleClose}>Отмена</Btn>
        <Btn variant="primary" disabled={!vacancyId || len < 10 || len > 2000} onClick={() => setDone(true)}>
          Отправить {resumes.length} приглашений
        </Btn>
      </div>
    </Modal>
  );
}

// ── Main Registry ───────────────────────────────────────────────────────────
export function ResumeRegistry({
  resumes, setResumes, vacancies, onOpenResume, onInvite, presetQuery,
}: {
  resumes: Resume[]; setResumes: (fn: (prev: Resume[]) => Resume[]) => void;
  vacancies: Vacancy[]; onOpenResume: (r: Resume) => void; onInvite: (r: Resume) => void;
  presetQuery?: string;
}) {
  const [query, setQuery] = useState(presetQuery ?? '');
  const [viewMode, setViewMode] = useState<'table' | 'cards'>('table');
  const [filterOpen, setFilterOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>(EMPTY);
  const [sortKey, setSortKey] = useState<SortKey>('publishedAt');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [loading] = useState(false);
  const [bulkInviteOpen, setBulkInviteOpen] = useState(false);
  const [bulkResumes, setBulkResumes] = useState<Resume[]>([]);

  useEffect(() => { if (presetQuery) setQuery(presetQuery); }, [presetQuery]);
  const debouncedQuery = useDebounce(query, 280);

  const updateFilter = useCallback(<K extends keyof Filters>(k: K, v: Filters[K]) => {
    setFilters(f => ({ ...f, [k]: v }));
    setSelected(new Set());
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY);
    setSelected(new Set());
  }, []);

  const activeCount = Object.entries(filters).filter(([, v]) => v !== '' && v !== false).length;

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  };

  const filtered = resumes.filter(r => {
    if (filters.onlyFavorites && !r.isFavorite) return false;
    if (filters.onlyPhoto && !r.hasPhoto) return false;
    if (filters.region && r.region !== filters.region) return false;
    if (filters.position && r.position !== filters.position) return false;
    if (filters.specialStatus && !r.specialStatuses.includes(filters.specialStatus)) return false;
    if (filters.test && !r.tests.includes(filters.test)) return false;
    if (filters.activityArea && !r.activityAreas.includes(filters.activityArea)) return false;
    if (filters.salaryFrom && r.salary != null && r.salary < parseInt(filters.salaryFrom)) return false;
    if (filters.salaryTo && r.salary != null && r.salary > parseInt(filters.salaryTo)) return false;
    if (filters.expMin && r.experience < parseInt(filters.expMin)) return false;
    if (filters.workMode && r.workMode !== filters.workMode) return false;
    if (filters.ageFrom && r.age < parseInt(filters.ageFrom)) return false;
    if (filters.ageTo && r.age > parseInt(filters.ageTo)) return false;
    if (filters.gender && r.gender !== filters.gender) return false;
    if (filters.education && r.education !== filters.education) return false;
    if (debouncedQuery) {
      const q = debouncedQuery.toLowerCase();
      const hay = [r.position, r.about, ...r.activityAreas, r.city, r.fullName].join(' ').toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const sorted = [...filtered].sort((a, b) => {
    let va: number, vb: number;
    if (sortKey === 'salary') { va = a.salary ?? 0; vb = b.salary ?? 0; }
    else if (sortKey === 'experience') { va = a.experience; vb = b.experience; }
    else if (sortKey === 'age') { va = a.age; vb = b.age; }
    else { va = new Date(a.publishedAt).getTime(); vb = new Date(b.publishedAt).getTime(); }
    return sortDir === 'asc' ? va - vb : vb - va;
  });

  const toggleFav = (id: string) =>
    setResumes(prev => prev.map(r => r.id === id ? { ...r, isFavorite: !r.isFavorite } : r));

  const toggleSelect = (id: string) =>
    setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const toggleAll = () =>
    setSelected(s => s.size === sorted.length ? new Set() : new Set(sorted.map(r => r.id)));

  const bulkFav = () => {
    setResumes(prev => prev.map(r => selected.has(r.id) ? { ...r, isFavorite: true } : r));
    setSelected(new Set());
  };

  return (
    <div className="flex h-full">
      <BulkInviteModal
        open={bulkInviteOpen}
        onClose={() => { setBulkInviteOpen(false); setSelected(new Set()); }}
        resumes={bulkResumes}
        vacancies={vacancies}
      />
      <FilterSidebar filters={filters} onChange={updateFilter} onReset={resetFilters} activeCount={activeCount} open={filterOpen} onClose={() => setFilterOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-2 md:gap-3 px-3 md:px-5 py-3 border-b border-slate-100 bg-white sticky top-0 z-20">
          {/* Mobile filter button */}
          <button
            onClick={() => setFilterOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50 transition flex-shrink-0"
            aria-label="Открыть фильтры"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
            </svg>
            Фильтры
            {activeCount > 0 && (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold">{activeCount}</span>
            )}
          </button>
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              placeholder="Должность, город, ключевые слова..."
              className="w-full pl-9 pr-8 py-1.5 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                ✕
              </button>
            )}
          </div>

          <span className="text-sm text-slate-500 whitespace-nowrap">
            <span className="font-semibold text-slate-800">{sorted.length}</span> / {resumes.length}
          </span>

          <div className="ml-auto flex items-center gap-2">
            {/* View toggle */}
            <div className="flex rounded-lg border border-slate-200 overflow-hidden">
              <button
                onClick={() => setViewMode('table')}
                aria-label="Режим таблицы"
                aria-pressed={viewMode === 'table'}
                className={`p-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${viewMode === 'table' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18M10 6v12M14 6v12M3 6h18M3 18h18" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('cards')}
                aria-label="Режим карточек"
                aria-pressed={viewMode === 'cards'}
                className={`p-2 transition border-l border-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${viewMode === 'cards' ? 'bg-blue-50 text-blue-600' : 'text-slate-400 hover:bg-slate-50'}`}
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto">
          {sorted.length === 0 && !loading ? (
            <EmptyState
              icon="🔍" title="Ничего не найдено"
              description={activeCount > 0 ? 'Попробуйте изменить фильтры' : 'Реестр пуст'}
              action={activeCount > 0 ? (
                <button onClick={resetFilters} className="mt-2 text-sm text-blue-600 hover:text-blue-800 font-medium">
                  Сбросить все фильтры
                </button>
              ) : undefined}
            />
          ) : viewMode === 'table' ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10 bg-slate-50 border-b border-slate-200">
                  <tr>
                    <th className="pl-3 pr-1 py-2.5 w-8">
                      <input
                        type="checkbox"
                        checked={selected.size === sorted.length && sorted.length > 0}
                        onChange={toggleAll}
                        className="rounded border-slate-300 text-blue-600 w-3.5 h-3.5 cursor-pointer"
                      />
                    </th>
                    <th className="w-10 px-2 py-2.5" />
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Кандидат</th>
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Город</th>
                    <SortTh label="Зарплата" sortKey="salary" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                    <SortTh label="Опыт" sortKey="experience" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                    <th className="px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Теги</th>
                    <SortTh label="Дата" sortKey="publishedAt" currentKey={sortKey} dir={sortDir} onSort={handleSort} />
                    <th className="w-8" />
                    <th className="w-16 px-3 py-2.5 text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wide">Действия</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {loading ? <SkeletonRows /> : sorted.map(r => (
                    <ResumeRow
                      key={r.id}
                      resume={r}
                      expanded={expandedId === r.id}
                      onExpand={() => setExpandedId(expandedId === r.id ? null : r.id)}
                      onOpen={onOpenResume}
                      onInvite={onInvite}
                      onToggleFav={toggleFav}
                      selected={selected.has(r.id)}
                      onSelect={() => toggleSelect(r.id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-5">
              <ResumeCards resumes={sorted} onOpen={onOpenResume} onInvite={onInvite} onToggleFav={toggleFav} />
            </div>
          )}
        </div>
      </div>

      {selected.size > 0 && (
        <BatchBar
          count={selected.size}
          onInviteAll={() => {
            setBulkResumes(sorted.filter(r => selected.has(r.id)));
            setBulkInviteOpen(true);
          }}
          onFavAll={bulkFav}
          onClear={() => setSelected(new Set())}
        />
      )}
    </div>
  );
}
