import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  createJobSchema,
  updateJobSchema,
  updateJobStatusSchema,
  publicJobApplySchema,
  JOB_STATUSES,
  APPLICATION_STAGES,
  NOTIFICATION_TYPES,
  SOCKET_EVENTS,
} from '@hireflow/shared';
import { emitToWorkspace } from '../../sockets/index.js';

export async function listJobs(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { status, department, search } = req.query;

  const where: any = { workspaceId };

  if (status && status !== 'ALL') {
    where.status = status as string;
  }
  if (department && department !== 'ALL') {
    where.department = department as string;
  }
  if (search) {
    where.OR = [
      { title: { contains: String(search) } },
      { department: { contains: String(search) } },
      { location: { contains: String(search) } },
    ];
  }

  const jobs = await prisma.job.findMany({
    where,
    include: {
      hiringManager: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      skills: true,
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = jobs.map((job) => ({
    ...job,
    applicationsCount: job._count.applications,
    assignedRecruiterIds: job.assignedRecruiterIds ? JSON.parse(job.assignedRecruiterIds) : [],
  }));

  res.json({ success: true, data: formatted });
}

export async function createJob(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const parsed = createJobSchema.parse(req.body);

  const { requiredSkills, preferredSkills, assignedRecruiterIds, ...jobData } = parsed;

  const job = await prisma.job.create({
    data: {
      ...jobData,
      workspaceId,
      assignedRecruiterIds: JSON.stringify(assignedRecruiterIds),
      publishedAt: parsed.status === JOB_STATUSES.PUBLISHED ? new Date() : null,
      skills: {
        create: [
          ...requiredSkills.map((name) => ({ name, isRequired: true })),
          ...preferredSkills.map((name) => ({ name, isRequired: false })),
        ],
      },
    },
    include: {
      skills: true,
      hiringManager: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: req.user?.userId,
      action: 'JOB_CREATED',
      entityType: 'JOB',
      entityId: job.id,
      details: JSON.stringify({ title: job.title }),
    },
  });

  res.status(201).json({
    success: true,
    data: {
      ...job,
      assignedRecruiterIds,
      applicationsCount: 0,
    },
  });
}

export async function getJob(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { jobId } = req.params;

  const job = await prisma.job.findFirst({
    where: { id: jobId, workspaceId },
    include: {
      hiringManager: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
      skills: true,
      _count: {
        select: { applications: true },
      },
    },
  });

  if (!job) {
    res.status(404).json({ success: false, error: 'Job opening not found' });
    return;
  }

  // Fetch recruiter objects if assigned
  let recruiters: any[] = [];
  const recruiterIds = job.assignedRecruiterIds ? JSON.parse(job.assignedRecruiterIds) : [];
  if (recruiterIds.length > 0) {
    recruiters = await prisma.user.findMany({
      where: { id: { in: recruiterIds } },
      select: { id: true, name: true, email: true, avatarUrl: true },
    });
  }

  res.json({
    success: true,
    data: {
      ...job,
      assignedRecruiterIds: recruiterIds,
      recruiters,
      applicationsCount: job._count.applications,
    },
  });
}

export async function updateJob(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { jobId } = req.params;
  const parsed = updateJobSchema.parse(req.body);

  const existing = await prisma.job.findFirst({
    where: { id: jobId, workspaceId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: 'Job opening not found' });
    return;
  }

  const { requiredSkills, preferredSkills, assignedRecruiterIds, ...jobData } = parsed;

  const updateData: any = { ...jobData };
  if (assignedRecruiterIds) {
    updateData.assignedRecruiterIds = JSON.stringify(assignedRecruiterIds);
  }

  if (jobData.status === JOB_STATUSES.PUBLISHED && !existing.publishedAt) {
    updateData.publishedAt = new Date();
  }

  // Update skills if supplied
  if (requiredSkills || preferredSkills) {
    await prisma.jobSkill.deleteMany({ where: { jobId } });
    const skillsToCreate = [
      ...(requiredSkills || []).map((name) => ({ name, isRequired: true })),
      ...(preferredSkills || []).map((name) => ({ name, isRequired: false })),
    ];
    if (skillsToCreate.length > 0) {
      await prisma.jobSkill.createMany({
        data: skillsToCreate.map((s) => ({ ...s, jobId })),
      });
    }
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: updateData,
    include: {
      skills: true,
      hiringManager: {
        select: { id: true, name: true, email: true, avatarUrl: true },
      },
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      assignedRecruiterIds: updated.assignedRecruiterIds ? JSON.parse(updated.assignedRecruiterIds) : [],
    },
  });
}

export async function updateJobStatus(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { jobId } = req.params;
  const { status } = updateJobStatusSchema.parse(req.body);

  const updateData: any = { status };
  if (status === JOB_STATUSES.PUBLISHED) {
    updateData.publishedAt = new Date();
  } else if (status === JOB_STATUSES.CLOSED) {
    updateData.closedAt = new Date();
  }

  const updated = await prisma.job.update({
    where: { id: jobId },
    data: updateData,
  });

  res.json({ success: true, data: updated });
}

// Public: Get published job details (No auth needed)
export async function getPublicJob(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      status: JOB_STATUSES.PUBLISHED,
    },
    include: {
      workspace: {
        select: { id: true, name: true, logoUrl: true, slug: true },
      },
      skills: true,
    },
  });

  if (!job) {
    res.status(404).json({ success: false, error: 'Job opening not found or no longer active' });
    return;
  }

  res.json({ success: true, data: job });
}

// Public: Submit job application (No auth needed)
export async function applyPublicJob(req: Request, res: Response): Promise<void> {
  const { jobId } = req.params;
  const parsed = publicJobApplySchema.parse(req.body);

  const job = await prisma.job.findFirst({
    where: {
      id: jobId,
      status: JOB_STATUSES.PUBLISHED,
    },
  });

  if (!job) {
    res.status(404).json({ success: false, error: 'Job opening not found or no longer active' });
    return;
  }

  // Check or create candidate in workspace
  let candidate = await prisma.candidate.findFirst({
    where: {
      workspaceId: job.workspaceId,
      email: parsed.email.toLowerCase(),
    },
  });

  if (!candidate) {
    candidate = await prisma.candidate.create({
      data: {
        workspaceId: job.workspaceId,
        fullName: parsed.fullName,
        email: parsed.email.toLowerCase(),
        phone: parsed.phone,
        location: parsed.location,
        linkedinUrl: parsed.linkedinUrl || null,
        portfolioUrl: parsed.portfolioUrl || null,
        currentCompany: parsed.currentCompany || null,
        expectedSalary: parsed.expectedSalary || null,
        noticePeriodDays: parsed.noticePeriodDays || null,
        resumeUrl: parsed.resumeUrl || null,
        source: 'CAREER_PAGE',
        tags: JSON.stringify(['Web Applicant']),
        experienceSummary: parsed.coverLetter || null,
        skills: {
          create: parsed.skills.map((name) => ({ name })),
        },
      },
    });
  }

  // Check if application already exists
  const existingApp = await prisma.application.findUnique({
    where: {
      jobId_candidateId: {
        jobId: job.id,
        candidateId: candidate.id,
      },
    },
  });

  if (existingApp) {
    res.status(409).json({ success: false, error: 'An application has already been submitted for this job.' });
    return;
  }

  // Create application in APPLIED stage
  const application = await prisma.application.create({
    data: {
      workspaceId: job.workspaceId,
      jobId: job.id,
      candidateId: candidate.id,
      stage: APPLICATION_STAGES.APPLIED,
      stageHistory: {
        create: {
          toStage: APPLICATION_STAGES.APPLIED,
          notes: 'Submitted via public career portal',
        },
      },
    },
    include: {
      job: { select: { title: true } },
      candidate: { select: { fullName: true, email: true } },
    },
  });

  // Notify workspace members
  await prisma.activityLog.create({
    data: {
      workspaceId: job.workspaceId,
      action: 'APPLICATION_SUBMITTED',
      entityType: 'APPLICATION',
      entityId: application.id,
      details: JSON.stringify({
        jobTitle: job.title,
        candidateName: candidate.fullName,
      }),
    },
  });

  emitToWorkspace(job.workspaceId, SOCKET_EVENTS.NOTIFICATION_NEW, {
    type: NOTIFICATION_TYPES.APPLICATION_NEW,
    title: 'New Candidate Applied',
    message: `${candidate.fullName} applied for ${job.title}`,
    link: `/applications?jobId=${job.id}`,
  });

  res.status(201).json({
    success: true,
    message: 'Application submitted successfully! Our recruiting team will review your application.',
    data: { applicationId: application.id },
  });
}

