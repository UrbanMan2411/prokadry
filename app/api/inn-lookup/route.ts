import { NextRequest, NextResponse } from 'next/server';

export type InnResult = {
  name: string;
  fullName: string;
  inn: string;
  kpp: string;
  ogrn: string;
  legalAddress: string;
  region: string;
  city: string;
  okved: string;
  orgStatus: string;
  head: string;
  registrationDate: string;
};

export async function GET(req: NextRequest) {
  const inn = req.nextUrl.searchParams.get('inn')?.trim() ?? '';
  if (!/^\d{10}(\d{2})?$/.test(inn)) {
    return NextResponse.json({ error: 'invalid_inn' }, { status: 400 });
  }

  const apiKey = process.env.DADATA_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'not_configured' }, { status: 503 });
  }

  try {
    const res = await fetch(
      'https://suggestions.dadata.ru/suggestions/api/4_1/rs/findById/party',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
          Authorization: `Token ${apiKey}`,
        },
        body: JSON.stringify({ query: inn, count: 1 }),
      },
    );

    if (!res.ok) {
      console.error('[inn-lookup] DaData error', res.status);
      return NextResponse.json({ error: 'upstream_error' }, { status: 502 });
    }

    const json = await res.json();
    const s = json?.suggestions?.[0];
    if (!s) return NextResponse.json({ error: 'not_found' }, { status: 404 });

    const d = s.data;
    const regDate = d.state?.registration_date
      ? new Date(d.state.registration_date).toLocaleDateString('ru-RU')
      : '';

    const result: InnResult = {
      name: d.name?.short_with_opf ?? s.value,
      fullName: d.name?.full_with_opf ?? s.unrestricted_value,
      inn: d.inn ?? inn,
      kpp: d.kpp ?? '',
      ogrn: d.ogrn ?? '',
      legalAddress: d.address?.value ?? '',
      region: d.address?.data?.region_with_type ?? '',
      city: d.address?.data?.city ?? d.address?.data?.settlement_with_type ?? '',
      okved: d.okved ? `${d.okved}` : '',
      orgStatus: d.state?.status === 'ACTIVE' ? 'Действующая'
        : d.state?.status === 'LIQUIDATING' ? 'В процессе ликвидации'
        : d.state?.status === 'LIQUIDATED' ? 'Ликвидирована'
        : d.state?.status ?? '',
      head: d.management?.name ?? '',
      registrationDate: regDate,
    };

    return NextResponse.json(result);
  } catch (err) {
    console.error('[inn-lookup]', err);
    return NextResponse.json({ error: 'internal_error' }, { status: 500 });
  }
}
