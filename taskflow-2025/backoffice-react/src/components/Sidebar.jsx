
import { useState } from 'react';

const ITEMS = [
  {
    key: 'dashboard',
    label: 'Dashboard',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m3 10 9-7 9 7v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10z"
      />
    ),
  },
  {
    key: 'users',
    label: 'Utilisateurs',
    icon: (
      <>
        <path d="M16 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
        <circle cx="10" cy="7" r="4" />
        <path d="M20 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
      </>
    ),
  },
  {
    key: 'projects',
    label: 'Projets',
    icon: (
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"
      />
    ),
  },
  {
    key: 'tasks',
    label: 'Tâches',
    icon: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="m7 12 3 3 7-7" />
      </>
    ),
  },
  {
    key: 'profile',
    label: 'Mon profil',
    icon: (
      <>
        <circle cx="12" cy="8" r="4" />
        <path d="M5 21a7 7 0 0114 0" />
      </>
    ),
  },
];

export default function Sidebar({
  current,
  open,
  onSelect,
  onClose,
}) {
  const [unused, setUnused] = useState(false);

  const handleSelect = (key) => {
    onSelect(key);
    onClose?.();
  };

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label="Fermer le menu"
          onClick={onClose}
          className="fixed inset-x-0 bottom-0 top-[52px] z-40 bg-slate-950/50 md:hidden"
        />
      )}

      <aside
        className={`
          ${open ? 'flex' : 'hidden'}
          fixed bottom-0 left-0 top-[52px] z-50
          w-[181px] shrink-0 flex-col
          border-r border-white/5
          bg-[#14283f] px-2.5 py-4 text-white
          md:sticky md:top-[52px] md:flex md:h-[calc(100vh-52px)]
        `}
      >
        <p className="mb-3 ml-2 px-1 text-[9px] font-semibold tracking-wider text-slate-400">
          MENU
        </p>

        <nav className="flex flex-col gap-1">
          {ITEMS.map((item) => {
            const active = current === item.key;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => handleSelect(item.key)}
                className={`
                  flex w-full items-center gap-3 rounded-lg
                  px-3 py-2.5 text-left text-[11px]
                  font-medium transition-all duration-200
                  ${
                    active
                      ? 'bg-[#3479ef] text-white shadow-md shadow-blue-950/20'
                      : 'text-slate-300 hover:bg-white/[0.07] hover:text-white'
                  }
                `}
              >
                <svg
                  viewBox="0 0 24 24"
                  fill={item.key === 'dashboard' ? 'currentColor' : 'none'}
                  stroke="currentColor"
                  strokeWidth="1.8"
                  className="h-[18px] w-[18px] shrink-0"
                >
                  {item.icon}
                </svg>

                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="mt-auto overflow-hidden rounded-xl border border-white/[0.06] bg-[#192f49] p-3">
          <div className="mb-2 flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20 text-lg">
            🚀
          </div>

          <p className="mb-1 text-[11px] font-bold text-white">
            TaskFlow
          </p>

          <p className="mb-0 text-[9px] leading-4 text-slate-300">
            Organisez vos projets, boostez votre productivité.
          </p>

          <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-2/3 rounded-full bg-blue-500" />
          </div>
        </div>
      </aside>
    </>
  );
}
