'use client';

import { useState, useEffect } from 'react';
import type { Role } from '@/lib/types';
import type { Resume, Vacancy, Employer, Message, Invitation, AuditLog } from '@/lib/types';
import { AppShell } from '@/components/layout';
import { ResumeRegistry } from '@/components/registry';
import { ResumeDetail, InviteModal, MessageModal } from '@/components/resume';
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
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  const apiFetch = async (url: string): Promise<Response | null> => {
    const r = await fetch(url);
    if (r.status === 401) {
      setSessionExpired(true);
      setTimeout(() => { window.location.href = '/auth'; }, 2500);
      return null;
    }
    return r;
  };
  const [resumes, setResumes] = useState<Resume[]>([]);
  const [vacancies, setVacancies] = useState<Vacancy[]>([]);
  const [employers, setEmployers] = useState<Employer[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  // Read page from URL on mount
  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('page');
    if (p) setPage(p);
  }, []);

  // Sync page → URL
  useEffect(() => {
    const url = new URL(window.location.href);
    if (url.searchParams.get('page') !== page) {
      url.searchParams.set('page', page);
      window.history.replaceState({}, '', url.toString());
    }
  }, [page]);

  // Document title with unread badge
  useEffect(() => {
    const count = role === 'employer'
      ? messages.filter(m => !m.isRead && m.fromRole === 'candidate').length
      : role === 'seeker'
      ? invitations.filter(i => i.status === 'sent').length + messages.filter(m => !m.isRead && m.fromRole === 'employer').length
      : resumes.filter(r => r.status === 'pending').length;
    document.title = count > 0 ? `ПРОкадры (${count})` : 'ПРОкадры';
  }, [role, messages, invitations, resumes]);

  useEffect(() => {
    const load = async () => {
      await Promise.all([
        apiFetch('/api/resumes').then(r => r?.ok ? r.json() : null).then(d => { if (d) setResumes(d); }).catch(() => {}),
        apiFetch('/api/vacancies').then(r => r?.ok ? r.json() : null).then(d => { if (d) setVacancies(d); }).catch(() => {}),
        apiFetch('/api/messages').then(r => r?.ok ? r.json() : null).then(d => { if (d) setMessages(d); }).catch(() => {}),
        apiFetch('/api/invitations').then(r => r?.ok ? r.json() : null).then(d => { if (d) setInvitations(d); }).catch(() => {}),
        ...(initialRole === 'admin' ? [
          apiFetch('/api/employers').then(r => r?.ok ? r.json() : null).then(d => { if (d) setEmployers(d); }).catch(() => {}),
          apiFetch('/api/admin/logs').then(r => r?.ok ? r.json() : null).then(d => { if (d) setAuditLogs(d); }).catch(() => {}),
        ] : []),
      ]);
      setLoading(false);
    };
    load();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialRole]);

  useEffect(() => {
    const poll = setInterval(() => {
      apiFetch('/api/messages').then(r => r?.ok ? r.json() : null).then(data => { if (data) setMessages(data); }).catch(() => {});
      apiFetch('/api/invitations').then(r => r?.ok ? r.json() : null).then(data => { if (data) setInvitations(data); }).catch(() => {});
      apiFetch('/api/resumes').then(r => r?.ok ? r.json() : null).then(data => { if (data) setResumes(data); }).catch(() => {});
    }, 30000);
    return () => clearInterval(poll);
  }, []);
  const [selectedResume, setSelectedResume] = useState<Resume | null>(null);
  const [inviteTarget, setInviteTarget] = useState<Resume | null>(null);
  const [inviteOpen, setInviteOpen] = useState(false);
  const [msgTarget, setMsgTarget] = useState<Resume | null>(null);
  const [msgOpen, setMsgOpen] = useState(false);
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

    if (page === 'regions') {
      return <RegionList resumes={resumes} vacancies={vacancies} onOpenRegion={r => { setSelectedRegion(r); setPage('region-detail'); }} />;
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
              invitations={invitations}
              onOpenResume={handleOpenResume}
              onInvite={handleInvite}
              onMessage={r => { setMsgTarget(r); setMsgOpen(true); }}
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
          return <EmployerMessages messages={messages} onMarkRead={threadId => {
            setMessages(prev => prev.map(m => m.counterpartyUserId === threadId ? { ...m, isRead: true } : m));
            messages.filter(m => m.counterpartyUserId === threadId && !m.isRead)
              .forEach(m => fetch(`/api/messages/${m.id}`, { method: 'PATCH' }).catch(() => {}));
          }} />;
        case 'invitations':
          return <EmployerInvitations invitations={invitations} setInvitations={setInvitations} />;
        case 'company':
          return <CompanyProfile />;
      }
    }

    if (role === 'seeker') {
      switch (page) {
        case 'seeker-dashboard':
          return <SeekerDashboard invitations={invitations} messages={messages} resumeStatus={resumes[0]?.status} />;
        case 'my-resume':
          return <MyResume />;
        case 'seeker-vacancies':
          return <SeekerVacancyRegistry vacancies={vacancies} invitations={invitations} />;
        case 'seeker-map':
          return <SeekerMapSearch vacancies={vacancies} />;
        case 'seeker-invitations':
          return <SeekerInvitations invitations={invitations} setInvitations={setInvitations} />;
        case 'seeker-messages':
          return <SeekerMessages messages={messages} email={email} onMarkRead={threadId => {
            setMessages(prev => prev.map(m => m.counterpartyUserId === threadId ? { ...m, isRead: true } : m));
            messages.filter(m => m.counterpartyUserId === threadId && !m.isRead)
              .forEach(m => fetch(`/api/messages/${m.id}`, { method: 'PATCH' }).catch(() => {}));
          }} />;
        case 'seeker-settings':
          return <SeekerSettings />;
      }
    }

    if (role === 'admin') {
      switch (page) {
        case 'admin-dashboard':
          return <AdminDashboard logs={auditLogs} />;
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
          return <AdminLogs logs={auditLogs} />;
      }
    }

    return (
      <div className="flex items-center justify-center h-64 text-slate-400">Страница не найдена</div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <svg className="w-8 h-8 text-blue-600 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span className="text-sm text-slate-500">Загрузка...</span>
        </div>
      </div>
    );
  }

  return (
    <AppShell role={role} email={email} page={page} setPage={setPage} badges={badges}>
      {sessionExpired && (
        <div className="fixed inset-0 z-[9999] flex items-end justify-center pb-8 pointer-events-none">
          <div className="bg-slate-900 text-white text-sm px-5 py-3 rounded-xl shadow-xl flex items-center gap-3">
            <svg className="w-4 h-4 text-amber-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Сессия истекла — перенаправление на страницу входа...
          </div>
        </div>
      )}
      <InviteModal
        open={inviteOpen}
        onClose={() => setInviteOpen(false)}
        resume={inviteTarget}
        vacancies={vacancies}
        onSent={() => {
          fetch('/api/messages').then(r => r.ok ? r.json() : []).then(setMessages).catch(() => {});
        }}
      />
      <MessageModal
        open={msgOpen}
        onClose={() => setMsgOpen(false)}
        resume={msgTarget}
      />
      {renderPage()}
    </AppShell>
  );
}
