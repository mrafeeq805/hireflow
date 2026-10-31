import { describe, it, expect } from 'vitest';
import request from 'supertest';
import { app } from '../src/app.js';

describe('HireFlow API Integration Tests', () => {
  it('GET /health returns healthy status', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('healthy');
  });

  describe('Authentication Flow', () => {
    const uniqueEmail = `test.user.${Date.now()}@hireflow.test`;

    it('POST /api/v1/auth/register creates user and default workspace', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          name: 'Integration Tester',
          email: uniqueEmail,
          password: 'Password123!',
          workspaceName: 'Test Org ATS',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe(uniqueEmail.toLowerCase());
      expect(res.body.data.workspaces).toHaveLength(1);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/login logs in with valid Argon2id credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: uniqueEmail,
          password: 'Password123!',
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.accessToken).toBeDefined();
    });

    it('POST /api/v1/auth/login rejects incorrect password', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: uniqueEmail,
          password: 'WrongPassword!',
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });

  describe('Public Jobs & Application Flow', () => {
    it('GET /api/v1/jobs/public/:jobId allows public viewing of published jobs', async () => {
      // First log in as seeded user to get job ID
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alex.morgan@hireflow.io',
          password: 'Password123!',
        });

      const token = loginRes.body.data.accessToken;
      const workspaceId = loginRes.body.data.activeWorkspaceId;

      const jobsRes = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${token}`)
        .set('x-workspace-id', workspaceId);

      expect(jobsRes.status).toBe(200);
      expect(jobsRes.body.data.length).toBeGreaterThan(0);

      const publishedJob = jobsRes.body.data.find((j: any) => j.status === 'PUBLISHED');
      expect(publishedJob).toBeDefined();

      // Now query public endpoint without any auth
      const publicRes = await request(app).get(`/api/v1/jobs/public/${publishedJob.id}`);
      expect(publicRes.status).toBe(200);
      expect(publicRes.body.data.title).toBe(publishedJob.title);
    });

    it('POST /api/v1/jobs/public/:jobId/apply allows candidate to apply publicly', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alex.morgan@hireflow.io',
          password: 'Password123!',
        });

      const token = loginRes.body.data.accessToken;
      const workspaceId = loginRes.body.data.activeWorkspaceId;

      const jobsRes = await request(app)
        .get('/api/v1/jobs')
        .set('Authorization', `Bearer ${token}`)
        .set('x-workspace-id', workspaceId);

      const publishedJob = jobsRes.body.data.find((j: any) => j.status === 'PUBLISHED');

      const applyRes = await request(app)
        .post(`/api/v1/jobs/public/${publishedJob.id}/apply`)
        .send({
          fullName: 'Jordan Applicant',
          email: `applicant.${Date.now()}@example.com`,
          phone: '+1 555-0199',
          location: 'Remote',
          skills: ['React', 'TypeScript'],
          coverLetter: 'I am excited to apply for this role.',
        });

      expect(applyRes.status).toBe(201);
      expect(applyRes.body.success).toBe(true);
      expect(applyRes.body.data.applicationId).toBeDefined();
    });
  });

  describe('Candidate & Pipeline Workflows', () => {
    let token: string;
    let workspaceId: string;

    it('detects duplicate candidates by email', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alex.morgan@hireflow.io',
          password: 'Password123!',
        });

      token = loginRes.body.data.accessToken;
      workspaceId = loginRes.body.data.activeWorkspaceId;

      const dupRes = await request(app)
        .get('/api/v1/candidates/check-duplicate?email=maya.lin@example.com')
        .set('Authorization', `Bearer ${token}`)
        .set('x-workspace-id', workspaceId);

      expect(dupRes.status).toBe(200);
      expect(dupRes.body.data.isDuplicate).toBe(true);
      expect(dupRes.body.data.candidate.fullName).toBe('Maya Lin');
    });

    it('advances application stage and creates history record', async () => {
      const appsRes = await request(app)
        .get('/api/v1/applications')
        .set('Authorization', `Bearer ${token}`)
        .set('x-workspace-id', workspaceId);

      expect(appsRes.status).toBe(200);
      const targetApp = appsRes.body.data[0];
      expect(targetApp).toBeDefined();

      const patchRes = await request(app)
        .patch(`/api/v1/applications/${targetApp.id}/stage`)
        .set('Authorization', `Bearer ${token}`)
        .set('x-workspace-id', workspaceId)
        .send({
          stage: 'ASSESSMENT',
          note: 'Passed initial screening with flying colors.',
        });

      expect(patchRes.status).toBe(200);
      expect(patchRes.body.data.stage).toBe('ASSESSMENT');
      expect(patchRes.body.data.stageHistory).toBeDefined();
    });

    it('calculates real database-driven recruitment analytics', async () => {
      const analyticsRes = await request(app)
        .get('/api/v1/analytics')
        .set('Authorization', `Bearer ${token}`)
        .set('x-workspace-id', workspaceId);

      expect(analyticsRes.status).toBe(200);
      expect(analyticsRes.body.data.overview).toBeDefined();
      expect(analyticsRes.body.data.overview.activeJobs).toBeGreaterThanOrEqual(1);
      expect(analyticsRes.body.data.pipelineDistribution).toBeDefined();
      expect(analyticsRes.body.data.recruiterPerformance).toBeDefined();
      expect(analyticsRes.body.data.monthlyTrends).toBeDefined();
    });
  });

  describe('Interviews & Conflict Detection', () => {
    it('detects scheduling conflicts when interviewer is already booked', async () => {
      const loginRes = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'alex.morgan@hireflow.io',
          password: 'Password123!',
        });

      const token = loginRes.body.data.accessToken;
      const workspaceId = loginRes.body.data.activeWorkspaceId;

      const interviewsRes = await request(app)
        .get('/api/v1/interviews')
        .set('Authorization', `Bearer ${token}`)
        .set('x-workspace-id', workspaceId);

      expect(interviewsRes.status).toBe(200);
      const scheduled = interviewsRes.body.data.find((i: any) => i.status === 'SCHEDULED');

      if (scheduled && scheduled.interviewers?.length > 0) {
        const interviewerId = scheduled.interviewers[0].userId;

        // Attempt to book another interview at the exact same time with the same interviewer
        const conflictRes = await request(app)
          .post('/api/v1/interviews')
          .set('Authorization', `Bearer ${token}`)
          .set('x-workspace-id', workspaceId)
          .send({
            applicationId: scheduled.applicationId,
            type: 'TECHNICAL',
            scheduledAt: scheduled.scheduledAt,
            durationMinutes: 45,
            interviewerIds: [interviewerId],
          });

        expect(conflictRes.status).toBe(409);
        expect(conflictRes.body.error).toContain('Scheduling conflict');
      }
    });
  });
});
