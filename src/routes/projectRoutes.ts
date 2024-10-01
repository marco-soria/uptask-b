import { Router } from "express";
import { body, param } from "express-validator";

import { ProjectController } from "../controllers/ProjectController";
import { handleInputErrors } from "../middleware/validation";

const router: Router = Router();

router.get("/", ProjectController.getAllProjects);

router.get(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  ProjectController.getProjectById
);

router.post(
  "/",
  body("projectName").notEmpty().withMessage("Project name is required"),
  body("clientName").notEmpty().withMessage("Client name is required"),
  body("description").notEmpty().withMessage("Description is required"),
  handleInputErrors,
  ProjectController.createProject
);

router.put(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  body("projectName")
    .optional()
    .notEmpty()
    .withMessage("Project name is required"),
  body("clientName")
    .optional()
    .notEmpty()
    .withMessage("Client name is required"),
  body("description")
    .optional()
    .notEmpty()
    .withMessage("Description is required"),
  handleInputErrors,
  ProjectController.updateProject
);

router.delete(
  "/:id",
  param("id").isMongoId().withMessage("Invalid project ID"),
  handleInputErrors,
  ProjectController.deleteProject
);

export default router;
