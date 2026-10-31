import { Router } from 'express';
import {
  listCandidates,
  checkDuplicate,
  createCandidate,
  getCandidate,
  updateCandidate,
  uploadDocument,
  deleteDocument,
} from './candidates.controller.js';
import { requireAuth, requireWorkspace, requireRole } from '../../middleware/auth.js';
import { upload } from '../../lib/upload.js';
import { ROLES } from '@hireflow/shared';

export const candidatesRouter = Router();

candidatesRouter.use(requireAuth, requireWorkspace);

candidatesRouter.get('/', listCandidates);
candidatesRouter.get('/check-duplicate', checkDuplicate);
candidatesRouter.post('/', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER]), createCandidate);
candidatesRouter.get('/:candidateId', getCandidate);
candidatesRouter.put('/:candidateId', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER]), updateCandidate);

candidatesRouter.post('/:candidateId/documents', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER]), upload.single('file'), uploadDocument);
candidatesRouter.delete('/documents/:documentId', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER]), deleteDocument);

