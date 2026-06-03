import { User } from 'lucide-react';

export default function Header({ onToggleSidebar }) {

  return (
    <header className="h-16 bg-slate-800 border-b border-slate-600 flex items-center justify-between px-4 lg:px-6 shrink-0">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="text-slate-300 hover:text-white lg:hidden transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-white tracking-tight">
          SalesPro Ltd - SRMS
        </h1>
      </div>
    </header>
  );
}
