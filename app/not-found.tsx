import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
      <div className="text-center max-w-sm">
        <div className="text-8xl font-bold text-slate-200 mb-4">404</div>
        <h1 className="text-xl font-bold text-slate-800 mb-2">Страница не найдена</h1>
        <p className="text-sm text-slate-500 mb-6">Запрошенная страница не существует или была удалена.</p>
        <Link
          href="/"
          className="inline-block px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm"
        >
          На главную
        </Link>
      </div>
    </div>
  );
}
