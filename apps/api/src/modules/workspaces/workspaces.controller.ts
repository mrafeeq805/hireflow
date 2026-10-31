import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  createWorkspaceSchema,
  updateWorkspaceSchema,
  inviteMemberSchema,
  updateMemberRoleSchema,
  ROLES,
  APPLICATION_STAGES,
} from '@hireflow/shared';
import { generateRandomToken } from '../../lib/security.js';

const DEFAULT_STAGES = [
  { name: APPLICATION_STAGES.APPLIED, order: 0, color: '#0F9D78', isSystemDefault: true },
  { name: APPLICATION_STAGES.SCREENING, order: 1, color: '#15966B', isSystemDefault: true },
  { name: APPLICATION_STAGES.SHORTLISTED, order: 2, color: '#3B82F6', isSystemDefault: true },
  { name: APPLICATION_STAGES.INTERVIEW, order: 3, color: '#8B5CF6', isSystemDefault: true },
  { name: APPLICATION_STAGES.ASSESSMENT, order: 4, color: '#E6A23C', isSystemDefault: true },
  { name: APPLICATION_STAGES.OFFER, order: 5, color: '#EC4899', isSystemDefault: true },
  { name: APPLICATION_STAGES.HIRED, order: 6, color: '#10B981', isSystemDefault: true },
  { name: APPLICATION_STAGES.REJECTED, order: 7, color: '#DC5B62', isSystemDefault: true },
];

export async function listWorkspaces(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;

  const memberships = await prisma.workspaceMember.findMany({
    where: { userId },
    include: {
      workspace: {
        include: {
          _count: {
            select: {
              members: true,
              jobs: { where: { status: 'PUBLISHED' } },
            },
          },
        },
      },
    },
  });

  const list = memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    description: m.workspace.description,
    logoUrl: m.workspace.logoUrl,
    role: m.role as any,
    memberCount: m.workspace._count.members,
    activeJobsCount: m.workspace._count.jobs,
  }));

  res.json({ success: true, data: list });
}

export async function createWorkspace(req: Request, res: Response): Promise<void> {
  const userId = req.user!.userId;
  const parsed = createWorkspaceSchema.parse(req.body);

  const baseSlug = (parsed.slug || parsed.name)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  const result = await prisma.$transaction(async (tx) => {
    const ws = await tx.workspace.create({
      data: {
        name: parsed.name,
        slug,
        description: parsed.description,
        ownerId: userId,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: ws.id,
        userId,
        role: ROLES.OWNER,
      },
    });

    await tx.applicationStage.createMany({
      data: DEFAULT_STAGES.map((s) => ({
        ...s,
        workspaceId: ws.id,
      })),
    });

    return ws;
  });

  res.status(201).json({
    success: true,
    data: {
      id: result.id,
      name: result.name,
      slug: result.slug,
      description: result.description,
      logoUrl: result.logoUrl,
      role: ROLES.OWNER,
    },
  });
}

export async function getWorkspace(req: Request, res: Response): Promise<void> {
  const { workspaceId } = req.params;

  const ws = await prisma.workspace.findUnique({
    where: { id: workspaceId },
    include: {
      _count: {
        select: {
          members: true,
          jobs: true,
          candidates: true,
          applications: true,
        },
      },
    },
  });

  if (!ws) {
    res.status(404).json({ success: false, error: 'Workspace not found' });
    return;
  }

  res.json({
    success: true,
    data: {
      id: ws.id,
      name: ws.name,
      slug: ws.slug,
      description: ws.description,
      logoUrl: ws.logoUrl,
      ownerId: ws.ownerId,
      counts: ws._count,
    },
  });
}

export async function updateWorkspace(req: Request, res: Response): Promise<void> {
  const { workspaceId } = req.params;
  const parsed = updateWorkspaceSchema.parse(req.body);

  const updated = await prisma.workspace.update({
    where: { id: workspaceId },
    data: parsed,
  });

  res.json({ success: true, data: updated });
}

export async function listMembers(req: Request, res: Response): Promise<void> {
  const { workspaceId } = req.params;

  const members = await prisma.workspaceMember.findMany({
    where: { workspaceId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { joinedAt: 'asc' },
  });

  res.json({
    success: true,
    data: members.map((m) => ({
      id: m.id,
      userId: m.userId,
      workspaceId: m.workspaceId,
      role: m.role,
      joinedAt: m.joinedAt.toISOString(),
      user: m.user,
    })),
  });
}

export async function inviteMember(req: Request, res: Response): Promise<void> {
  const { workspaceId } = req.params;
  const userId = req.user!.userId;
  const parsed = inviteMemberSchema.parse(req.body);

  // Check if already a member
  const existingMember = await prisma.workspaceMember.findFirst({
    where: {
      workspaceId,
      user: { email: parsed.email.toLowerCase() },
    },
  });

  if (existingMember) {
    res.status(409).json({ success: false, error: 'User is already a member of this workspace' });
    return;
  }

  const token = generateRandomToken(24);
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const invitation = await prisma.workspaceInvitation.upsert({
    where: {
      workspaceId_email: {
        workspaceId,
        email: parsed.email.toLowerCase(),
      },
    },
    update: {
      role: parsed.role,
      token,
      expiresAt,
      acceptedAt: null,
    },
    create: {
      workspaceId,
      email: parsed.email.toLowerCase(),
      role: parsed.role,
      token,
      inviterId: userId,
      expiresAt,
    },
    include: {
      inviter: {
        select: { name: true, email: true },
      },
    },
  });

  // Log email setup notice in console
  console.log(`[Email Integration Required] Workspace invitation token for ${parsed.email}: ${token}`);

  res.status(201).json({
    success: true,
    message: 'Invitation generated successfully',
    data: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      token: invitation.token,
      expiresAt: invitation.expiresAt.toISOString(),
      inviter: invitation.inviter,
      inviteUrl: `/join?token=${token}`,
    },
  });
}

export async function updateMemberRole(req: Request, res: Response): Promise<void> {
  const { workspaceId, memberId } = req.params;
  const parsed = updateMemberRoleSchema.parse(req.body);

  const member = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    include: { workspace: true },
  });

  if (!member || member.workspaceId !== workspaceId) {
    res.status(404).json({ success: false, error: 'Workspace member not found' });
    return;
  }

  if (member.userId === member.workspace.ownerId) {
    res.status(400).json({ success: false, error: 'Cannot modify workspace owner role' });
    return;
  }

  const updated = await prisma.workspaceMember.update({
    where: { id: memberId },
    data: { role: parsed.role },
  });

  res.json({ success: true, data: updated });
}

export async function removeMember(req: Request, res: Response): Promise<void> {
  const { workspaceId, memberId } = req.params;

  const member = await prisma.workspaceMember.findUnique({
    where: { id: memberId },
    include: { workspace: true },
  });

  if (!member || member.workspaceId !== workspaceId) {
    res.status(404).json({ success: false, error: 'Workspace member not found' });
    return;
  }

  if (member.userId === member.workspace.ownerId) {
    res.status(400).json({ success: false, error: 'Cannot remove workspace owner' });
    return;
  }

  await prisma.workspaceMember.delete({
    where: { id: memberId },
  });

  res.json({ success: true, message: 'Member removed successfully' });
}

export async function acceptInvitation(req: Request, res: Response): Promise<void> {
  const { token } = req.params;
  const userId = req.user!.userId;

  const invitation = await prisma.workspaceInvitation.findUnique({
    where: { token },
    include: { workspace: true },
  });

  if (!invitation) {
    res.status(404).json({ success: false, error: 'Invitation not found or invalid' });
    return;
  }

  if (new Date() > invitation.expiresAt) {
    res.status(400).json({ success: false, error: 'Invitation has expired' });
    return;
  }

  // Add member
  await prisma.$transaction([
    prisma.workspaceMember.upsert({
      where: {
        workspaceId_userId: {
          workspaceId: invitation.workspaceId,
          userId,
        },
      },
      update: {
        role: invitation.role,
      },
      create: {
        workspaceId: invitation.workspaceId,
        userId,
        role: invitation.role,
      },
    }),
    prisma.workspaceInvitation.update({
      where: { id: invitation.id },
      data: { acceptedAt: new Date() },
    }),
  ]);

  res.json({
    success: true,
    data: {
      workspaceId: invitation.workspace.id,
      name: invitation.workspace.name,
      role: invitation.role,
    },
  });
}

