const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Task title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: { type: String, trim: true, maxlength: [2000, 'Description cannot exceed 2000 characters'] },
    list: { type: mongoose.Schema.Types.ObjectId, ref: 'List', required: true },
    board: { type: mongoose.Schema.Types.ObjectId, ref: 'Board', required: true },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    dueDate: { type: Date, default: null },
    position: { type: Number, required: true, default: 0 },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    labels: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Task', taskSchema);