import { Router } from 'express';
import {
  listOffers,
  createOffer,
  getOffer,
  updateOfferStatus,
  markHired,
} from './offers.controller.js';
import { requireAuth, requireWorkspace, requireRole } from '../../middleware/auth.js';
import { ROLES } from '@hireflow/shared';

export const offersRouter = Router();

offersRouter.use(requireAuth, requireWorkspace);

offersRouter.get('/', listOffers);
offersRouter.post('/', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), createOffer);
offersRouter.get('/:offerId', getOffer);
offersRouter.patch('/:offerId/status', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER]), updateOfferStatus);
offersRouter.post('/mark-hired', requireRole([ROLES.OWNER, ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER]), markHired);

