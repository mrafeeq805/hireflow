export const ROLES = {
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  RECRUITER: 'RECRUITER',
  HIRING_MANAGER: 'HIRING_MANAGER',
  INTERVIEWER: 'INTERVIEWER',
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const JOB_STATUSES = {
  DRAFT: 'DRAFT',
  PUBLISHED: 'PUBLISHED',
  PAUSED: 'PAUSED',
  CLOSED: 'CLOSED',
  ARCHIVED: 'ARCHIVED',
} as const;

export type JobStatus = (typeof JOB_STATUSES)[keyof typeof JOB_STATUSES];

export const EMPLOYMENT_TYPES = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  INTERNSHIP: 'INTERNSHIP',
  REMOTE: 'REMOTE',
} as const;

export type EmploymentType = (typeof EMPLOYMENT_TYPES)[keyof typeof EMPLOYMENT_TYPES];

export const EXPERIENCE_LEVELS = {
  ENTRY: 'ENTRY',
  MID: 'MID',
  SENIOR: 'SENIOR',
  LEAD: 'LEAD',
  EXECUTIVE: 'EXECUTIVE',
} as const;

export type ExperienceLevel = (typeof EXPERIENCE_LEVELS)[keyof typeof EXPERIENCE_LEVELS];

export const CANDIDATE_SOURCES = {
  LINKEDIN: 'LINKEDIN',
  CAREER_PAGE: 'CAREER_PAGE',
  REFERRAL: 'REFERRAL',
  AGENCY: 'AGENCY',
  DIRECT: 'DIRECT',
  INDEED: 'INDEED',
  OTHER: 'OTHER',
} as const;

export type CandidateSource = (typeof CANDIDATE_SOURCES)[keyof typeof CANDIDATE_SOURCES];

export const APPLICATION_STAGES = {
  APPLIED: 'APPLIED',
  SCREENING: 'SCREENING',
  SHORTLISTED: 'SHORTLISTED',
  INTERVIEW: 'INTERVIEW',
  ASSESSMENT: 'ASSESSMENT',
  OFFER: 'OFFER',
  HIRED: 'HIRED',
  REJECTED: 'REJECTED',
} as const;

export type ApplicationStageName = (typeof APPLICATION_STAGES)[keyof typeof APPLICATION_STAGES];

export const APPLICATION_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type ApplicationPriority = (typeof APPLICATION_PRIORITIES)[keyof typeof APPLICATION_PRIORITIES];

export const PRIORITIES = APPLICATION_PRIORITIES;
export type Priority = ApplicationPriority;

export const INTERVIEW_TYPES = {
  PHONE: 'PHONE',
  VIDEO: 'VIDEO',
  TECHNICAL: 'TECHNICAL',
  HR: 'HR',
  FINAL: 'FINAL',
} as const;

export type InterviewType = (typeof INTERVIEW_TYPES)[keyof typeof INTERVIEW_TYPES];

export const INTERVIEW_STATUSES = {
  SCHEDULED: 'SCHEDULED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
  RESCHEDULED: 'RESCHEDULED',
} as const;

export type InterviewStatus = (typeof INTERVIEW_STATUSES)[keyof typeof INTERVIEW_STATUSES];

export const INTERVIEW_OUTCOMES = {
  PENDING: 'PENDING',
  PASSED: 'PASSED',
  FAILED: 'FAILED',
} as const;

export type InterviewOutcome = (typeof INTERVIEW_OUTCOMES)[keyof typeof INTERVIEW_OUTCOMES];

export const SCORECARD_RECOMMENDATIONS = {
  STRONG_YES: 'STRONG_YES',
  YES: 'YES',
  MAYBE: 'MAYBE',
  NO: 'NO',
  STRONG_NO: 'STRONG_NO',
} as const;

export type ScorecardRecommendation = (typeof SCORECARD_RECOMMENDATIONS)[keyof typeof SCORECARD_RECOMMENDATIONS];

export const OFFER_STATUSES = {
  DRAFT: 'DRAFT',
  SENT: 'SENT',
  ACCEPTED: 'ACCEPTED',
  DECLINED: 'DECLINED',
  EXPIRED: 'EXPIRED',
} as const;

export type OfferStatus = (typeof OFFER_STATUSES)[keyof typeof OFFER_STATUSES];

export const TASK_TYPES = {
  RECRUITER_FOLLOW_UP: 'RECRUITER_FOLLOW_UP',
  CANDIDATE_REMINDER: 'CANDIDATE_REMINDER',
  INTERVIEW_PREP: 'INTERVIEW_PREP',
  OFFER_FOLLOW_UP: 'OFFER_FOLLOW_UP',
  GENERAL: 'GENERAL',
  FOLLOW_UP: 'RECRUITER_FOLLOW_UP',
  OFFER_FOLLOWUP: 'OFFER_FOLLOW_UP',
  SCREENING: 'GENERAL',
} as const;

export type TaskType = (typeof TASK_TYPES)[keyof typeof TASK_TYPES];

export const TASK_PRIORITIES = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT',
} as const;

export type TaskPriority = (typeof TASK_PRIORITIES)[keyof typeof TASK_PRIORITIES];

export const TASK_STATUSES = {
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
} as const;

export type TaskStatus = (typeof TASK_STATUSES)[keyof typeof TASK_STATUSES];

export const NOTIFICATION_TYPES = {
  INTERVIEW_SCHEDULED: 'INTERVIEW_SCHEDULED',
  FEEDBACK_SUBMITTED: 'FEEDBACK_SUBMITTED',
  OFFER_CREATED: 'OFFER_CREATED',
  OFFER_UPDATED: 'OFFER_UPDATED',
  APPLICATION_MOVED: 'APPLICATION_MOVED',
  TASK_ASSIGNED: 'TASK_ASSIGNED',
  MENTION: 'MENTION',
  WORKSPACE_INVITE: 'WORKSPACE_INVITE',
  APPLICATION_NEW: 'APPLICATION_NEW',
} as const;

export type NotificationType = (typeof NOTIFICATION_TYPES)[keyof typeof NOTIFICATION_TYPES];

export const SOCKET_EVENTS = {
  JOIN_WORKSPACE: 'workspace:join',
  LEAVE_WORKSPACE: 'workspace:leave',
  APPLICATION_STAGE_CHANGED: 'application:stage_changed',
  APPLICATION_ASSIGNED: 'application:assigned',
  INTERVIEW_SCHEDULED: 'interview:scheduled',
  INTERVIEW_UPDATED: 'interview:updated',
  FEEDBACK_ADDED: 'feedback:added',
  OFFER_UPDATED: 'offer:updated',
  NOTIFICATION_NEW: 'notification:new',
  ACTIVITY_NEW: 'activity:new',
} as const;
