import { type NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { searchHhResumes, mapHhSearchItemToDb } from '@/lib/parsers/hh';
import { searchAvitoResumes, parseAvitoResumeUrl, mapAvitoToDb } from '@/lib/parsers/avito';
import { bulkImport } from '@/lib/parsers/db-importer';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'ADMIN') {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 });
  }

  const body = await req.json() as {
    source: 'hh' | 'avito';
    query: string;
    limit?: number;
    areaId?: string;
  };

  const { source, query, limit = 20, areaId } = body;
  if (!query) return NextResponse.json({ error: 'query required' }, { status: 400 });

  try {
    if (source === 'hh') {
      const perPage = Math.min(limit, 50);
      const pages = Math.ceil(limit / perPage);
      const items = [];

      for (let page = 0; page < pages; page++) {
        const { items: pageItems } = await searchHhResumes({ query, areaId, perPage, page });
        items.push(...pageItems);
        if (items.length >= limit) break;
      }

      const parsed = items.slice(0, limit).map(mapHhSearchItemToDb);
      const summary = await bulkImport(parsed);
      return NextResponse.json({ source: 'hh', query, fetched: items.length, ...summary });
    }

    if (source === 'avito') {
      const cards = await searchAvitoResumes(query);
      const limited = cards.slice(0, limit);

      const parsed = await Promise.allSettled(
        limited.map(c => parseAvitoResumeUrl(c.url).then(mapAvitoToDb))
      );

      const items = parsed
        .filter((r): r is PromiseFulfilledResult<ReturnType<typeof mapAvitoToDb>> => r.status === 'fulfilled')
        .map(r => r.value);

      const summary = await bulkImport(items);
      return NextResponse.json({ source: 'avito', query, fetched: limited.length, ...summary });
    }

    return NextResponse.json({ error: 'unknown source' }, { status: 400 });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}
