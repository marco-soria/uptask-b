import mongoose, { Schema, Document, Types } from 'mongoose';

const taskStatus = {
  PENDING: 'pending',
  ON_HOLD: 'on-hold',
  IN_PROGRESS: 'in-progress',
  UNDER_REVIEW: 'under-review',
  COMPLETED: 'completed',
} as const;

export type TaskStatus = (typeof taskStatus)[keyof typeof taskStatus];

export interface ITask extends Document {
  name: string;
  description: string;
  project: Types.ObjectId;
  status: TaskStatus;
}

export const TaskSchema: Schema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    project: { type: Schema.Types.ObjectId, ref: 'Project' },
    status: {
      type: String,
      enum: Object.values(taskStatus),
      default: taskStatus.PENDING,
    },
  },
  { timestamps: true }
);

const Task = mongoose.model<ITask>('Task', TaskSchema);

export default Task;
