import type { Request, Response } from 'express';
import { prisma } from '../../lib/prisma.js';
import {
  hashPassword,
  verifyPassword,
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  hashToken,
  generateRandomToken,
} from '../../lib/security.js';
import { config } from '../../config/index.js';
import {
  registerSchema,
  loginSchema,
  updateProfileSchema,
  ROLES,
  APPLICATION_STAGES,
} from '@hireflow/shared';

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

function setRefreshTokenCookie(res: Response, token: string): void {
  res.cookie('refreshToken', token, {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
}

function clearRefreshTokenCookie(res: Response): void {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: config.cookie.secure,
    sameSite: config.cookie.sameSite,
    path: '/',
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const parsed = registerSchema.parse(req.body);

  const existing = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
  });

  if (existing) {
    res.status(409).json({ success: false, error: 'A user with this email already exists' });
    return;
  }

  const passwordHash = await hashPassword(parsed.password);

  // Generate unique slug
  const baseSlug = (parsed.workspaceName || `${parsed.name} Workspace`)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 30);
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`;

  // Run in transaction: create User, Workspace, Member, Default Stages
  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: parsed.email.toLowerCase(),
        passwordHash,
        name: parsed.name,
      },
    });

    const workspace = await tx.workspace.create({
      data: {
        name: parsed.workspaceName || `${parsed.name}'s Organization`,
        slug,
        ownerId: user.id,
      },
    });

    await tx.workspaceMember.create({
      data: {
        workspaceId: workspace.id,
        userId: user.id,
        role: ROLES.OWNER,
      },
    });

    // Create default pipeline stages
    await tx.applicationStage.createMany({
      data: DEFAULT_STAGES.map((s) => ({
        ...s,
        workspaceId: workspace.id,
      })),
    });

    return { user, workspace };
  });

  // Issue tokens
  const payload = { userId: result.user.id, email: result.user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const family = generateRandomToken(16);

  await prisma.refreshToken.create({
    data: {
      userId: result.user.id,
      tokenHash: hashToken(refreshToken),
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setRefreshTokenCookie(res, refreshToken);

  res.status(201).json({
    success: true,
    data: {
      user: {
        id: result.user.id,
        email: result.user.email,
        name: result.user.name,
        avatarUrl: result.user.avatarUrl,
        themePreference: result.user.themePreference,
        createdAt: result.user.createdAt.toISOString(),
      },
      workspaces: [
        {
          id: result.workspace.id,
          name: result.workspace.name,
          slug: result.workspace.slug,
          description: result.workspace.description,
          logoUrl: result.workspace.logoUrl,
          role: ROLES.OWNER,
        },
      ],
      activeWorkspaceId: result.workspace.id,
      accessToken,
    },
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const parsed = loginSchema.parse(req.body);

  const user = await prisma.user.findUnique({
    where: { email: parsed.email.toLowerCase() },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!user) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  const isValid = await verifyPassword(parsed.password, user.passwordHash);
  if (!isValid) {
    res.status(401).json({ success: false, error: 'Invalid email or password' });
    return;
  }

  const payload = { userId: user.id, email: user.email };
  const accessToken = signAccessToken(payload);
  const refreshToken = signRefreshToken(payload);
  const family = generateRandomToken(16);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: hashToken(refreshToken),
      family,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  setRefreshTokenCookie(res, refreshToken);

  const workspaces = user.memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    description: m.workspace.description,
    logoUrl: m.workspace.logoUrl,
    role: m.role as any,
  }));

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        themePreference: user.themePreference,
        createdAt: user.createdAt.toISOString(),
      },
      workspaces,
      activeWorkspaceId: workspaces[0]?.id || '',
      accessToken,
    },
  });
}

export async function refresh(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken;
  if (!token) {
    res.status(401).json({ success: false, error: 'Refresh token cookie missing' });
    return;
  }

  try {
    const payload = verifyRefreshToken(token);
    const tokenHash = hashToken(token);

    const tokenRecord = await prisma.refreshToken.findUnique({
      where: { tokenHash },
    });

    if (!tokenRecord) {
      clearRefreshTokenCookie(res);
      res.status(401).json({ success: false, error: 'Invalid refresh token' });
      return;
    }

    // Token reuse detection: if revoked, revoke all tokens in the same family!
    if (tokenRecord.isRevoked) {
      await prisma.refreshToken.updateMany({
        where: { userId: payload.userId, family: tokenRecord.family },
        data: { isRevoked: true },
      });
      clearRefreshTokenCookie(res);
      res.status(403).json({ success: false, error: 'Token revoked. Please login again.' });
      return;
    }

    // Revoke used token (token rotation)
    await prisma.refreshToken.update({
      where: { id: tokenRecord.id },
      data: { isRevoked: true },
    });

    // Issue new pair
    const newPayload = { userId: payload.userId, email: payload.email };
    const newAccessToken = signAccessToken(newPayload);
    const newRefreshToken = signRefreshToken(newPayload);

    await prisma.refreshToken.create({
      data: {
        userId: payload.userId,
        tokenHash: hashToken(newRefreshToken),
        family: tokenRecord.family,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    setRefreshTokenCookie(res, newRefreshToken);

    res.json({
      success: true,
      data: {
        accessToken: newAccessToken,
      },
    });
  } catch {
    clearRefreshTokenCookie(res);
    res.status(401).json({ success: false, error: 'Expired or invalid refresh token' });
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.refreshToken;
  if (token) {
    try {
      const tokenHash = hashToken(token);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { isRevoked: true },
      });
    } catch {
      // Ignore
    }
  }

  clearRefreshTokenCookie(res);
  res.json({ success: true, message: 'Logged out successfully' });
}

export async function getMe(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { id: req.user.userId },
    include: {
      memberships: {
        include: {
          workspace: true,
        },
      },
    },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const workspaces = user.memberships.map((m) => ({
    id: m.workspace.id,
    name: m.workspace.name,
    slug: m.workspace.slug,
    description: m.workspace.description,
    logoUrl: m.workspace.logoUrl,
    role: m.role as any,
  }));

  res.json({
    success: true,
    data: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl,
        themePreference: user.themePreference,
        createdAt: user.createdAt.toISOString(),
      },
      workspaces,
    },
  });
}

export async function updateProfile(req: Request, res: Response): Promise<void> {
  if (!req.user) {
    res.status(401).json({ success: false, error: 'Unauthorized' });
    return;
  }

  const parsed = updateProfileSchema.parse(req.body);

  const updated = await prisma.user.update({
    where: { id: req.user.userId },
    data: parsed,
  });

  res.json({
    success: true,
    data: {
      id: updated.id,
      email: updated.email,
      name: updated.name,
      avatarUrl: updated.avatarUrl,
      themePreference: updated.themePreference,
      createdAt: updated.createdAt.toISOString(),
    },
  });
}

export async function forgotPassword(req: Request, res: Response): Promise<void> {
  const { email } = req.body;
  if (!email) {
    res.status(400).json({ success: false, error: 'Email is required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  // Always return success for security (prevents user enumeration)
  // In development, log the simulated reset token
  const resetToken = generateRandomToken(32);
  console.log(`[Auth] Password reset requested for ${email}. Dev token: ${resetToken}`);

  res.json({
    success: true,
    message: 'If an account with that email exists, reset instructions have been dispatched.',
    devToken: process.env.NODE_ENV !== 'production' ? resetToken : undefined,
  });
}

export async function resetPassword(req: Request, res: Response): Promise<void> {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ success: false, error: 'Email and new password are required' });
    return;
  }

  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
  });

  if (!user) {
    res.status(404).json({ success: false, error: 'User not found' });
    return;
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({
    where: { id: user.id },
    data: { passwordHash },
  });

  res.json({
    success: true,
    message: 'Password reset successful. Please login with your new password.',
  });
}

