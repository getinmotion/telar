import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import type { ShopWithProducts } from '@/hooks/useShippingAnalytics';
import { COLOMBIA_COORDS, DEPT_FALLBACK_COORDS } from '@/data/colombiaCoords';

interface ArtisansMapTabProps {
  shopsData: ShopWithProducts[];
}

const LEAFLET_CSS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
const LEAFLET_JS = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';

function normalize(s: string): string {
  return (s || '')
    .toUpperCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .trim();
}

function getCoords(dept: string, muni: string): [number, number] | null {
  const key = `${normalize(dept)}|${normalize(muni)}`;
  if (COLOMBIA_COORDS[key]) return COLOMBIA_COORDS[key];
  const fb = DEPT_FALLBACK_COORDS[normalize(dept)];
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

export const ArtisansMapTab: React.FC<ArtisansMapTabProps> = ({ shopsData }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const points = useMemo(() => {
    return shopsData
      .map((s) => {
        const coords = getCoords(s.department, s.municipality);
        if (!coords) return null;
        return { ...s, lat: coords[0], lng: coords[1] };
      })
      .filter(
        (x): x is ShopWithProducts & { lat: number; lng: number } => x !== null,
      );
  }, [shopsData]);

  const missing = shopsData.length - points.length;

  // Init map once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current) return;
        if (mapRef.current) return;

        const map = L.map(containerRef.current, {
          center: [4.5709, -74.2973], // Colombia center
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

    // Group by location to avoid overlap
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
      const color = coverage
        ? '#16a34a' // green
        : partial
          ? '#f59e0b' // amber
          : '#dc2626'; // red

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

    // Fit bounds
    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) {
      map.fitBounds(bounds.pad(0.2), { maxZoom: 9 });
    }
  }, [points]);

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Ubicación geográfica de artesanos
          </CardTitle>
          <div className="text-xs text-muted-foreground flex items-center gap-3">
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-green-600" />
              Cobertura Servientrega
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-amber-500" />
              Parcial
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block w-3 h-3 rounded-full bg-red-600" />
              Sin cobertura
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-3 flex items-center gap-4 text-sm">
            <span><strong>{points.length}</strong> ubicados</span>
            {missing > 0 && (
              <span className="text-muted-foreground">
                {missing} sin coordenadas conocidas
              </span>
            )}
          </div>
          <div className="relative w-full rounded-md overflow-hidden border" style={{ height: 560 }}>
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
        </CardContent>
      </Card>
    </div>
  );
};

function escapeHtml(s: string): string {
  return (s || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
