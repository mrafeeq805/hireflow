import type {
  Role,
  JobStatus,
  EmploymentType,
  ExperienceLevel,
  CandidateSource,
  ApplicationStageName,
  ApplicationPriority,
  InterviewType,
  InterviewStatus,
  InterviewOutcome,
  ScorecardRecommendation,
  OfferStatus,
  TaskType,
  TaskPriority,
  TaskStatus,
  NotificationType,
} from '../constants/index.js';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl?: string | null;
  themePreference: 'light' | 'dark';
  createdAt: string;
}

export interface WorkspaceSummary {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  logoUrl?: string | null;
  role: Role;
  memberCount?: number;
  activeJobsCount?: number;
}

export interface WorkspaceMemberInfo {
  id: string;
  userId: string;
  workspaceId: string;
  role: Role;
  joinedAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    avatarUrl?: string | null;
  };
}

export interface WorkspaceInvitationInfo {
  id: string;
  email: string;
  role: Role;
  token: string;
  workspaceId: string;
  expiresAt: string;
  createdAt: string;
  inviter: {
    name: string;
    email: string;
  };
}

export interface JobSkillDto {
  id: string;
  name: string;
  isRequired: boolean;
}

export interface JobDto {
  id: string;
  workspaceId: string;
  title: string;
  department: string;
  location: string;
  employmentType: EmploymentType;
  experienceLevel: ExperienceLevel;
  salaryMin?: number | null;
  salaryMax?: number | null;
  currency: string;
  description: string;
  responsibilities?: string | null;
  vacancies: number;
  status: JobStatus;
  publishedAt?: string | null;
  internalNotes?: string | null;
  hiringManagerId?: string | null;
  hiringManager?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  skills: JobSkillDto[];
  recruiters?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  }[];
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateSkillDto {
  id: string;
  name: string;
}

export interface CandidateDocumentDto {
  id: string;
  candidateId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  fileType: string;
  uploadedAt: string;
}

export interface CandidateDto {
  id: string;
  workspaceId: string;
  fullName: string;
  email: string;
  phone?: string | null;
  location?: string | null;
  resumeUrl?: string | null;
  linkedinUrl?: string | null;
  portfolioUrl?: string | null;
  currentCompany?: string | null;
  expectedSalary?: number | null;
  noticePeriodDays?: number | null;
  availabilityDate?: string | null;
  source: CandidateSource;
  tags: string[];
  skills: CandidateSkillDto[];
  documents?: CandidateDocumentDto[];
  experienceSummary?: string | null;
  educationSummary?: string | null;
  assignedRecruiterId?: string | null;
  assignedRecruiter?: {
    id: string;
    name: string;
    email: string;
  } | null;
  internalNotes?: string | null;
  applicationsCount?: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApplicationStageHistoryDto {
  id: string;
  applicationId: string;
  fromStage?: ApplicationStageName | null;
  toStage: ApplicationStageName;
  changedById?: string | null;
  changedBy?: {
    name: string;
    email: string;
  } | null;
  notes?: string | null;
  createdAt: string;
}

export interface ApplicationDto {
  id: string;
  workspaceId: string;
  jobId: string;
  candidateId: string;
  stage: ApplicationStageName;
  priority: ApplicationPriority;
  status: 'ACTIVE' | 'ARCHIVED' | 'REJECTED' | 'HIRED';
  rejectionReason?: string | null;
  assignedRecruiterId?: string | null;
  internalNotes?: string | null;
  appliedAt: string;
  updatedAt: string;
  job: {
    id: string;
    title: string;
    department: string;
    location: string;
  };
  candidate: CandidateDto;
  assignedRecruiter?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  stageHistory?: ApplicationStageHistoryDto[];
  interviewsCount?: number;
  scorecardsCount?: number;
  latestScorecardAvg?: number | null;
}

export interface InterviewerDto {
  id: string;
  userId: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface ScorecardDto {
  id: string;
  interviewId: string;
  interviewerId: string;
  technicalRating: number;
  communicationRating: number;
  problemSolvingRating: number;
  experienceRating: number;
  cultureFitRating: number;
  averageRating: number;
  recommendation: ScorecardRecommendation;
  summaryNotes: string;
  strengths?: string | null;
  areasToImprove?: string | null;
  createdAt: string;
  interviewer: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface InterviewDto {
  id: string;
  workspaceId: string;
  applicationId: string;
  type: InterviewType;
  status: InterviewStatus;
  outcome: InterviewOutcome;
  scheduledAt: string;
  durationMinutes: number;
  location?: string | null;
  meetingLink?: string | null;
  instructions?: string | null;
  outcomeNotes?: string | null;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    stage: ApplicationStageName;
    job: {
      id: string;
      title: string;
      department: string;
    };
    candidate: {
      id: string;
      fullName: string;
      email: string;
      phone?: string | null;
    };
  };
  interviewers: InterviewerDto[];
  scorecards?: ScorecardDto[];
}

export interface OfferDto {
  id: string;
  workspaceId: string;
  applicationId: string;
  baseSalary: number;
  currency: string;
  bonus?: number | null;
  equity?: string | null;
  proposedJoiningDate: string;
  expiryDate: string;
  employmentType: EmploymentType;
  status: OfferStatus;
  declineReason?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
  application: {
    id: string;
    job: {
      id: string;
      title: string;
      department: string;
    };
    candidate: {
      id: string;
      fullName: string;
      email: string;
    };
  };
}

export interface TaskDto {
  id: string;
  workspaceId: string;
  title: string;
  description?: string | null;
  type: TaskType;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  assigneeId?: string | null;
  candidateId?: string | null;
  jobId?: string | null;
  applicationId?: string | null;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
  candidate?: {
    id: string;
    fullName: string;
  } | null;
  job?: {
    id: string;
    title: string;
  } | null;
}

export interface CommentDto {
  id: string;
  workspaceId: string;
  userId: string;
  candidateId?: string | null;
  applicationId?: string | null;
  jobId?: string | null;
  content: string;
  mentions: string[];
  createdAt: string;
  user: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  };
}

export interface ActivityLogDto {
  id: string;
  workspaceId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, unknown> | null;
  createdAt: string;
  user?: {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
  } | null;
}

export interface NotificationDto {
  id: string;
  workspaceId: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  createdAt: string;
}

export interface RecruitmentAnalyticsDto {
  overview: {
    activeJobs: number;
    totalCandidates: number;
    newApplications: number;
    interviewsScheduled: number;
    offersSent: number;
    candidatesHired: number;
    rejectedApplications: number;
    appToInterviewRate: number;
    interviewToOfferRate: number;
    offerAcceptanceRate: number;
    avgTimeToHireDays: number;
  };
  pipelineDistribution: {
    stage: ApplicationStageName;
    count: number;
  }[];
  sourcesBreakdown: {
    source: CandidateSource;
    count: number;
    hiredCount: number;
  }[];
  recruiterPerformance: {
    recruiterId: string;
    recruiterName: string;
    activeApplications: number;
    interviewsConducted: number;
    offersSent: number;
    hiresCount: number;
  }[];
  monthlyTrends: {
    month: string;
    applications: number;
    interviews: number;
    hires: number;
  }[];
  jobProgress: {
    jobId: string;
    title: string;
    department: string;
    vacancies: number;
    hiredCount: number;
    appliedCount: number;
    interviewCount: number;
    offerCount: number;
  }[];
}

export interface AuthResponse {
  user: UserProfile;
  workspaces: WorkspaceSummary[];
  activeWorkspaceId: string;
  accessToken: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}
