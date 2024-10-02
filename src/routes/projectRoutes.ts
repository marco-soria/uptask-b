import { Router } from 'express';
import { body, param } from 'express-validator';

import { ProjectController } from '../controllers/ProjectController';
import { handleInputErrors } from '../middleware/validation';
import Task from '../models/Task';
import { TaskController } from '../controllers/TaskController';
import { projectExists } from '../middleware/project';
import { taskBelongsToProject, taskExists } from '../middleware/task';

const router: Router = Router();

router.get('/', ProjectController.getAllProjects);

router.get(
  '/:id',
  param('id').isMongoId().withMessage('Invalid project ID'),
  handleInputErrors,
  ProjectController.getProjectById
);

router.post(
  '/',
  body('projectName').notEmpty().withMessage('Project name is required'),
  body('clientName').notEmpty().withMessage('Client name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  handleInputErrors,
  ProjectController.createProject
);

router.put(
  '/:id',
  param('id').isMongoId().withMessage('Invalid project ID'),
  body('projectName')
    .optional()
    .notEmpty()
    .withMessage('Project name is required'),
  body('clientName')
    .optional()
    .notEmpty()
    .withMessage('Client name is required'),
  body('description')
    .optional()
    .notEmpty()
    .withMessage('Description is required'),
  handleInputErrors,
  ProjectController.updateProject
);

router.delete(
  '/:id',
  param('id').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  ProjectController.deleteProject
);

/* Routes for tasks */
router.param('projectId', projectExists); // this line's purpose is to validate the project ID before the request reaches the controller

router.post(
  '/:projectId/tasks',
  body('name').notEmpty().withMessage('Task name is required'),
  body('description').notEmpty().withMessage('Description is required'),
  handleInputErrors,
  TaskController.createTask
);

router.get('/:projectId/tasks', TaskController.getProjectTasks);

router.param('taskId', taskExists); // this line's purpose is to validate the task ID before the request reaches the controller
router.param('taskId', taskBelongsToProject); // this line's purpose is to check if the task belongs to the project before the request reaches the controller

router.get(
  '/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TaskController.getTaskById
);

router.put(
  '/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  body('name').optional().notEmpty().withMessage('Task name is required'),
  body('description')
    .optional()
    .notEmpty()
    .withMessage('Description is required'),
  handleInputErrors,
  TaskController.updateTask
);

router.delete(
  '/:projectId/tasks/:taskId',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  handleInputErrors,
  TaskController.getTaskById
);

router.put(
  '/:projectId/tasks/:taskId/status',
  param('taskId').isMongoId().withMessage('Invalid ID'),
  body('status').notEmpty().withMessage('Status is required'),
  handleInputErrors,
  TaskController.updateStatus
);

export default router;
