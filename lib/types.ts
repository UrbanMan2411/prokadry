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

export interface SpecialStatus {
  value: string;
  label: string;
  confirmed: boolean;
  docDate: string;
  docNumber: string;
  documentRef: string;
  disabilityGroup: string;
}

export interface ResumeTest {
  value: string;
  label: string;
  passedAt: string | null;
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
  educationInstitution: string;
  educationYears: string;
  workMode: string;
  activityAreas: string[];
  skills: string[];
  purchaseTypes: string[];
  tests: ResumeTest[];
  specialStatuses: SpecialStatus[];
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
  clientSpheres: string[];
  specialistActivities: string[];
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
  fromSeeker?: boolean;
}

export interface Message {
  id: string;
  fromRole: 'employer' | 'candidate';
  fromName: string;
  toName: string;
  counterpartyUserId: string;
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
  clientSpheres: string[];
  specialistActivities: string[];
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

// ── Contact Exchange (Task 4) ──────────────────────────────────────────────
export type ContactStatus = 'hidden' | 'requested' | 'opened' | 'detected_in_message';
export type ContactInitiator = 'employer' | 'candidate' | 'system';
export type DetectedContactType = 'phone' | 'email' | 'messenger' | 'link' | null;

export interface ContactExchange {
  id: string;
  candidateId: string;
  employerId: string;
  vacancyId?: string;
  status: ContactStatus;
  initiatedBy: ContactInitiator;
  detectedType: DetectedContactType;
  createdAt: string;
  updatedAt: string;
}

// ── Parsed Source (Task 7) ─────────────────────────────────────────────────
export type ParsedSourceStatus = 'active' | 'paused' | 'error' | 'testing';
export type ParsedSourceType =
  | 'vacancies' | 'resumes' | 'eis' | 'regional_employment'
  | 'regulatory' | 'enrichment' | 'statistics' | 'social_support';

export interface ParsedSource {
  id: string;
  name: string;
  type: ParsedSourceType;
  url: string;
  status: ParsedSourceStatus;
  lastSyncAt: string | null;
  updateFrequency: string;
  legalNotes: string;
}

// ── Region Stat (Task 6) ───────────────────────────────────────────────────
export interface RegionStat {
  name: string;
  region: string;
  vacanciesCount: number;
  resumesCount: number;
  avgSalary: number;
  supplyDemandIndex: number;
  rating: number;
}
