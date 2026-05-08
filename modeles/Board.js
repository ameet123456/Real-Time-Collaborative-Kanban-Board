const mongoose = require('mongoose');

const boardMemberSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  role: { type: String, enum: ['admin', 'member'], default: 'member' },
});

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Board name is required'],
      trim: true,
      maxlength: [100, 'Board name cannot exceed 100 characters'],
    },
    description: { type: String, trim: true, maxlength: [500, 'Description cannot exceed 500 characters'] },
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    members: [boardMemberSchema],
    background: { type: String, default: '#0f172a' },
  },
  { timestamps: true }
);

// Auto-add owner as admin member when board is created
boardSchema.pre('save', function () {

  if (this.isNew) {

    const alreadyMember = this.members.some(
      (m) => m.user.toString() === this.owner.toString()
    );

    if (!alreadyMember) {

      this.members.push({
        user: this.owner,
        role: 'admin'
      });

    }
  }
});

module.exports = mongoose.model('Board', boardSchema);