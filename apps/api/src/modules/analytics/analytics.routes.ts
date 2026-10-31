import { Router } from 'express';
import { getAnalytics } from './analytics.controller.js';
import { requireAuth, requireWorkspace } from '../../middleware/auth.js';

export const analyticsRouter = Router();

analyticsRouter.use(requireAuth, requireWorkspace);

analyticsRouter.get('/', getAnalytics);

