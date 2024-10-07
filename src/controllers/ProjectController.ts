import type { Request, Response } from 'express';
import Project from '../models/Project';

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    project.manager = req.user.id;
    try {
      await project.save();
      res.status(201).send({ message: 'Project created successfully' });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({
        $or: [
          { manager: { $in: req.user.id } },
          { team: { $in: req.user.id } },
        ],
      });
      res.json(projects);
    } catch (error) {
      res.status(400).send(error);
    }
  };

  static getProjectById = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id).populate('tasks');

      if (!project) {
        const error = new Error('Project not found');
        res.status(404).json({ error: error.message });
      }
      if (
        project.manager.toString() !== req.user.id.toString() &&
        !project.team.includes(req.user.id)
      ) {
        const error = new Error('Invalid action');
        res.status(404).json({ error: error.message });
      }
      res.json(project);
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };

  static updateProject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);
      if (!project) {
        res.status(404).json({ error: 'Project not found' });
        return;
      }

      Object.assign(project, req.body);

      await project.save();

      res.send({ message: 'Project updated successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };

  static deleteProject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);

      if (!project) {
        const error = new Error('Project not found');
        res.status(404).json({ error: error.message });
      }

      await project.deleteOne();
      res.send({ message: 'Project deleted successfully' });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };
}
