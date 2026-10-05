import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a project name'],
    },
    description: {
      type: String,
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      }
    ],
  },
  {
    timestamps: true,
  }
);

const Project = mongoose.model('Project', projectSchema);
export default Project;
