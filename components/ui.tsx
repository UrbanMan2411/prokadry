'use client';

import { useEffect, ReactNode } from 'react';

// ── Badge ──────────────────────────────────────────────────────────────────
type BadgeColor = 'blue' | 'cyan' | 'green' | 'amber' | 'red' | 'slate' | 'purple' | 'orange';
type BadgeSize = 'xs' | 'sm' | 'md';

const BADGE_COLORS: Record<BadgeColor, string> = {
  blue:   'bg-blue-50 text-blue-700 ring-blue-100',
  cyan:   'bg-cyan-50 text-cyan-700 ring-cyan-100',
  green:  'bg-emerald-50 text-emerald-700 ring-emerald-100',
  amber:  'bg-amber-50 text-amber-700 ring-amber-100',
  red:    'bg-red-50 text-red-700 ring-red-100',
  slate:  'bg-slate-100 text-slate-600 ring-slate-200',
  purple: 'bg-purple-50 text-purple-700 ring-purple-100',
  orange: 'bg-orange-50 text-orange-700 ring-orange-100',
};
const BADGE_SIZES: Record<BadgeSize, string> = {
  xs: 'px-1.5 py-0.5 text-[10px]',
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export function Badge({ children, color = 'blue', size = 'sm' }: { children: ReactNode; color?: BadgeColor; size?: BadgeSize }) {
  return (
    <span className={`inline-flex items-center gap-1 font-medium rounded ring-1 ring-inset ${BADGE_COLORS[color]} ${BADGE_SIZES[size]}`}>
      {children}
    </span>
  );
}

// ── StatusBadge ────────────────────────────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: BadgeColor }> = {
  active:   { label: 'Активно',    color: 'green'  },
  pending:  { label: 'На проверке', color: 'amber'  },
  draft:    { label: 'Черновик',   color: 'slate'  },
  archived: { label: 'В архиве',   color: 'slate'  },
  approved: { label: 'Одобрено',   color: 'green'  },
  rejected: { label: 'Отклонено',  color: 'red'    },
  sent:     { label: 'Отправлено', color: 'blue'   },
  viewed:   { label: 'Просмотрено',color: 'purple' },
  accepted: { label: 'Принято',    color: 'green'  },
};

export function StatusBadge({ status }: { status: string }) {
  const { label = 'Неизвестно', color = 'slate' } = STATUS_MAP[status] ?? {};
  return <Badge color={color}>{label}</Badge>;
}

// ── Btn ─────────────────────────────────────────────────────────────────────
type BtnVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'cyan';
type BtnSize = 'xs' | 'sm' | 'md' | 'lg';

const BTN_VARIANTS: Record<BtnVariant, string> = {
  primary:   'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
  secondary: 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 focus:ring-blue-500 shadow-sm',
  ghost:     'text-slate-600 hover:bg-slate-100 focus:ring-blue-500',
  danger:    'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 shadow-sm',
  cyan:      'bg-cyan-500 text-white hover:bg-cyan-600 focus:ring-cyan-400 shadow-sm',
};
const BTN_SIZES: Record<BtnSize, string> = {
  xs: 'px-2.5 py-1 text-xs',
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export function Btn({
  children, variant = 'primary', size = 'md', onClick, disabled, className = '', type = 'button', icon,
}: {
  children: ReactNode; variant?: BtnVariant; size?: BtnSize; onClick?: (e: React.MouseEvent) => void;
  disabled?: boolean; className?: string; type?: 'button' | 'submit'; icon?: ReactNode;
}) {
  return (
    <button
      type={type} onClick={onClick} disabled={disabled}
      className={`inline-flex items-center gap-1.5 font-medium rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${BTN_VARIANTS[variant]} ${BTN_SIZES[size]} ${className}`}
    >
      {icon && <span className="w-4 h-4 flex-shrink-0">{icon}</span>}
      {children}
    </button>
  );
}

// ── Input ──────────────────────────────────────────────────────────────────
export function Input({
  value, onChange, placeholder, className = '', type = 'text', prefix, suffix,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string;
  className?: string; type?: string; prefix?: ReactNode; suffix?: ReactNode;
}) {
  return (
    <div className={`relative flex items-center ${className}`}>
      {prefix && <span className="absolute left-3 text-slate-400 pointer-events-none">{prefix}</span>}
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
        className={`w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition ${prefix ? 'pl-9' : 'pl-3'} ${suffix ? 'pr-9' : 'pr-3'} py-2`}
      />
      {suffix && <span className="absolute right-3 text-slate-400">{suffix}</span>}
    </div>
  );
}

// ── Select ─────────────────────────────────────────────────────────────────
export function Select({
  value, onChange, options, placeholder, className = '',
}: {
  value: string; onChange: (v: string) => void;
  options: string[] | { value: string; label: string }[]; placeholder?: string; className?: string;
}) {
  return (
    <select
      value={value} onChange={e => onChange(e.target.value)}
      className={`w-full rounded-lg border border-slate-200 bg-white text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition px-3 py-2 ${className}`}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => {
        const val = typeof o === 'string' ? o : o.value;
        const label = typeof o === 'string' ? o : o.label;
        return <option key={val} value={val}>{label}</option>;
      })}
    </select>
  );
}

// ── Modal ──────────────────────────────────────────────────────────────────
const MODAL_SIZES: Record<string, string> = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export function Modal({
  open, onClose, title, children, size = 'md',
}: {
  open: boolean; onClose: () => void; title: string; children: ReactNode; size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${MODAL_SIZES[size]} max-h-[90vh] overflow-y-auto`}>
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="text-base font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} aria-label="Закрыть" className="text-slate-400 hover:text-slate-600 transition p-1 rounded-lg hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

// ── Avatar ─────────────────────────────────────────────────────────────────
const AVATAR_SIZES: Record<string, string> = {
  sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-16 h-16 text-xl', xl: 'w-24 h-24 text-3xl',
};

export function Avatar({ src, name, size = 'md' }: { src?: string | null; name?: string; size?: 'sm' | 'md' | 'lg' | 'xl' }) {
  const initials = name ? name.split(' ').slice(0, 2).map(w => w[0]).join('') : '?';
  if (src) return <img src={src} alt={name} className={`${AVATAR_SIZES[size]} rounded-full object-cover ring-2 ring-white shadow`} />;
  return (
    <div className={`${AVATAR_SIZES[size]} rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center font-semibold text-white ring-2 ring-white shadow flex-shrink-0`}>
      {initials}
    </div>
  );
}

// ── StarBtn ────────────────────────────────────────────────────────────────
export function StarBtn({ active, onToggle }: { active: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={e => { e.stopPropagation(); onToggle(); }}
      aria-label={active ? 'Убрать из избранного' : 'Добавить в избранное'}
      aria-pressed={active}
      className={`p-1.5 rounded-lg transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-400 ${active ? 'text-amber-400 hover:text-amber-500' : 'text-slate-300 hover:text-amber-400'}`}
    >
      <svg className="w-4 h-4" fill={active ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
      </svg>
    </button>
  );
}

// ── Chip ───────────────────────────────────────────────────────────────────
export function Chip({ label, onRemove }: { label: string; onRemove?: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full ring-1 ring-blue-100">
      {label}
      {onRemove && (
        <button onClick={onRemove} className="hover:text-blue-900 transition">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
    </span>
  );
}

// ── StatCard ───────────────────────────────────────────────────────────────
const STAT_COLORS: Record<string, string> = {
  blue:   'from-blue-500 to-blue-600',
  cyan:   'from-cyan-500 to-cyan-600',
  green:  'from-emerald-500 to-emerald-600',
  amber:  'from-amber-500 to-amber-600',
  purple: 'from-purple-500 to-purple-600',
};

export function StatCard({ label, value, icon, color = 'blue', sub }: {
  label: string; value: number | string; icon: ReactNode; color?: string; sub?: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-100 p-5 shadow-sm flex items-start gap-4">
      <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${STAT_COLORS[color] ?? STAT_COLORS.blue} flex items-center justify-center text-white flex-shrink-0 shadow-sm`}>
        <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
      </div>
      <div className="min-w-0">
        <div className="text-2xl font-bold text-slate-800 leading-none">{value}</div>
        <div className="text-sm text-slate-500 mt-0.5">{label}</div>
        {sub && <div className="text-xs text-slate-400 mt-1">{sub}</div>}
      </div>
    </div>
  );
}

// ── EmptyState ─────────────────────────────────────────────────────────────
export function EmptyState({ icon = '📄', title, description, action }: {
  icon?: string; title: string; description?: string; action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-4xl mb-3 opacity-60">{icon}</div>
      <div className="text-slate-700 font-semibold text-base mb-1">{title}</div>
      {description && <div className="text-sm text-slate-400 mb-4 max-w-xs">{description}</div>}
      {action}
    </div>
  );
}
