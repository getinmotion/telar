import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import type { ShopWithProducts } from '@/hooks/useShippingAnalytics';
import { COLOMBIA_COORDS, DEPT_FALLBACK_COORDS } from '@/data/colombiaCoords';

export interface ArtisansMapProps {
  shopsData: ShopWithProducts[];
  /** Filtra solo a este departamento (case-insensitive, sin acentos). */
  filterDepartment?: string | null;
  /** Alto del contenedor del mapa */
  height?: number | string;
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

export function normalizeLocation(s: string): string {
  return (s || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function getCoords(dept: string, muni: string): [number, number] | null {
  const key = `${normalizeLocation(dept)}|${normalizeLocation(muni)}`;
  if (COLOMBIA_COORDS[key]) return COLOMBIA_COORDS[key];
  const fb = DEPT_FALLBACK_COORDS[normalizeLocation(dept)];
  return fb ?? null;
}

function loadLeaflet(): Promise<any> {
  const w = window as any;
  if (w.L) return Promise.resolve(w.L);

  if (!document.querySelector(`link[href="${LEAFLET_CSS}"]`)) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = LEAFLET_CSS;
    document.head.appendChild(link);
  }

  return new Promise((resolve, reject) => {
    const existing = document.querySelector(
      `script[src="${LEAFLET_JS}"]`,
    ) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener('load', () => resolve((window as any).L));
      existing.addEventListener('error', reject);
      if ((window as any).L) resolve((window as any).L);
      return;
    }
    const script = document.createElement('script');
    script.src = LEAFLET_JS;
    script.async = true;
    script.onload = () => resolve((window as any).L);
    script.onerror = reject;
    document.head.appendChild(script);
  });
}

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export const ArtisansMap: React.FC<ArtisansMapProps> = ({
  shopsData,
  filterDepartment,
  height = 560,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!filterDepartment) return shopsData;
    const norm = normalizeLocation(filterDepartment);
    return shopsData.filter((s) => normalizeLocation(s.department) === norm);
  }, [shopsData, filterDepartment]);

  const points = useMemo(() => {
    return filtered
      .map((s) => {
        const coords = getCoords(s.department, s.municipality);
        if (!coords) return null;
        return { ...s, lat: coords[0], lng: coords[1] };
      })
      .filter(
        (x): x is ShopWithProducts & { lat: number; lng: number } => x !== null,
      );
  }, [filtered]);

  // Init map once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        if (mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: [4.5709, -74.2973],
          zoom: 6,
          scrollWheelZoom: true,
        });

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18,
        }).addTo(map);

        mapRef.current = map;
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError('No se pudo cargar el mapa');
        setLoading(false);
      });

    return () => {
      cancelled = true;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // Update markers when points change
  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }

    if (points.length === 0) return;

    const buckets = new Map<string, typeof points>();
    for (const p of points) {
      const k = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
      if (!buckets.has(k)) buckets.set(k, []);
      buckets.get(k)!.push(p);
    }

    const group = L.layerGroup();

    for (const [, arr] of buckets) {
      const count = arr.length;
      const productSum = arr.reduce((acc, x) => acc + x.products.length, 0);
      const coverage = arr.every((x) => x.servientregaCoverage);
      const partial = arr.some((x) => x.servientregaCoverage);
      const color = coverage ? '#16a34a' : partial ? '#f59e0b' : '#dc2626';

      const radius = Math.min(20, 6 + Math.sqrt(count) * 4);
      const base = arr[0];

      const marker = L.circleMarker([base.lat, base.lng], {
        radius,
        color: '#fff',
        weight: 2,
        fillColor: color,
        fillOpacity: 0.85,
      });

      const listHtml = arr
        .slice(0, 10)
        .map(
          (s) =>
            `<li style="margin:2px 0"><strong>${escapeHtml(s.shopName)}</strong> — ${s.products.length} prod. ${s.servientregaCoverage ? '✅' : '❌'}</li>`,
        )
        .join('');
      const more = arr.length > 10 ? `<li>… +${arr.length - 10} más</li>` : '';

      marker.bindPopup(
        `<div style="font-size:12px;max-width:260px">
          <div style="font-weight:600;margin-bottom:4px">${escapeHtml(base.municipality || '—')}, ${escapeHtml(base.department || '—')}</div>
          <div style="margin-bottom:6px">${count} artesano${count > 1 ? 's' : ''} · ${productSum} producto${productSum !== 1 ? 's' : ''}</div>
          <ul style="margin:0;padding-left:14px">${listHtml}${more}</ul>
        </div>`,
      );

      marker.bindTooltip(
        `${count} artesano${count > 1 ? 's' : ''} en ${escapeHtml(base.municipality || base.department || '—')}`,
        { direction: 'top' },
      );

      group.addLayer(marker);
    }

    group.addTo(map);
    layerRef.current = group;

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2), { maxZoom: 9 });
    } else {
      map.setView([4.5709, -74.2973], 6);
    }
  }, [points]);

  return (
    <div
      className="relative w-full rounded-md overflow-hidden border"
      style={{ height }}
    >
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted/40 z-10">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}
      {error && (
        <div className="absolute inset-0 flex items-center justify-center text-destructive text-sm">
          {error}
        </div>
      )}
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
};

/** Devuelve el set de departamentos únicos presentes en los datos. */
export function uniqueDepartments(shopsData: ShopWithProducts[]): string[] {
  const set = new Set<string>();
  for (const s of shopsData) {
    if (s.department) set.add(s.department);
  }
  return Array.from(set).sort((a, b) => a.localeCompare(b, 'es'));
}

/** Conteo de tiendas ubicables y faltantes para un filtro dado. */
export function countLocated(
  shopsData: ShopWithProducts[],
  filterDepartment?: string | null,
): { located: number; missing: number; total: number } {
  const norm = filterDepartment ? normalizeLocation(filterDepartment) : null;
  const filtered = norm
    ? shopsData.filter((s) => normalizeLocation(s.department) === norm)
    : shopsData;
  let located = 0;
  for (const s of filtered) {
    const c =
      COLOMBIA_COORDS[
        `${normalizeLocation(s.department)}|${normalizeLocation(s.municipality)}`
      ] ?? DEPT_FALLBACK_COORDS[normalizeLocation(s.department)];
    if (c) located++;
  }
  return { located, missing: filtered.length - located, total: filtered.length };
}
