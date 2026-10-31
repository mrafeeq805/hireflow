import { Router } from 'express';
import {
  listNotifications,
  markAsRead,
  markAllAsRead,
} from './notifications.controller.js';
import { requireAuth, requireWorkspace } from '../../middleware/auth.js';

export const notificationsRouter = Router();

notificationsRouter.use(requireAuth, requireWorkspace);

notificationsRouter.get('/', listNotifications);
notificationsRouter.patch('/:notificationId/read', markAsRead);
notificationsRouter.post('/mark-all-read', markAllAsRead);

