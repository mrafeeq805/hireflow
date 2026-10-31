import { Router } from 'express';
import {
  listWorkspaces,
  createWorkspace,
  getWorkspace,
  updateWorkspace,
  listMembers,
  inviteMember,
  updateMemberRole,
  removeMember,
  acceptInvitation,
} from './workspaces.controller.js';
import { requireAuth, requireWorkspace, requireRole } from '../../middleware/auth.js';
import { ROLES } from '@hireflow/shared';

export const workspacesRouter = Router();

workspacesRouter.use(requireAuth);

workspacesRouter.get('/', listWorkspaces);
workspacesRouter.post('/', createWorkspace);
workspacesRouter.post('/invitations/:token/accept', acceptInvitation);

workspacesRouter.get('/:workspaceId', requireWorkspace, getWorkspace);
workspacesRouter.put('/:workspaceId', requireWorkspace, requireRole([ROLES.OWNER, ROLES.ADMIN]), updateWorkspace);

workspacesRouter.get('/:workspaceId/members', requireWorkspace, listMembers);
workspacesRouter.post('/:workspaceId/invitations', requireWorkspace, requireRole([ROLES.OWNER, ROLES.ADMIN]), inviteMember);
workspacesRouter.put('/:workspaceId/members/:memberId', requireWorkspace, requireRole([ROLES.OWNER, ROLES.ADMIN]), updateMemberRole);
workspacesRouter.delete('/:workspaceId/members/:memberId', requireWorkspace, requireRole([ROLES.OWNER, ROLES.ADMIN]), removeMember);

