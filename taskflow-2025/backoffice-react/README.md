# TaskFlow Backoffice (React + Vite)

Interface d'administration pour tester tous les modules de l'API TaskFlow :
Dashboard, Utilisateurs (ADMIN), Projets + membres, Tâches (filtres, recherche, tri, pagination), Profil.

## Lancer en local
```bash
npm install
# Vérifier .env : VITE_API_URL=http://localhost:5000
npm run dev        # http://localhost:5173
```
L'API doit tourner (`npm run dev` dans taskflow-api) et un admin doit exister (`npm run seed`).
Connexion : admin@taskflow.com / Admin123!

## Déployer sur Vercel
1. Pousser ce dossier sur GitHub.
2. Vercel → **Add New Project** → choisir le dépôt (Framework : Vite).
3. **Environment Variables** : `VITE_API_URL` = `https://VOTRE-API.onrender.com`
4. Deploy.
5. Sur Render, mettre `CLIENT_URL` = l'URL Vercel (sans `/` final) pour autoriser le CORS.

## Structure
```
src/
├── main.jsx            # point d'entrée
├── App.jsx             # connexion, menu, navigation
├── api.js              # appels à l'API (token JWT)
├── styles.css
├── components/         # Login.jsx, Pager.jsx
└── pages/              # Dashboard, Users, Projects, Tasks, Profile
```
