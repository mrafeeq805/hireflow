import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  scheduleInterviewSchema,
  updateInterviewSchema,
  updateInterviewOutcomeSchema,
  INTERVIEW_STATUSES,
  INTERVIEW_OUTCOMES,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
} from '@hireflow/shared';
import { emitToWorkspace, emitToUser } from '../../sockets/index.js';

export async function listInterviews(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { status, type, interviewerId, startDate, endDate } = req.query;

  const where: any = { workspaceId };

  if (status && status !== 'ALL') {
    where.status = status as string;
  }
  if (type && type !== 'ALL') {
    where.type = type as string;
  }
  if (interviewerId && interviewerId !== 'ALL') {
    where.interviewers = {
      some: { userId: interviewerId as string },
    };
  }
  if (startDate || endDate) {
    where.scheduledAt = {};
    if (startDate) where.scheduledAt.gte = new Date(String(startDate));
    if (endDate) where.scheduledAt.lte = new Date(String(endDate));
  }

  const interviews = await prisma.interview.findMany({
    where,
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, department: true } },
          candidate: { select: { id: true, fullName: true, email: true, phone: true } },
        },
      },
      interviewers: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      scorecards: {
        include: {
          interviewer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  res.json({ success: true, data: interviews });
}

export async function scheduleInterview(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const parsed = scheduleInterviewSchema.parse(req.body);

  const app = await prisma.application.findFirst({
    where: { id: parsed.applicationId, workspaceId },
    include: {
      candidate: { select: { fullName: true } },
      job: { select: { title: true } },
    },
  });

  if (!app) {
    res.status(404).json({ success: false, error: 'Application not found' });
    return;
  }

  const scheduledAt = new Date(parsed.scheduledAt);
  const endAt = new Date(scheduledAt.getTime() + parsed.durationMinutes * 60 * 1000);

  // Conflict Detection: check if any assigned interviewer already has an interview scheduled in this time slot
  for (const userId of parsed.interviewerIds) {
    const conflicts = await prisma.interview.findMany({
      where: {
        workspaceId,
        status: INTERVIEW_STATUSES.SCHEDULED,
        interviewers: { some: { userId } },
        scheduledAt: {
          lt: endAt,
        },
      },
      include: {
        interviewers: {
          where: { userId },
          include: { user: { select: { name: true } } },
        },
      },
    });

    const hasOverlap = conflicts.some((c) => {
      const cEnd = new Date(c.scheduledAt.getTime() + c.durationMinutes * 60 * 1000);
      return scheduledAt < cEnd && endAt > c.scheduledAt;
    });

    if (hasOverlap) {
      const user = await prisma.user.findUnique({ where: { id: userId }, select: { name: true } });
      res.status(409).json({
        success: false,
        error: `Scheduling conflict: Interviewer ${user?.name || userId} is already booked for another interview at this time.`,
      });
      return;
    }
  }

  const interview = await prisma.interview.create({
    data: {
      workspaceId,
      applicationId: parsed.applicationId,
      type: parsed.type,
      status: INTERVIEW_STATUSES.SCHEDULED,
      outcome: INTERVIEW_OUTCOMES.PENDING,
      scheduledAt,
      durationMinutes: parsed.durationMinutes,
      location: parsed.location,
      meetingLink: parsed.meetingLink,
      instructions: parsed.instructions,
      interviewers: {
        create: parsed.interviewerIds.map((userId) => ({ userId })),
      },
    },
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, department: true } },
          candidate: { select: { id: true, fullName: true, email: true } },
        },
      },
      interviewers: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: req.user?.userId,
      action: 'INTERVIEW_SCHEDULED',
      entityType: 'INTERVIEW',
      entityId: interview.id,
      details: JSON.stringify({
        candidateName: app.candidate.fullName,
        jobTitle: app.job.title,
        scheduledAt: interview.scheduledAt.toISOString(),
        type: interview.type,
      }),
    },
  });

  // Create notifications for each assigned interviewer
  for (const userId of parsed.interviewerIds) {
    await prisma.notification.create({
      data: {
        workspaceId,
        userId,
        type: NOTIFICATION_TYPES.INTERVIEW_SCHEDULED,
        title: 'New Interview Scheduled',
        message: `You are scheduled to interview ${app.candidate.fullName} for ${app.job.title}`,
        link: `/interviews/${interview.id}`,
      },
    });

    emitToUser(userId, SOCKET_EVENTS.NOTIFICATION_NEW, {
      title: 'New Interview Scheduled',
      message: `You are scheduled to interview ${app.candidate.fullName} for ${app.job.title}`,
      link: `/interviews/${interview.id}`,
    });
  }

  emitToWorkspace(workspaceId, SOCKET_EVENTS.INTERVIEW_SCHEDULED, interview);

  res.status(201).json({
    success: true,
    data: interview,
  });
}

export async function getInterview(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { interviewId } = req.params;

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, workspaceId },
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, department: true, location: true } },
          candidate: {
            include: {
              skills: true,
              documents: true,
            },
          },
        },
      },
      interviewers: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
      scorecards: {
        include: {
          interviewer: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  if (!interview) {
    res.status(404).json({ success: false, error: 'Interview not found' });
    return;
  }

  res.json({ success: true, data: interview });
}

export async function updateInterview(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { interviewId } = req.params;
  const parsed = updateInterviewSchema.parse(req.body);

  const existing = await prisma.interview.findFirst({
    where: { id: interviewId, workspaceId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: 'Interview not found' });
    return;
  }

  const { interviewerIds, scheduledAt, ...data } = parsed;

  const updateData: any = { ...data };
  if (scheduledAt) {
    updateData.scheduledAt = new Date(scheduledAt);
    updateData.status = INTERVIEW_STATUSES.RESCHEDULED;
  }

  if (interviewerIds && interviewerIds.length > 0) {
    await prisma.interviewer.deleteMany({ where: { interviewId } });
    await prisma.interviewer.createMany({
      data: interviewerIds.map((userId) => ({ interviewId, userId })),
    });
  }

  const updated = await prisma.interview.update({
    where: { id: interviewId },
    data: updateData,
    include: {
      interviewers: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
        },
      },
    },
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.INTERVIEW_UPDATED, updated);

  res.json({ success: true, data: updated });
}

export async function cancelInterview(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { interviewId } = req.params;
  const { reason } = req.body;

  const updated = await prisma.interview.update({
    where: { id: interviewId, workspaceId },
    data: {
      status: INTERVIEW_STATUSES.CANCELLED,
      outcomeNotes: reason ? `Cancellation reason: ${reason}` : 'Cancelled',
    },
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.INTERVIEW_UPDATED, updated);

  res.json({ success: true, data: updated });
}

export async function updateOutcome(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { interviewId } = req.params;
  const { outcome, notes } = updateInterviewOutcomeSchema.parse(req.body);

  const updated = await prisma.interview.update({
    where: { id: interviewId, workspaceId },
    data: {
      outcome,
      outcomeNotes: notes,
      status: INTERVIEW_STATUSES.COMPLETED,
    },
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.INTERVIEW_UPDATED, updated);

  res.json({ success: true, data: updated });
}

