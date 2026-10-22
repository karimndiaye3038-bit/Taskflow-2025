
import { useEffect, useState } from 'react';
import { api, makeRun } from '../api';

const STAT_ITEMS = [
  {
    key: 'totalProjects',
    label: 'Projets',
    icon: 'folder',
    color: 'green',
    description: 'Projets enregistrés',
  },
  {
    key: 'totalTasks',
    label: 'Tâches',
    icon: 'check',
    color: 'purple',
    description: 'Tâches au total',
  },
  {
    key: 'completedTasks',
    label: 'Terminées',
    icon: 'done',
    color: 'blue',
    description: 'Tâches accomplies',
  },
  {
    key: 'inProgressTasks',
    label: 'En cours',
    icon: 'progress',
    color: 'orange',
    description: 'Tâches en progression',
  },
  {
    key: 'overdueTasks',
    label: 'En retard',
    icon: 'clock',
    color: 'red',
    description: 'Tâches à surveiller',
  },
  {
    key: 'myAssignedTasks',
    label: 'Assignées à moi',
    icon: 'user',
    color: 'cyan',
    description: 'Mes tâches',
  },
];

const COLORS = {
  green: {
    icon: 'bg-emerald-100 text-emerald-600',
    value: 'text-emerald-600',
  },
  purple: {
    icon: 'bg-violet-100 text-violet-600',
    value: 'text-violet-600',
  },
  blue: {
    icon: 'bg-blue-100 text-blue-600',
    value: 'text-blue-600',
  },
  orange: {
    icon: 'bg-orange-100 text-orange-600',
    value: 'text-orange-600',
  },
  red: {
    icon: 'bg-rose-100 text-rose-600',
    value: 'text-rose-600',
  },
  cyan: {
    icon: 'bg-cyan-100 text-cyan-600',
    value: 'text-cyan-600',
  },
};

function StatIcon({ type }) {
  const common = {
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 1.8,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
  };

  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" {...common}>
      {type === 'folder' && (
        <path d="M3 7a2 2 0 012-2h5l2 2h7a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" />
      )}
      {type === 'check' && (
        <>
          <rect x="3" y="3" width="18" height="18" rx="4" />
          <path d="m7 12 3 3 7-7" />
        </>
      )}
      {type === 'done' && (
        <path d="m5 12 4 4L19 6" />
      )}
      {type === 'progress' && (
        <>
          <path d="M4 19V12M10 19V5M16 19V9M22 19V3" />
        </>
      )}
      {type === 'clock' && (
        <>
          <circle cx="12" cy="12" r="9" />
          <path d="M12 7v5l3 2" />
        </>
      )}
      {type === 'user' && (
        <>
          <circle cx="12" cy="8" r="4" />
          <path d="M5 21a7 7 0 0114 0" />
        </>
      )}
    </svg>
  );
}

function StatCard({ label, value, icon, color, description }) {
  const styles = COLORS[color] || COLORS.blue;

  return (
    <article className="group rounded-xl border border-slate-100 bg-white p-4 shadow-sm transition duration-200 hover:-translate-y-0.5 hover:shadow-md sm:p-5">
      <div className="mb-3 flex items-center justify-between">
        <div
          className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.icon}`}
        >
          <StatIcon type={icon} />
        </div>

        <span className="text-[10px] font-medium text-slate-400">
          TaskFlow
        </span>
      </div>

      <p className="mb-1 text-xs font-medium text-slate-500">
        {label}
      </p>

      <p className={`mb-1 text-2xl font-bold tracking-tight ${styles.value}`}>
        {value ?? 0}
      </p>

      <p className="mb-0 text-[10px] text-slate-400">
        {description}
      </p>
    </article>
  );
}

function StatusCard({ label, value, color, percent }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-600">{label}</span>
        <span className={`text-lg font-bold ${color}`}>{value}</span>
      </div>

      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color.replace('text-', 'bg-')}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

export default function Dashboard({ notify }) {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    makeRun(notify)(async () => {
      const response = await api('/api/dashboard/stats');
      setStats(response.stats);
    });
  }, []);

  if (!stats) {
    return (
      <div className="flex min-h-64 items-center justify-center">
        <div className="flex items-center gap-3 text-sm text-slate-500">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
          Chargement du tableau de bord...
        </div>
      </div>
    );
  }

  const total = Number(stats.totalTasks) || 0;
  const completed = Number(stats.completedTasks) || 0;
  const completion = total > 0
    ? Math.round((completed / total) * 100)
    : 0;

  const statuses = stats.tasksByStatus || {};
  const statusItems = [
    {
      label: 'À faire',
      value: Number(statuses.TODO) || 0,
      color: 'text-orange-500',
    },
    {
      label: 'En cours',
      value: Number(statuses.IN_PROGRESS) || 0,
      color: 'text-blue-600',
    },
    {
      label: 'Terminées',
      value: Number(statuses.DONE) || 0,
      color: 'text-emerald-600',
    },
  ];

  return (
    <div className="space-y-5">
      {/* Bannière de bienvenue */}
      <section className="relative isolate overflow-hidden rounded-xl bg-gradient-to-r from-[#e5f1ff] via-[#eaf4ff] to-[#cce3ff] px-5 py-7 sm:px-7 sm:py-8">
        <div className="relative z-10 max-w-xl">
          <p className="mb-1 text-xs font-medium text-slate-600">
            Bonjour,
          </p>

          <h2 className="mb-2 text-2xl font-bold tracking-tight text-[#172c47]">
            Bienvenue sur TaskFlow
          </h2>

          <p className="mb-0 max-w-md text-sm leading-6 text-slate-600">
            Gérez vos projets, vos équipes et vos tâches en toute simplicité.
          </p>
        </div>

        <div className="pointer-events-none absolute -right-8 -top-12 h-48 w-48 rounded-full bg-blue-300/20 blur-2xl" />

        <svg
          viewBox="0 0 240 150"
          className="pointer-events-none absolute bottom-0 right-4 hidden h-36 w-56 text-blue-600 opacity-80 sm:block"
          fill="none"
        >
          <rect
            x="30"
            y="28"
            width="140"
            height="92"
            rx="7"
            stroke="currentColor"
            strokeWidth="7"
            transform="rotate(-4 30 28)"
          />
          <path
            d="M20 120h160"
            stroke="currentColor"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {[0, 1, 2].map((n) => (
            <g key={n} transform={`translate(55 ${48 + n * 22})`}>
              <rect width="12" height="12" rx="2" fill="#3479ef" />
              <path
                d="m2 6 3 3 6-7"
                stroke="white"
                strokeWidth="1.5"
              />
              <path
                d="M23 6h42"
                stroke="#8bb6fa"
                strokeWidth="4"
                strokeLinecap="round"
              />
            </g>
          ))}
          <circle cx="183" cy="80" r="18" fill="#3479ef" />
          <path
            d="m174 80 6 6 12-13"
            stroke="white"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M213 118V77m0 15-13-15m13 8 12-17m-12 38-11-7m11-8 12-9"
            stroke="#3479ef"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <path
            d="M204 119h19l-3 13h-13z"
            fill="#3479ef"
          />
        </svg>
      </section>

      {/* Cartes statistiques */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {STAT_ITEMS.map((item) => (
          <StatCard
            key={item.key}
            label={item.label}
            value={stats[item.key] ?? 0}
            icon={item.icon}
            color={item.color}
            description={item.description}
          />
        ))}

        <article className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
          <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-amber-100 text-amber-600">
            <StatIcon type="progress" />
          </div>

          <p className="mb-1 text-xs font-medium text-slate-500">
            Taux de complétion
          </p>

          <p className="mb-2 text-2xl font-bold text-[#24364e]">
            {completion}%
          </p>

          <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-amber-400 transition-all"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p className="mb-0 mt-2 text-[10px] text-slate-400">
            {completed} tâche(s) terminée(s) sur {total}
          </p>
        </article>
      </section>

      {/* Répartition des tâches */}
      <section className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <StatIcon type="check" />
          </div>

          <div>
            <h3 className="mb-0 text-base font-bold text-[#24364e]">
              Répartition des tâches
            </h3>
            <p className="mb-0 mt-1 text-xs text-slate-400">
              Vue d'ensemble par statut
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
          {statusItems.map((item) => (
            <StatusCard
              key={item.label}
              label={item.label}
              value={item.value}
              color={item.color}
              percent={
                total > 0
                  ? Math.min(100, Math.round((item.value / total) * 100))
                  : 0
              }
            />
          ))}
        </div>
      </section>
    </div>
  );
}
