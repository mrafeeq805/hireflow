import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import rateLimit from 'express-rate-limit';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

import { config } from './config/index.js';
import { errorHandler } from './middleware/errorHandler.js';

import { authRouter } from './modules/auth/auth.routes.js';
import { workspacesRouter } from './modules/workspaces/workspaces.routes.js';
import { jobsRouter } from './modules/jobs/jobs.routes.js';
import { candidatesRouter } from './modules/candidates/candidates.routes.js';
import { applicationsRouter } from './modules/applications/applications.routes.js';
import { interviewsRouter } from './modules/interviews/interviews.routes.js';
import { scorecardsRouter } from './modules/scorecards/scorecards.routes.js';
import { offersRouter } from './modules/offers/offers.routes.js';
import { tasksRouter } from './modules/tasks/tasks.routes.js';
import { commentsRouter } from './modules/comments/comments.routes.js';
import { notificationsRouter } from './modules/notifications/notifications.routes.js';
import { analyticsRouter } from './modules/analytics/analytics.routes.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const app = express();

// Security headers with cross-origin resource policy allowed for static uploads
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  })
);

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, public embeds) or localhost
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(null, true);
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'x-workspace-id'],
  })
);

// Rate limiter for general API routes
const apiLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: { success: false, error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser(config.cookie.secret));

// Static files (uploads)
app.use('/uploads', express.static(config.storage.localDir));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get(`${config.apiPrefix}/health`, (_req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Apply rate limiting to API prefix
app.use(config.apiPrefix, apiLimiter);

// API Route Registration
app.use(`${config.apiPrefix}/auth`, authRouter);
app.use(`${config.apiPrefix}/workspaces`, workspacesRouter);
app.use(`${config.apiPrefix}/jobs`, jobsRouter);
app.use(`${config.apiPrefix}/candidates`, candidatesRouter);
app.use(`${config.apiPrefix}/applications`, applicationsRouter);
app.use(`${config.apiPrefix}/interviews`, interviewsRouter);
app.use(`${config.apiPrefix}/scorecards`, scorecardsRouter);
app.use(`${config.apiPrefix}/offers`, offersRouter);
app.use(`${config.apiPrefix}/tasks`, tasksRouter);
app.use(`${config.apiPrefix}/comments`, commentsRouter);
app.use(`${config.apiPrefix}/notifications`, notificationsRouter);
app.use(`${config.apiPrefix}/analytics`, analyticsRouter);

// Optional SPA static file serving (for unified single-service deployments)
const webDistPath = path.resolve(__dirname, '../../../apps/web/dist');
const altWebDistPath = path.resolve(__dirname, '../../web/dist');
const resolvedDist = fs.existsSync(webDistPath) ? webDistPath : fs.existsSync(altWebDistPath) ? altWebDistPath : null;

if (resolvedDist) {
  app.use(express.static(resolvedDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(resolvedDist, 'index.html'));
  });
}

// Centralized error handling
app.use(errorHandler);

