import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';

// Auth Pages
import { LoginPage } from '@/features/auth/pages/LoginPage';
import { RegisterPage } from '@/features/auth/pages/RegisterPage';
import { ForgotPasswordPage } from '@/features/auth/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/features/auth/pages/ResetPasswordPage';
import { OnboardingPage } from '@/features/auth/pages/OnboardingPage';

// Public Career Pages
import { PublicJobPage } from '@/features/jobs/pages/PublicJobPage';
import { PublicApplyPage } from '@/features/jobs/pages/PublicApplyPage';

// App Pages
import { DashboardPage } from '@/features/dashboard/pages/DashboardPage';
import { JobsPage } from '@/features/jobs/pages/JobsPage';
import { CreateEditJobPage } from '@/features/jobs/pages/CreateEditJobPage';
import { JobDetailPage } from '@/features/jobs/pages/JobDetailPage';
import { CandidatesPage } from '@/features/candidates/pages/CandidatesPage';
import { CandidateDetailPage } from '@/features/candidates/pages/CandidateDetailPage';
import { ApplicationsPage } from '@/features/applications/pages/ApplicationsPage';
import { RecruitmentKanbanPage } from '@/features/applications/pages/RecruitmentKanbanPage';
import { InterviewsPage } from '@/features/interviews/pages/InterviewsPage';
import { InterviewDetailPage } from '@/features/interviews/pages/InterviewDetailPage';
import { InterviewFeedbackPage } from '@/features/interviews/pages/InterviewFeedbackPage';
import { TasksPage } from '@/features/tasks/pages/TasksPage';
import { OffersPage } from '@/features/offers/pages/OffersPage';
import { HiredCandidatesPage } from '@/features/offers/pages/HiredCandidatesPage';
import { TeamPage } from '@/features/team/pages/TeamPage';
import { NotificationsPage } from '@/features/notifications/pages/NotificationsPage';
import { AnalyticsPage } from '@/features/analytics/pages/AnalyticsPage';
import { SettingsPage } from '@/features/settings/pages/SettingsPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route path="/onboarding" element={<OnboardingPage />} />

      {/* Public Job & Apply Routes */}
      <Route path="/jobs/public/:jobId" element={<PublicJobPage />} />
      <Route path="/jobs/:jobId/apply" element={<PublicApplyPage />} />
      <Route path="/jobs/public/:jobId/apply" element={<PublicApplyPage />} />

      {/* Authenticated Application Routes (Wrapped in ProtectedRoute and AppShell) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/jobs" element={<JobsPage />} />
        <Route path="/jobs/new" element={<CreateEditJobPage />} />
        <Route path="/jobs/:jobId" element={<JobDetailPage />} />
        <Route path="/jobs/:jobId/edit" element={<CreateEditJobPage />} />
        <Route path="/candidates" element={<CandidatesPage />} />
        <Route path="/candidates/:candidateId" element={<CandidateDetailPage />} />
        <Route path="/applications" element={<ApplicationsPage />} />
        <Route path="/kanban" element={<RecruitmentKanbanPage />} />
        <Route path="/interviews" element={<InterviewsPage />} />
        <Route path="/interviews/:interviewId" element={<InterviewDetailPage />} />
        <Route path="/interviews/:interviewId/feedback" element={<InterviewFeedbackPage />} />
        <Route path="/tasks" element={<TasksPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/hired" element={<HiredCandidatesPage />} />
        <Route path="/team" element={<TeamPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>

      {/* Fallback Catch-all Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

