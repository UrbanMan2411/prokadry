'use client';

import { useState } from 'react';
import type { Role } from '@/lib/types';
import type { Resume, Vacancy, Employer } from '@/lib/types';
import { RESUMES, VACANCIES, INVITATIONS, MESSAGES, EMPLOYERS, AUDIT_LOGS } from '@/lib/mock-data';
import { AppShell } from '@/components/layout';
import { ResumeRegistry } from '@/components/registry';
import { ResumeDetail, InviteModal } from '@/components/resume';
import {
  EmployerDashboard, EmployerVacancies, EmployerFavorites,
  EmployerMessages, EmployerInvitations, CompanyProfile,
} from '@/components/employer';
import {
  SeekerDashboard, MyResume, SeekerInvitations, SeekerMessages, SeekerSettings,
} from '@/components/seeker';
import {
  AdminDashboard, AdminResumes, AdminEmployers, AdminVacancies,
  AdminUsers, AdminDicts, AdminLogs,
} from '@/components/admin';

const DEFAULT_PAGE: Record<Role, string> = {
  employer: 'dashboard',
  seeker: 'seeker-dashboard',
  admin: 'admin-dashboard',
};

export default function ClientApp({ initialRole, email }: { initialRole: Role; email: string }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [page, setPage] = useState<string>(DEFAULT_PAGE[initialRole]);
  const [resumes, setResumes] = useState<Resume[]>(RESUMES);
  const [vacancies, setVacancies] = useState<Vacancy[]>(VACANCIES);
  const [employers, setEmployers] = useState<Employer[]>(EMPLOYERS);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Resume | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [registryPreset, setRegistryPreset] = useState<string>('');

  const handleSetRole = (r: Role) => {
    setRole(r);
    setPage(DEFAULT_PAGE[r]);
    setSelectedResume(null);
  };

  const handleOpenResume = (r: Resume) => {
    setSelectedResume(r);
    setPage('resume-detail');
  };

  const handleInvite = (r: Resume) => {
    setInviteTarget(r);
    setInviteOpen(true);
  };

  const handleBackFromResume = () => {
    setSelectedResume(null);
    setPage('registry');
  };

  const handleFindCandidates = (position: string) => {
    setRegistryPreset(position);
    setPage('registry');
  };

  const renderPage = () => {
    if (page === 'resume-detail' && selectedResume) {
      return (
        <ResumeDetail
          resume={selectedResume}
          vacancies={vacancies}
          onBack={handleBackFromResume}
          onInvite={handleInvite}
        />
      );
    }

    if (role === 'employer') {
      switch (page) {
        case 'dashboard':
          return (
            <EmployerDashboard
              resumes={resumes} vacancies={vacancies} invitations={INVITATIONS}
              onGoToRegistry={() => setPage('registry')}
              onGoToVacancies={() => setPage('vacancies')}
            />
          );
        case 'registry':
          return (
            <ResumeRegistry
              resumes={resumes}
              setResumes={setResumes}
              vacancies={vacancies}
              onOpenResume={handleOpenResume}
              onInvite={handleInvite}
              presetQuery={registryPreset}
            />
          );
        case 'vacancies':
          return (
            <EmployerVacancies
              vacancies={vacancies}
              setVacancies={setVacancies}
              onFindCandidates={handleFindCandidates}
            />
          );
        case 'favorites':
          return (
            <EmployerFavorites
              resumes={resumes}
              setResumes={setResumes}
              onOpenResume={handleOpenResume}
              vacancies={vacancies}
            />
          );
        case 'messages':
          return <EmployerMessages messages={MESSAGES} />;
        case 'invitations':
          return <EmployerInvitations invitations={INVITATIONS} />;
        case 'company':
          return <CompanyProfile />;
      }
    }

    if (role === 'seeker') {
      switch (page) {
        case 'seeker-dashboard':
          return <SeekerDashboard invitations={INVITATIONS} messages={MESSAGES} />;
        case 'my-resume':
          return <MyResume />;
        case 'seeker-invitations':
          return <SeekerInvitations invitations={INVITATIONS} />;
        case 'seeker-messages':
          return <SeekerMessages messages={MESSAGES} />;
        case 'seeker-settings':
          return <SeekerSettings />;
      }
    }

    if (role === 'admin') {
      switch (page) {
        case 'admin-dashboard':
          return <AdminDashboard logs={AUDIT_LOGS} />;
        case 'admin-resumes':
          return <AdminResumes resumes={resumes} setResumes={setResumes} />;
        case 'admin-employers':
          return <AdminEmployers employers={employers} setEmployers={setEmployers} />;
        case 'admin-vacancies':
          return <AdminVacancies vacancies={vacancies} setVacancies={setVacancies} />;
        case 'admin-users':
          return <AdminUsers employers={employers} />;
        case 'admin-dicts':
          return <AdminDicts />;
        case 'admin-logs':
          return <AdminLogs logs={AUDIT_LOGS} />;
      }
    }

    return (
      <div className="flex items-center justify-center h-64 text-slate-400">Страница не найдена</div>
    );
  };

  return (
    <AppShell role={role} email={email} page={page} setPage={setPage}>
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        resume={inviteTarget}
        vacancies={vacancies}
      />
      {renderPage()}
    </AppShell>
  );
}
