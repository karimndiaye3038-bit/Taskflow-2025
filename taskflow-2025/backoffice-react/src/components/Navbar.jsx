
import { API_URL } from '../api';

export default function Navbar({ me, onToggleSidebar, onLogout }) {
  return (
    <header className="sticky top-0 z-40 flex h-[52px] items-center justify-between border-b border-white/10 bg-[#193451] px-4 text-white shadow-sm md:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-[30px] w-[30px] shrink-0 items-center justify-center rounded-lg bg-blue-500 text-xl font-bold shadow-sm">
            ✓
          </div>
          <h1 className="text-lg font-bold tracking-tight">
            TaskFlow
          </h1>
        </div>

        <div className="mx-1 hidden h-8 border-l border-white/15 sm:block" />

        <button
          type="button"
          onClick={onToggleSidebar}
          aria-label="Ouvrir ou fermer le menu"
          className="rounded-lg p-2 text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-5 w-5"
          >
            <path
              strokeLinecap="round"
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <a
          href={`${API_URL}/api-docs`}
          target="_blank"
          rel="noreferrer"
          className="hidden items-center gap-1.5 text-xs font-medium text-white/85 transition hover:text-white md:flex"
        >
          Swagger
          <span>↗</span>
        </a>

        <div className="hidden h-8 border-l border-white/15 md:block" />

        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-slate-100 text-sm font-bold text-[#24466c]">
            {me?.name?.charAt(0)?.toUpperCase() || 'U'}
          </div>

          <div className="hidden sm:block">
            <p className="mb-0 max-w-32 truncate text-xs font-medium text-white">
              {me?.name || 'Utilisateur'}
            </p>
            <p className="mb-0 text-[10px] text-blue-200">
              {me?.role || 'Membre'}
            </p>
          </div>

          <span className="hidden rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-semibold text-white sm:inline-block">
            {me?.role || 'user'}
          </span>
        </div>

        <button
          type="button"
          onClick={onLogout}
          className="ml-1 flex items-center gap-2 rounded-lg border border-white/20 px-2.5 py-2 text-xs font-medium transition hover:bg-white/10 sm:px-3"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            className="h-4 w-4"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M10 17l5-5-5-5m5 5H3m9-9h6a2 2 0 012 2v14a2 2 0 01-2 2h-6"
            />
          </svg>
          <span className="hidden sm:inline">Déconnexion</span>
        </button>
      </div>
    </header>
  );
}
