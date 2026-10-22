const Project = require('../models/Project');
const Task = require('../models/Task');
const { asyncHandler } = require('../middlewares/error.middleware');

// GET /api/dashboard/stats  -> calculé depuis la base de données
exports.getStats = asyncHandler(async (req, res) => {
  const projectFilter = req.user.role === 'ADMIN' ? {} : { members: req.user._id };
  const projects = await Project.find(projectFilter).select('_id');
  const base = { project: { $in: projects.map((p) => p._id) } };

  const [total, todo, inProgress, done, overdue, myAssigned] = await Promise.all([
    Task.countDocuments(base),
    Task.countDocuments({ ...base, status: 'TODO' }),
    Task.countDocuments({ ...base, status: 'IN_PROGRESS' }),
    Task.countDocuments({ ...base, status: 'DONE' }),
    Task.countDocuments({ ...base, status: { $ne: 'DONE' }, dueDate: { $lt: new Date() } }),
    Task.countDocuments({ ...base, assignedTo: req.user._id }),
  ]);

  res.json({
    success: true,
    stats: {
      totalProjects: projects.length,
      totalTasks: total,
      completedTasks: done,
      inProgressTasks: inProgress,
      overdueTasks: overdue,
      myAssignedTasks: myAssigned,
      tasksByStatus: { TODO: todo, IN_PROGRESS: inProgress, DONE: done },
    },
  });
});
