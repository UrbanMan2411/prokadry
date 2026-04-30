'use client';

import { useEffect, useRef } from 'react';

export type MapCity = {
  name: string;
  coords: [number, number]; // [lng, lat]
  vacancies: number;
  resumes: number;
};

export const RUSSIA_CITIES: MapCity[] = [
  { name: 'Москва',           coords: [37.617, 55.756], vacancies: 38, resumes: 120 },
  { name: 'Санкт-Петербург', coords: [30.314, 59.931], vacancies: 22, resumes: 74 },
  { name: 'Казань',           coords: [49.122, 55.789], vacancies: 15, resumes: 48 },
  { name: 'Новосибирск',      coords: [82.935, 55.042], vacancies: 18, resumes: 55 },
  { name: 'Екатеринбург',    coords: [60.597, 56.852], vacancies: 14, resumes: 42 },
  { name: 'Краснодар',        coords: [38.977, 45.036], vacancies: 11, resumes: 31 },
  { name: 'Нижний Новгород', coords: [44.002, 56.327], vacancies: 9,  resumes: 28 },
  { name: 'Ростов-на-Дону',  coords: [39.701, 47.236], vacancies: 8,  resumes: 24 },
  { name: 'Самара',           coords: [50.178, 53.196], vacancies: 7,  resumes: 21 },
  { name: 'Уфа',              coords: [55.972, 54.739], vacancies: 10, resumes: 30 },
  { name: 'Красноярск',       coords: [92.893, 56.015], vacancies: 12, resumes: 34 },
  { name: 'Пермь',            coords: [56.229, 58.011], vacancies: 8,  resumes: 25 },
  { name: 'Воронеж',          coords: [39.184, 51.672], vacancies: 6,  resumes: 18 },
  { name: 'Владивосток',      coords: [131.887, 43.116], vacancies: 5, resumes: 14 },
  { name: 'Иркутск',          coords: [104.281, 52.298], vacancies: 7, resumes: 20 },
];

const KEY = process.env.NEXT_PUBLIC_2GIS_KEY ?? '';

export function bubbleHtml(label: string | number, size: number, bg: string, text: string): string {
  return `<div style="width:${size}px;height:${size}px;border-radius:50%;background:${bg};color:${text};display:flex;align-items:center;justify-content:center;font-size:${Math.max(10, size * 0.38)}px;font-weight:700;font-family:Golos Text,sans-serif;box-shadow:0 2px 8px rgba(0,0,0,.25);cursor:pointer;border:2px solid rgba(255,255,255,.6);white-space:nowrap;">${label}</div>`;
}

type UseRussiaMapOptions = {
  containerRef: React.RefObject<HTMLDivElement | null>;
  cities: MapCity[];
  center?: [number, number];
  zoom?: number;
  onCityClick?: (city: MapCity) => void;
};

export function useRussiaMap({ containerRef, cities, center = [60, 60], zoom = 3, onCityClick }: UseRussiaMapOptions) {
  const mapRef = useRef<any>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    const maxVac = Math.max(...cities.map(c => c.vacancies));
    let destroyed = false;
    const cleanup: (() => void)[] = [];

    import('@2gis/mapgl').then(({ load }) => load()).then((mapgl) => {
      if (destroyed || !el) return;

      const map = new mapgl.Map(el, {
        center,
        zoom,
        key: KEY,
        zoomControl: true,
        copyright: 'bottomRight',
      });
      mapRef.current = map;

      cities.forEach(city => {
        const size = 28 + Math.round((city.vacancies / maxVac) * 22);
        const marker = new mapgl.HtmlMarker(map, {
          coordinates: city.coords,
          html: bubbleHtml(city.vacancies, size, '#2563EB', '#fff'),
          anchor: [size / 2, size / 2],
        });
        const dom = marker.getContent();
        const onClick = () => onCityClick?.(city);
        dom.addEventListener('click', onClick);
        cleanup.push(() => { dom.removeEventListener('click', onClick); marker.destroy(); });
      });

      cleanup.push(() => { map.destroy(); mapRef.current = null; });
    });

    return () => {
      destroyed = true;
      cleanup.forEach(fn => fn());
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return mapRef;
}
