import http from 'http';
import { app } from './app.js';
import { config } from './config/index.js';
import { initSocketServer } from './sockets/index.js';
import { prisma } from './lib/prisma.js';

const server = http.createServer(app);

// Initialize Socket.IO
initSocketServer(server, config.corsOrigin);

// Background job for reminder notifications (runs every 60 seconds)
const reminderInterval = setInterval(async () => {
  try {
    const now = new Date();
    const next15Min = new Date(now.getTime() + 15 * 60 * 1000);

    // 1. Check upcoming interviews starting within 15 minutes
    const upcomingInterviews = await prisma.interview.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: now,
          lte: next15Min,
        },
      },
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

    for (const interview of upcomingInterviews) {
      for (const interviewer of interview.interviewers) {
        // Check if reminder notification already exists
        const existing = await prisma.notification.findFirst({
          where: {
            userId: interviewer.userId,
            link: `/interviews/${interview.id}`,
            title: 'Interview Starting Soon',
          },
        });

        if (!existing) {
          await prisma.notification.create({
            data: {
              workspaceId: interview.workspaceId,
              userId: interviewer.userId,
              type: 'INTERVIEW_SCHEDULED',
              title: 'Interview Starting Soon',
              message: `Interview with ${interview.application.candidate.fullName} starts in 15 minutes`,
              link: `/interviews/${interview.id}`,
            },
          });
        }
      }
    }
  } catch (err) {
    // Avoid crashing on background scheduler error
    console.error('[Background Scheduler Error]:', err);
  }
}, 60 * 1000);

// Start server
server.listen(config.port, () => {
  console.log(`🚀 HireFlow API Server running at http://localhost:${config.port}`);
  console.log(`📡 Socket.IO initialized on port ${config.port}`);
  console.log(`📦 Database connected via Prisma`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  clearInterval(reminderInterval);
  server.close(() => {
    prisma.$disconnect();
    process.exit(0);
  });
});

