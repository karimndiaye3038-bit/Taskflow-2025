
import { useEffect, useState } from 'react';
import { api, fmtDate, makeRun } from '../api';
import Pager from '../components/Pager.jsx';

const EMPTY_FORM = {
  name: '',
  email: '',
  password: '',
  role: 'USER',
};

const ROLE_LABELS = {
  USER: 'Utilisateur',
  ADMIN: 'Administrateur',
};

export default function Users({ notify }) {
  const run = makeRun(notify);

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    search: '',
    role: '',
  });

  const [applied, setApplied] = useState({
    search: '',
    role: '',
  });

  const [form, setForm] = useState(EMPTY_FORM);

  const load = () =>
    run(async () => {
      const q =
        `?page=${page}&limit=10` +
        `&search=${encodeURIComponent(applied.search)}` +
        `&role=${encodeURIComponent(applied.role)}`;

      const d = await api('/api/users' + q);

      setUsers(d.data || []);
      setPagination(d.pagination);
    });

  useEffect(() => {
    load();
  }, [page, applied]);

  const createUser = async (e) => {
    e.preventDefault();

    await run(async () => {
      await api('/api/users', {
        method: 'POST',
        body: form,
      });

      setForm(EMPTY_FORM);

      if (page !== 1) {
        setPage(1);
      } else {
        await load();
      }
    }, 'Utilisateur créé');
  };

  const changeRole = async (id, role) => {
    await run(
      () =>
        api(`/api/users/${id}/role`, {
          method: 'PATCH',
          body: { role },
        }),
      'Rôle modifié',
    );

    await load();
  };

  const remove = async (id) => {
    if (!confirm('Supprimer cet utilisateur ?')) return;

    await run(
      () =>
        api(`/api/users/${id}`, {
          method: 'DELETE',
        }),
      'Utilisateur supprimé',
    );

    await load();
  };

  return (
    <div className="space-y-5">
      <section className="card">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 text-xl">
            👥
          </div>

          <div>
            <h2 className="mb-1 text-lg font-bold">
              Gestion des utilisateurs
            </h2>

            <p className="mb-0 text-xs text-slate-500">
              Gérez les comptes et les autorisations de votre équipe.
            </p>
          </div>
        </div>

        <div className="mb-5 flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-blue-50 px-4 py-3">
            <p className="mb-1 text-xs text-slate-500">
              Total des utilisateurs
            </p>

            <p className="mb-0 text-2xl font-bold text-blue-600">
              {pagination.total}
            </p>
          </div>
        </div>

        <form onSubmit={createUser}>
          <h3 className="mb-4 text-base font-bold">
            Créer un utilisateur
          </h3>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Nom complet
              </label>

              <input
                required
                placeholder="Nom"
                value={form.name}
                onChange={(e) =>
                  setForm({ ...form, name: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Adresse e-mail
              </label>

              <input
                required
                type="email"
                placeholder="nom@exemple.com"
                value={form.email}
                onChange={(e) =>
                  setForm({ ...form, email: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Mot de passe
              </label>

              <input
                required
                type="password"
                autoComplete="new-password"
                placeholder="Mot de passe"
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
              />
            </div>

            <div>
              <label className="mb-2 block text-xs font-semibold text-slate-600">
                Rôle
              </label>

              <select
                value={form.role}
                onChange={(e) =>
                  setForm({ ...form, role: e.target.value })
                }
              >
                <option value="USER">Utilisateur</option>
                <option value="ADMIN">Administrateur</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="submit"
                className="btn w-full"
              >
                + Créer
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold">
              Liste des utilisateurs
            </h2>

            <p className="mb-0 text-xs text-slate-500">
              Consultez les comptes et modifiez leurs rôles.
            </p>
          </div>

          <span className="badge">
            {pagination.total} compte(s)
          </span>
        </div>

        <form
          className="mb-5 grid grid-cols-1 gap-3 rounded-xl bg-slate-50 p-4 sm:grid-cols-[1fr_200px_auto_auto]"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setApplied({ ...filters });
          }}
        >
          <input
            placeholder="Rechercher par nom ou e-mail..."
            value={filters.search}
            onChange={(e) =>
              setFilters({
                ...filters,
                search: e.target.value,
              })
            }
          />

          <select
            value={filters.role}
            onChange={(e) =>
              setFilters({
                ...filters,
                role: e.target.value,
              })
            }
          >
            <option value="">Tous les rôles</option>
            <option value="USER">Utilisateur</option>
            <option value="ADMIN">Administrateur</option>
          </select>

          <button type="submit" className="btn">
            Filtrer
          </button>

          <button
            type="button"
            className="btn light"
            onClick={() => {
              const empty = {
                search: '',
                role: '',
              };

              setFilters(empty);
              setApplied(empty);
              setPage(1);
            }}
          >
            Réinitialiser
          </button>
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Utilisateur</th>
                <th>Adresse e-mail</th>
                <th>Rôle</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {users.map((u) => (
                <tr key={u._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                        {(u.name || 'U')
                          .trim()
                          .charAt(0)
                          .toUpperCase()}
                      </div>

                      <span className="font-semibold text-slate-700">
                        {u.name}
                      </span>
                    </div>
                  </td>

                  <td>{u.email}</td>

                  <td>
                    <select
                      aria-label={`Rôle de ${u.name}`}
                      className="!w-auto !min-w-36 !py-1.5 !text-xs"
                      value={u.role}
                      onChange={(e) =>
                        changeRole(u._id, e.target.value)
                      }
                    >
                      <option value="USER">
                        {ROLE_LABELS.USER}
                      </option>

                      <option value="ADMIN">
                        {ROLE_LABELS.ADMIN}
                      </option>
                    </select>
                  </td>

                  <td className="whitespace-nowrap text-xs text-slate-500">
                    {fmtDate(u.createdAt)}
                  </td>

                  <td>
                    <button
                      type="button"
                      className="btn danger small"
                      onClick={() => remove(u._id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))}

              {users.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-slate-400"
                  >
                    Aucun utilisateur trouvé.
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
