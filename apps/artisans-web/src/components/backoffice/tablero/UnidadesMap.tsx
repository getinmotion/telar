import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { ClienteEnRiesgo } from '@/services/gestion.actions';
import { escapeHtml, loadLeaflet, resolveCoords } from '@/lib/leafletColombia';

/**
 * Bloque 2 del brief: mapa de Colombia con un marcador por unidad productiva.
 *
 * - Tamaño del marcador proporcional a los productos publicados.
 * - Color por estado: activa / creada sin publicar / en riesgo.
 * - Click en el marcador abre la ficha de la unidad productiva.
 *
 * A diferencia de ArtisansMap (que colorea por cobertura de envío y dimensiona
 * por número de tiendas), aquí la pregunta es "dónde está activo el programa y
 * dónde está frenado". Comparte con él la geocodificación y la carga de Leaflet.
 */

export const ESTADO_COLOR: Record<string, string> = {
  activa: '#166534',
  creada: '#c29200',
  en_riesgo: '#dc2626',
};

export const ESTADO_LABEL: Record<string, string> = {
  activa: 'Activa',
  creada: 'Creada sin publicar',
  en_riesgo: 'En riesgo',
};

export interface UnidadesMapProps {
  shops: ClienteEnRiesgo[];
  height?: number | string;
  /** UP que el backend ya sabe que no tienen ningún dato geográfico. */
  unmappable?: number;
}

interface Point {
  shop: ClienteEnRiesgo;
  lat: number;
  lng: number;
  precision: 'municipio' | 'departamento';
}

export const UnidadesMap: React.FC<UnidadesMapProps> = ({
  shops,
  height = 420,
  unmappable,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<any>(null);
  const layerRef = useRef<any>(null);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { points, notLocated } = useMemo(() => {
    const located: Point[] = [];
    let missing = 0;
    for (const shop of shops) {
      const hit = resolveCoords({
        geoKey: shop.geoKey,
        geoTokens: shop.geoTokens,
      });
      if (!hit) {
        missing += 1;
        continue;
      }
      located.push({
        shop,
        lat: hit.coords[0],
        lng: hit.coords[1],
        precision: hit.precision,
      });
    }
    return { points: located, notLocated: missing };
  }, [shops]);

  const maxPublished = useMemo(
    () =>
      points.reduce(
        (max, p) => Math.max(max, p.shop.metrics.publishedProducts),
        0,
      ),
    [points],
  );

  useEffect(() => {
    let cancelled = false;
    loadLeaflet()
      .then((L) => {
        if (cancelled || !containerRef.current || mapRef.current) return;
        const map = L.map(containerRef.current, {
          center: [4.5709, -74.2973],
          zoom: 5,
          scrollWheelZoom: true,
        });
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; OpenStreetMap',
          maxZoom: 18,
        }).addTo(map);
        mapRef.current = map;
        setLoading(false);
      })
      .catch(() => {
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

  useEffect(() => {
    const L = (window as any).L;
    const map = mapRef.current;
    if (!L || !map) return;

    if (layerRef.current) {
      map.removeLayer(layerRef.current);
      layerRef.current = null;
    }
    if (points.length === 0) return;

    const group = L.layerGroup();

    // Las unidades que caen en la misma coordenada se dispersan en un anillo
    // pequeño: agruparlas en un solo pin escondería cuántas hay y de qué estado,
    // que es justo lo que el mapa tiene que responder.
    const buckets = new Map<string, Point[]>();
    for (const p of points) {
      const key = `${p.lat.toFixed(4)},${p.lng.toFixed(4)}`;
      const list = buckets.get(key);
      if (list) list.push(p);
      else buckets.set(key, [p]);
    }

    for (const [, arr] of buckets) {
      arr.forEach((p, index) => {
        const { shop } = p;
        const published = shop.metrics.publishedProducts;
        // Radio proporcional a productos publicados, con raíz para que una
        // tienda con 40 piezas no tape media Colombia.
        const ratio = maxPublished > 0 ? published / maxPublished : 0;
        const radius = 5 + Math.sqrt(ratio) * 13;

        let lat = p.lat;
        let lng = p.lng;
        if (arr.length > 1) {
          const angle = (2 * Math.PI * index) / arr.length;
          const spread = 0.045 + Math.min(arr.length, 12) * 0.004;
          lat += Math.sin(angle) * spread;
          lng += Math.cos(angle) * spread;
        }

        const color = ESTADO_COLOR[shop.derivedState] ?? '#64748b';
        const marker = L.circleMarker([lat, lng], {
          radius,
          color: '#fff',
          weight: 1.5,
          fillColor: color,
          fillOpacity: 0.85,
        });

        const place =
          [shop.municipality, shop.department].filter(Boolean).join(', ') ||
          shop.region ||
          'Ubicación aproximada';

        marker.bindPopup(
          `<div style="font-size:12px;max-width:250px">
            <div style="font-weight:700;margin-bottom:2px">${escapeHtml(shop.shopName)}</div>
            <div style="color:#64748b;margin-bottom:6px">${escapeHtml(place)}${
              p.precision === 'departamento'
                ? ' · ubicación aproximada al departamento'
                : ''
            }</div>
            <div style="margin-bottom:2px">
              <span style="display:inline-block;width:7px;height:7px;border-radius:50%;background:${color}"></span>
              ${escapeHtml(ESTADO_LABEL[shop.derivedState] ?? shop.derivedState)}
            </div>
            <div>${published} publicado${published === 1 ? '' : 's'} · ${shop.metrics.approvedProducts} aprobado${
              shop.metrics.approvedProducts === 1 ? '' : 's'
            }</div>
            <div style="color:#64748b">${escapeHtml(shop.agreementName ?? 'Sin convenio')}</div>
            <div style="margin-top:6px;color:#ec6d13;font-weight:700">Clic para abrir la ficha</div>
          </div>`,
        );
        marker.on('click', () =>
          navigate(`/backoffice/store-studio?shopId=${shop.shopId}`),
        );
        group.addLayer(marker);
      });
    }

    group.addTo(map);
    layerRef.current = group;

    const bounds = L.latLngBounds(points.map((p) => [p.lat, p.lng]));
    if (bounds.isValid()) map.fitBounds(bounds.pad(0.2), { maxZoom: 8 });
  }, [points, maxPublished, navigate]);

  // Hay dos motivos distintos para que una unidad no aparezca, y mezclarlos
  // haría que los números no cuadraran con el total: unas no tienen ningún dato
  // geográfico (lo cuenta el backend) y otras sí lo tienen pero su municipio no
  // está en el catálogo estático de coordenadas. Se reportan por separado.
  const sinDatoGeo = unmappable ?? 0;
  const sinCoordenada = Math.max(0, notLocated - sinDatoGeo);
  const missingTotal = notLocated;

  return (
    <div>
      <div
        className="relative w-full overflow-hidden rounded-xl border border-slate-200"
        style={{ height }}
      >
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-50">
            <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
          </div>
        )}
        {error && (
          <div className="absolute inset-0 z-10 flex items-center justify-center text-sm text-red-600">
            {error}
          </div>
        )}
        <div ref={containerRef} className="h-full w-full" />
      </div>

      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
        {Object.entries(ESTADO_LABEL).map(([code, label]) => (
          <span key={code} className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ background: ESTADO_COLOR[code] }}
            />
            {label}
          </span>
        ))}
        <span className="text-slate-400">
          El tamaño del punto es proporcional a los productos publicados.
        </span>
        <span className="ml-auto">
          <strong className="text-slate-600">{points.length}</strong> de{' '}
          {shops.length} en el mapa
          {missingTotal > 0 && (
            <>
              {' · '}
              {sinDatoGeo > 0 && <>{sinDatoGeo} sin datos de ubicación</>}
              {sinDatoGeo > 0 && sinCoordenada > 0 && ' y '}
              {sinCoordenada > 0 && (
                <>{sinCoordenada} sin coordenada en el catálogo</>
              )}
            </>
          )}
        </span>
      </div>
    </div>
  );
};
