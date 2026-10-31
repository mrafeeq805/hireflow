import type { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../lib/security.js';
import { prisma } from '../lib/prisma.js';
import type { Role } from '@hireflow/shared';

export interface AuthenticatedUser {
  userId: string;
  email: string;
}

export interface WorkspaceContext {
  workspaceId: string;
  role: Role;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      workspace?: WorkspaceContext;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ success: false, error: 'Authentication token required' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const payload = verifyAccessToken(token);
    req.user = payload;
    next();
  } catch {
    res.status(401).json({ success: false, error: 'Invalid or expired authentication token' });
  }
}

export function optionalAuth(req: Request, _res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      req.user = verifyAccessToken(token);
    } catch {
      // Ignore invalid optional token
    }
  }
  next();
}

export async function requireWorkspace(req: Request, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Authentication required' });
    return;
  }

  const workspaceId =
    (req.headers['x-workspace-id'] as string) ||
    req.params.workspaceId ||
    (req.query.workspaceId as string);

  if (!workspaceId) {
    res.status(400).json({ success: false, error: 'Workspace ID required (x-workspace-id header or param)' });
    return;
  }

  try {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: req.user.userId,
        },
      },
    });

    if (!member) {
      res.status(403).json({ success: false, error: 'Access denied: You are not a member of this workspace' });
      return;
    }

    req.workspace = {
      workspaceId: member.workspaceId,
      role: member.role as Role,
    };
    next();
  } catch (err) {
    next(err);
  }
}

export function requireRole(allowedRoles: Role[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.workspace) {
      res.status(403).json({ success: false, error: 'Workspace context missing' });
      return;
    }

    if (!allowedRoles.includes(req.workspace.role)) {
      res.status(403).json({
        success: false,
        error: `Insufficient permissions. Required roles: ${allowedRoles.join(', ')}`,
      });
      return;
    }

    next();
  };
}

