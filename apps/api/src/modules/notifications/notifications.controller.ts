import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';

export async function listNotifications(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const userId = req.user!.userId;

  const notifications = await prisma.notification.findMany({
    where: {
      workspaceId,
      userId,
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  res.json({ success: true, data: notifications });
}

export async function markAsRead(req: Request, res: Response): Promise<void> {
  const { notificationId } = req.params;
  const userId = req.user!.userId;

  await prisma.notification.updateMany({
    where: {
      id: notificationId,
      userId,
    },
    data: { isRead: true },
  });

  res.json({ success: true, message: 'Notification marked as read' });
}

export async function markAllAsRead(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const userId = req.user!.userId;

  await prisma.notification.updateMany({
    where: {
      workspaceId,
      userId,
      isRead: false,
    },
    data: { isRead: true },
  });

  res.json({ success: true, message: 'All notifications marked as read' });
}

