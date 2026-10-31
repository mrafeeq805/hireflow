import { Router } from 'express';
import {
  listInterviews,
  scheduleInterview,
  getInterview,
  updateInterview,
  cancelInterview,
  updateOutcome,
} from './interviews.controller.js';
import { requireAuth, requireWorkspace, requireRole } from '../../middleware/auth.js';
import { ROLES } from '@hireflow/shared';

export const interviewsRouter = Router();

interviewsRouter.use(requireAuth, requireWorkspace);

interviewsRouter.get('/', listInterviews);
interviewsRouter.post('/', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), scheduleInterview);
interviewsRouter.get('/:interviewId', getInterview);
interviewsRouter.put('/:interviewId', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), updateInterview);
interviewsRouter.patch('/:interviewId/cancel', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), cancelInterview);
interviewsRouter.patch('/:interviewId/outcome', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER, ROLES.INTERVIEWER]), updateOutcome);

