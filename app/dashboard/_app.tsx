'use client';

import { useState, useEffect } from 'react';
import type { Role } from '@/lib/types';
import type { Resume, Vacancy, Employer, Message, Invitation } from '@/lib/types';
import { AUDIT_LOGS } from '@/lib/mock-data';
import { AppShell } from '@/components/layout';
import { ResumeRegistry } from '@/components/registry';
import { ResumeDetail, InviteModal } from '@/components/resume';
import {
  EmployerDashboard, EmployerVacancies, EmployerFavorites,
  EmployerMessages, EmployerInvitations, CompanyProfile,
} from '@/components/employer';
import {
  SeekerDashboard, MyResume, SeekerInvitations, SeekerMessages, SeekerSettings,
  SeekerVacancyRegistry, SeekerMapSearch,
} from '@/components/seeker';
import {
  AdminDashboard, AdminResumes, AdminEmployers, AdminVacancies,
  AdminUsers, AdminDicts, AdminLogs, AdminRegions, AdminImport,
} from '@/components/admin';
import { RegionList, RegionDetail } from '@/components/regions';

const DEFAULT_PAGE: Record<Role, string> = {
  employer: 'dashboard',
  seeker: 'seeker-dashboard',
  admin: 'admin-dashboard',
};

export default function ClientApp({ initialRole, email }: { initialRole: Role; email: string }) {
  const [role, setRole] = useState<Role>(initialRole);
  const [page, setPage] = useState<string>(DEFAULT_PAGE[initialRole]);
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);

  useEffect(() => {
    fetch('/api/resumes').then(r => r.json()).then(setResumes).catch(() => {});
    fetch('/api/vacancies').then(r => r.json()).then(setVacancies).catch(() => {});
    fetch('/api/messages').then(r => r.json()).then(setMessages).catch(() => {});
    fetch('/api/invitations').then(r => r.json()).then(setInvitations).catch(() => {});
    if (initialRole === 'admin') {
      fetch('/api/employers').then(r => r.json()).then(setEmployers).catch(() => {});
    }
  }, [initialRole]);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Resume | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [registryPreset, setRegistryPreset] = useState<string>('');
  const [selectedRegion, setSelectedRegion] = useState<string>('');

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

  const badges: Record<string, number> = {};
  if (role === 'employer') {
    badges['registry'] = resumes.filter(r => r.status === 'active').length;
    badges['favorites'] = resumes.filter(r => r.isFavorite).length;
    badges['messages'] = messages.filter(m => !m.isRead && m.fromRole === 'candidate').length;
    badges['invitations'] = invitations.filter(i => i.status === 'sent').length;
    badges['vacancies'] = vacancies.filter(v => v.status === 'active').length;
  } else if (role === 'seeker') {
    badges['seeker-invitations'] = invitations.filter(i => i.status === 'sent').length;
    badges['seeker-messages'] = messages.filter(m => !m.isRead && m.fromRole === 'employer').length;
    badges['seeker-vacancies'] = vacancies.filter(v => v.status === 'active').length;
  } else {
    badges['admin-resumes'] = resumes.filter(r => r.status === 'pending').length;
    badges['admin-employers'] = employers.filter(e => e.status === 'pending').length;
  }

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

    if (page === 'region-detail' && selectedRegion) {
      return (
        <RegionDetail
          regionName={selectedRegion}
          resumes={resumes}
          vacancies={vacancies}
          onBack={() => setPage('regions')}
        />
      );
    }

    if (role === 'employer') {
      switch (page) {
        case 'dashboard':
          return (
            <EmployerDashboard
              resumes={resumes} vacancies={vacancies} invitations={invitations}
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
          return <EmployerMessages messages={messages} onMarkRead={id => {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
            fetch(`/api/messages/${id}`, { method: 'PATCH' }).catch(() => {});
          }} />;
        case 'invitations':
          return <EmployerInvitations invitations={invitations} />;
        case 'company':
          return <CompanyProfile />;
      }
    }

    if (role === 'seeker') {
      switch (page) {
        case 'seeker-dashboard':
          return <SeekerDashboard invitations={invitations} messages={messages} />;
        case 'my-resume':
          return <MyResume />;
        case 'seeker-vacancies':
          return <SeekerVacancyRegistry vacancies={vacancies} />;
        case 'seeker-map':
          return <SeekerMapSearch vacancies={vacancies} />;
        case 'seeker-invitations':
          return <SeekerInvitations invitations={invitations} setInvitations={setInvitations} />;
        case 'seeker-messages':
          return <SeekerMessages messages={messages} onMarkRead={id => {
            setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
            fetch(`/api/messages/${id}`, { method: 'PATCH' }).catch(() => {});
          }} />;
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
        case 'admin-regions':
          return <AdminRegions resumes={resumes} vacancies={vacancies} onOpenRegion={r => { setSelectedRegion(r); setPage('admin-region-detail'); }} />;
        case 'admin-region-detail':
          return selectedRegion ? (
            <RegionDetail regionName={selectedRegion} resumes={resumes} vacancies={vacancies} onBack={() => setPage('admin-regions')} />
          ) : null;
        case 'admin-import':
          return <AdminImport />;
        case 'admin-logs':
          return <AdminLogs logs={AUDIT_LOGS} />;
      }
    }

    return (
      <div className="flex items-center justify-center h-64 text-slate-400">Страница не найдена</div>
    );
  };

  return (
    <AppShell role={role} email={email} page={page} setPage={setPage} badges={badges}>
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
