import type { Request, Response, NextFunction } from 'express';
import Task, { ITask } from '../models/Task';

declare global {
  namespace Express {
    interface Request {
      task: ITask;
    }
  }
}

export async function taskExists(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const { taskId } = req.params;
    const task = await Task.findById(taskId);

    if (!task) {
      const error = new Error('task not found');
      res.status(404).json({ error: error.message });
    }
    req.task = task;
    next();
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

export function taskBelongsToProject(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (req.task.project.toString() !== req.project.id.toString()) {
    res.status(403).send({ message: 'Task does not belong to project' });
    return;
  }
  next();
}

export function hasAuthorization(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (req.user.id.toString() !== req.project.manager.toString()) {
    const error = new Error('Invalid Action');
    res.status(400).json({ error: error.message });
  }
  next();
}
