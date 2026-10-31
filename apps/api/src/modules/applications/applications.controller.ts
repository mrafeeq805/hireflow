import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  createApplicationSchema,
  updateApplicationStageSchema,
  updateApplicationPrioritySchema,
  APPLICATION_STAGES,
  SOCKET_EVENTS,
} from '@hireflow/shared';
import { emitToWorkspace } from '../../sockets/index.js';

export async function listApplications(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { jobId, stage, priority, recruiterId, search } = req.query;

  const where: any = { workspaceId };

  if (jobId && jobId !== 'ALL') {
    where.jobId = jobId as string;
  }
  if (stage && stage !== 'ALL') {
    where.stage = stage as string;
  }
  if (priority && priority !== 'ALL') {
    where.priority = priority as string;
  }
  if (recruiterId && recruiterId !== 'ALL') {
    where.assignedRecruiterId = recruiterId as string;
  }
  if (search) {
    where.candidate = {
      OR: [
        { fullName: { contains: String(search) } },
        { email: { contains: String(search) } },
      ],
    };
  }

  const applications = await prisma.application.findMany({
    where,
    include: {
      job: {
        select: { id: true, title: true, department: true, location: true },
      },
      candidate: {
        include: {
          skills: true,
        },
      },
      assignedRecruiter: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      stageHistory: {
        orderBy: { createdAt: 'desc' },
        take: 1,
      },
      _count: {
        select: { interviews: true },
      },
    },
    orderBy: { updatedAt: 'desc' },
  });

  const formatted = applications.map((app) => ({
    ...app,
    candidate: {
      ...app.candidate,
      tags: app.candidate.tags ? JSON.parse(app.candidate.tags) : [],
    },
    interviewsCount: app._count.interviews,
  }));

  res.json({ success: true, data: formatted });
}

export async function createApplication(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const parsed = createApplicationSchema.parse(req.body);

  // Check unique candidate per job
  const existing = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId: parsed.jobId,
        candidateId: parsed.candidateId,
      },
    },
  });

  if (existing) {
    res.status(409).json({ success: false, error: 'Candidate has already applied for this job' });
    return;
  }

  const app = await prisma.application.create({
    data: {
      workspaceId,
      jobId: parsed.jobId,
      candidateId: parsed.candidateId,
      stage: parsed.stage,
      priority: parsed.priority,
      assignedRecruiterId: parsed.assignedRecruiterId,
      internalNotes: parsed.internalNotes,
      stageHistory: {
        create: {
          toStage: parsed.stage,
          changedById: req.user?.userId,
          notes: 'Initial application created',
        },
      },
    },
    include: {
      job: { select: { id: true, title: true, department: true } },
      candidate: true,
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: req.user?.userId,
      action: 'APPLICATION_CREATED',
      entityType: 'APPLICATION',
      entityId: app.id,
      details: JSON.stringify({
        candidateName: app.candidate.fullName,
        jobTitle: app.job.title,
        stage: app.stage,
      }),
    },
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.APPLICATION_STAGE_CHANGED, {
    applicationId: app.id,
    jobId: app.jobId,
    candidateId: app.candidateId,
    toStage: app.stage,
  });

  res.status(201).json({
    success: true,
    data: app,
  });
}

export async function getApplication(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { applicationId } = req.params;

  const app = await prisma.application.findFirst({
    where: { id: applicationId, workspaceId },
    include: {
      job: {
        select: { id: true, title: true, department: true, location: true },
      },
      candidate: {
        include: {
          skills: true,
          documents: true,
        },
      },
      assignedRecruiter: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      stageHistory: {
        include: {
          changedBy: { select: { id: true, name: true, email: true } },
        },
        orderBy: { createdAt: 'desc' },
      },
      interviews: {
        include: {
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
        orderBy: { scheduledAt: 'desc' },
      },
      offers: {
        orderBy: { createdAt: 'desc' },
      },
      comments: {
        include: {
          user: { select: { id: true, name: true, email: true, avatarUrl: true } },
          attachments: true,
        },
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!app) {
    res.status(404).json({ success: false, error: 'Application not found' });
    return;
  }

  // Calculate average rating from all scorecards across interviews
  const allScorecards = app.interviews.flatMap((i) => i.scorecards || []);
  const avgRating =
    allScorecards.length > 0
      ? allScorecards.reduce((acc, s) => acc + s.averageRating, 0) / allScorecards.length
      : null;

  res.json({
    success: true,
    data: {
      ...app,
      candidate: {
        ...app.candidate,
        tags: app.candidate.tags ? JSON.parse(app.candidate.tags) : [],
      },
      latestScorecardAvg: avgRating ? Number(avgRating.toFixed(1)) : null,
      scorecardsCount: allScorecards.length,
    },
  });
}

export async function updateStage(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { applicationId } = req.params;
  const parsed = updateApplicationStageSchema.parse(req.body);

  const existing = await prisma.application.findFirst({
    where: { id: applicationId, workspaceId },
    include: {
      candidate: { select: { fullName: true } },
      job: { select: { title: true } },
    },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: 'Application not found' });
    return;
  }

  const fromStage = existing.stage;
  const toStage = parsed.stage;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.application.update({
      where: { id: applicationId },
      data: {
        stage: toStage,
        status:
          toStage === APPLICATION_STAGES.REJECTED
            ? 'REJECTED'
            : toStage === APPLICATION_STAGES.HIRED
            ? 'HIRED'
            : 'ACTIVE',
        rejectionReason: toStage === APPLICATION_STAGES.REJECTED ? parsed.rejectionReason : null,
      },
      include: {
        stageHistory: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    await tx.applicationStageHistory.create({
      data: {
        applicationId,
        fromStage,
        toStage,
        changedById: req.user?.userId,
        notes: parsed.note || (parsed.rejectionReason ? `Reason: ${parsed.rejectionReason}` : null),
      },
    });

    await tx.activityLog.create({
      data: {
        workspaceId,
        userId: req.user?.userId,
        action: 'STAGE_CHANGED',
        entityType: 'APPLICATION',
        entityId: applicationId,
        details: JSON.stringify({
          candidateName: existing.candidate.fullName,
          jobTitle: existing.job.title,
          fromStage,
          toStage,
          note: parsed.note,
        }),
      },
    });

    return updated;
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.APPLICATION_STAGE_CHANGED, {
    applicationId,
    fromStage,
    toStage,
    changedById: req.user?.userId,
  });

  res.json({
    success: true,
    data: result,
  });
}

export async function updatePriority(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { applicationId } = req.params;
  const { priority } = updateApplicationPrioritySchema.parse(req.body);

  const updated = await prisma.application.update({
    where: { id: applicationId, workspaceId },
    data: { priority },
  });

  res.json({ success: true, data: updated });
}

export async function bulkMove(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { applicationIds, stage, note } = req.body;

  if (!Array.isArray(applicationIds) || applicationIds.length === 0 || !stage) {
    res.status(400).json({ success: false, error: 'Application IDs array and target stage required' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    for (const appId of applicationIds) {
      const app = await tx.application.findFirst({
        where: { id: appId, workspaceId },
      });
      if (app) {
        await tx.application.update({
          where: { id: appId },
          data: { stage },
        });

        await tx.applicationStageHistory.create({
          data: {
            applicationId: appId,
            fromStage: app.stage,
            toStage: stage,
            changedById: req.user?.userId,
            notes: note || 'Bulk moved',
          },
        });
      }
    }
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.APPLICATION_STAGE_CHANGED, {
    bulk: true,
    applicationIds,
    toStage: stage,
  });

  res.json({ success: true, message: `Moved ${applicationIds.length} applications to ${stage}` });
}

