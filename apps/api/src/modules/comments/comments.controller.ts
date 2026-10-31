import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import { createCommentSchema, NOTIFICATION_TYPES, SOCKET_EVENTS } from '@hireflow/shared';
import { emitToWorkspace, emitToUser } from '../../sockets/index.js';

export async function listComments(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { candidateId, applicationId, jobId } = req.query;

  const where: any = { workspaceId };
  if (candidateId) where.candidateId = candidateId as string;
  if (applicationId) where.applicationId = applicationId as string;
  if (jobId) where.jobId = jobId as string;

  const comments = await prisma.comment.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      attachments: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const formatted = comments.map((c) => ({
    ...c,
    mentions: c.mentions ? JSON.parse(c.mentions) : [],
  }));

  res.json({ success: true, data: formatted });
}

export async function createComment(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const userId = req.user!.userId;
  const parsed = createCommentSchema.parse(req.body);

  const comment = await prisma.comment.create({
    data: {
      workspaceId,
      userId,
      candidateId: parsed.candidateId,
      applicationId: parsed.applicationId,
      jobId: parsed.jobId,
      content: parsed.content,
      mentions: JSON.stringify(parsed.mentions),
    },
    include: {
      user: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      attachments: true,
    },
  });

  // Handle @mentions: find mentioned users by name or email and notify them
  if (parsed.mentions.length > 0) {
    for (const mention of parsed.mentions) {
      const mentionedUser = await prisma.user.findFirst({
        where: {
          memberships: { some: { workspaceId } },
          OR: [
            { name: { contains: mention } },
            { email: { contains: mention } },
          ],
        },
      });

      if (mentionedUser && mentionedUser.id !== userId) {
        await prisma.notification.create({
          data: {
            workspaceId,
            userId: mentionedUser.id,
            type: NOTIFICATION_TYPES.MENTION,
            title: 'You were mentioned',
            message: `${comment.user.name} mentioned you in a comment`,
            link: parsed.applicationId
              ? `/applications/${parsed.applicationId}`
              : parsed.candidateId
              ? `/candidates/${parsed.candidateId}`
              : '/dashboard',
          },
        });

        emitToUser(mentionedUser.id, SOCKET_EVENTS.NOTIFICATION_NEW, {
          title: 'You were mentioned',
          message: `${comment.user.name} mentioned you in a comment`,
        });
      }
    }
  }

  res.status(201).json({
    success: true,
    data: {
      ...comment,
      mentions: parsed.mentions,
    },
  });
}

