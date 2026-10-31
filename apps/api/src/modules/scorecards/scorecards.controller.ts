import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  submitFeedbackSchema,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
  ROLES,
} from '@hireflow/shared';
import { emitToWorkspace } from '../../sockets/index.js';

export async function submitScorecard(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const userRole = req.workspace!.role;
  const userId = req.user!.userId;
  const { interviewId } = req.params;
  const parsed = submitFeedbackSchema.parse(req.body);

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, workspaceId },
    include: {
      application: {
        include: {
          candidate: { select: { fullName: true } },
          job: { select: { title: true } },
        },
      },
      interviewers: true,
    },
  });

  if (!interview) {
    res.status(404).json({ success: false, error: 'Interview not found' });
    return;
  }

  // Check authorization: if INTERVIEWER, must be assigned to this interview
  if (userRole === ROLES.INTERVIEWER) {
    const isAssigned = interview.interviewers.some((i) => i.userId === userId);
    if (!isAssigned) {
      res.status(403).json({ success: false, error: 'You are not assigned as an interviewer for this session' });
      return;
    }
  }

  // Calculate average rating
  const avg =
    (parsed.technicalRating +
      parsed.communicationRating +
      parsed.problemSolvingRating +
      parsed.experienceRating +
      parsed.cultureFitRating) /
    5;

  const scorecard = await prisma.interviewScorecard.upsert({
    where: {
      interviewId_interviewerId: {
        interviewId,
        interviewerId: userId,
      },
    },
    update: {
      ...parsed,
      averageRating: Number(avg.toFixed(1)),
    },
    create: {
      ...parsed,
      averageRating: Number(avg.toFixed(1)),
      interviewId,
      interviewerId: userId,
    },
    include: {
      interviewer: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId,
      action: 'FEEDBACK_SUBMITTED',
      entityType: 'INTERVIEW',
      entityId: interview.id,
      details: JSON.stringify({
        candidateName: interview.application.candidate.fullName,
        jobTitle: interview.application.job.title,
        recommendation: parsed.recommendation,
        averageRating: scorecard.averageRating,
      }),
    },
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.FEEDBACK_ADDED, {
    interviewId,
    scorecard,
  });

  res.status(201).json({
    success: true,
    data: scorecard,
  });
}

export async function getInterviewScorecards(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const userRole = req.workspace!.role;
  const userId = req.user!.userId;
  const { interviewId } = req.params;

  const interview = await prisma.interview.findFirst({
    where: { id: interviewId, workspaceId },
  });

  if (!interview) {
    res.status(404).json({ success: false, error: 'Interview not found' });
    return;
  }

  // Role check: Interviewer can only see their own scorecard until other scorecards are submitted or if recruiter/admin
  const whereScorecard: any = { interviewId };
  if (userRole === ROLES.INTERVIEWER) {
    whereScorecard.interviewerId = userId;
  }

  const scorecards = await prisma.interviewScorecard.findMany({
    where: whereScorecard,
    include: {
      interviewer: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  res.json({ success: true, data: scorecards });
}

