const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Le titre est obligatoire'], trim: true, minlength: [2, 'Le titre doit avoir au moins 2 caractères'] },
    description: { type: String, trim: true, default: '' },
    status: { type: String, enum: { values: ['TODO', 'IN_PROGRESS', 'DONE'], message: 'Statut invalide (TODO, IN_PROGRESS, DONE)' }, default: 'TODO' },
    priority: { type: String, enum: { values: ['LOW', 'MEDIUM', 'HIGH'], message: 'Priorité invalide (LOW, MEDIUM, HIGH)' }, default: 'MEDIUM' },
    dueDate: { type: Date, default: null },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    project: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true } // createdAt + updatedAt
);

module.exports = mongoose.model('Task', taskSchema);
