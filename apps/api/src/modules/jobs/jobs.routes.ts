import { Router } from 'express';
import {
  listJobs,
  createJob,
  getJob,
  updateJob,
  updateJobStatus,
  getPublicJob,
  applyPublicJob,
} from './jobs.controller.js';
import { requireAuth, requireWorkspace, requireRole } from '../../middleware/auth.js';
import { ROLES } from '@hireflow/shared';

export const jobsRouter = Router();

// Public routes (no workspace auth required)
jobsRouter.get('/public/:jobId', getPublicJob);
jobsRouter.post('/public/:jobId/apply', applyPublicJob);

// Workspace protected routes
jobsRouter.use(requireAuth, requireWorkspace);

jobsRouter.get('/', listJobs);
jobsRouter.post('/', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), createJob);
jobsRouter.get('/:jobId', getJob);
jobsRouter.put('/:jobId', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), updateJob);
jobsRouter.patch('/:jobId/status', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER]), updateJobStatus);

