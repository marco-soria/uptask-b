import type { Request, Response } from "express";
import Project from "../models/Project";

export class ProjectController {
  static createProject = async (req: Request, res: Response) => {
    const project = new Project(req.body);

    try {
      await project.save();
      res.status(201).send({ message: "Project created successfully" });
    } catch (error) {
      res.status(400).send(error);
    }
  };

  static getAllProjects = async (req: Request, res: Response) => {
    try {
      const projects = await Project.find({});
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
      const project = await Project.findById(id);

      if (!project) {
        const error = new Error("Project not found");
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
      const project = await Project.findByIdAndUpdate(
        id,
        { $set: req.body },
        { new: true, runValidators: true }
      );
      if (!project) {
        const error = new Error("Project not found");
        res.status(404).json({ error: error.message });
      }

      await project.save();
      res.json({ message: "Project updated successfully" });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };

  static deleteProject = async (req: Request, res: Response): Promise<void> => {
    const { id } = req.params;
    try {
      const project = await Project.findById(id);

      if (!project) {
        const error = new Error("Project not found");
        res.status(404).json({ error: error.message });
      }

      await project.deleteOne();
      res.json({ message: "Project deleted successfully" });
    } catch (error) {
      res.status(400).send({ error: error.message });
    }
  };
}
