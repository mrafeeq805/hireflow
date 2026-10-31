import { Router } from 'express';
import {
  listApplications,
  createApplication,
  getApplication,
  updateStage,
  updatePriority,
  bulkMove,
} from './applications.controller.js';
import { requireAuth, requireWorkspace, requireRole } from '../../middleware/auth.js';
import { ROLES } from '@hireflow/shared';

export const applicationsRouter = Router();

applicationsRouter.use(requireAuth, requireWorkspace);

applicationsRouter.get('/', listApplications);
applicationsRouter.post('/', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), createApplication);
applicationsRouter.get('/:applicationId', getApplication);
applicationsRouter.patch('/:applicationId/stage', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), updateStage);
applicationsRouter.patch('/:applicationId/priority', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), updatePriority);
applicationsRouter.post('/bulk-move', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER]), bulkMove);

