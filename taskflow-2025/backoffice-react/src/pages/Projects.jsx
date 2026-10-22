import { useEffect, useState } from 'react';
import { api, fmtDate, makeRun } from '../api';
import Pager from '../components/Pager.jsx';

const EMPTY_FORM = {
  name: '',
  description: '',
};

export default function Projects({ notify, onOpenTasks }) {
  const run = makeRun(notify);

  const [projects, setProjects] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
    total: 0,
  });

  const [page, setPage] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(EMPTY_FORM);

  const [detail, setDetail] = useState(null);
  const [memberEmail, setMemberEmail] = useState('');

  const load = () =>
    run(async () => {
      const d = await api(
        `/api/projects?page=${page}&limit=10&search=${encodeURIComponent(search)}`,
      );

      setProjects(d.data || []);
      setPagination(d.pagination);
    });

  useEffect(() => {
    load();
  }, [page, search]);

  const createProject = async (e) => {
    e.preventDefault();

    await run(async () => {
      await api('/api/projects', {
        method: 'POST',
        body: form,
      });

      setForm(EMPTY_FORM);

      if (page !== 1) {
        setPage(1);
      } else {
        await load();
      }
    }, 'Projet créé');
  };

  const editProject = async (project) => {
    const name = prompt('Nouveau nom du projet', project.name);

    if (!name?.trim()) return;

    await run(
      () =>
        api(`/api/projects/${project._id}`, {
          method: 'PATCH',
          body: { name: name.trim() },
        }),
      'Projet modifié',
    );

    await load();
  };

  const removeProject = async (id) => {
    if (!confirm('Supprimer ce projet et toutes ses tâches ?')) return;

    await run(
      () =>
        api(`/api/projects/${id}`, {
          method: 'DELETE',
        }),
      'Projet supprimé',
    );

    if (detail?.project._id === id) {
      setDetail(null);
    }

    await load();
  };

  const openMembers = (project) =>
    run(async () => {
      const d = await api(`/api/projects/${project._id}/members`);

      setDetail({
        project,
        members: d.members || [],
      });
    });

  const addMember = async (e) => {
    e.preventDefault();

    if (!detail || !memberEmail.trim()) return;

    await run(async () => {
      await api(`/api/projects/${detail.project._id}/members`, {
        method: 'POST',
        body: { email: memberEmail.trim() },
      });

      setMemberEmail('');

      const d = await api(
        `/api/projects/${detail.project._id}/members`,
      );

      setDetail({
        project: detail.project,
        members: d.members || [],
      });

      await load();
    }, 'Membre ajouté');
  };

  const removeMember = async (userId) => {
    if (!detail) return;

    await run(async () => {
      await api(
        `/api/projects/${detail.project._id}/members/${userId}`,
        { method: 'DELETE' },
      );

      const d = await api(
        `/api/projects/${detail.project._id}/members`,
      );

      setDetail({
        project: detail.project,
        members: d.members || [],
      });

      await load();
    }, 'Membre retiré');
  };

  return (
    <div className="space-y-5">
      <form className="card" onSubmit={createProject}>
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-xl">
            📁
          </div>

          <div>
            <h2 className="mb-1 text-base font-bold">
              Créer un projet
            </h2>

            <p className="mb-0 text-xs text-slate-500">
              Organisez votre travail dans un nouvel espace de projet.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_2fr_auto]">
          <input
            required
            placeholder="Nom du projet"
            value={form.name}
            onChange={(e) =>
              setForm({ ...form, name: e.target.value })
            }
          />

          <input
            placeholder="Description du projet"
            value={form.description}
            onChange={(e) =>
              setForm({ ...form, description: e.target.value })
            }
          />

          <button className="btn" type="submit">
            + Créer le projet
          </button>
        </div>
      </form>

      <section className="card">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="mb-1 text-lg font-bold">
              Mes projets
            </h2>

            <p className="mb-0 text-xs text-slate-500">
              Consultez et gérez vos projets.
            </p>
          </div>

          <span className="badge">
            {pagination.total} projet(s)
          </span>
        </div>

        <form
          className="mb-5 flex flex-col gap-3 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            setPage(1);
            setSearch(searchInput);
          }}
        >
          <input
            placeholder="Rechercher un projet par nom..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />

          <button type="submit" className="btn">
            Rechercher
          </button>

          {search && (
            <button
              type="button"
              className="btn light"
              onClick={() => {
                setSearchInput('');
                setSearch('');
                setPage(1);
              }}
            >
              Effacer
            </button>
          )}
        </form>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Projet</th>
                <th>Responsable</th>
                <th>Membres</th>
                <th>Créé le</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {projects.map((p) => (
                <tr key={p._id}>
                  <td>
                    <p className="mb-1 font-semibold text-slate-700">
                      {p.name}
                    </p>

                    <p className="mb-0 max-w-xs text-xs text-slate-400">
                      {p.description || 'Aucune description'}
                    </p>
                  </td>

                  <td>{p.owner?.name || '—'}</td>

                  <td>
                    <span className="badge">
                      {p.members?.length || 0}
                    </span>
                  </td>

                  <td className="whitespace-nowrap text-xs text-slate-500">
                    {fmtDate(p.createdAt)}
                  </td>

                  <td>
                    <div className="flex min-w-48 flex-wrap gap-1.5">
                      <button
                        type="button"
                        className="btn small"
                        onClick={() => openMembers(p)}
                      >
                        Membres
                      </button>

                      <button
                        type="button"
                        className="btn light small"
                        onClick={() => onOpenTasks?.(p._id)}
                      >
                        Tâches
                      </button>

                      <button
                        type="button"
                        className="btn light small"
                        onClick={() => editProject(p)}
                      >
                        Modifier
                      </button>

                      <button
                        type="button"
                        className="btn danger small"
                        onClick={() => removeProject(p._id)}
                      >
                        Supprimer
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {projects.length === 0 && (
                <tr>
                  <td
                    colSpan="5"
                    className="py-10 text-center text-slate-400"
                  >
                    Aucun projet trouvé.
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

      {detail && (
        <section className="card">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="mb-1 text-lg font-bold">
                Membres du projet
              </h2>

              <p className="mb-0 text-xs text-slate-500">
                Projet : {detail.project.name}
              </p>
            </div>

            <button
              type="button"
              className="btn light small"
              onClick={() => setDetail(null)}
            >
              Fermer
            </button>
          </div>

          <form
            className="mb-5 flex flex-col gap-3 sm:flex-row"
            onSubmit={addMember}
          >
            <input
              required
              type="email"
              placeholder="Adresse e-mail du membre"
              value={memberEmail}
              onChange={(e) => setMemberEmail(e.target.value)}
            />

            <button type="submit" className="btn">
              + Ajouter un membre
            </button>
          </form>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>E-mail</th>
                  <th>Rôle</th>
                  <th>Action</th>
                </tr>
              </thead>

              <tbody>
                {detail.members.map((m) => (
                  <tr key={m._id}>
                    <td className="font-medium">{m.name}</td>
                    <td>{m.email}</td>
                    <td>
                      <span className="badge">{m.role}</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn danger small"
                        onClick={() => removeMember(m._id)}
                      >
                        Retirer
                      </button>
                    </td>
                  </tr>
                ))}

                {detail.members.length === 0 && (
                  <tr>
                    <td
                      colSpan="4"
                      className="py-8 text-center text-slate-400"
                    >
                      Aucun membre dans ce projet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}