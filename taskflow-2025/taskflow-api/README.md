# 📋 TaskFlow API

API REST pour gérer des **projets**, des **équipes** et des **tâches**.
Stack : Node.js, Express, MongoDB (Mongoose), JWT, bcrypt, Swagger (OpenAPI 3).

## 1. Lancer en local

```bash
cd taskflow-api
npm install
# Vérifiez le fichier .env (MONGO_URI, JWT_SECRET)
npm run seed     # crée le compte ADMIN (admin@taskflow.com / Admin123!)
npm run dev      # démarre sur http://localhost:5000
```

- Documentation Swagger : http://localhost:5000/api-docs
- MongoDB local requis, ou une base gratuite MongoDB Atlas (mettre l'URI dans `.env`).

## 2. Tester avec Swagger
1. Ouvrir `/api-docs`
2. `POST /api/auth/login` → copier le `token` de la réponse
3. Bouton **Authorize** (cadenas) → coller le token → **Authorize**
4. Tester toutes les routes protégées

## 3. Règles métier
| Règle | Détail |
|---|---|
| Inscription | Toujours rôle `USER`. L'admin se crée avec `npm run seed` ou via `POST /api/users` (ADMIN) |
| Projet | Le créateur est le **responsable** et le premier membre |
| Accès projet | Membres uniquement (403 sinon). L'ADMIN accède à tout |
| Modifier / supprimer un projet, gérer les membres | Responsable (ou ADMIN) |
| Supprimer un projet | Supprime aussi ses tâches |
| Tâche | Un assigné doit être membre du projet (400 sinon) |
| Supprimer une tâche | Créateur de la tâche, responsable du projet ou ADMIN |
| Mot de passe | Haché (bcrypt), jamais renvoyé |

## 4. Liste des routes
| Méthode | Route | Description | Accès |
|---|---|---|---|
| POST | /api/auth/register | Inscription | Public |
| POST | /api/auth/login | Connexion | Public |
| GET / PATCH | /api/users/me | Voir / modifier son profil | Connecté |
| GET / POST | /api/users | Lister / créer des utilisateurs | ADMIN |
| GET / DELETE | /api/users/:id | Voir / supprimer un utilisateur | ADMIN |
| PATCH | /api/users/:id/role | Changer le rôle | ADMIN |
| POST / GET | /api/projects | Créer / lister (search, page, limit) | Connecté |
| GET / PATCH / DELETE | /api/projects/:id | Détails / modifier / supprimer | Membre / Responsable |
| POST / GET | /api/projects/:id/members | Ajouter / lister les membres | Responsable / Membre |
| DELETE | /api/projects/:id/members/:userId | Retirer un membre | Responsable |
| POST / GET | /api/projects/:id/tasks | Créer / lister les tâches du projet | Membre |
| GET | /api/tasks | Toutes mes tâches (filtres) | Connecté |
| GET / PATCH / DELETE | /api/tasks/:id | Détails / modifier / supprimer | Membre |
| GET | /api/dashboard/stats | Statistiques | Connecté |

**Filtres des tâches** : `?status=TODO&priority=HIGH&assignedTo=me&search=maquette&overdue=true&sortBy=dueDate&order=asc&page=1&limit=10`

## 5. Déploiement sur Render (API)
1. Créer une base gratuite sur **MongoDB Atlas** (autoriser l'IP `0.0.0.0/0`) et copier l'URI.
2. Pousser le dossier `taskflow-api` sur GitHub.
3. Render → **New Web Service** → choisir le dépôt
   - Build Command : `npm install`
   - Start Command : `npm start`
4. Variables d'environnement : `MONGO_URI`, `JWT_SECRET` (long et secret), `CLIENT_URL` (URL Vercel, ou `*`).
5. Créer l'admin en production : en local, mettre l'URI Atlas dans `.env` puis `npm run seed`.

## 6. Backoffice (Vercel)
Voir le dossier `backoffice/` : modifier `config.js` avec l'URL Render, puis déployer le dossier sur Vercel.
