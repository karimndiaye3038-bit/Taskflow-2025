
import { useEffect, useState } from 'react';
import { api, fmtDate, makeRun } from '../api';

export default function Profile({ notify }) {
  const run = makeRun(notify);
  const [user, setUser] = useState(null);
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
  });

  const load = () =>
    run(async () => {
      const { user } = await api('/api/users/me');
      setUser(user);
      setForm({
        name: user.name || '',
        email: user.email || '',
        password: '',
      });
    });

  useEffect(() => {
    load();
  }, []);

  const save = (e) => {
    e.preventDefault();

    const body = {
      name: form.name,
      email: form.email,
    };

    if (form.password) {
      body.password = form.password;
    }

    run(
      () =>
        api('/api/users/me', {
          method: 'PATCH',
          body,
        }),
      'Profil mis à jour',
    ).then(load);
  };

  if (!user) {
    return (
      <div className="card text-sm text-slate-500">
        Chargement du profil...
      </div>
    );
  }

  const initials = (user.name || 'U')
    .trim()
    .charAt(0)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <section className="rounded-xl bg-gradient-to-r from-blue-100 to-sky-50 p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-600 text-2xl font-bold text-white shadow-sm">
            {initials}
          </div>

          <div>
            <p className="mb-1 text-xs text-slate-500">
              Espace personnel
            </p>
            <h2 className="mb-2 text-xl font-bold">
              Mon profil
            </h2>
            <span className="badge">{user.role}</span>
          </div>
        </div>
      </section>

      <form className="card" onSubmit={save}>
        <div className="mb-6 border-b border-slate-100 pb-4">
          <h3 className="mb-1 text-base font-bold">
            Informations personnelles
          </h3>
          <p className="mb-0 text-xs text-slate-500">
            Modifiez vos informations de compte.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Nom complet
            </label>
            <input
              required
              value={form.name}
              onChange={(e) =>
                setForm({ ...form, name: e.target.value })
              }
              placeholder="Votre nom"
            />
          </div>

          <div>
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Adresse e-mail
            </label>
            <input
              required
              type="email"
              value={form.email}
              onChange={(e) =>
                setForm({ ...form, email: e.target.value })
              }
              placeholder="nom@exemple.com"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="mb-2 block text-xs font-semibold text-slate-600">
              Nouveau mot de passe
            </label>
            <input
              type="password"
              autoComplete="new-password"
              minLength={8}
              placeholder="Laisser vide pour ne pas le modifier"
              value={form.password}
              onChange={(e) =>
                setForm({ ...form, password: e.target.value })
              }
            />
            <p className="mb-0 mt-2 text-xs text-slate-400">
              Le mot de passe actuel reste inchangé si ce champ est vide.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 pt-5">
          <p className="mb-0 text-xs text-slate-500">
            Compte créé le {fmtDate(user.createdAt)}
          </p>

          <button type="submit" className="btn">
            Enregistrer les modifications
          </button>
        </div>
      </form>
    </div>
  );
}
