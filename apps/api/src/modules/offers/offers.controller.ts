import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  createOfferSchema,
  updateOfferStatusSchema,
  OFFER_STATUSES,
  APPLICATION_STAGES,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
} from '@hireflow/shared';
import { emitToWorkspace } from '../../sockets/index.js';

export async function listOffers(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { status } = req.query;

  const where: any = { workspaceId };
  if (status && status !== 'ALL') {
    where.status = status as string;
  }

  const offers = await prisma.offer.findMany({
    where,
    include: {
      application: {
        include: {
          job: { select: { id: true, title: true, department: true } },
          candidate: { select: { id: true, fullName: true, email: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  res.json({ success: true, data: offers });
}

export async function createOffer(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const parsed = createOfferSchema.parse(req.body);

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

  const offer = await prisma.offer.create({
    data: {
      workspaceId,
      applicationId: parsed.applicationId,
      baseSalary: parsed.baseSalary,
      currency: parsed.currency,
      bonus: parsed.bonus,
      equity: parsed.equity,
      proposedJoiningDate: new Date(parsed.proposedJoiningDate),
      expiryDate: new Date(parsed.expiryDate),
      employmentType: parsed.employmentType,
      notes: parsed.notes,
      status: OFFER_STATUSES.DRAFT,
    },
    include: {
      application: {
        include: {
          job: { select: { title: true } },
          candidate: { select: { fullName: true } },
        },
      },
    },
  });

  // Automatically move application stage to OFFER if not already
  if (app.stage !== APPLICATION_STAGES.OFFER) {
    await prisma.application.update({
      where: { id: app.id },
      data: { stage: APPLICATION_STAGES.OFFER },
    });

    await prisma.applicationStageHistory.create({
      data: {
        applicationId: app.id,
        fromStage: app.stage,
        toStage: APPLICATION_STAGES.OFFER,
        changedById: req.user?.userId,
        notes: `Offer drafted: ${offer.currency} ${offer.baseSalary}`,
      },
    });
  }

  // Log activity
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: req.user?.userId,
      action: 'OFFER_CREATED',
      entityType: 'OFFER',
      entityId: offer.id,
      details: JSON.stringify({
        candidateName: app.candidate.fullName,
        jobTitle: app.job.title,
        baseSalary: offer.baseSalary,
      }),
    },
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.OFFER_UPDATED, offer);

  res.status(201).json({ success: true, data: offer });
}

export async function getOffer(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { offerId } = req.params;

  const offer = await prisma.offer.findFirst({
    where: { id: offerId, workspaceId },
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
    },
  });

  if (!offer) {
    res.status(404).json({ success: false, error: 'Offer not found' });
    return;
  }

  res.json({ success: true, data: offer });
}

export async function updateOfferStatus(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { offerId } = req.params;
  const parsed = updateOfferStatusSchema.parse(req.body);

  const offer = await prisma.offer.findFirst({
    where: { id: offerId, workspaceId },
    include: {
      application: {
        include: {
          candidate: { select: { id: true, fullName: true } },
          job: { select: { id: true, title: true } },
        },
      },
    },
  });

  if (!offer) {
    res.status(404).json({ success: false, error: 'Offer not found' });
    return;
  }

  const updated = await prisma.$transaction(async (tx) => {
    const resOffer = await tx.offer.update({
      where: { id: offerId },
      data: {
        status: parsed.status,
        declineReason: parsed.status === OFFER_STATUSES.DECLINED ? parsed.declineReason : null,
        notes: parsed.notes ? `${offer.notes || ''}\n${parsed.notes}` : offer.notes,
      },
    });

    // If accepted, mark application as HIRED
    if (parsed.status === OFFER_STATUSES.ACCEPTED) {
      await tx.application.update({
        where: { id: offer.applicationId },
        data: {
          stage: APPLICATION_STAGES.HIRED,
          status: 'HIRED',
        },
      });

      await tx.applicationStageHistory.create({
        data: {
          applicationId: offer.applicationId,
          fromStage: APPLICATION_STAGES.OFFER,
          toStage: APPLICATION_STAGES.HIRED,
          changedById: req.user?.userId,
          notes: 'Candidate accepted offer. Hired!',
        },
      });
    }

    return resOffer;
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.OFFER_UPDATED, updated);

  res.json({ success: true, data: updated });
}

export async function markHired(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { applicationId } = req.body;

  if (!applicationId) {
    res.status(400).json({ success: false, error: 'Application ID required' });
    return;
  }

  const app = await prisma.application.findFirst({
    where: { id: applicationId, workspaceId },
    include: {
      candidate: { select: { fullName: true } },
      job: { select: { title: true } },
    },
  });

  if (!app) {
    res.status(404).json({ success: false, error: 'Application not found' });
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.application.update({
      where: { id: applicationId },
      data: {
        stage: APPLICATION_STAGES.HIRED,
        status: 'HIRED',
      },
    });

    await tx.applicationStageHistory.create({
      data: {
        applicationId,
        fromStage: app.stage,
        toStage: APPLICATION_STAGES.HIRED,
        changedById: req.user?.userId,
        notes: 'Candidate officially marked as hired',
      },
    });

    await tx.activityLog.create({
      data: {
        workspaceId,
        userId: req.user?.userId,
        action: 'CANDIDATE_HIRED',
        entityType: 'APPLICATION',
        entityId: applicationId,
        details: JSON.stringify({
          candidateName: app.candidate.fullName,
          jobTitle: app.job.title,
        }),
      },
    });
  });

  emitToWorkspace(workspaceId, SOCKET_EVENTS.APPLICATION_STAGE_CHANGED, {
    applicationId,
    toStage: APPLICATION_STAGES.HIRED,
  });

  res.json({ success: true, message: 'Candidate successfully marked as hired!' });
}

