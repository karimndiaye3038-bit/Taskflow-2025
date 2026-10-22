// Petites fonctions utilitaires réutilisées partout

const sameId = (a, b) => String(a && a._id ? a._id : a) === String(b && b._id ? b._id : b);

// Un ADMIN a accès à tout. Sinon il faut être membre du projet.
const isMember = (project, user) =>
  user.role === 'ADMIN' || project.members.some((m) => sameId(m, user._id));

// Responsable du projet (ou ADMIN)
const isOwner = (project, user) => user.role === 'ADMIN' || sameId(project.owner, user._id);

const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const getPagination = (query) => {
  const page = Math.max(parseInt(query.page) || 1, 1);
  const limit = Math.min(Math.max(parseInt(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
};

const paginationInfo = (page, limit, total) => ({
  page,
  limit,
  total,
  totalPages: Math.ceil(total / limit),
});

module.exports = { sameId, isMember, isOwner, escapeRegex, getPagination, paginationInfo };
