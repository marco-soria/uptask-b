import type { Request, Response } from 'express';
import Task from '../models/Task';
import Project from '../models/Project';

export class TaskController {
  static createTask = async (req: Request, res: Response) => {
    try {
      const task = new Task(req.body);
      task.project = req.project.id;
      req.project.tasks.push(task.id);
      await Promise.allSettled([task.save(), req.project.save()]);
      res.status(201).send({ message: 'Task created successfully' });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  static getProjectTasks = async (req: Request, res: Response) => {
    try {
      const tasks = await Task.find({ project: req.project.id }).populate(
        'project'
      );
      res.json(tasks);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  static getTaskById = async (req: Request, res: Response): Promise<void> => {
    try {
      const task = await Task.findById(req.task.id)
        .populate({ path: 'completedBy.user', select: 'id name email' })
        .populate({
          path: 'notes',
          populate: { path: 'createdBy', select: 'id name email' },
        });
      res.json(task);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  static updateTask = async (req: Request, res: Response): Promise<void> => {
    try {
      Object.assign(req.task, req.body);

      await req.task.save();

      res.send({ message: 'Task updated successfully' });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  static deleteTask = async (req: Request, res: Response) => {
    try {
      req.project.tasks = req.project.tasks.filter(
        (task) => task.toString() !== req.task.id.toString()
      );
      await Promise.allSettled([req.task.deleteOne(), req.project.save()]);

      res.send({ message: 'Task deleted successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };

  static updateStatus = async (req: Request, res: Response) => {
    try {
      const { status } = req.body;
      req.task.status = status;
      await req.task.save();
      res.send({ message: 'Task status updated successfully' });
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  };
}
