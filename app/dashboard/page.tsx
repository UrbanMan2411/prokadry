import { redirect } from 'next/navigation';
import { getSession } from '@/lib/session';
import type { Role } from '@/lib/types';
import ClientApp from './_app';

function dbRoleToAppRole(role: string): Role {
  if (role === 'EMPLOYER') return 'employer';
  if (role === 'SEEKER') return 'seeker';
  if (role === 'ADMIN') return 'admin';
  return 'employer';
}

export default async function Page() {
  const session = await getSession();
  if (!session) redirect('/auth');
  return <ClientApp initialRole={dbRoleToAppRole(session.role)} email={session.email} />;
}
