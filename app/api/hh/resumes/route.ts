import { type NextRequest, NextResponse } from 'next/server';
import { fetchHhResumes, fetchHhResumeDetail, mapHhResume } from '@/lib/parsers/hh';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
  const jar = await cookies();
  const token = jar.get('hh_token')?.value;
  if (!token) return NextResponse.json({ error: 'not_connected' }, { status: 401 });

  const { searchParams } = req.nextUrl;
  const id = searchParams.get('id');

  try {
    if (id) {
      const detail = await fetchHhResumeDetail(token, id);
      return NextResponse.json(mapHhResume(detail));
    }
    const list = await fetchHhResumes(token);
    return NextResponse.json(list.map(r => ({ id: r.id, title: r.title, area: r.area?.name })));
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
