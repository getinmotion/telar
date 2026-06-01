import React, { useState, useEffect, useRef, useCallback } from 'react';
import { X, Plus, Sparkles, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  searchTaxonomy,
  suggestTaxonomyItem,
  type TaxonomyType,
  type TaxonomyItem,
} from '@/services/taxonomy.actions';
import { useAuthStore } from '@/stores/authStore';
import { cn } from '@/lib/utils';

const LABELS: Record<TaxonomyType, string> = {
  crafts: 'Oficio',
  techniques: 'Técnica',
  materials: 'Material',
  styles: 'Estilo',
  herramientas: 'Herramienta',
};

interface TaxonomyPickerProps {
  taxonomyType: TaxonomyType;
  value: string[];
  onChange: (ids: string[]) => void;
  label?: string;
  maxItems?: number;
  onAiSuggest?: () => void;
  className?: string;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export const TaxonomyPicker: React.FC<TaxonomyPickerProps> = ({
  taxonomyType,
  value,
  onChange,
  label,
  maxItems,
  onAiSuggest,
  className,
}) => {
  const user = useAuthStore((s) => s.user);
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<TaxonomyItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<TaxonomyItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [suggesting, setSuggesting] = useState(false);
  const [showSuggestInput, setShowSuggestInput] = useState(false);
  const [suggestName, setSuggestName] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  const containerRef = useRef<HTMLDivElement>(null);
  const typeLabel = label ?? LABELS[taxonomyType];

  // Load initial selected items by ID
  useEffect(() => {
    if (value.length === 0) { setSelectedItems([]); return; }
    searchTaxonomy(taxonomyType, undefined, 'approved')
      .then((all) => setSelectedItems(all.filter((i) => value.includes(i.id))))
      .catch(() => {});
  }, [taxonomyType]);

  // Search as user types
  useEffect(() => {
    if (!debouncedSearch && !isOpen) return;
    setLoading(true);
    searchTaxonomy(taxonomyType, debouncedSearch || undefined, 'approved')
      .then(setResults)
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedSearch, taxonomyType, isOpen]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggle = useCallback((item: TaxonomyItem) => {
    const isSelected = value.includes(item.id);
    if (!isSelected && maxItems && value.length >= maxItems) {
      toast.warning(`Máximo ${maxItems} ${typeLabel.toLowerCase()}(s)`);
      return;
    }
    const newIds = isSelected ? value.filter((id) => id !== item.id) : [...value, item.id];
    const newItems = isSelected
      ? selectedItems.filter((i) => i.id !== item.id)
      : [...selectedItems, item];
    setSelectedItems(newItems);
    onChange(newIds);
  }, [value, selectedItems, maxItems, typeLabel, onChange]);

  const handleSuggest = async () => {
    if (!suggestName.trim()) return;
    setSuggesting(true);
    try {
      const newItem = await suggestTaxonomyItem(taxonomyType, suggestName.trim(), user?.id);
      // Optimistically add pending chip
      const optimistic: TaxonomyItem = { ...newItem, status: 'pending' };
      setSelectedItems((prev) => [...prev, optimistic]);
      onChange([...value, optimistic.id]);
      setSuggestName('');
      setShowSuggestInput(false);
      toast.success(`"${optimistic.name}" enviado para revisión`);
    } catch {
      toast.error('No se pudo enviar la sugerencia');
    } finally {
      setSuggesting(false);
    }
  };

  const unselectedResults = results.filter((r) => !value.includes(r.id));

  return (
    <div className={cn('space-y-2', className)} ref={containerRef}>
      {/* Label */}
      {label !== undefined && (
        <p className="text-sm font-medium text-[#151b2d]">{label}</p>
      )}

      {/* Selected chips */}
      {selectedItems.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selectedItems.map((item) => (
            <Badge
              key={item.id}
              variant={item.status === 'pending' ? 'outline' : 'secondary'}
              className={cn(
                'flex items-center gap-1 pr-1 text-xs',
                item.status === 'pending' && 'border-amber-400 text-amber-700 bg-amber-50',
              )}
            >
              {item.name}
              {item.status === 'pending' && (
                <span className="text-[9px] uppercase tracking-wide ml-0.5 opacity-70">pendiente</span>
              )}
              <button
                type="button"
                onClick={() => toggle(item)}
                className="ml-0.5 hover:text-red-500 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}

      {/* Search input */}
      <div className="relative">
        <Input
          placeholder={`Buscar ${typeLabel.toLowerCase()}...`}
          value={search}
          onChange={(e) => { setSearch(e.target.value); setIsOpen(true); }}
          onFocus={() => setIsOpen(true)}
          className="text-sm"
        />

        {/* Dropdown */}
        {isOpen && (
          <div className="absolute z-50 top-full left-0 right-0 mt-1 rounded-lg border border-gray-200 bg-white shadow-lg max-h-52 overflow-y-auto">
            {loading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              </div>
            ) : unselectedResults.length === 0 ? (
              <p className="px-3 py-2 text-xs text-gray-400">
                {search ? 'Sin resultados' : `Sin ${typeLabel.toLowerCase()}s aprobados`}
              </p>
            ) : (
              unselectedResults.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => { toggle(item); setSearch(''); setIsOpen(false); }}
                  className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 transition-colors"
                >
                  {item.name}
                </button>
              ))
            )}
          </div>
        )}
      </div>

      {/* Actions row */}
      <div className="flex items-center gap-2">
        {/* Suggest new */}
        {showSuggestInput ? (
          <div className="flex items-center gap-1.5 flex-1">
            <Input
              placeholder={`Nombre del nuevo ${typeLabel.toLowerCase()}...`}
              value={suggestName}
              onChange={(e) => setSuggestName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSuggest()}
              className="text-xs h-7"
              autoFocus
            />
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="h-7 text-xs px-2"
              onClick={handleSuggest}
              disabled={suggesting || !suggestName.trim()}
            >
              {suggesting ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Sugerir'}
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              className="h-7 text-xs px-2"
              onClick={() => { setShowSuggestInput(false); setSuggestName(''); }}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-gray-500 hover:text-[#151b2d] gap-1"
            onClick={() => setShowSuggestInput(true)}
          >
            <Plus className="w-3 h-3" />
            Sugerir {typeLabel.toLowerCase()}
          </Button>
        )}

        {/* AI placeholder */}
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 text-xs text-gray-300 cursor-not-allowed gap-1"
          disabled
          title="Próximamente"
          onClick={onAiSuggest}
        >
          <Sparkles className="w-3 h-3" />
          IA sugiere
        </Button>
      </div>
    </div>
  );
};
