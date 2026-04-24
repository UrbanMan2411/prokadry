export type Role = 'employer' | 'seeker' | 'admin';

export type ResumeStatus = 'active' | 'pending' | 'draft';
export type VacancyStatus = 'active' | 'archived' | 'draft';
export type InvitationStatus = 'sent' | 'viewed' | 'accepted' | 'rejected';
export type EmployerStatus = 'approved' | 'pending';

export interface WorkExperience {
  id: number;
  company: string;
  role: string;
  from: string;
  to: string;
  description: string;
}

export interface Resume {
  id: string;
  firstName: string;
  lastName: string;
  patronymic: string;
  fullName: string;
  gender: 'male' | 'female';
  age: number;
  city: string;
  region: string;
  position: string;
  salary: number | null;
  experience: number;
  education: string;
  workMode: string;
  activityAreas: string[];
  tests: string[];
  specialStatuses: string[];
  hasPhoto: boolean;
  photo: string | null;
  publishedAt: string;
  about: string;
  workExperiences: WorkExperience[];
  isFavorite: boolean;
  status: ResumeStatus;
}

export interface Employer {
  id: string;
  name: string;
  inn: string;
  region: string;
  city: string;
  contactName: string;
  email: string;
  phone: string;
  status: EmployerStatus;
  registeredAt: string;
  vacancyCount: number;
}

export interface Vacancy {
  id: string;
  employerId: string;
  employerName: string;
  title: string;
  department: string;
  city: string;
  region: string;
  workMode: string;
  salaryFrom: number;
  salaryTo: number;
  description: string;
  skills: string[];
  status: VacancyStatus;
  createdAt: string;
}

export interface Invitation {
  id: string;
  resumeId: string;
  vacancyId: string;
  candidateName: string;
  vacancyTitle: string;
  employerName: string;
  message: string;
  status: InvitationStatus;
  createdAt: string;
}

export interface Message {
  id: string;
  fromRole: 'employer' | 'candidate';
  fromName: string;
  toName: string;
  text: string;
  createdAt: string;
  isRead: boolean;
}

export interface AdminStats {
  totalResumes: number;
  activeResumes: number;
  pendingResumes: number;
  totalEmployers: number;
  approvedEmployers: number;
  totalVacancies: number;
  activeVacancies: number;
  totalInvitations: number;
}

export interface Dictionaries {
  positions: string[];
  regions: string[];
  educations: string[];
  workModes: string[];
  activityAreas: string[];
  tests: string[];
  specialStatuses: string[];
}

export interface AuditLog {
  id: number;
  action: string;
  user: string;
  role: string;
  timestamp: string;
  details: string;
}

export interface MockDataStore {
  RESUMES: Resume[];
  EMPLOYERS: Employer[];
  VACANCIES: Vacancy[];
  INVITATIONS: Invitation[];
  MESSAGES: Message[];
  ADMIN_STATS: AdminStats;
  DICTIONARIES: Dictionaries;
  AUDIT_LOGS: AuditLog[];
}
