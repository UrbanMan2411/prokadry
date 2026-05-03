'use client';

import { useState } from 'react';
import type { RegionStat } from '@/lib/types';
import type { Resume, Vacancy } from '@/lib/types';
import { REGION_STATS } from '@/lib/mock-data';
import { fmtSalary, fmtExp } from '@/lib/utils';

function Bar({ pct, color = 'bg-blue-400' }: { pct: number; color?: string }) {
  return (
    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
      <div className={`h-full ${color} rounded-full transition-all`} style={{ width: `${Math.max(pct, 2)}%` }} />
    </div>
  );
}

type SortKey = keyof RegionStat;

function SortIcon({ col, sortCol, sortDir }: { col: SortKey; sortCol: SortKey; sortDir: 'asc' | 'desc' }) {
  if (sortCol !== col) return <span className="ml-1 text-slate-300 text-xs">↕</span>;
  return <span className="ml-1 text-blue-500 text-xs">{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export function RegionList({ onOpenRegion }: { onOpenRegion: (region: string) => void }) {
  const [search, setSearch] = useState('');
  const [sortCol, setSortCol] = useState<SortKey>('rating');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');

  const handleSort = (col: SortKey) => {
    if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortCol(col); setSortDir('desc'); }
  };

  let data = REGION_STATS;
  if (search) data = data.filter(r =>
    r.name.toLowerCase().includes(search.toLowerCase()) ||
    r.region.toLowerCase().includes(search.toLowerCase())
  );
  data = [...data].sort((a, b) => {
    const av = a[sortCol];
    const bv = b[sortCol];
    const cmp = typeof av === 'string'
      ? (av as string).localeCompare(bv as string, 'ru')
      : (av as number) - (bv as number);
    return sortDir === 'asc' ? cmp : -cmp;
  });

  const maxVac = Math.max(...REGION_STATS.map(r => r.vacanciesCount), 1);
  const maxRes = Math.max(...REGION_STATS.map(r => r.resumesCount), 1);
  const totalVac = REGION_STATS.reduce((s, r) => s + r.vacanciesCount, 0);
  const totalRes = REGION_STATS.reduce((s, r) => s + r.resumesCount, 0);
  const avgSalaryAll = Math.round(REGION_STATS.reduce((s, r) => s + r.avgSalary, 0) / REGION_STATS.length);

  const Th = ({ col, label }: { col: SortKey; label: string }) => (
    <th
      onClick={() => handleSort(col)}
      className="px-4 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide cursor-pointer hover:text-slate-700 select-none whitespace-nowrap"
    >
      {label}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
    </th>
  );

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">Регионы закупок</h1>
        <p className="text-sm text-slate-500 mt-0.5">Статистика рынка труда специалистов по 44-ФЗ и 223-ФЗ</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-slate-800">{REGION_STATS.length}</div>
          <div className="text-xs text-slate-500 mt-0.5">регионов</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{totalVac}</div>
          <div className="text-xs text-slate-500 mt-0.5">активных вакансий</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-cyan-600">{totalRes}</div>
          <div className="text-xs text-slate-500 mt-0.5">активных резюме</div>
        </div>
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{Math.round(avgSalaryAll / 1000)}к ₽</div>
          <div className="text-xs text-slate-500 mt-0.5">средняя зарплата</div>
        </div>
      </div>

      <div className="mb-4">
        <input
          type="text" value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Поиск по городу или региону..."
          className="w-full max-w-sm rounded-lg border border-slate-200 text-sm px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <Th col="region" label="Регион" />
                <Th col="vacanciesCount" label="Вакансии" />
                <Th col="resumesCount" label="Резюме" />
                <Th col="avgSalary" label="Ср. зарплата" />
                <Th col="supplyDemandIndex" label="Индекс с/п" />
                <Th col="rating" label="Рейтинг" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.map(r => (
                <tr
                  key={r.region}
                  onClick={() => onOpenRegion(r.region)}
                  className="hover:bg-blue-50/50 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{r.name}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5 leading-snug max-w-[200px] truncate">{r.region}</div>
                  </td>
                  <td className="px-4 py-3 min-w-[90px]">
                    <div className="font-semibold text-blue-600">{r.vacanciesCount}</div>
                    <Bar pct={(r.vacanciesCount / maxVac) * 100} color="bg-blue-400" />
                  </td>
                  <td className="px-4 py-3 min-w-[90px]">
                    <div className="font-semibold text-cyan-600">{r.resumesCount}</div>
                    <Bar pct={(r.resumesCount / maxRes) * 100} color="bg-cyan-400" />
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">
                    {r.avgSalary.toLocaleString('ru-RU')} ₽
                  </td>
                  <td className="px-4 py-3">
                    <span className={`font-semibold ${r.supplyDemandIndex >= 1 ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {r.supplyDemandIndex.toFixed(2)}
                    </span>
                    <div className="text-[10px] text-slate-400">{r.supplyDemandIndex >= 1 ? 'нехватка' : 'избыток'}</div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <span className="font-semibold text-slate-700">{r.rating}</span>
                      <span className="text-xs text-slate-400">/10</span>
                    </div>
                    <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div
                        className={`h-full rounded-full ${r.rating >= 7 ? 'bg-emerald-400' : r.rating >= 5 ? 'bg-amber-400' : 'bg-red-400'}`}
                        style={{ width: `${r.rating * 10}%` }}
                      />
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {data.length === 0 && (
          <div className="py-12 text-center text-sm text-slate-400">Регионы не найдены</div>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-3">
        Индекс с/п = вакансии / резюме. Значение {'>'}1 означает нехватку специалистов в регионе.
      </p>
    </div>
  );
}

export function RegionDetail({
  regionName, resumes, vacancies, onBack,
}: {
  regionName: string; resumes: Resume[]; vacancies: Vacancy[]; onBack: () => void;
}) {
  const stat = REGION_STATS.find(r => r.region === regionName);
  const regionVacs = vacancies.filter(v => v.region === regionName && v.status === 'active');
  const regionRes = resumes.filter(r => r.region === regionName && r.status === 'active');

  const salaryBuckets = [
    { label: '< 60к', min: 0, max: 60000 },
    { label: '60–80к', min: 60000, max: 80000 },
    { label: '80–100к', min: 80000, max: 100000 },
    { label: '100–150к', min: 100000, max: 150000 },
    { label: '> 150к', min: 150000, max: Infinity },
  ].map(b => ({
    ...b,
    count: regionRes.filter(r => r.salary !== null && r.salary >= b.min && r.salary < b.max).length,
  }));
  const maxBucket = Math.max(...salaryBuckets.map(b => b.count), 1);

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-800 font-medium mb-5 transition"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Назад к регионам
      </button>

      <div className="mb-6">
        <h1 className="text-xl font-bold text-slate-800">{regionName}</h1>
        <p className="text-sm text-slate-500 mt-0.5">Рынок труда в сфере государственных закупок</p>
      </div>

      {stat && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'вакансий', value: stat.vacanciesCount, cls: 'text-blue-600' },
            { label: 'резюме', value: stat.resumesCount, cls: 'text-cyan-600' },
            { label: 'средн. зарплата', value: stat.avgSalary.toLocaleString('ru-RU') + ' ₽', cls: 'text-slate-800' },
            { label: 'рейтинг активности', value: `${stat.rating}/10`, cls: stat.rating >= 7 ? 'text-emerald-600' : stat.rating >= 5 ? 'text-amber-600' : 'text-red-500' },
          ].map(s => (
            <div key={s.label} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 text-center">
              <div className={`text-2xl font-bold ${s.cls}`}>{s.value}</div>
              <div className="text-xs text-slate-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Активные вакансии ({regionVacs.length})</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {regionVacs.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">Вакансий пока нет</div>
            )}
            {regionVacs.map(v => (
              <div key={v.id} className="flex items-start gap-3 px-5 py-3">
                <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0 mt-1.5" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{v.title}</div>
                  <div className="text-xs text-slate-400 mt-0.5">
                    {v.employerName} · {v.salaryFrom.toLocaleString('ru-RU')}–{v.salaryTo.toLocaleString('ru-RU')} ₽
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
          <div className="px-5 py-4 border-b border-slate-100">
            <h2 className="text-sm font-semibold text-slate-800">Специалисты ({regionRes.length})</h2>
          </div>
          <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto">
            {regionRes.length === 0 && (
              <div className="py-8 text-center text-sm text-slate-400">Резюме пока нет</div>
            )}
            {regionRes.map(r => (
              <div key={r.id} className="flex items-center gap-3 px-5 py-3">
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-800 truncate">{r.position}</div>
                  <div className="text-xs text-slate-400 mt-0.5">{fmtExp(r.experience)} · {fmtSalary(r.salary)}</div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {r.tests.slice(0, 1).map(t => (
                    <span key={t.value} className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-medium rounded ring-1 ring-blue-100">{t.label}</span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Salary distribution — CSS-only bar chart */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm mb-6">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Распределение зарплат специалистов</h2>
        </div>
        <div className="px-5 py-5">
          <div className="flex items-end gap-3 h-28">
            {salaryBuckets.map(b => (
              <div key={b.label} className="flex-1 flex flex-col items-center gap-1">
                {b.count > 0 && (
                  <div className="text-xs font-semibold text-slate-600">{b.count}</div>
                )}
                <div
                  className="w-full bg-blue-400 rounded-t"
                  style={{ height: `${Math.max((b.count / maxBucket) * 80, b.count > 0 ? 4 : 0)}px` }}
                />
                <div className="text-[10px] text-slate-400 text-center leading-tight mt-1">{b.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Social support */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm">
        <div className="px-5 py-4 border-b border-slate-100">
          <h2 className="text-sm font-semibold text-slate-800">Социальные категории специалистов</h2>
        </div>
        <div className="px-5 py-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { title: 'Участники СВО', key: 'svo_participant', cls: 'text-red-600 bg-red-50' },
            { title: 'Члены семей СВО', key: 'svo_family', cls: 'text-orange-600 bg-orange-50' },
            { title: 'Люди с ОВЗ', key: 'disabled', cls: 'text-purple-600 bg-purple-50' },
          ].map(s => {
            const count = regionRes.filter(r => r.specialStatuses.some(ss => ss.value === s.key)).length;
            return (
              <div key={s.title} className={`text-center p-4 rounded-xl ${s.cls}`}>
                <div className="text-3xl font-bold">{count}</div>
                <div className="text-xs mt-1 font-medium">{s.title}</div>
                {count > 0 && regionRes.length > 0 && (
                  <div className="text-[10px] opacity-70 mt-0.5">{Math.round(count / regionRes.length * 100)}% от активных</div>
                )}
              </div>
            );
          })}
        </div>
        <div className="px-5 pb-4 text-xs text-slate-400">
          Данные по активным резюме в регионе. Поддержка занятости льготных категорий граждан в соответствии с программами Минтруда РФ.
        </div>
      </div>
    </div>
  );
}
