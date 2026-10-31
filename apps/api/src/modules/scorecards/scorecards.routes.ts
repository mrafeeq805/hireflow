import { Router } from 'express';
import {
  submitScorecard,
  getInterviewScorecards,
} from './scorecards.controller.js';
import { requireAuth, requireWorkspace } from '../../middleware/auth.js';

export const scorecardsRouter = Router();

scorecardsRouter.use(requireAuth, requireWorkspace);

scorecardsRouter.get('/interviews/:interviewId', getInterviewScorecards);
scorecardsRouter.post('/interviews/:interviewId', submitScorecard);

