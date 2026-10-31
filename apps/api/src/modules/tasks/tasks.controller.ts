import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  createTaskSchema,
  updateTaskStatusSchema,
  TASK_STATUSES,
} from '@hireflow/shared';

export async function listTasks(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { filter, status, assigneeId, type } = req.query;

  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

  const where: any = { workspaceId };

  if (status && status !== 'ALL') {
    where.status = status as string;
  }
  if (type && type !== 'ALL') {
    where.type = type as string;
  }
  if (assigneeId && assigneeId !== 'ALL') {
    where.assigneeId = assigneeId as string;
  }

  // Filter views: dueToday, upcoming, overdue
  if (filter === 'dueToday') {
    where.dueDate = { gte: startOfDay, lte: endOfDay };
    where.status = { not: TASK_STATUSES.COMPLETED };
  } else if (filter === 'upcoming') {
    where.dueDate = { gt: endOfDay };
    where.status = { not: TASK_STATUSES.COMPLETED };
  } else if (filter === 'overdue') {
    where.dueDate = { lt: startOfDay };
    where.status = { not: TASK_STATUSES.COMPLETED };
  }

  const tasks = await prisma.task.findMany({
    where,
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      candidate: {
        select: { id: true, fullName: true },
      },
      job: {
        select: { id: true, title: true },
      },
    },
    orderBy: { dueDate: 'asc' },
  });

  res.json({ success: true, data: tasks });
}

export async function createTask(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const userId = req.user!.userId;
  const parsed = createTaskSchema.parse(req.body);

  const task = await prisma.task.create({
    data: {
      workspaceId,
      title: parsed.title,
      description: parsed.description,
      type: parsed.type,
      priority: parsed.priority,
      status: TASK_STATUSES.TODO,
      dueDate: new Date(parsed.dueDate),
      assigneeId: parsed.assigneeId || userId,
      createdById: userId,
      candidateId: parsed.candidateId,
      jobId: parsed.jobId,
      applicationId: parsed.applicationId,
    },
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      candidate: {
        select: { id: true, fullName: true },
      },
      job: {
        select: { id: true, title: true },
      },
    },
  });

  res.status(201).json({ success: true, data: task });
}

export async function updateTask(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { taskId } = req.params;

  const existing = await prisma.task.findFirst({
    where: { id: taskId, workspaceId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: 'Task not found' });
    return;
  }

  const updateData: any = { ...req.body };
  if (updateData.dueDate) {
    updateData.dueDate = new Date(updateData.dueDate);
  }

  const updated = await prisma.task.update({
    where: { id: taskId },
    data: updateData,
    include: {
      assignee: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  res.json({ success: true, data: updated });
}

export async function updateTaskStatus(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { taskId } = req.params;
  const { status } = updateTaskStatusSchema.parse(req.body);

  const isCompleted = status === TASK_STATUSES.COMPLETED;

  const updated = await prisma.task.update({
    where: { id: taskId, workspaceId },
    data: {
      status,
      isCompleted,
      completedAt: isCompleted ? new Date() : null,
    },
  });

  res.json({ success: true, data: updated });
}

export async function deleteTask(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { taskId } = req.params;

  await prisma.task.delete({
    where: { id: taskId, workspaceId },
  });

  res.json({ success: true, message: 'Task deleted successfully' });
}

