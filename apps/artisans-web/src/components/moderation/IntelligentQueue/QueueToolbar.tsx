import React, { useRef } from 'react';
import {
  Search, X, List, LayoutGrid, Table2, Columns,
  ChevronDown, ArrowUpDown, Check,
} from 'lucide-react';
import { SANS, SERIF, lc, glassPrimary, glassGreen, GREEN_MOD } from '@/components/dashboard/dashboardStyles';
import type { QueueSection } from './QueueSidebar';
import type { QueueViewMode } from './QueueCard';

export type SortBy = 'oldest' | 'newest' | 'most_issues' | 'priority_score';

export interface QueueFilterState {
  region: string;
  category: string;
  hasNoPhotos: boolean;
  nonMarketplaceOnly: boolean;
}

interface QueueToolbarProps {
  section: QueueSection;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  filters: QueueFilterState;
  onFiltersChange: (f: QueueFilterState) => void;
  sortBy: SortBy;
  onSortChange: (s: SortBy) => void;
  viewMode: QueueViewMode | 'kanban';
  onViewModeChange: (v: QueueViewMode | 'kanban') => void;
  availableRegions: string[];
  availableCategories: string[];
  totalItems: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const SORT_LABELS: Record<SortBy, string> = {
  oldest: 'Más antiguo',
  newest: 'Más reciente',
  most_issues: 'Más alertas',
  priority_score: 'Prioridad',
};

const VIEW_ICONS: { mode: QueueViewMode | 'kanban'; icon: React.ReactNode; label: string }[] = [
  { mode: 'list',   icon: <List style={{ width: 14, height: 14 }} />,        label: 'Lista' },
  { mode: 'grid',   icon: <LayoutGrid style={{ width: 14, height: 14 }} />,  label: 'Grid' },
  { mode: 'table',  icon: <Table2 style={{ width: 14, height: 14 }} />,      label: 'Tabla' },
  { mode: 'kanban', icon: <Columns style={{ width: 14, height: 14 }} />,     label: 'Kanban' },
];

// ─── Small dropdown ───────────────────────────────────────────────────────────

interface DropdownOption { label: string; value: string }

function PillDropdown({
  label, value, options, onChange, emptyLabel,
}: {
  label: string;
  value: string;
  options: DropdownOption[];
  onChange: (v: string) => void;
  emptyLabel?: string;
}) {
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = !!value;

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          ...(isActive ? glassGreen : glassPrimary),
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
          border: isActive ? `1px solid ${GREEN_MOD}` : '1px solid rgba(21,128,61,0.15)',
          fontFamily: SANS, fontSize: 11, fontWeight: isActive ? 700 : 500,
          color: isActive ? GREEN_MOD : 'rgba(84,67,62,0.65)',
          whiteSpace: 'nowrap',
        }}
      >
        {isActive ? options.find(o => o.value === value)?.label ?? label : label}
        {isActive
          ? <X style={{ width: 11, height: 11 }} onClick={e => { e.stopPropagation(); onChange(''); }} />
          : <ChevronDown style={{ width: 11, height: 11 }} />
        }
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 50,
          ...glassPrimary, borderRadius: 10, padding: '4px 0',
          border: '1px solid rgba(21,128,61,0.15)', minWidth: 160,
          boxShadow: '0 8px 24px rgba(21,27,45,0.12)',
        }}>
          {emptyLabel && (
            <button
              type="button"
              onClick={() => { onChange(''); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 12px', background: 'none', border: 'none', cursor: 'pointer',
                fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)', textAlign: 'left',
              }}
            >
              {emptyLabel}
            </button>
          )}
          {options.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { onChange(opt.value); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 12px', background: value === opt.value ? 'rgba(21,128,61,0.06)' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontFamily: SANS, fontSize: 11, fontWeight: value === opt.value ? 700 : 400,
                color: value === opt.value ? GREEN_MOD : '#151b2d',
              }}
            >
              {value === opt.value && <Check style={{ width: 10, height: 10, color: GREEN_MOD }} />}
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Toggle pill ──────────────────────────────────────────────────────────────

function TogglePill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        ...(active ? glassGreen : glassPrimary),
        padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
        border: active ? `1px solid ${GREEN_MOD}` : '1px solid rgba(21,128,61,0.15)',
        fontFamily: SANS, fontSize: 11, fontWeight: active ? 700 : 500,
        color: active ? GREEN_MOD : 'rgba(84,67,62,0.65)',
        whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

// ─── Sort dropdown ────────────────────────────────────────────────────────────

function SortDropdown({ value, onChange }: { value: SortBy; onChange: (s: SortBy) => void }) {
  const [open, setOpen] = React.useState(false);
  const ref = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        style={{
          ...glassPrimary,
          display: 'flex', alignItems: 'center', gap: 5,
          padding: '5px 10px', borderRadius: 8, cursor: 'pointer',
          border: '1px solid rgba(21,128,61,0.15)',
          fontFamily: SANS, fontSize: 11, fontWeight: 500,
          color: 'rgba(84,67,62,0.65)', whiteSpace: 'nowrap',
        }}
      >
        <ArrowUpDown style={{ width: 11, height: 11 }} />
        {SORT_LABELS[value]}
        <ChevronDown style={{ width: 11, height: 11 }} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 4px)', right: 0, zIndex: 50,
          ...glassPrimary, borderRadius: 10, padding: '4px 0',
          border: '1px solid rgba(21,128,61,0.15)', minWidth: 160,
          boxShadow: '0 8px 24px rgba(21,27,45,0.12)',
        }}>
          {(Object.keys(SORT_LABELS) as SortBy[]).map(opt => (
            <button
              key={opt}
              type="button"
              onClick={() => { onChange(opt); setOpen(false); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 8, width: '100%',
                padding: '7px 12px', background: value === opt ? 'rgba(21,128,61,0.06)' : 'none',
                border: 'none', cursor: 'pointer', textAlign: 'left',
                fontFamily: SANS, fontSize: 11, fontWeight: value === opt ? 700 : 400,
                color: value === opt ? GREEN_MOD : '#151b2d',
              }}
            >
              {value === opt && <Check style={{ width: 10, height: 10, color: GREEN_MOD }} />}
              {SORT_LABELS[opt]}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Main toolbar ─────────────────────────────────────────────────────────────

export const QueueToolbar: React.FC<QueueToolbarProps> = ({
  section,
  searchQuery,
  onSearchChange,
  filters,
  onFiltersChange,
  sortBy,
  onSortChange,
  viewMode,
  onViewModeChange,
  availableRegions,
  availableCategories,
  totalItems,
}) => {
  const searchRef = useRef<HTMLInputElement>(null);

  const regionOptions: DropdownOption[] = availableRegions.map(r => ({ label: r, value: r }));
  const categoryOptions: DropdownOption[] = availableCategories.map(c => ({ label: c, value: c }));

  const activeFilterCount = [
    filters.region, filters.category,
    filters.hasNoPhotos, filters.nonMarketplaceOnly,
  ].filter(Boolean).length;

  return (
    <div style={{
      ...glassPrimary,
      borderBottom: '1px solid rgba(21,128,61,0.1)',
      flexShrink: 0,
    }}>

      {/* Row 1: search */}
      <div style={{ padding: '10px 12px 6px', position: 'relative' }}>
        <Search style={{
          position: 'absolute', left: 22, top: '50%', transform: 'translateY(-20%)',
          width: 13, height: 13, color: 'rgba(84,67,62,0.4)',
        }} />
        <input
          ref={searchRef}
          type="text"
          value={searchQuery}
          onChange={e => onSearchChange(e.target.value)}
          placeholder={
            section === 'shops'
              ? 'Buscar por taller, región, mail de contacto…'
              : 'Buscar por nombre, taller, región, SKU…'
          }
          style={{
            width: '100%', paddingLeft: 32, paddingRight: searchQuery ? 32 : 12,
            paddingTop: 8, paddingBottom: 8, borderRadius: 10,
            border: '1px solid rgba(21,128,61,0.15)',
            background: 'rgba(255,255,255,0.7)',
            fontFamily: SANS, fontSize: 13, color: '#151b2d', outline: 'none',
            boxSizing: 'border-box',
          }}
        />
        {searchQuery && (
          <button
            type="button"
            onClick={() => onSearchChange('')}
            style={{
              position: 'absolute', right: 22, top: '50%', transform: 'translateY(-20%)',
              background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex',
            }}
          >
            <X style={{ width: 13, height: 13, color: 'rgba(84,67,62,0.4)' }} />
          </button>
        )}
      </div>

      {/* Row 2: filters + sort + view switcher */}
      <div style={{ padding: '0 12px 10px', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>

        {/* Filters */}
        {regionOptions.length > 0 && (
          <PillDropdown
            label="Región"
            value={filters.region}
            options={regionOptions}
            emptyLabel="Todas las regiones"
            onChange={v => onFiltersChange({ ...filters, region: v })}
          />
        )}
        {section === 'products' && categoryOptions.length > 0 && (
          <PillDropdown
            label="Categoría"
            value={filters.category}
            options={categoryOptions}
            emptyLabel="Todas las categorías"
            onChange={v => onFiltersChange({ ...filters, category: v })}
          />
        )}
        {section === 'products' && (
          <TogglePill
            label="Sin foto"
            active={filters.hasNoPhotos}
            onClick={() => onFiltersChange({ ...filters, hasNoPhotos: !filters.hasNoPhotos })}
          />
        )}
        {section === 'shops' && (
          <TogglePill
            label="No marketplace"
            active={filters.nonMarketplaceOnly}
            onClick={() => onFiltersChange({ ...filters, nonMarketplaceOnly: !filters.nonMarketplaceOnly })}
          />
        )}

        {/* Clear all filters */}
        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => onFiltersChange({ region: '', category: '', hasNoPhotos: false, nonMarketplaceOnly: false })}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '5px 8px', borderRadius: 8, cursor: 'pointer',
              background: 'none', border: '1px solid rgba(239,68,68,0.2)',
              fontFamily: SANS, fontSize: 10, fontWeight: 700, color: '#dc2626',
            }}
          >
            <X style={{ width: 10, height: 10 }} /> Limpiar ({activeFilterCount})
          </button>
        )}

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Count */}
        <p style={{ ...lc(0.35), fontSize: 9, flexShrink: 0 }}>
          {totalItems} item{totalItems !== 1 ? 's' : ''}
        </p>

        {/* Separator */}
        <div style={{ width: 1, height: 18, background: 'rgba(21,128,61,0.15)', margin: '0 2px' }} />

        {/* Sort */}
        <SortDropdown value={sortBy} onChange={onSortChange} />

        {/* Separator */}
        <div style={{ width: 1, height: 18, background: 'rgba(21,128,61,0.15)', margin: '0 2px' }} />

        {/* View switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {VIEW_ICONS.map(({ mode, icon, label }) => (
            <button
              key={mode}
              type="button"
              title={label}
              onClick={() => onViewModeChange(mode)}
              style={{
                ...(viewMode === mode ? glassGreen : {}),
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 30, height: 30, borderRadius: 7, cursor: 'pointer',
                border: viewMode === mode ? `1px solid ${GREEN_MOD}` : '1px solid transparent',
                background: viewMode === mode ? undefined : 'transparent',
                color: viewMode === mode ? GREEN_MOD : 'rgba(84,67,62,0.5)',
                transition: 'all 0.12s',
              }}
            >
              {icon}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
