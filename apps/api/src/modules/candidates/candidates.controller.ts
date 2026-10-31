import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  createCandidateSchema,
  updateCandidateSchema,
} from '@hireflow/shared';

export async function listCandidates(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { search, source, recruiterId, tag } = req.query;

  const where: any = { workspaceId };

  if (source && source !== 'ALL') {
    where.source = source as string;
  }
  if (recruiterId && recruiterId !== 'ALL') {
    where.assignedRecruiterId = recruiterId as string;
  }
  if (tag) {
    where.tags = { contains: String(tag) };
  }
  if (search) {
    where.OR = [
      { fullName: { contains: String(search) } },
      { email: { contains: String(search) } },
      { location: { contains: String(search) } },
      { currentCompany: { contains: String(search) } },
    ];
  }

  const candidates = await prisma.candidate.findMany({
    where,
    include: {
      skills: true,
      assignedRecruiter: {
        select: { id: true, name: true, email: true },
      },
      _count: {
        select: { applications: true },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const formatted = candidates.map((c) => ({
    ...c,
    tags: c.tags ? JSON.parse(c.tags) : [],
    applicationsCount: c._count.applications,
  }));

  res.json({ success: true, data: formatted });
}

export async function checkDuplicate(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { email, phone } = req.query;

  if (!email && !phone) {
    res.status(400).json({ success: false, error: 'Email or phone required to check duplicate' });
    return;
  }

  const whereConditions: any[] = [];
  if (email) {
    whereConditions.push({ email: String(email).toLowerCase() });
  }
  if (phone) {
    whereConditions.push({ phone: String(phone) });
  }

  const existing = await prisma.candidate.findFirst({
    where: {
      workspaceId,
      OR: whereConditions,
    },
    include: {
      applications: {
        include: {
          job: { select: { title: true } },
        },
      },
    },
  });

  if (existing) {
    const candidateData = {
      id: existing.id,
      fullName: existing.fullName,
      email: existing.email,
      phone: existing.phone,
      appliedJobs: existing.applications.map((a) => a.job.title),
    };
    res.json({
      success: true,
      isDuplicate: true,
      candidate: candidateData,
      data: {
        isDuplicate: true,
        candidate: candidateData,
      },
    });
    return;
  }

  res.json({
    success: true,
    isDuplicate: false,
    data: {
      isDuplicate: false,
    },
  });
}

export async function createCandidate(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const parsed = createCandidateSchema.parse(req.body);

  // Check duplicate
  const existing = await prisma.candidate.findFirst({
    where: {
      workspaceId,
      email: parsed.email.toLowerCase(),
    },
  });

  if (existing) {
    res.status(409).json({
      success: false,
      error: `Candidate with email ${parsed.email} already exists in this workspace.`,
      candidateId: existing.id,
    });
    return;
  }

  const { skills, tags, availabilityDate, ...candidateData } = parsed;

  const candidate = await prisma.candidate.create({
    data: {
      ...candidateData,
      email: parsed.email.toLowerCase(),
      workspaceId,
      tags: JSON.stringify(tags),
      availabilityDate: availabilityDate ? new Date(availabilityDate) : null,
      skills: {
        create: skills.map((name) => ({ name })),
      },
    },
    include: {
      skills: true,
      assignedRecruiter: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  // Log activity
  await prisma.activityLog.create({
    data: {
      workspaceId,
      userId: req.user?.userId,
      action: 'CANDIDATE_CREATED',
      entityType: 'CANDIDATE',
      entityId: candidate.id,
      details: JSON.stringify({ name: candidate.fullName }),
    },
  });

  res.status(201).json({
    success: true,
    data: {
      ...candidate,
      tags,
      applicationsCount: 0,
    },
  });
}

export async function getCandidate(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { candidateId } = req.params;

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, workspaceId },
    include: {
      skills: true,
      documents: true,
      assignedRecruiter: {
        select: { id: true, name: true, email: true },
      },
      applications: {
        include: {
          job: {
            select: { id: true, title: true, department: true, location: true },
          },
          stageHistory: {
            orderBy: { createdAt: 'desc' },
          },
          interviews: {
            include: {
              interviewers: {
                include: {
                  user: { select: { id: true, name: true, email: true, avatarUrl: true } },
                },
              },
            },
          },
        },
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

  if (!candidate) {
    res.status(404).json({ success: false, error: 'Candidate profile not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      ...candidate,
      tags: candidate.tags ? JSON.parse(candidate.tags) : [],
      applicationsCount: candidate.applications.length,
    },
  });
}

export async function updateCandidate(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { candidateId } = req.params;
  const parsed = updateCandidateSchema.parse(req.body);

  const existing = await prisma.candidate.findFirst({
    where: { id: candidateId, workspaceId },
  });

  if (!existing) {
    res.status(404).json({ success: false, error: 'Candidate profile not found' });
    return;
  }

  const { skills, tags, availabilityDate, ...candidateData } = parsed;

  const updateData: any = { ...candidateData };
  if (parsed.email) {
    updateData.email = parsed.email.toLowerCase();
  }
  if (tags) {
    updateData.tags = JSON.stringify(tags);
  }
  if (availabilityDate !== undefined) {
    updateData.availabilityDate = availabilityDate ? new Date(availabilityDate) : null;
  }

  // Update skills if provided
  if (skills) {
    await prisma.candidateSkill.deleteMany({ where: { candidateId } });
    if (skills.length > 0) {
      await prisma.candidateSkill.createMany({
        data: skills.map((name) => ({ name, candidateId })),
      });
    }
  }

  const updated = await prisma.candidate.update({
    where: { id: candidateId },
    data: updateData,
    include: {
      skills: true,
      documents: true,
      assignedRecruiter: {
        select: { id: true, name: true, email: true },
      },
    },
  });

  res.json({
    success: true,
    data: {
      ...updated,
      tags: updated.tags ? JSON.parse(updated.tags) : [],
    },
  });
}

export async function uploadDocument(req: Request, res: Response): Promise<void> {
  const workspaceId = req.workspace!.workspaceId;
  const { candidateId } = req.params;

  if (!req.file) {
    res.status(400).json({ success: false, error: 'No file uploaded' });
    return;
  }

  const candidate = await prisma.candidate.findFirst({
    where: { id: candidateId, workspaceId },
  });

  if (!candidate) {
    res.status(404).json({ success: false, error: 'Candidate profile not found' });
    return;
  }

  const fileUrl = `/uploads/${req.file.filename}`;

  const document = await prisma.candidateDocument.create({
    data: {
      candidateId,
      fileName: req.file.originalname,
      fileUrl,
      fileSize: req.file.size,
      fileType: req.file.mimetype,
    },
  });

  // If candidate had no resumeUrl, set this as primary resume
  if (!candidate.resumeUrl) {
    await prisma.candidate.update({
      where: { id: candidateId },
      data: { resumeUrl: fileUrl },
    });
  }

  res.status(201).json({
    success: true,
    data: document,
  });
}

export async function deleteDocument(req: Request, res: Response): Promise<void> {
  const { documentId } = req.params;

  await prisma.candidateDocument.delete({
    where: { id: documentId },
  });

  res.json({ success: true, message: 'Document deleted successfully' });
}

