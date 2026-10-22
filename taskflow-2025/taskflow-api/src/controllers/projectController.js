const Project = require('../models/Project');
const Task = require('../models/Task');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../middlewares/error.middleware');
const { isMember, isOwner, sameId, escapeRegex, getPagination, paginationInfo } = require('../utils/helpers');

// Cherche un projet ou renvoie 404 (utilisé aussi par taskController)
const getProjectOrFail = async (id) => {
  const project = await Project.findById(id);
  if (!project) throw httpError(404, 'Projet introuvable');
  return project;
};

const populateProject = (query) => query.populate('owner', 'name email').populate('members', 'name email role');

// POST /api/projects
exports.createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;
  if (!name) throw httpError(400, 'Le nom du projet est obligatoire');
  const project = await Project.create({ name, description, owner: req.user._id, members: [req.user._id] });
  res.status(201).json({ success: true, project });
});

// GET /api/projects?search=&page=&limit=
exports.listProjects = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = req.user.role === 'ADMIN' ? {} : { members: req.user._id };
  if (req.query.search) filter.name = new RegExp(escapeRegex(req.query.search), 'i');

  const [projects, total] = await Promise.all([
    populateProject(Project.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit)),
    Project.countDocuments(filter),
  ]);
  res.json({ success: true, data: projects, pagination: paginationInfo(page, limit, total) });
});

// GET /api/projects/:id
exports.getProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isMember(project, req.user)) throw httpError(403, "Vous n'avez pas accès à ce projet");
  await project.populate([{ path: 'owner', select: 'name email' }, { path: 'members', select: 'name email role' }]);
  res.json({ success: true, project });
});

// PATCH /api/projects/:id
exports.updateProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isOwner(project, req.user)) throw httpError(403, 'Seul le responsable du projet peut le modifier');
  const { name, description } = req.body;
  if (name !== undefined) project.name = name;
  if (description !== undefined) project.description = description;
  await project.save();
  res.json({ success: true, project });
});

// DELETE /api/projects/:id
exports.deleteProject = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isOwner(project, req.user)) throw httpError(403, 'Seul le responsable du projet peut le supprimer');
  await Task.deleteMany({ project: project._id }); // on supprime aussi ses tâches
  await project.deleteOne();
  res.json({ success: true, message: 'Projet et tâches supprimés' });
});

// POST /api/projects/:id/members   body: { userId } ou { email }
exports.addMember = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isOwner(project, req.user)) throw httpError(403, 'Seul le responsable du projet peut ajouter des membres');

  const { userId, email } = req.body;
  if (!userId && !email) throw httpError(400, 'Fournissez "userId" ou "email"');
  const user = userId ? await User.findById(userId) : await User.findOne({ email: email.toLowerCase() });
  if (!user) throw httpError(404, 'Utilisateur introuvable');
  if (project.members.some((m) => sameId(m, user))) throw httpError(409, 'Cet utilisateur est déjà membre du projet');

  project.members.push(user._id);
  await project.save();
  await project.populate('members', 'name email role');
  res.status(201).json({ success: true, members: project.members });
});

// GET /api/projects/:id/members
exports.listMembers = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isMember(project, req.user)) throw httpError(403, "Vous n'avez pas accès à ce projet");
  await project.populate('members', 'name email role');
  res.json({ success: true, members: project.members });
});

// DELETE /api/projects/:id/members/:userId
exports.removeMember = asyncHandler(async (req, res) => {
  const project = await getProjectOrFail(req.params.id);
  if (!isOwner(project, req.user)) throw httpError(403, 'Seul le responsable du projet peut retirer des membres');
  if (sameId(project.owner, req.params.userId)) throw httpError(409, 'Le responsable ne peut pas être retiré du projet');
  if (!project.members.some((m) => sameId(m, req.params.userId))) throw httpError(404, "Cet utilisateur n'est pas membre du projet");

  project.members = project.members.filter((m) => !sameId(m, req.params.userId));
  await project.save();
  await Task.updateMany({ project: project._id, assignedTo: req.params.userId }, { assignedTo: null });
  res.json({ success: true, message: 'Membre retiré du projet' });
});

exports.getProjectOrFail = getProjectOrFail;
