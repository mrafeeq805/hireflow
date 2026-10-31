import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/lib/security.js';
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
} from '@hireflow/shared';

const prisma = new PrismaClient();

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

async function main() {
  console.log('🌱 Starting HireFlow realistic seed...');

  // 1. Clean existing data
  await prisma.notification.deleteMany();
  await prisma.activityLog.deleteMany();
  await prisma.attachment.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.task.deleteMany();
  await prisma.offer.deleteMany();
  await prisma.interviewScorecard.deleteMany();
  await prisma.interviewer.deleteMany();
  await prisma.interview.deleteMany();
  await prisma.applicationStageHistory.deleteMany();
  await prisma.application.deleteMany();
  await prisma.candidateDocument.deleteMany();
  await prisma.candidateSkill.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.jobSkill.deleteMany();
  await prisma.job.deleteMany();
  await prisma.applicationStage.deleteMany();
  await prisma.workspaceInvitation.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  // 2. Create Users
  const defaultPassword = await hashPassword('Password123!');

  const alex = await prisma.user.create({
    data: {
      name: 'Alex Morgan',
      email: 'alex.morgan@hireflow.io',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      themePreference: 'light',
    },
  });

  const sarah = await prisma.user.create({
    data: {
      name: 'Sarah Jenkins',
      email: 'sarah.jenkins@hireflow.io',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      themePreference: 'light',
    },
  });

  const david = await prisma.user.create({
    data: {
      name: 'David Chen',
      email: 'david.chen@hireflow.io',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      themePreference: 'dark',
    },
  });

  const elena = await prisma.user.create({
    data: {
      name: 'Elena Rostova',
      email: 'elena.rostova@hireflow.io',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      themePreference: 'light',
    },
  });

  const marcus = await prisma.user.create({
    data: {
      name: 'Marcus Vance',
      email: 'marcus.vance@hireflow.io',
      passwordHash: defaultPassword,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      themePreference: 'light',
    },
  });

  console.log('✓ Created 5 team users');

  // 3. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Technologies',
      slug: 'acme-tech',
      description: 'Global SaaS enterprise scaling engineering and design teams.',
      logoUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=150&auto=format&fit=crop&q=80',
      ownerId: alex.id,
    },
  });

  // Assign memberships with distinct roles
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: alex.id, role: ROLES.OWNER },
      { workspaceId: workspace.id, userId: sarah.id, role: ROLES.RECRUITER },
      { workspaceId: workspace.id, userId: david.id, role: ROLES.HIRING_MANAGER },
      { workspaceId: workspace.id, userId: elena.id, role: ROLES.INTERVIEWER },
      { workspaceId: workspace.id, userId: marcus.id, role: ROLES.INTERVIEWER },
    ],
  });

  // Create default pipeline stages
  await prisma.applicationStage.createMany({
    data: DEFAULT_STAGES.map((s) => ({
      ...s,
      workspaceId: workspace.id,
    })),
  });

  console.log('✓ Workspace & RBAC memberships seeded');

  // 4. Create Jobs
  const jobFullStack = await prisma.job.create({
    data: {
      workspaceId: workspace.id,
      title: 'Senior Full-Stack Engineer (React & Node.js)',
      department: 'Engineering',
      location: 'San Francisco, CA (Hybrid / Remote)',
      employmentType: EMPLOYMENT_TYPES.FULL_TIME,
      experienceLevel: EXPERIENCE_LEVELS.SENIOR,
      salaryMin: 145000,
      salaryMax: 185000,
      currency: 'USD',
      description:
        'We are seeking a seasoned Senior Full-Stack Engineer to lead architecture on our real-time core platform. You will build high-throughput APIs, design sleek user interfaces, and collaborate with product teams to deliver exceptional SaaS experiences.',
      responsibilities:
        '• Architect and maintain high-performance microservices and frontend web apps.\n• Mentor junior engineers and conduct technical design reviews.\n• Drive reliable testing, CI/CD pipelines, and observability.',
      vacancies: 2,
      status: JOB_STATUSES.PUBLISHED,
      publishedAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      hiringManagerId: david.id,
      assignedRecruiterIds: JSON.stringify([sarah.id]),
      internalNotes: 'Targeting candidates with strong TypeScript and database optimization skills.',
      skills: {
        create: [
          { name: 'TypeScript', isRequired: true },
          { name: 'React', isRequired: true },
          { name: 'Node.js', isRequired: true },
          { name: 'PostgreSQL', isRequired: true },
          { name: 'GraphQL', isRequired: false },
          { name: 'Docker', isRequired: false },
        ],
      },
    },
  });

  const jobProductDesigner = await prisma.job.create({
    data: {
      workspaceId: workspace.id,
      title: 'Staff Product Designer',
      department: 'Design & UX',
      location: 'New York, NY (Hybrid)',
      employmentType: EMPLOYMENT_TYPES.FULL_TIME,
      experienceLevel: EXPERIENCE_LEVELS.LEAD,
      salaryMin: 135000,
      salaryMax: 170000,
      currency: 'USD',
      description:
        'Lead our design system, user research, and customer experience. We are crafting the future of workflow automation and require a designer who blends obsessive detail with systems thinking.',
      responsibilities:
        '• Own our cross-platform design token system.\n• Partner with PMs and engineering to prototype interactive concepts.\n• Run customer interviews and usability sessions.',
      vacancies: 1,
      status: JOB_STATUSES.PUBLISHED,
      publishedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
      hiringManagerId: david.id,
      assignedRecruiterIds: JSON.stringify([sarah.id]),
      skills: {
        create: [
          { name: 'Figma', isRequired: true },
          { name: 'Design Systems', isRequired: true },
          { name: 'User Research', isRequired: true },
          { name: 'Prototyping', isRequired: false },
        ],
      },
    },
  });

  const jobDevOps = await prisma.job.create({
    data: {
      workspaceId: workspace.id,
      title: 'DevOps & Cloud Infrastructure Lead',
      department: 'Engineering',
      location: 'Remote (US / Canada)',
      employmentType: EMPLOYMENT_TYPES.FULL_TIME,
      experienceLevel: EXPERIENCE_LEVELS.SENIOR,
      salaryMin: 155000,
      salaryMax: 195000,
      currency: 'USD',
      description:
        'Own our AWS Kubernetes clusters, multi-region database failover, security automation, and deployment pipelines.',
      vacancies: 1,
      status: JOB_STATUSES.PUBLISHED,
      publishedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
      hiringManagerId: david.id,
      assignedRecruiterIds: JSON.stringify([sarah.id]),
      skills: {
        create: [
          { name: 'AWS', isRequired: true },
          { name: 'Kubernetes', isRequired: true },
          { name: 'Terraform', isRequired: true },
          { name: 'CI/CD', isRequired: true },
        ],
      },
    },
  });

  const jobTalentRecruiter = await prisma.job.create({
    data: {
      workspaceId: workspace.id,
      title: 'Senior Technical Recruiter',
      department: 'Talent Acquisition',
      location: 'Austin, TX',
      employmentType: EMPLOYMENT_TYPES.FULL_TIME,
      experienceLevel: EXPERIENCE_LEVELS.MID,
      salaryMin: 90000,
      salaryMax: 120000,
      currency: 'USD',
      description:
        'Scale our global engineering and executive hiring. Source top-tier talent, partner with hiring managers, and refine candidate evaluation scorecards.',
      vacancies: 1,
      status: JOB_STATUSES.PUBLISHED,
      publishedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
      hiringManagerId: alex.id,
      assignedRecruiterIds: JSON.stringify([sarah.id]),
      skills: {
        create: [
          { name: 'Technical Sourcing', isRequired: true },
          { name: 'Applicant Tracking Systems', isRequired: true },
          { name: 'Interview Coaching', isRequired: false },
        ],
      },
    },
  });

  const jobFrontendDraft = await prisma.job.create({
    data: {
      workspaceId: workspace.id,
      title: 'Junior Frontend Developer',
      department: 'Engineering',
      location: 'Chicago, IL',
      employmentType: EMPLOYMENT_TYPES.FULL_TIME,
      experienceLevel: EXPERIENCE_LEVELS.ENTRY,
      salaryMin: 70000,
      salaryMax: 88000,
      currency: 'USD',
      description: 'Entry-level opportunity for eager web builders passionate about clean UI and React.',
      vacancies: 2,
      status: JOB_STATUSES.DRAFT,
      hiringManagerId: david.id,
      skills: {
        create: [
          { name: 'JavaScript', isRequired: true },
          { name: 'HTML & CSS', isRequired: true },
          { name: 'React', isRequired: false },
        ],
      },
    },
  });

  console.log('✓ Created 5 job postings (4 published, 1 draft)');

  // 5. Create Candidates
  const candidatesData = [
    {
      fullName: 'Maya Lin',
      email: 'maya.lin@example.com',
      phone: '+1 (415) 890-1234',
      location: 'San Francisco, CA',
      currentCompany: 'Stripe',
      expectedSalary: 175000,
      noticePeriodDays: 30,
      source: CANDIDATE_SOURCES.LINKEDIN,
      tags: ['Senior', 'Ex-Stripe', 'High Priority'],
      skills: ['TypeScript', 'React', 'Node.js', 'Distributed Systems'],
      experienceSummary: '6 years of engineering experience scaling payment systems and modern web dashboards.',
      educationSummary: 'B.S. in Computer Science, UC Berkeley',
      jobId: jobFullStack.id,
      stage: APPLICATION_STAGES.OFFER,
      priority: APPLICATION_PRIORITIES.HIGH,
    },
    {
      fullName: 'Liam Campbell',
      email: 'liam.campbell@example.com',
      phone: '+1 (206) 555-0192',
      location: 'Seattle, WA',
      currentCompany: 'Amazon Web Services',
      expectedSalary: 180000,
      noticePeriodDays: 14,
      source: CANDIDATE_SOURCES.REFERRAL,
      tags: ['Cloud', 'Kubernetes Expert'],
      skills: ['AWS', 'Kubernetes', 'Go', 'Terraform', 'Prometheus'],
      experienceSummary: '8 years designing multi-region cloud infrastructures and site reliability systems.',
      educationSummary: 'M.S. in Computer Engineering, University of Washington',
      jobId: jobDevOps.id,
      stage: APPLICATION_STAGES.INTERVIEW,
      priority: APPLICATION_PRIORITIES.URGENT,
    },
    {
      fullName: 'Sophia Rodriguez',
      email: 'sophia.rodriguez@example.com',
      phone: '+1 (212) 789-4321',
      location: 'Brooklyn, NY',
      currentCompany: 'Figma',
      expectedSalary: 160000,
      noticePeriodDays: 30,
      source: CANDIDATE_SOURCES.CAREER_PAGE,
      tags: ['Design System', 'Strong Portfolio'],
      skills: ['Figma', 'Design Systems', 'Micro-interactions', 'Prototyping'],
      experienceSummary: '5 years crafting design systems and complex data dashboards.',
      educationSummary: 'B.F.A. in Interaction Design, RISD',
      jobId: jobProductDesigner.id,
      stage: APPLICATION_STAGES.HIRED,
      priority: APPLICATION_PRIORITIES.HIGH,
    },
    {
      fullName: 'Jordan Miller',
      email: 'jordan.miller@example.com',
      phone: '+1 (512) 430-8812',
      location: 'Austin, TX',
      currentCompany: 'DoorDash',
      expectedSalary: 110000,
      noticePeriodDays: 15,
      source: CANDIDATE_SOURCES.LINKEDIN,
      tags: ['Recruiter', 'Tech Hiring'],
      skills: ['Technical Sourcing', 'ATS Mastery', 'Boolean Search'],
      experienceSummary: '4 years scaling engineering teams across Series B to D startups.',
      educationSummary: 'B.A. in Psychology, UT Austin',
      jobId: jobTalentRecruiter.id,
      stage: APPLICATION_STAGES.SHORTLISTED,
      priority: APPLICATION_PRIORITIES.MEDIUM,
    },
    {
      fullName: 'Daniel Ortiz',
      email: 'daniel.ortiz@example.com',
      phone: '+1 (650) 223-9090',
      location: 'San Jose, CA',
      currentCompany: 'Meta',
      expectedSalary: 170000,
      noticePeriodDays: 30,
      source: CANDIDATE_SOURCES.DIRECT,
      tags: ['Full-stack', 'Graph QL'],
      skills: ['React', 'Node.js', 'PostgreSQL', 'GraphQL'],
      experienceSummary: '5 years building high-traffic web applications with dynamic feeds.',
      educationSummary: 'B.S. in Computer Science, Stanford University',
      jobId: jobFullStack.id,
      stage: APPLICATION_STAGES.ASSESSMENT,
      priority: APPLICATION_PRIORITIES.MEDIUM,
    },
    {
      fullName: 'Aisha Patel',
      email: 'aisha.patel@example.com',
      phone: '+1 (312) 441-7789',
      location: 'Chicago, IL',
      currentCompany: 'Shopify',
      expectedSalary: 165000,
      noticePeriodDays: 20,
      source: CANDIDATE_SOURCES.CAREER_PAGE,
      tags: ['Full-stack', 'Frontend Specialist'],
      skills: ['TypeScript', 'Next.js', 'Tailwind CSS', 'Node.js'],
      experienceSummary: '6 years designing accessible, fast e-commerce interfaces and checkout flows.',
      educationSummary: 'B.S. in Software Engineering, UIUC',
      jobId: jobFullStack.id,
      stage: APPLICATION_STAGES.SCREENING,
      priority: APPLICATION_PRIORITIES.HIGH,
    },
    {
      fullName: 'Ethan Wright',
      email: 'ethan.wright@example.com',
      phone: '+1 (415) 309-8821',
      location: 'Oakland, CA',
      currentCompany: 'Dropbox',
      expectedSalary: 160000,
      noticePeriodDays: 30,
      source: CANDIDATE_SOURCES.AGENCY,
      tags: ['DevOps', 'Security'],
      skills: ['Kubernetes', 'Docker', 'AWS', 'Python'],
      experienceSummary: '4 years operating container fleets and CI/CD pipelines.',
      educationSummary: 'B.S. in Computer Systems, UC Davis',
      jobId: jobDevOps.id,
      stage: APPLICATION_STAGES.APPLIED,
      priority: APPLICATION_PRIORITIES.LOW,
    },
    {
      fullName: 'Chloe Bennett',
      email: 'chloe.bennett@example.com',
      phone: '+1 (917) 604-1123',
      location: 'Jersey City, NJ',
      currentCompany: 'Squarespace',
      expectedSalary: 145000,
      noticePeriodDays: 14,
      source: CANDIDATE_SOURCES.LINKEDIN,
      tags: ['Product Design', 'Visual'],
      skills: ['Figma', 'Illustration', 'User Testing'],
      experienceSummary: '5 years creating visual designs and intuitive SaaS layouts.',
      educationSummary: 'B.A. in Graphic Design, Pratt Institute',
      jobId: jobProductDesigner.id,
      stage: APPLICATION_STAGES.REJECTED,
      priority: APPLICATION_PRIORITIES.LOW,
    },
    {
      fullName: 'Carlos Mendes',
      email: 'carlos.mendes@example.com',
      phone: '+1 (408) 551-9988',
      location: 'Sunnyvale, CA',
      currentCompany: 'Cisco',
      expectedSalary: 180000,
      noticePeriodDays: 30,
      source: CANDIDATE_SOURCES.INDEED,
      tags: ['Backend', 'PostgreSQL Expert'],
      skills: ['Node.js', 'PostgreSQL', 'Redis', 'Docker'],
      experienceSummary: '7 years building distributed database clusters and RESTful web microservices.',
      educationSummary: 'B.S. in Computer Science, San Jose State',
      jobId: jobFullStack.id,
      stage: APPLICATION_STAGES.HIRED,
      priority: APPLICATION_PRIORITIES.HIGH,
    },
    {
      fullName: 'Zoe Zhang',
      email: 'zoe.zhang@example.com',
      phone: '+1 (646) 332-9011',
      location: 'New York, NY',
      currentCompany: 'Notion',
      expectedSalary: 155000,
      noticePeriodDays: 30,
      source: CANDIDATE_SOURCES.REFERRAL,
      tags: ['Design', 'Design System Lead'],
      skills: ['Figma', 'Design Systems', 'Design Tokens', 'HTML/CSS'],
      experienceSummary: '6 years scaling cross-platform product design systems and component libraries.',
      educationSummary: 'B.S. in Human-Computer Interaction, Carnegie Mellon',
      jobId: jobProductDesigner.id,
      stage: APPLICATION_STAGES.OFFER,
      priority: APPLICATION_PRIORITIES.URGENT,
    },
  ];

  for (const c of candidatesData) {
    const candidate = await prisma.candidate.create({
      data: {
        workspaceId: workspace.id,
        fullName: c.fullName,
        email: c.email,
        phone: c.phone,
        location: c.location,
        currentCompany: c.currentCompany,
        expectedSalary: c.expectedSalary,
        noticePeriodDays: c.noticePeriodDays,
        source: c.source,
        tags: JSON.stringify(c.tags),
        experienceSummary: c.experienceSummary,
        educationSummary: c.educationSummary,
        assignedRecruiterId: sarah.id,
        resumeUrl: '/uploads/sample-resume.pdf',
        skills: {
          create: c.skills.map((name) => ({ name })),
        },
      },
    });

    // Create Application
    const app = await prisma.application.create({
      data: {
        workspaceId: workspace.id,
        jobId: c.jobId,
        candidateId: candidate.id,
        stage: c.stage,
        priority: c.priority,
        status:
          c.stage === APPLICATION_STAGES.HIRED
            ? 'HIRED'
            : c.stage === APPLICATION_STAGES.REJECTED
            ? 'REJECTED'
            : 'ACTIVE',
        rejectionReason:
          c.stage === APPLICATION_STAGES.REJECTED ? 'Salary expectations exceeded budgeted range' : null,
        assignedRecruiterId: sarah.id,
        internalNotes: `Candidate applied via ${c.source}. Initial profile looks well aligned with job requirements.`,
        stageHistory: {
          create: [
            {
              toStage: APPLICATION_STAGES.APPLIED,
              changedById: sarah.id,
              notes: 'Initial application submitted',
              createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
            },
            ...(c.stage !== APPLICATION_STAGES.APPLIED
              ? [
                  {
                    fromStage: APPLICATION_STAGES.APPLIED,
                    toStage: c.stage,
                    changedById: sarah.id,
                    notes: `Advanced to ${c.stage}`,
                    createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
                  },
                ]
              : []),
          ],
        },
      },
    });

    // For Liam Campbell (Interview stage)
    if (c.fullName === 'Liam Campbell') {
      const interview = await prisma.interview.create({
        data: {
          workspaceId: workspace.id,
          applicationId: app.id,
          type: INTERVIEW_TYPES.TECHNICAL,
          status: INTERVIEW_STATUSES.SCHEDULED,
          outcome: INTERVIEW_OUTCOMES.PENDING,
          scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow
          durationMinutes: 60,
          meetingLink: 'https://meet.google.com/hireflow-tech-interview',
          instructions: 'Prepare for deep-dive architecture questions regarding Kubernetes and multi-region failover.',
          interviewers: {
            create: [{ userId: elena.id }, { userId: david.id }],
          },
        },
      });

      await prisma.task.create({
        data: {
          workspaceId: workspace.id,
          title: `Prepare interview scorecard for ${c.fullName}`,
          description: 'Review AWS infrastructure scenarios and candidate GitHub repos.',
          type: TASK_TYPES.INTERVIEW_PREP,
          priority: TASK_PRIORITIES.HIGH,
          status: TASK_STATUSES.TODO,
          dueDate: new Date(Date.now() + 20 * 60 * 60 * 1000),
          assigneeId: elena.id,
          candidateId: candidate.id,
          applicationId: app.id,
        },
      });
    }

    // For Maya Lin (Offer stage)
    if (c.fullName === 'Maya Lin') {
      const interview = await prisma.interview.create({
        data: {
          workspaceId: workspace.id,
          applicationId: app.id,
          type: INTERVIEW_TYPES.FINAL,
          status: INTERVIEW_STATUSES.COMPLETED,
          outcome: INTERVIEW_OUTCOMES.PASSED,
          scheduledAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000),
          durationMinutes: 45,
          interviewers: {
            create: [{ userId: david.id }, { userId: marcus.id }],
          },
        },
      });

      // Add structured scorecards
      await prisma.interviewScorecard.create({
        data: {
          interviewId: interview.id,
          interviewerId: david.id,
          technicalRating: 5,
          communicationRating: 4,
          problemSolvingRating: 5,
          experienceRating: 5,
          cultureFitRating: 5,
          averageRating: 4.8,
          recommendation: SCORECARD_RECOMMENDATIONS.STRONG_YES,
          summaryNotes:
            'Outstanding mastery of TypeScript and asynchronous architecture. Answered all concurrency edge cases with precision.',
          strengths: 'Deep systems design knowledge, clear explanations, strong engineering instincts.',
          areasToImprove: 'Could deepen familiarity with our specific cloud telemetry stack.',
        },
      });

      // Create Offer
      await prisma.offer.create({
        data: {
          workspaceId: workspace.id,
          applicationId: app.id,
          baseSalary: 175000,
          currency: 'USD',
          bonus: 20000,
          equity: '0.15% ISO Options (4-year vest)',
          proposedJoiningDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          employmentType: EMPLOYMENT_TYPES.FULL_TIME,
          status: OFFER_STATUSES.SENT,
          notes: 'Competitive offer package aligned with Stripe experience level.',
        },
      });

      await prisma.task.create({
        data: {
          workspaceId: workspace.id,
          title: `Follow up with ${c.fullName} on offer acceptance`,
          description: 'Answer any questions regarding healthcare and 401(k) matching before offer expiry.',
          type: TASK_TYPES.OFFER_FOLLOW_UP,
          priority: TASK_PRIORITIES.URGENT,
          status: TASK_STATUSES.TODO,
          dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          assigneeId: sarah.id,
          candidateId: candidate.id,
          applicationId: app.id,
        },
      });
    }

    // For Sophia Rodriguez (Hired stage)
    if (c.fullName === 'Sophia Rodriguez') {
      await prisma.offer.create({
        data: {
          workspaceId: workspace.id,
          applicationId: app.id,
          baseSalary: 160000,
          currency: 'USD',
          bonus: 15000,
          equity: '0.12% RSUs',
          proposedJoiningDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          expiryDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
          employmentType: EMPLOYMENT_TYPES.FULL_TIME,
          status: OFFER_STATUSES.ACCEPTED,
          notes: 'Candidate accepted offer promptly.',
        },
      });
    }
  }

  console.log('✓ Created 10 candidates with applications, scorecards, and offers');

  // 6. Create General Tasks
  await prisma.task.createMany({
    data: [
      {
        workspaceId: workspace.id,
        title: 'Review new inbound applicants for Senior Full-Stack role',
        description: 'Screen resume pool from Hacker News and LinkedIn campaign.',
        type: TASK_TYPES.RECRUITER_FOLLOW_UP,
        priority: TASK_PRIORITIES.HIGH,
        status: TASK_STATUSES.TODO,
        dueDate: new Date(),
        assigneeId: sarah.id,
      },
      {
        workspaceId: workspace.id,
        title: 'Send reminder email for upcoming quarterly recruitment review',
        description: 'Synthesize hiring conversion rates and budget allocations.',
        type: TASK_TYPES.GENERAL,
        priority: TASK_PRIORITIES.MEDIUM,
        status: TASK_STATUSES.TODO,
        dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
        assigneeId: alex.id,
      },
      {
        workspaceId: workspace.id,
        title: 'Calibrate scorecard criteria for Design Lead role',
        description: 'Align with David Chen on design system portfolio rubric.',
        type: TASK_TYPES.GENERAL,
        priority: TASK_PRIORITIES.LOW,
        status: TASK_STATUSES.COMPLETED,
        isCompleted: true,
        completedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
        assigneeId: sarah.id,
      },
    ],
  });

  // 7. Create Activity Logs & Notifications
  await prisma.activityLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: alex.id,
        action: 'WORKSPACE_INITIALIZED',
        entityType: 'WORKSPACE',
        entityId: workspace.id,
        details: JSON.stringify({ name: workspace.name }),
        createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: workspace.id,
        userId: sarah.id,
        action: 'JOB_PUBLISHED',
        entityType: 'JOB',
        entityId: jobFullStack.id,
        details: JSON.stringify({ title: jobFullStack.title }),
        createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000),
      },
      {
        workspaceId: workspace.id,
        userId: sarah.id,
        action: 'OFFER_SENT',
        entityType: 'OFFER',
        entityId: 'seed-offer-1',
        details: JSON.stringify({ candidateName: 'Maya Lin', baseSalary: 175000 }),
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
      },
    ],
  });

  await prisma.notification.createMany({
    data: [
      {
        workspaceId: workspace.id,
        userId: alex.id,
        type: 'APPLICATION_MOVED',
        title: 'Maya Lin Advanced to Offer',
        message: 'Maya Lin was moved to the Offer stage with an average rating of 4.8 / 5.0.',
        link: '/offers',
        isRead: false,
      },
      {
        workspaceId: workspace.id,
        userId: sarah.id,
        type: 'INTERVIEW_SCHEDULED',
        title: 'Technical Interview with Liam Campbell',
        message: 'Scheduled for tomorrow at 2:00 PM with Elena Rostova and David Chen.',
        link: '/interviews',
        isRead: false,
      },
    ],
  });

  console.log('🎉 HireFlow Database successfully seeded with realistic production data!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

