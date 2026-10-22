import { useState } from 'react';
import { api, API_URL, makeRun } from '../api';

export default function Login({ onLogin, notify }) {
  const run = makeRun(notify);
  const [email, setEmail] = useState('admin@taskflow.com');
  const [password, setPassword] = useState('');

  const submit = (e) => {
    e.preventDefault();
    run(async () => {
      const d = await api('/api/auth/login', { method: 'POST', body: { email, password } });
      if (d.user.role !== 'ADMIN') throw new Error('Accès réservé aux administrateurs');
      onLogin(d.token, d.user);
    });
  };

  return (
    <form className="card mx-auto mt-20 max-w-sm" onSubmit={submit}>
      <h2>🔐 TaskFlow Admin</h2>
      <p className="muted">API : {API_URL}</p>
      <input type="email" placeholder="Email admin" className="mb-2.5 w-full" value={email} onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Mot de passe" className="mb-2.5 w-full" value={password} onChange={(e) => setPassword(e.target.value)} />
      <button className="btn w-full">Se connecter</button>
      <p className="muted mt-3">Réservé aux comptes ADMIN (créez-en un avec <code>npm run seed</code>).</p>
    </form>
  );
}