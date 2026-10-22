const Task = require('../models/Task');
const Project = require('../models/Project');
const { asyncHandler, httpError } = require('../middlewares/error.middleware');
const { getProjectOrFail } = require('./projectController');
const { isMember, isOwner, sameId, escapeRegex, getPagination, paginationInfo } = require('../utils/helpers');

const STATUSES = ['TODO', 'IN_PROGRESS', 'DONE'];
const PRIORITIES = ['LOW', 'MEDIUM', 'HIGH'];

// Construit le filtre MongoDB à partir des paramètres de l'URL
const buildFilter = (query, user) => {
  const filter = {};
  if (query.status) {
    if (!STATUSES.includes(query.status)) throw httpError(400, 'Statut invalide (TODO, IN_PROGRESS, DONE)');
    filter.status = query.status;
  }
  if (query.priority) {
    if (!PRIORITIES.includes(query.priority)) throw httpError(400, 'Priorité invalide (LOW, MEDIUM, HIGH)');
    filter.priority = query.priority;
  }
  if (query.assignedTo) filter.assignedTo = query.assignedTo === 'me' ? user._id : query.assignedTo;
  if (query.search) filter.title = new RegExp(escapeRegex(query.search), 'i');
  if (query.overdue === 'true') {
    filter.dueDate = { $lt: new Date() };
    filter.status = { $ne: 'DONE' };
  }
  return filter;
};

// Tri : ?sortBy=createdAt|dueDate&order=asc|desc
const buildSort = (query) => {
  const sortBy = query.sortBy || 'createdAt';
  if (!['createdAt', 'dueDate'].includes(sortBy)) throw httpError(400, 'sortBy invalide (createdAt, dueDate)');
  if (query.order && !['asc', 'desc'].includes(query.order)) throw httpError(400, 'order invalide (asc, desc)');
  return { [sortBy]: query.order === 'asc' ? 1 : -1 };
};

const runList = async (filter, query, res) => {
  const { page, limit, skip } = getPagination(query);
  const sort = buildSort(query);
  const [tasks, total] = await Promise.all([
    Task.find(filter)
      .populate('assignedTo', 'name email')
      .populate('project', 'name')
      .sort(sort)
      .skip(skip)
      .limit(limit),
    Task.countDocuments(filter),
  ]);
  res.json({ success: true, data: tasks, pagination: paginationInfo(page, limit, total) });
};

// Charge une tâche + son projet et vérifie l'accès
const getTaskWithAccess = async (id, user) => {
  const task = await Task.findById(id);
  if (!task) throw httpError(404, 'Tâche introuvable');
  const project = await Project.findById(task.project);
  if (!project || !isMember(project, user)) throw httpError(403, "Vous n'avez pas accès à cette tâche");
  return { task, project };
};

const checkAssignee = (project, userId) => {
  if (userId && !project.members.some((m) => sameId(m, userId))) {
    throw httpError(400, "L'utilisateur assigné doit être membre du projet");
  }
};

// POST /api/projects/:id/tasks
exports.createTask = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isMember(project, req.user)) throw httpError(403, "Vous n'avez pas accès à ce projet");

  const { title, description, status, priority, dueDate, assignedTo } = req.body;
  if (!title) throw httpError(400, 'Le titre est obligatoire');
  checkAssignee(project, assignedTo);

  const task = await Task.create({
    title, description, status, priority, dueDate,
    assignedTo: assignedTo || null,
    project: project._id,
    createdBy: req.user._id,
  });
  res.status(201).json({ success: true, task });
});

// GET /api/projects/:id/tasks
exports.listProjectTasks = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isMember(project, req.user)) throw httpError(403, "Vous n'avez pas accès à ce projet");
  const filter = { project: project._id, ...buildFilter(req.query, req.user) };
  await runList(filter, req.query, res);
});

// GET /api/tasks  (toutes les tâches de mes projets)
exports.listMyTasks = asyncHandler(async (req, res) => {
  const projectFilter = req.user.role === 'ADMIN' ? {} : { members: req.user._id };
  const projects = await Project.find(projectFilter).select('_id');
  const filter = { project: { $in: projects.map((p) => p._id) }, ...buildFilter(req.query, req.user) };
  await runList(filter, req.query, res);
});

// GET /api/tasks/:id
exports.getTask = asyncHandler(async (req, res) => {
  const { task } = await getTaskWithAccess(req.params.id, req.user);
  await task.populate([{ path: 'assignedTo', select: 'name email' }, { path: 'project', select: 'name' }]);
  res.json({ success: true, task });
});

// PATCH /api/tasks/:id
exports.updateTask = asyncHandler(async (req, res) => {
  const { task, project } = await getTaskWithAccess(req.params.id, req.user);
  const { title, description, status, priority, dueDate, assignedTo } = req.body;

  if (title !== undefined) task.title = title;
  if (description !== undefined) task.description = description;
  if (status !== undefined) task.status = status;
  if (priority !== undefined) task.priority = priority;
  if (dueDate !== undefined) task.dueDate = dueDate; // null pour supprimer la date
  if (assignedTo !== undefined) {
    checkAssignee(project, assignedTo);
    task.assignedTo = assignedTo || null; // null pour désassigner
  }
  await task.save();
  res.json({ success: true, task });
});

// DELETE /api/tasks/:id  (créateur de la tâche, responsable du projet ou admin)
exports.deleteTask = asyncHandler(async (req, res) => {
  const { task, project } = await getTaskWithAccess(req.params.id, req.user);
  if (!isOwner(project, req.user) && !sameId(task.createdBy, req.user._id)) {
    throw httpError(403, 'Seul le créateur de la tâche ou le responsable du projet peut la supprimer');
  }
  await task.deleteOne();
  res.json({ success: true, message: 'Tâche supprimée' });
});
