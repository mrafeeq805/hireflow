import { z } from 'zod';
import {
  ROLES,
  JOB_STATUSES,
  EMPLOYMENT_TYPES,
  EXPERIENCE_LEVELS,
  CANDIDATE_SOURCES,
  APPLICATION_STAGES,
  APPLICATION_PRIORITIES,
  INTERVIEW_TYPES,
  INTERVIEW_STATUSES,
  INTERVIEW_OUTCOMES,
  SCORECARD_RECOMMENDATIONS,
  OFFER_STATUSES,
  TASK_TYPES,
  TASK_PRIORITIES,
  TASK_STATUSES,
} from '../constants/index.js';

// Auth Schemas
export const registerSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  workspaceName: z.string().min(2, 'Workspace name must be at least 2 characters').optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  avatarUrl: z.string().url().or(z.literal('')).optional().nullable(),
  themePreference: z.enum(['light', 'dark']).optional(),
});

// Workspace Schemas
export const createWorkspaceSchema = z.object({
  name: z.string().min(2, 'Workspace name must be at least 2 characters'),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/, 'Slug must contain only lowercase alphanumeric characters and hyphens').optional(),
  description: z.string().max(500).optional().nullable(),
});

export const updateWorkspaceSchema = z.object({
  name: z.string().min(2).optional(),
  slug: z.string().min(2).regex(/^[a-z0-9-]+$/).optional(),
  description: z.string().max(500).optional().nullable(),
  logoUrl: z.string().url().or(z.literal('')).optional().nullable(),
});

export const inviteMemberSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum([ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER, ROLES.INTERVIEWER]),
});

export const updateMemberRoleSchema = z.object({
  role: z.enum([ROLES.ADMIN, ROLES.RECRUITER, ROLES.HIRING_MANAGER, ROLES.INTERVIEWER]),
});

// Job Schemas
export const createJobSchema = z.object({
  title: z.string().min(2, 'Job title is required'),
  department: z.string().min(2, 'Department is required'),
  location: z.string().min(2, 'Location is required'),
  employmentType: z.enum([
    EMPLOYMENT_TYPES.FULL_TIME,
    EMPLOYMENT_TYPES.PART_TIME,
    EMPLOYMENT_TYPES.CONTRACT,
    EMPLOYMENT_TYPES.INTERNSHIP,
    EMPLOYMENT_TYPES.REMOTE,
  ]),
  experienceLevel: z.enum([
    EXPERIENCE_LEVELS.ENTRY,
    EXPERIENCE_LEVELS.MID,
    EXPERIENCE_LEVELS.SENIOR,
    EXPERIENCE_LEVELS.LEAD,
    EXPERIENCE_LEVELS.EXECUTIVE,
  ]),
  salaryMin: z.number().nonnegative().optional().nullable(),
  salaryMax: z.number().nonnegative().optional().nullable(),
  currency: z.string().default('USD'),
  description: z.string().min(10, 'Job description must be at least 10 characters'),
  responsibilities: z.string().optional().nullable(),
  vacancies: z.number().int().positive().default(1),
  hiringManagerId: z.string().optional().nullable(),
  assignedRecruiterIds: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  internalNotes: z.string().optional().nullable(),
  status: z.enum([
    JOB_STATUSES.DRAFT,
    JOB_STATUSES.PUBLISHED,
    JOB_STATUSES.PAUSED,
    JOB_STATUSES.CLOSED,
    JOB_STATUSES.ARCHIVED,
  ]).default(JOB_STATUSES.DRAFT),
});

export const updateJobSchema = createJobSchema.partial();

export const updateJobStatusSchema = z.object({
  status: z.enum([
    JOB_STATUSES.DRAFT,
    JOB_STATUSES.PUBLISHED,
    JOB_STATUSES.PAUSED,
    JOB_STATUSES.CLOSED,
    JOB_STATUSES.ARCHIVED,
  ]),
});

// Public Job Application Schema
export const publicJobApplySchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().min(5, 'Phone number is required'),
  location: z.string().min(2, 'Location is required'),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').optional().or(z.literal('')),
  portfolioUrl: z.string().url('Invalid portfolio URL').optional().or(z.literal('')),
  currentCompany: z.string().optional().or(z.literal('')),
  expectedSalary: z.number().optional().nullable(),
  noticePeriodDays: z.number().int().optional().nullable(),
  skills: z.array(z.string()).default([]),
  coverLetter: z.string().optional(),
  resumeUrl: z.string().optional(),
});

// Candidate Schemas
export const createCandidateSchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  resumeUrl: z.string().optional().nullable(),
  linkedinUrl: z.string().url().or(z.literal('')).optional().nullable(),
  portfolioUrl: z.string().url().or(z.literal('')).optional().nullable(),
  currentCompany: z.string().optional().nullable(),
  expectedSalary: z.number().optional().nullable(),
  noticePeriodDays: z.number().int().optional().nullable(),
  availabilityDate: z.string().or(z.date()).optional().nullable(),
  source: z.enum([
    CANDIDATE_SOURCES.LINKEDIN,
    CANDIDATE_SOURCES.CAREER_PAGE,
    CANDIDATE_SOURCES.REFERRAL,
    CANDIDATE_SOURCES.AGENCY,
    CANDIDATE_SOURCES.DIRECT,
    CANDIDATE_SOURCES.INDEED,
    CANDIDATE_SOURCES.OTHER,
  ]).default(CANDIDATE_SOURCES.DIRECT),
  tags: z.array(z.string()).default([]),
  skills: z.array(z.string()).default([]),
  experienceSummary: z.string().optional().nullable(),
  educationSummary: z.string().optional().nullable(),
  assignedRecruiterId: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

export const updateCandidateSchema = createCandidateSchema.partial();

// Application Schemas
export const createApplicationSchema = z.object({
  jobId: z.string().min(1, 'Job ID is required'),
  candidateId: z.string().min(1, 'Candidate ID is required'),
  stage: z.enum([
    APPLICATION_STAGES.APPLIED,
    APPLICATION_STAGES.SCREENING,
    APPLICATION_STAGES.SHORTLISTED,
    APPLICATION_STAGES.INTERVIEW,
    APPLICATION_STAGES.ASSESSMENT,
    APPLICATION_STAGES.OFFER,
    APPLICATION_STAGES.HIRED,
    APPLICATION_STAGES.REJECTED,
  ]).default(APPLICATION_STAGES.APPLIED),
  priority: z.enum([
    APPLICATION_PRIORITIES.LOW,
    APPLICATION_PRIORITIES.MEDIUM,
    APPLICATION_PRIORITIES.HIGH,
    APPLICATION_PRIORITIES.URGENT,
  ]).default(APPLICATION_PRIORITIES.MEDIUM),
  assignedRecruiterId: z.string().optional().nullable(),
  internalNotes: z.string().optional().nullable(),
});

export const updateApplicationStageSchema = z.object({
  stage: z.enum([
    APPLICATION_STAGES.APPLIED,
    APPLICATION_STAGES.SCREENING,
    APPLICATION_STAGES.SHORTLISTED,
    APPLICATION_STAGES.INTERVIEW,
    APPLICATION_STAGES.ASSESSMENT,
    APPLICATION_STAGES.OFFER,
    APPLICATION_STAGES.HIRED,
    APPLICATION_STAGES.REJECTED,
  ]),
  rejectionReason: z.string().optional().nullable(),
  note: z.string().optional().nullable(),
});

export const updateApplicationPrioritySchema = z.object({
  priority: z.enum([
    APPLICATION_PRIORITIES.LOW,
    APPLICATION_PRIORITIES.MEDIUM,
    APPLICATION_PRIORITIES.HIGH,
    APPLICATION_PRIORITIES.URGENT,
  ]),
});

// Interview Schemas
export const scheduleInterviewSchema = z.object({
  applicationId: z.string().min(1, 'Application is required'),
  type: z.enum([
    INTERVIEW_TYPES.PHONE,
    INTERVIEW_TYPES.VIDEO,
    INTERVIEW_TYPES.TECHNICAL,
    INTERVIEW_TYPES.HR,
    INTERVIEW_TYPES.FINAL,
  ]),
  scheduledAt: z.string().or(z.date()),
  durationMinutes: z.number().int().positive().default(45),
  interviewerIds: z.array(z.string()).min(1, 'At least one interviewer is required'),
  location: z.string().optional().nullable(),
  meetingLink: z.string().url().or(z.literal('')).optional().nullable(),
  instructions: z.string().optional().nullable(),
});

export const updateInterviewSchema = scheduleInterviewSchema.partial();

export const updateInterviewOutcomeSchema = z.object({
  outcome: z.enum([
    INTERVIEW_OUTCOMES.PENDING,
    INTERVIEW_OUTCOMES.PASSED,
    INTERVIEW_OUTCOMES.FAILED,
  ]),
  notes: z.string().optional().nullable(),
});

// Scorecard & Feedback Schema
export const submitFeedbackSchema = z.object({
  technicalRating: z.number().int().min(1).max(5),
  communicationRating: z.number().int().min(1).max(5),
  problemSolvingRating: z.number().int().min(1).max(5),
  experienceRating: z.number().int().min(1).max(5),
  cultureFitRating: z.number().int().min(1).max(5),
  recommendation: z.enum([
    SCORECARD_RECOMMENDATIONS.STRONG_YES,
    SCORECARD_RECOMMENDATIONS.YES,
    SCORECARD_RECOMMENDATIONS.MAYBE,
    SCORECARD_RECOMMENDATIONS.NO,
    SCORECARD_RECOMMENDATIONS.STRONG_NO,
  ]),
  summaryNotes: z.string().min(5, 'Summary feedback is required'),
  strengths: z.string().optional().nullable(),
  areasToImprove: z.string().optional().nullable(),
});

// Offer Schema
export const createOfferSchema = z.object({
  applicationId: z.string().min(1, 'Application is required'),
  baseSalary: z.number().positive('Salary must be positive'),
  currency: z.string().default('USD'),
  bonus: z.number().nonnegative().optional().nullable(),
  equity: z.string().optional().nullable(),
  proposedJoiningDate: z.string().or(z.date()),
  expiryDate: z.string().or(z.date()),
  employmentType: z.enum([
    EMPLOYMENT_TYPES.FULL_TIME,
    EMPLOYMENT_TYPES.PART_TIME,
    EMPLOYMENT_TYPES.CONTRACT,
    EMPLOYMENT_TYPES.INTERNSHIP,
    EMPLOYMENT_TYPES.REMOTE,
  ]).default(EMPLOYMENT_TYPES.FULL_TIME),
  notes: z.string().optional().nullable(),
});

export const updateOfferStatusSchema = z.object({
  status: z.enum([
    OFFER_STATUSES.DRAFT,
    OFFER_STATUSES.SENT,
    OFFER_STATUSES.ACCEPTED,
    OFFER_STATUSES.DECLINED,
    OFFER_STATUSES.EXPIRED,
  ]),
  declineReason: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

// Task & Follow-up Schema
export const createTaskSchema = z.object({
  title: z.string().min(2, 'Task title is required'),
  description: z.string().optional().nullable(),
  type: z.enum([
    TASK_TYPES.RECRUITER_FOLLOW_UP,
    TASK_TYPES.CANDIDATE_REMINDER,
    INTERVIEW_TYPES.HR ? TASK_TYPES.INTERVIEW_PREP : TASK_TYPES.INTERVIEW_PREP,
    TASK_TYPES.OFFER_FOLLOW_UP,
    TASK_TYPES.GENERAL,
  ]).default(TASK_TYPES.GENERAL),
  priority: z.enum([
    TASK_PRIORITIES.LOW,
    TASK_PRIORITIES.MEDIUM,
    TASK_PRIORITIES.HIGH,
    TASK_PRIORITIES.URGENT,
  ]).default(TASK_PRIORITIES.MEDIUM),
  dueDate: z.string().or(z.date()),
  assigneeId: z.string().optional().nullable(),
  candidateId: z.string().optional().nullable(),
  jobId: z.string().optional().nullable(),
  applicationId: z.string().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  status: z.enum([
    TASK_STATUSES.TODO,
    TASK_STATUSES.IN_PROGRESS,
    TASK_STATUSES.COMPLETED,
    TASK_STATUSES.CANCELLED,
  ]),
});

// Comment Schema
export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment cannot be empty'),
  candidateId: z.string().optional().nullable(),
  applicationId: z.string().optional().nullable(),
  jobId: z.string().optional().nullable(),
  mentions: z.array(z.string()).default([]),
});
