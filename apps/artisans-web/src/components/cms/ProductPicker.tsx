/**
 * ProductPicker — selector reutilizable de productos para bloques de CMS.
 *
 * Búsqueda por nombre (debounced 350ms), lista de resultados, selección,
 * reorden con flechas y eliminación. El valor es un array de IDs.
 */
import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, Search, X, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  searchProductsNew,
  getProductsNewByIds,
} from '@/services/products-new.actions';
import type { ProductResponse } from '@/services/products-new.types';

interface ProductPickerProps {
  value: string[];
  onChange: (ids: string[]) => void;
}

const thumbOf = (p: ProductResponse): string | undefined =>
  p.media?.find((m) => m.type === 'image')?.url ?? p.media?.[0]?.url;

export const ProductPicker: React.FC<ProductPickerProps> = ({ value, onChange }) => {
  const [search, setSearch] = useState('');
  const [debounced, setDebounced] = useState('');
  const [results, setResults] = useState<ProductResponse[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selected, setSelected] = useState<ProductResponse[]>([]);
  const [hydrating, setHydrating] = useState(false);
  const lastIdsKey = useRef<string>('');

  // debounce
  useEffect(() => {
    const t = setTimeout(() => setDebounced(search), 350);
    return () => clearTimeout(t);
  }, [search]);

  // perform search
  useEffect(() => {
    let alive = true;
    if (debounced.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearchLoading(true);
    searchProductsNew({ search: debounced.trim(), limit: 12 })
      .then((res) => {
        if (alive) setResults(res.data ?? []);
      })
      .catch((err) => {
        console.error('[ProductPicker] search error', err);
      })
      .finally(() => {
        if (alive) setSearchLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [debounced]);

  // hydrate selected
  useEffect(() => {
    const key = value.join(',');
    if (key === lastIdsKey.current) return;
    lastIdsKey.current = key;
    if (value.length === 0) {
      setSelected([]);
      return;
    }
    setHydrating(true);
    getProductsNewByIds(value)
      .then((rows) => {
        // preserve order from value
        const byId = new Map(rows.map((r) => [r.id, r]));
        setSelected(value.map((id) => byId.get(id)).filter(Boolean) as ProductResponse[]);
      })
      .catch((err) => console.error('[ProductPicker] hydrate error', err))
      .finally(() => setHydrating(false));
  }, [value]);

  const selectedIds = useMemo(() => new Set(value), [value]);

  const add = (p: ProductResponse) => {
    if (selectedIds.has(p.id)) return;
    onChange([...value, p.id]);
  };

  const remove = (id: string) => {
    onChange(value.filter((v) => v !== id));
  };

  const move = (idx: number, dir: -1 | 1) => {
    const next = [...value];
    const target = idx + dir;
    if (target < 0 || target >= next.length) return;
    [next[idx], next[target]] = [next[target], next[idx]];
    onChange(next);
  };

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar productos por nombre..."
          className="pl-9"
        />
        {searchLoading && (
          <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
        )}
      </div>

      {/* Results */}
      {results.length > 0 && (
        <div className="max-h-72 overflow-y-auto rounded-md border bg-background">
          {results.map((p) => {
            const already = selectedIds.has(p.id);
            return (
              <button
                type="button"
                key={p.id}
                disabled={already}
                onClick={() => add(p)}
                className="flex w-full items-center gap-3 border-b px-3 py-2 text-left last:border-b-0 hover:bg-muted disabled:opacity-50"
              >
                <div className="h-10 w-10 flex-none overflow-hidden rounded bg-muted">
                  {thumbOf(p) && (
                    <img src={thumbOf(p)} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">{p.name}</div>
                  <div className="truncate text-xs text-muted-foreground">{p.id}</div>
                </div>
                {already ? (
                  <span className="text-xs text-muted-foreground">añadido</span>
                ) : (
                  <Plus className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Selected */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Seleccionados ({value.length})</span>
          {hydrating && <Loader2 className="h-3 w-3 animate-spin text-muted-foreground" />}
        </div>
        {value.length === 0 && (
          <p className="rounded border border-dashed px-3 py-4 text-center text-sm text-muted-foreground">
            Aún no hay productos. Busca arriba para añadirlos.
          </p>
        )}
        {value.map((id, idx) => {
          const p = selected.find((s) => s.id === id);
          return (
            <div key={id} className="flex items-center gap-2 rounded-md border bg-card p-2">
              <div className="h-10 w-10 flex-none overflow-hidden rounded bg-muted">
                {p && thumbOf(p) && (
                  <img src={thumbOf(p)} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{p?.name ?? '(producto no encontrado)'}</div>
                <div className="truncate text-xs text-muted-foreground">{id}</div>
              </div>
              <Button type="button" variant="ghost" size="icon" onClick={() => move(idx, -1)} disabled={idx === 0}>
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => move(idx, 1)} disabled={idx === value.length - 1}>
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button type="button" variant="ghost" size="icon" onClick={() => remove(id)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ProductPicker;
