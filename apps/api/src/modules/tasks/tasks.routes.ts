import { Router } from 'express';
import {
  listTasks,
  createTask,
  updateTask,
  updateTaskStatus,
  deleteTask,
} from './tasks.controller.js';
import { requireAuth, requireWorkspace } from '../../middleware/auth.js';

export const tasksRouter = Router();

tasksRouter.use(requireAuth, requireWorkspace);

tasksRouter.get('/', listTasks);
tasksRouter.post('/', createTask);
tasksRouter.put('/:taskId', updateTask);
tasksRouter.patch('/:taskId/status', updateTaskStatus);
tasksRouter.delete('/:taskId', deleteTask);

