// Toutes les requêtes vers l'API passent par ce fichier
export const API_URL = (
  import.meta.env.VITE_API_URL ||
  'https://taskflow-2025.onrender.com'
).replace(/\/$/, '');

let onUnauthorized = () => {};
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('tf_token');
  const res = await fetch(API_URL + path, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: 'Bearer ' + token } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && token) onUnauthorized(); // token expiré -> déconnexion
    throw new Error(data.message || 'Erreur ' + res.status);
  }
  return data;
}

// Exécute une action, affiche un message de succès ou l'erreur
export const makeRun = (notify) => async (fn, successMessage) => {
  try {
    const result = await fn();
    if (successMessage) notify(successMessage);
    return result;
  } catch (e) {
    notify(e.message, false);
  }
};

export const fmtDate = (d) => (d ? new Date(d).toLocaleDateString('fr-FR') : '—');
