
import { useEffect, useState } from 'react';
import { api, fmtDate, makeRun } from '../api';
import Pager from '../components/Pager.jsx';

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

const EMPTY_FILTERS = {
  search: '',
  status: '',
  priority: '',
  sortBy: 'createdAt',
  order: 'desc',
  overdue: false,
};

const EMPTY_TASK = {
  title: '',
  description: '',
  priority: 'MEDIUM',
  dueDate: '',
  assignedTo: '',
};

const STATUS_LABELS = {
  TODO: 'À faire',
  IN_PROGRESS: 'En cours',
  DONE: 'Terminée',
};

const PRIORITY_LABELS = {
  LOW: 'Basse',
  MEDIUM: 'Moyenne',
  HIGH: 'Haute',
};

function StatusBadge({ status }) {
  const styles = {
    TODO: 'bg-amber-50 text-amber-700',
    IN_PROGRESS: 'bg-blue-50 text-blue-700',
    DONE: 'bg-emerald-50 text-emerald-700',
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[status] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {STATUS_LABELS[status] || status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  const styles = {
    LOW: 'bg-slate-100 text-slate-600',
    MEDIUM: 'bg-orange-50 text-orange-700',
    HIGH: 'bg-rose-50 text-rose-700',
  };

  return (
    <span
      className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-medium ${
        styles[priority] || 'bg-slate-100 text-slate-600'
      }`}
    >
      {PRIORITY_LABELS[priority] || priority}
    </span>
  );
}

export default function Tasks({ notify, projectId, setProjectId }) {
  const run = makeRun(notify);

  const [projects, setProjects] = useState([]);
  const [members, setMembers] = useState([]);
  const [tasks, setTasks] = useState([]);

  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [applied, setApplied] = useState(EMPTY_FILTERS);
  const [form, setForm] = useState(EMPTY_TASK);

  useEffect(() => {
    run(async () => {
      const d = await api('/api/projects?limit=100');
      setProjects(d.data || []);
    });
  }, []);

  useEffect(() => {
    if (!projectId) {
      setMembers([]);
      return;
    }

    run(async () => {
      const d = await api(`/api/projects/${projectId}/members`);
      setMembers(d.members || []);
    });
  }, [projectId]);

  const load = () =>
    run(async () => {
      const f = applied;

      const base = projectId
        ? `/api/projects/${projectId}/tasks`
        : '/api/tasks';

      const q =
        `?page=${page}&limit=10` +
        `&status=${encodeURIComponent(f.status)}` +
        `&priority=${encodeURIComponent(f.priority)}` +
        `&search=${encodeURIComponent(f.search)}` +
        `&sortBy=${encodeURIComponent(f.sortBy)}` +
        `&order=${encodeURIComponent(f.order)}` +
        (f.overdue ? '&overdue=true' : '');

      const d = await api(base + q);

      setTasks(d.data || []);
      setPagination(d.pagination);
    });

  useEffect(() => {
    load();
  }, [projectId, page, applied]);

  const createTask = async (e) => {
    e.preventDefault();

    if (!projectId) return;

    await run(async () => {
      await api(`/api/projects/${projectId}/tasks`, {
        method: 'POST',
        body: {
          ...form,
          dueDate: form.dueDate || undefined,
          assignedTo: form.assignedTo || undefined,
        },
      });

      setForm(EMPTY_TASK);
      await load();
    }, 'Tâche créée');
  };

  const patchTask = async (id, body) => {
    await run(
      () =>
        api(`/api/tasks/${id}`, {
          method: 'PATCH',
          body,
        }),
      'Tâche mise à jour',
    );

    await load();
  };

  const removeTask = async (id) => {
    if (!confirm('Supprimer cette tâche ?')) return;

    await run(
      () =>
        api(`/api/tasks/${id}`, {
          method: 'DELETE',
        }),
      'Tâche supprimée',
    );

    await load();
  };

  const setF = (key, value) => {
    setFilters((previous) => ({
      ...previous,
      [key]: value,
    }));
  };

  const applyFilters = (e) => {
    e.preventDefault();
    setPage(1);
    setApplied({ ...filters });
  };

  return (
    <div className="space-y-5">
      <section className="card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-100 text-xl">
            ✅
          </div>

          <div>
            <h2 className="mb-1 text-lg font-bold">
              Gestion des tâches
            </h2>

            <p className="mb-0 text-xs text-slate-500">
              Organisez, assignez et suivez l'avancement de vos tâches.
            </p>
          </div>
        </div>

        <label
          htmlFor="task-project"
          className="mb-2 block text-xs font-semibold text-slate-600"
        >
          Projet sélectionné
        </label>

        <select
          id="task-project"
          value={projectId || ''}
          onChange={(e) => {
            setPage(1);
            setProjectId(e.target.value);
          }}
        >
          <option value="">Tous mes projets</option>

          {projects.map((p) => (
            <option key={p._id} value={p._id}>
              {p.name}
            </option>
          ))}
        </select>
      </section>

      {projectId ? (
        <section className="card">
          <h3 className="mb-1 text-base font-bold">
            Nouvelle tâche
          </h3>

          <p className="mb-5 text-xs text-slate-500">
            Complétez les informations pour créer une tâche.
          </p>

          <form onSubmit={createTask}>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Titre
                </label>

                <input
                  required
                  placeholder="Titre de la tâche"
                  value={form.title}
                  onChange={(e) =>
                    setForm({ ...form, title: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Description
                </label>

                <input
                  placeholder="Description facultative"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Priorité
                </label>

                <select
                  value={form.priority}
                  onChange={(e) =>
                    setForm({ ...form, priority: e.target.value })
                  }
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {PRIORITY_LABELS[p]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Date limite
                </label>

                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) =>
                    setForm({ ...form, dueDate: e.target.value })
                  }
                />
              </div>

              <div className="sm:col-span-2">
                <label className="mb-2 block text-xs font-semibold text-slate-600">
                  Assigner à un membre
                </label>

                <select
                  value={form.assignedTo}
                  onChange={(e) =>
                    setForm({ ...form, assignedTo: e.target.value })
                  }
                >
                  <option value="">Non assignée</option>

                  {members.map((m) => (
                    <option key={m._id} value={m._id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="mt-5 flex justify-end">
              <button className="btn" type="submit">
                + Créer la tâche
              </button>
            </div>
          </form>
        </section>
      ) : (
        <div className="rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm text-blue-700">
          Sélectionnez un projet pour créer une nouvelle tâche.
        </div>
      )}

      <section className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold">
              Liste des tâches
            </h2>

            <p className="mb-0 text-xs text-slate-500">
              Filtrez les tâches et modifiez leur statut directement.
            </p>
          </div>

          <span className="badge">
            {pagination.total} tâche(s)
          </span>
        </div>

        <form
          onSubmit={applyFilters}
          className="mb-5 rounded-xl bg-slate-50 p-4"
        >
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <input
              placeholder="Rechercher par titre..."
              value={filters.search}
              onChange={(e) => setF('search', e.target.value)}
            />

            <select
              value={filters.status}
              onChange={(e) => setF('status', e.target.value)}
            >
              <option value="">Tous les statuts</option>

              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {STATUS_LABELS[s]}
                </option>
              ))}
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setF('priority', e.target.value)}
            >
              <option value="">Toutes les priorités</option>

              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {PRIORITY_LABELS[p]}
                </option>
              ))}
            </select>

            <select
              value={filters.sortBy}
              onChange={(e) => setF('sortBy', e.target.value)}
            >
              <option value="createdAt">Trier par création</option>
              <option value="dueDate">Trier par échéance</option>
            </select>

            <select
              value={filters.order}
              onChange={(e) => setF('order', e.target.value)}
            >
              <option value="desc">Plus récent en premier</option>
              <option value="asc">Plus ancien en premier</option>
            </select>

            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={filters.overdue}
                onChange={(e) => setF('overdue', e.target.checked)}
              />
              Tâches en retard uniquement
            </label>
          </div>

          <div className="flex flex-wrap gap-2">
            <button type="submit" className="btn">
              Appliquer les filtres
            </button>

            <button
              type="button"
              className="btn light"
              onClick={() => {
                setFilters(EMPTY_FILTERS);
                setApplied(EMPTY_FILTERS);
                setPage(1);
              }}
            >
              Réinitialiser
            </button>
          </div>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Tâche</th>
                <th>Projet</th>
                <th>Statut</th>
                <th>Priorité</th>
                <th>Échéance</th>
                <th>Assigné à</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {tasks.map((t) => (
                <tr key={t._id}>
                  <td>
                    <p className="mb-1 font-semibold text-slate-700">
                      {t.title}
                    </p>

                    <p className="mb-0 max-w-xs text-xs text-slate-400">
                      {t.description || 'Aucune description'}
                    </p>
                  </td>

                  <td>{t.project?.name || '—'}</td>

                  <td>
                    <div className="flex flex-col items-start gap-2">
                      <StatusBadge status={t.status} />

                      <select
                        aria-label={`Statut de ${t.title}`}
                        className="!w-auto !max-w-36 !py-1 !text-xs"
                        value={t.status}
                        onChange={(e) =>
                          patchTask(t._id, { status: e.target.value })
                        }
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {STATUS_LABELS[s]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td>
                    <div className="flex flex-col items-start gap-2">
                      <PriorityBadge priority={t.priority} />

                      <select
                        aria-label={`Priorité de ${t.title}`}
                        className="!w-auto !max-w-36 !py-1 !text-xs"
                        value={t.priority}
                        onChange={(e) =>
                          patchTask(t._id, { priority: e.target.value })
                        }
                      >
                        {PRIORITIES.map((p) => (
                          <option key={p} value={p}>
                            {PRIORITY_LABELS[p]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>

                  <td className="whitespace-nowrap text-xs text-slate-500">
                    {fmtDate(t.dueDate)}
                  </td>

                  <td>{t.assignedTo?.name || '—'}</td>

                  <td>
                    <button
                      type="button"
                      className="btn danger small"
                      onClick={() => removeTask(t._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}

              {tasks.length === 0 && (
                <tr>
                  <td
                    colSpan="7"
                    className="py-10 text-center text-slate-400"
                  >
                    Aucune tâche trouvée.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-4">
          <Pager
            pagination={pagination}
            onChange={setPage}
          />
        </div>
      </section>
    </div>
  );
}
