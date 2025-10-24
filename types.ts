export interface Program {
  id: string;
  title: string;
  organization: string;
  logo: string;
  description: string;
  eligibility: string[];
  subjects: string[];
  location: string;
  cost: string;
  deadline: string;
  applicationSteps: string[];
  acceptanceRate: string;
  testimonials: { author: string; quote: string }[];
  website: string;
  category: 'Research' | 'Academic' | 'Entrepreneurship' | 'Business' | 'Environment' | 'STEM' | 'AI' | 'Tech' | 'Leadership' | 'Policy' | 'Global Affairs' | 'Humanities' | 'Writing' | 'Medical' | 'Biology' | 'Competition' | 'Innovation' | 'Scholarship' | 'Internship';
  mode: 'Online' | 'In-Person' | 'Hybrid';
  highlights?: string[];
  tagline?: string;
  duration?: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export type ApplicationStatus = 'Not Started' | 'In Progress' | 'Submitted' | 'Awaiting Response';

export interface ApplicationProgress {
  programId: string;
  programTitle: string;
  programLogo: string;
  status: ApplicationStatus;
  deadlineDate: string; // ISO string for date e.g., "2024-12-15"
  checklist: { item: string; completed: boolean }[];
}


export type View = 'home' | 'programDetail' | 'aiAssistant' | 'dashboard' | 'simulation';

export interface SectionFeedback {
  sectionName: string;
  strengths: string;
  improvements: string;
}

export interface SimulationFeedback {
  overallScore: number;
  overallFeedback: string;
  sectionFeedback: SectionFeedback[];
}