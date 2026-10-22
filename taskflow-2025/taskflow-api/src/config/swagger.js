// Documentation OpenAPI 3.0 de TaskFlow (affichée sur /api-docs)

const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const bearer = [{ bearerAuth: [] }];
const ID = '665f1c2e9b1e8a001c8e4a11';

const idParam = (name, description) => ({ name, in: 'path', required: true, description, schema: { type: 'string', example: ID } });
const query = (name, description, schema, example) => ({ name, in: 'query', description, schema, example });

const pageParams = [
  query('page', 'Numéro de page (défaut 1)', { type: 'integer', default: 1 }, 1),
  query('limit', "Éléments par page (défaut 10, max 100)", { type: 'integer', default: 10 }, 10),
];
const taskQueryParams = [
  query('status', 'Filtrer par statut', { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] }),
  query('priority', 'Filtrer par priorité', { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }),
  query('assignedTo', 'Id de l\'utilisateur assigné (ou "me")', { type: 'string' }, 'me'),
  query('search', 'Recherche par titre', { type: 'string' }, 'maquette'),
  query('overdue', 'true = uniquement les tâches en retard', { type: 'boolean' }),
  query('sortBy', 'Champ de tri', { type: 'string', enum: ['createdAt', 'dueDate'], default: 'createdAt' }),
  query('order', 'Ordre de tri', { type: 'string', enum: ['asc', 'desc'], default: 'desc' }),
  ...pageParams,
];

const errorResponse = (description, message) => ({
  description,
  content: { 'application/json': { schema: ref('Error'), example: { success: false, message } } },
});
const E = {
  400: errorResponse('Données invalides', 'Le titre est obligatoire'),
  401: errorResponse('Non authentifié (token manquant, invalide ou expiré)', 'Token invalide ou expiré'),
  403: errorResponse('Accès refusé (permissions insuffisantes)', "Vous n'avez pas accès à ce projet"),
  404: errorResponse('Ressource introuvable', 'Projet introuvable'),
  409: errorResponse('Conflit (doublon ou règle métier)', 'Cet email est déjà utilisé'),
  500: errorResponse('Erreur interne du serveur', 'Erreur interne du serveur'),
};
const errors = (...codes) => Object.fromEntries(codes.map((c) => [c, E[c]]));

const ok = (description, schema, example) => ({ description, content: { 'application/json': { schema, example } } });
const body = (schema, example) => ({ required: true, content: { 'application/json': { schema, example } } });

const exUser = { _id: ID, name: 'Alice Diallo', email: 'alice@example.com', role: 'USER', createdAt: '2026-01-10T09:00:00.000Z', updatedAt: '2026-01-10T09:00:00.000Z' };
const exProject = { _id: ID, name: 'Refonte site web', description: 'Nouveau site vitrine', owner: ID, members: [ID], createdAt: '2026-01-10T09:00:00.000Z', updatedAt: '2026-01-10T09:00:00.000Z' };
const exTask = { _id: ID, title: 'Créer la maquette', description: 'Maquette Figma de la page accueil', status: 'TODO', priority: 'HIGH', dueDate: '2026-12-31T00:00:00.000Z', assignedTo: ID, project: ID, createdBy: ID, createdAt: '2026-01-10T09:00:00.000Z', updatedAt: '2026-01-10T09:00:00.000Z' };
const exPagination = { page: 1, limit: 10, total: 1, totalPages: 1 };

const list = (itemSchema, example) =>
  ok('Liste paginée', { type: 'object', properties: { success: { type: 'boolean' }, data: { type: 'array', items: itemSchema }, pagination: ref('Pagination') } },
    { success: true, data: [example], pagination: exPagination });

const spec = {
  openapi: '3.0.3',
  info: {
    title: 'TaskFlow API',
    version: '1.0.0',
    description:
      "API REST pour gérer **projets**, **équipes** et **tâches**.\n\n" +
      "### Comment tester ?\n1. `POST /api/auth/login` pour obtenir un token\n2. Cliquez sur **Authorize** et collez le token (sans le mot « Bearer »)\n3. Testez les routes protégées\n\n" +
      "### Format des erreurs\n```json\n{ \"success\": false, \"message\": \"Description de l'erreur\" }\n```",
  },
  servers: [{ url: '/', description: 'Serveur courant' }],
  tags: [
    { name: 'Auth', description: 'Inscription et connexion' },
    { name: 'Profil', description: "Profil de l'utilisateur connecté" },
    { name: 'Admin - Utilisateurs', description: 'Gestion des utilisateurs (rôle ADMIN requis)' },
    { name: 'Projets', description: 'Projets et membres' },
    { name: 'Tâches', description: 'Tâches, filtres, recherche, pagination, tri' },
    { name: 'Dashboard', description: 'Statistiques' },
  ],
  components: {
    securitySchemes: { bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' } },
    schemas: {
      Error: { type: 'object', properties: { success: { type: 'boolean', example: false }, message: { type: 'string' } } },
      Pagination: { type: 'object', properties: { page: { type: 'integer' }, limit: { type: 'integer' }, total: { type: 'integer' }, totalPages: { type: 'integer' } } },
      User: {
        type: 'object',
        properties: {
          _id: { type: 'string' }, name: { type: 'string' }, email: { type: 'string', format: 'email' },
          role: { type: 'string', enum: ['ADMIN', 'USER'] }, createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
        },
        example: exUser,
      },
      Project: {
        type: 'object',
        properties: {
          _id: { type: 'string' }, name: { type: 'string' }, description: { type: 'string' },
          owner: { type: 'string', description: 'Id du responsable' }, members: { type: 'array', items: { type: 'string' } },
          createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
        },
        example: exProject,
      },
      Task: {
        type: 'object',
        properties: {
          _id: { type: 'string' }, title: { type: 'string' }, description: { type: 'string' },
          status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] }, priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] },
          dueDate: { type: 'string', format: 'date-time', nullable: true }, assignedTo: { type: 'string', nullable: true },
          project: { type: 'string' }, createdBy: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' }, updatedAt: { type: 'string', format: 'date-time' },
        },
        example: exTask,
      },
      Stats: {
        type: 'object',
        properties: {
          totalProjects: { type: 'integer' }, totalTasks: { type: 'integer' }, completedTasks: { type: 'integer' },
          inProgressTasks: { type: 'integer' }, overdueTasks: { type: 'integer' }, myAssignedTasks: { type: 'integer' },
          tasksByStatus: { type: 'object', properties: { TODO: { type: 'integer' }, IN_PROGRESS: { type: 'integer' }, DONE: { type: 'integer' } } },
        },
      },
      AuthResponse: { type: 'object', properties: { success: { type: 'boolean' }, token: { type: 'string' }, user: ref('User') } },
    },
  },
  paths: {
    '/api/auth/register': {
      post: {
        tags: ['Auth'], summary: 'Inscrire un utilisateur (rôle USER)',
        requestBody: body({ type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string', minLength: 6 } } },
          { name: 'Alice Diallo', email: 'alice@example.com', password: 'secret123' }),
        responses: { 201: ok('Compte créé', ref('AuthResponse'), { success: true, token: 'eyJhbGciOi...', user: exUser }), ...errors(400, 409, 500) },
      },
    },
    '/api/auth/login': {
      post: {
        tags: ['Auth'], summary: 'Connexion (email + mot de passe)',
        requestBody: body({ type: 'object', required: ['email', 'password'], properties: { email: { type: 'string' }, password: { type: 'string' } } },
          { email: 'admin@taskflow.com', password: 'Admin123!' }),
        responses: { 200: ok('Connexion réussie', ref('AuthResponse'), { success: true, token: 'eyJhbGciOi...', user: exUser }), 400: E[400], 401: E[401], 500: E[500] },
      },
    },
    '/api/users/me': {
      get: {
        tags: ['Profil'], summary: 'Consulter mon profil', security: bearer,
        responses: { 200: ok('Profil', { type: 'object', properties: { success: { type: 'boolean' }, user: ref('User') } }, { success: true, user: exUser }), ...errors(401, 500) },
      },
      patch: {
        tags: ['Profil'], summary: 'Modifier mon profil', security: bearer,
        requestBody: body({ type: 'object', properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string', minLength: 6 } } }, { name: 'Alice D.' }),
        responses: { 200: ok('Profil modifié', { type: 'object', properties: { success: { type: 'boolean' }, user: ref('User') } }, { success: true, user: exUser }), ...errors(400, 401, 409, 500) },
      },
    },
    '/api/users': {
      get: {
        tags: ['Admin - Utilisateurs'], summary: 'Lister les utilisateurs (ADMIN)', security: bearer,
        parameters: [query('search', 'Recherche nom ou email', { type: 'string' }), query('role', 'Filtrer par rôle', { type: 'string', enum: ['ADMIN', 'USER'] }), ...pageParams],
        responses: { 200: list(ref('User'), exUser), ...errors(400, 401, 403, 500) },
      },
      post: {
        tags: ['Admin - Utilisateurs'], summary: 'Créer un utilisateur avec un rôle (ADMIN)', security: bearer,
        requestBody: body({ type: 'object', required: ['name', 'email', 'password'], properties: { name: { type: 'string' }, email: { type: 'string' }, password: { type: 'string' }, role: { type: 'string', enum: ['ADMIN', 'USER'] } } },
          { name: 'Bob', email: 'bob@example.com', password: 'secret123', role: 'USER' }),
        responses: { 201: ok('Utilisateur créé', { type: 'object', properties: { success: { type: 'boolean' }, user: ref('User') } }, { success: true, user: exUser }), ...errors(400, 401, 403, 409, 500) },
      },
    },
    '/api/users/{id}': {
      get: {
        tags: ['Admin - Utilisateurs'], summary: 'Consulter un utilisateur (ADMIN)', security: bearer, parameters: [idParam('id', "Id de l'utilisateur")],
        responses: { 200: ok('Utilisateur', { type: 'object', properties: { success: { type: 'boolean' }, user: ref('User') } }, { success: true, user: exUser }), ...errors(401, 403, 404, 500) },
      },
      delete: {
        tags: ['Admin - Utilisateurs'], summary: 'Supprimer un utilisateur (ADMIN)', security: bearer, parameters: [idParam('id', "Id de l'utilisateur")],
        responses: { 200: ok('Supprimé', ref('Error'), { success: true, message: 'Utilisateur supprimé' }), ...errors(401, 403, 404, 409, 500) },
      },
    },
    '/api/users/{id}/role': {
      patch: {
        tags: ['Admin - Utilisateurs'], summary: "Changer le rôle d'un utilisateur (ADMIN)", security: bearer, parameters: [idParam('id', "Id de l'utilisateur")],
        requestBody: body({ type: 'object', required: ['role'], properties: { role: { type: 'string', enum: ['ADMIN', 'USER'] } } }, { role: 'ADMIN' }),
        responses: { 200: ok('Rôle modifié', { type: 'object', properties: { success: { type: 'boolean' }, user: ref('User') } }, { success: true, user: { ...exUser, role: 'ADMIN' } }), ...errors(400, 401, 403, 404, 409, 500) },
      },
    },
    '/api/projects': {
      post: {
        tags: ['Projets'], summary: 'Créer un projet (vous en êtes le responsable)', security: bearer,
        requestBody: body({ type: 'object', required: ['name'], properties: { name: { type: 'string' }, description: { type: 'string' } } }, { name: 'Refonte site web', description: 'Nouveau site vitrine' }),
        responses: { 201: ok('Projet créé', { type: 'object', properties: { success: { type: 'boolean' }, project: ref('Project') } }, { success: true, project: exProject }), ...errors(400, 401, 500) },
      },
      get: {
        tags: ['Projets'], summary: 'Lister mes projets (tous les projets pour un ADMIN)', security: bearer,
        parameters: [query('search', 'Recherche par nom', { type: 'string' }, 'site'), ...pageParams],
        responses: { 200: list(ref('Project'), exProject), ...errors(401, 500) },
      },
    },
    '/api/projects/{id}': {
      get: {
        tags: ['Projets'], summary: "Détails d'un projet (membres uniquement)", security: bearer, parameters: [idParam('id', 'Id du projet')],
        responses: { 200: ok('Projet', { type: 'object', properties: { success: { type: 'boolean' }, project: ref('Project') } }, { success: true, project: exProject }), ...errors(401, 403, 404, 500) },
      },
      patch: {
        tags: ['Projets'], summary: 'Modifier un projet (responsable uniquement)', security: bearer, parameters: [idParam('id', 'Id du projet')],
        requestBody: body({ type: 'object', properties: { name: { type: 'string' }, description: { type: 'string' } } }, { name: 'Nouveau nom' }),
        responses: { 200: ok('Projet modifié', { type: 'object', properties: { success: { type: 'boolean' }, project: ref('Project') } }, { success: true, project: exProject }), ...errors(400, 401, 403, 404, 500) },
      },
      delete: {
        tags: ['Projets'], summary: 'Supprimer un projet et ses tâches (responsable uniquement)', security: bearer, parameters: [idParam('id', 'Id du projet')],
        responses: { 200: ok('Supprimé', ref('Error'), { success: true, message: 'Projet et tâches supprimés' }), ...errors(401, 403, 404, 500) },
      },
    },
    '/api/projects/{id}/members': {
      post: {
        tags: ['Projets'], summary: 'Ajouter un membre (responsable uniquement)', security: bearer, parameters: [idParam('id', 'Id du projet')],
        requestBody: body({ type: 'object', properties: { userId: { type: 'string' }, email: { type: 'string' } }, description: 'Fournir userId OU email' }, { email: 'bob@example.com' }),
        responses: { 201: ok('Membre ajouté', { type: 'object', properties: { success: { type: 'boolean' }, members: { type: 'array', items: ref('User') } } }, { success: true, members: [exUser] }), ...errors(400, 401, 403, 404, 409, 500) },
      },
      get: {
        tags: ['Projets'], summary: "Lister les membres d'un projet", security: bearer, parameters: [idParam('id', 'Id du projet')],
        responses: { 200: ok('Membres', { type: 'object', properties: { success: { type: 'boolean' }, members: { type: 'array', items: ref('User') } } }, { success: true, members: [exUser] }), ...errors(401, 403, 404, 500) },
      },
    },
    '/api/projects/{id}/members/{userId}': {
      delete: {
        tags: ['Projets'], summary: 'Retirer un membre (responsable uniquement)', security: bearer,
        parameters: [idParam('id', 'Id du projet'), idParam('userId', "Id du membre")],
        responses: { 200: ok('Membre retiré', ref('Error'), { success: true, message: 'Membre retiré du projet' }), ...errors(401, 403, 404, 409, 500) },
      },
    },
    '/api/projects/{id}/tasks': {
      post: {
        tags: ['Tâches'], summary: 'Créer une tâche dans un projet', security: bearer, parameters: [idParam('id', 'Id du projet')],
        requestBody: body({ type: 'object', required: ['title'], properties: { title: { type: 'string' }, description: { type: 'string' }, status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] }, priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }, dueDate: { type: 'string', format: 'date' }, assignedTo: { type: 'string' } } },
          { title: 'Créer la maquette', description: 'Maquette Figma', priority: 'HIGH', dueDate: '2026-12-31', assignedTo: ID }),
        responses: { 201: ok('Tâche créée', { type: 'object', properties: { success: { type: 'boolean' }, task: ref('Task') } }, { success: true, task: exTask }), ...errors(400, 401, 403, 404, 500) },
      },
      get: {
        tags: ['Tâches'], summary: "Lister les tâches d'un projet (filtres, recherche, tri, pagination)", security: bearer,
        parameters: [idParam('id', 'Id du projet'), ...taskQueryParams],
        responses: { 200: list(ref('Task'), exTask), ...errors(400, 401, 403, 404, 500) },
      },
    },
    '/api/tasks': {
      get: {
        tags: ['Tâches'], summary: 'Lister toutes les tâches de mes projets', security: bearer, parameters: taskQueryParams,
        responses: { 200: list(ref('Task'), exTask), ...errors(400, 401, 500) },
      },
    },
    '/api/tasks/{id}': {
      get: {
        tags: ['Tâches'], summary: "Détails d'une tâche", security: bearer, parameters: [idParam('id', 'Id de la tâche')],
        responses: { 200: ok('Tâche', { type: 'object', properties: { success: { type: 'boolean' }, task: ref('Task') } }, { success: true, task: exTask }), ...errors(401, 403, 404, 500) },
      },
      patch: {
        tags: ['Tâches'], summary: 'Modifier une tâche (assigner = champ assignedTo, null pour désassigner)', security: bearer, parameters: [idParam('id', 'Id de la tâche')],
        requestBody: body({ type: 'object', properties: { title: { type: 'string' }, description: { type: 'string' }, status: { type: 'string', enum: ['TODO', 'IN_PROGRESS', 'DONE'] }, priority: { type: 'string', enum: ['LOW', 'MEDIUM', 'HIGH'] }, dueDate: { type: 'string', nullable: true }, assignedTo: { type: 'string', nullable: true } } },
          { status: 'IN_PROGRESS', assignedTo: ID }),
        responses: { 200: ok('Tâche modifiée', { type: 'object', properties: { success: { type: 'boolean' }, task: ref('Task') } }, { success: true, task: { ...exTask, status: 'IN_PROGRESS' } }), ...errors(400, 401, 403, 404, 500) },
      },
      delete: {
        tags: ['Tâches'], summary: 'Supprimer une tâche (créateur, responsable du projet ou admin)', security: bearer, parameters: [idParam('id', 'Id de la tâche')],
        responses: { 200: ok('Supprimée', ref('Error'), { success: true, message: 'Tâche supprimée' }), ...errors(401, 403, 404, 500) },
      },
    },
    '/api/dashboard/stats': {
      get: {
        tags: ['Dashboard'], summary: 'Statistiques calculées depuis la base de données', security: bearer,
        responses: {
          200: ok('Statistiques', { type: 'object', properties: { success: { type: 'boolean' }, stats: ref('Stats') } }, {
            success: true,
            stats: { totalProjects: 3, totalTasks: 12, completedTasks: 4, inProgressTasks: 5, overdueTasks: 2, myAssignedTasks: 6, tasksByStatus: { TODO: 3, IN_PROGRESS: 5, DONE: 4 } },
          }),
          ...errors(401, 500),
        },
      },
    },
  },
};

module.exports = spec;
