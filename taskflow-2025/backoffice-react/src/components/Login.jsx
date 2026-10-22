import { useState } from 'react';
import { api, API_URL, makeRun } from '../api';

export default function Login({ onLogin, notify }) {
  const run = makeRun(notify);
  const [email, setEmail] = useState('admin@taskflow.com');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const submit = (e) => {
    e.preventDefault();

    run(async () => {
      const d = await api('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (d.user.role !== 'ADMIN') {
        throw new Error('Accès réservé aux administrateurs');
      }

      onLogin(d.token, d.user);
    });
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-950 px-4 py-10">
      <div className="w-full max-w-md">

        {/* Logo et identité */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-3xl shadow-lg shadow-blue-600/30">
            ✓
          </div>

          <h1 className="text-3xl font-bold tracking-tight text-white">
            TaskFlow
          </h1>

          <p className="mt-2 text-sm text-slate-400">
            Administration et gestion des tâches
          </p>
        </div>

        {/* Carte de connexion */}
        <div className="rounded-2xl border border-slate-700/70 bg-slate-900 p-8 shadow-2xl sm:p-10">

          <div className="mb-8">
            <p className="mb-2 text-sm font-semibold uppercase tracking-widest text-blue-400">
              Espace sécurisé
            </p>

            <h2 className="text-2xl font-bold text-white">
              Bon retour !
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-400">
              Connectez-vous à votre compte administrateur
              pour accéder à votre tableau de bord.
            </p>
          </div>

          <form onSubmit={submit} className="space-y-5">

            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-slate-200"
              >
                Adresse e-mail
              </label>

              <input
                id="email"
                type="email"
                placeholder="nom@entreprise.com"
                autoComplete="username"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <div className="mb-2 flex items-center justify-between gap-3">
                <label
                  htmlFor="password"
                  className="text-sm font-medium text-slate-200"
                >
                  Mot de passe
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Entrez votre mot de passe"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800/70 px-4 py-3 pr-24 text-white outline-none transition placeholder:text-slate-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/15"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-3 text-sm font-medium text-blue-400 transition hover:text-blue-300"
                >
                  {showPassword ? 'Masquer' : 'Afficher'}
                </button>
              </div>
            </div>

            {/* Bouton */}
            <button
              type="submit"
              className="flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3.5 font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-500 focus:outline-none focus:ring-4 focus:ring-blue-500/30 active:scale-[0.99]"
            >
              Se connecter
              <span className="ml-2" aria-hidden="true">→</span>
            </button>

          </form>

          {/* Informations de sécurité */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-slate-700/60 bg-slate-800/40 p-4">
            <span className="mt-0.5 text-lg" aria-hidden="true">🔒</span>
            <div>
              <p className="text-sm font-medium text-slate-200">
                Accès administrateur sécurisé
              </p>
              <p className="mt-1 text-xs leading-5 text-slate-400">
                Cet espace est réservé aux utilisateurs autorisés
                disposant du rôle ADMIN.
              </p>
            </div>
          </div>

        </div>

        {/* Pied de page */}
        <footer className="mt-6 text-center">
          <p className="text-xs text-slate-500">
            TaskFlow Admin · Connexion sécurisée
          </p>
        </footer>

        {/* Diagnostic API : utile en développement */}
        {import.meta.env.DEV && (
          <p className="mt-3 break-all text-center text-xs text-slate-600">
            API : {API_URL}
          </p>
        )}

      </div>
    </main>
  );
}
