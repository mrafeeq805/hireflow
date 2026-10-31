import { Router } from 'express';
import { listComments, createComment } from './comments.controller.js';
import { requireAuth, requireWorkspace } from '../../middleware/auth.js';

export const commentsRouter = Router();

commentsRouter.use(requireAuth, requireWorkspace);

commentsRouter.get('/', listComments);
commentsRouter.post('/', createComment);

