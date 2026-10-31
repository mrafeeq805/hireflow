import { Server as SocketIOServer, Socket } from 'socket.io';
import type { Server as HTTPServer } from 'http';
import { verifyAccessToken } from '../lib/security.js';
import { prisma } from '../lib/prisma.js';
import { SOCKET_EVENTS } from '@hireflow/shared';

export interface AuthenticatedSocket extends Socket {
  userId?: string;
  userEmail?: string;
}

let ioInstance: SocketIOServer | null = null;

export function initSocketServer(server: HTTPServer, corsOrigin: string): SocketIOServer {
  const io = new SocketIOServer(server, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
    pingTimeout: 30000,
    pingInterval: 15000,
  });

  // Socket Auth Middleware
  io.use(async (socket: AuthenticatedSocket, next) => {
    try {
      const token =
        socket.handshake.auth?.token ||
        socket.handshake.headers?.authorization?.replace('Bearer ', '');

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      const payload = verifyAccessToken(token);
      socket.userId = payload.userId;
      socket.userEmail = payload.email;
      next();
    } catch {
      next(new Error('Invalid or expired authentication token'));
    }
  });

  io.on('connection', (socket: AuthenticatedSocket) => {
    // Join personal user room for direct notifications
    if (socket.userId) {
      socket.join(`user:${socket.userId}`);
    }

    // Join workspace room after verifying membership
    socket.on(SOCKET_EVENTS.JOIN_WORKSPACE, async (workspaceId: string) => {
      if (!socket.userId || !workspaceId) return;

      try {
        const membership = await prisma.workspaceMember.findUnique({
          where: {
            workspaceId_userId: {
              workspaceId,
              userId: socket.userId,
            },
          },
        });

        if (membership) {
          socket.join(`workspace:${workspaceId}`);
        }
      } catch (err) {
        console.error('Socket join workspace error:', err);
      }
    });

    // Leave workspace room
    socket.on(SOCKET_EVENTS.LEAVE_WORKSPACE, (workspaceId: string) => {
      if (workspaceId) {
        socket.leave(`workspace:${workspaceId}`);
      }
    });
  });

  ioInstance = io;
  return io;
}

export function getIO(): SocketIOServer | null {
  return ioInstance;
}

export function emitToWorkspace(workspaceId: string, event: string, data: unknown): void {
  if (ioInstance) {
    ioInstance.to(`workspace:${workspaceId}`).emit(event, data);
  }
}

export function emitToUser(userId: string, event: string, data: unknown): void {
  if (ioInstance) {
    ioInstance.to(`user:${userId}`).emit(event, data);
  }
}

