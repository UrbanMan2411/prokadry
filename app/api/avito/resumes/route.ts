import { type NextRequest, NextResponse } from 'next/server';
import { searchAvitoResumes, parseAvitoResumeUrl } from '@/lib/parsers/avito';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get('q') ?? 'специалист по закупкам';
  const url = searchParams.get('url');
  const city = searchParams.get('city') ?? undefined;

  try {
    if (url) {
      const parsed = await parseAvitoResumeUrl(url);
      return NextResponse.json(parsed);
    }
    const results = await searchAvitoResumes(query, city);
    return NextResponse.json(results);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'unknown';
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
