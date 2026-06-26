import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UploadFolder, uploadImage } from '@/services/fileUpload.actions';
import { isSlugAvailable, updateStoreArtisanalCraft } from '@/services/artisanShops.actions';
import { getAllCategories, type Category } from '@/services/categories.actions';
import { ArtisanProfileData } from '@/types/artisanProfile';
import { useToast } from '@/components/ui/use-toast';
import { buildMarketplaceStoreUrl, buildAppStoreUrl, MARKETPLACE_DOMAIN } from '@/config/urls';
import { CraftMultiPicker } from '@/components/shop/new-product-wizard/components/CraftPicker';
import { TechniqueMultiPicker } from './Step5Craft';

interface Props {
  data: ArtisanProfileData;
  onChange: (updates: Partial<ArtisanProfileData>) => void;
  shopSlug?: string;
  shopName?: string;
  onShopUpdate?: (updates: { shopName?: string; shopSlug?: string }) => Promise<void>;
  userId?: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export function toSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

const glassCard: React.CSSProperties = {
  background: 'rgba(255,255,255,0.78)',
  backdropFilter: 'blur(14px)',
  WebkitBackdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.65)',
  boxShadow: '0 2px 10px -2px rgba(0,0,0,0.05)',
};

const inputCls =
  "w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/50 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/25 transition-all hover:border-[#e2d5cf]/80";
const inputBg: React.CSSProperties = { background: 'rgba(247,244,239,0.5)' };

const Label: React.FC<{ children: React.ReactNode; required?: boolean; optional?: boolean }> = ({
  children, required, optional,
}) => (
  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
    {children}
    {required && <span className="text-[#ef4444] ml-1">*</span>}
    {optional && <span className="ml-2 text-[#54433e]/30 normal-case tracking-normal font-[500] text-[11px]">— Opcional</span>}
  </label>
);

// ─── Avatar Uploader ──────────────────────────────────────────────────────────

const AvatarUploader: React.FC<{ value: string; onChange: (url: string) => void }> = ({
  value,
  onChange,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFile = async (file: File) => {
    setIsUploading(true);
    try {
      const result = await uploadImage(file, UploadFolder.PROFILES, file.name);
      onChange(result.url);
    } catch {
      toast({ title: 'Error', description: 'No se pudo subir la foto.', variant: 'destructive' });
    } finally {
      setIsUploading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  return (
    <div
      className="relative w-full h-full rounded-xl overflow-hidden cursor-pointer group"
      style={{ background: 'rgba(84,67,62,0.07)', border: '2px dashed rgba(84,67,62,0.15)' }}
      onClick={() => inputRef.current?.click()}
    >
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

      {value ? (
        <>
          <img src={value} alt="Foto de perfil" className="w-full h-full object-cover" />
          {/* Hover overlay */}
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: 'rgba(21,27,45,0.55)' }}>
            <span className="material-symbols-outlined text-[22px] text-white">photo_camera</span>
            <span className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-white/80">Cambiar</span>
          </div>
        </>
      ) : isUploading ? (
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-[#ec6d13]/30 border-t-[#ec6d13] rounded-full animate-spin" />
        </div>
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-1.5">
          <span className="material-symbols-outlined text-[28px] text-[#54433e]/30">add_a_photo</span>
          <span className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-[#54433e]/35">Subir foto</span>
        </div>
      )}
    </div>
  );
};

// ─── Slug Creator ─────────────────────────────────────────────────────────────

type SlugStatus = 'idle' | 'checking' | 'available' | 'taken' | 'error';

export const SlugCreator: React.FC<{
  artisticName: string;
  currentSlug: string;
  onSave: (slug: string, shopName: string) => Promise<void>;
}> = ({ artisticName, currentSlug, onSave }) => {
  const [slug, setSlug] = useState(currentSlug || toSlug(artisticName));
  const [status, setStatus] = useState<SlugStatus>('idle');
  const [isSaving, setIsSaving] = useState(false);
  const checkRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { toast } = useToast();

  // Sync initial slug when artisticName changes and no current slug
  useEffect(() => {
    if (!currentSlug && artisticName) {
      setSlug(toSlug(artisticName));
    }
  }, [artisticName, currentSlug]);

  const checkAvailability = useCallback((value: string) => {
    if (!value) { setStatus('idle'); return; }
    if (value === currentSlug) { setStatus('available'); return; }

    setStatus('checking');
    if (checkRef.current) clearTimeout(checkRef.current);
    checkRef.current = setTimeout(async () => {
      try {
        const available = await isSlugAvailable(value);
        setStatus(available ? 'available' : 'taken');
      } catch {
        setStatus('error');
      }
    }, 600);
  }, [currentSlug]);

  const handleSlugChange = (val: string) => {
    const clean = toSlug(val) || val.toLowerCase().replace(/[^a-z0-9-]/g, '');
    setSlug(clean);
    checkAvailability(clean);
  };

  const handleSave = async () => {
    if (status !== 'available' && slug !== currentSlug) return;
    setIsSaving(true);
    try {
      await onSave(slug, artisticName);
      toast({ title: 'URL guardada', description: `Tu tienda quedó en /${slug}` });
    } catch {
      toast({ title: 'Error', description: 'No se pudo guardar la URL.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };

  const statusIcon = {
    idle:      { icon: 'pending', color: 'text-[#54433e]/30' },
    checking:  { icon: 'progress_activity', color: 'text-[#54433e]/40 animate-spin' },
    available: { icon: 'check_circle', color: 'text-[#166534]' },
    taken:     { icon: 'cancel', color: 'text-[#ef4444]' },
    error:     { icon: 'error', color: 'text-[#f59e0b]' },
  }[status];

  const urls = [
    {
      icon: 'storefront',
      label: 'Marketplace',
      value: buildMarketplaceStoreUrl(slug || '…'),
      live: true,
    },
    {
      icon: 'language',
      label: 'Tu tienda online',
      value: buildAppStoreUrl(slug || '…'),
      live: true,
    },
    {
      icon: 'dns',
      label: 'Dominio propio',
      value: null,
      live: false,
      soon: true,
    },
  ];

  return (
    <div
      className="mt-4 rounded-xl overflow-hidden"
      style={{
        background: '#151b2d',
        border: '1px solid rgba(255,255,255,0.08)',
      }}
    >
      {/* Header */}
      <div className="px-5 pt-5 pb-4 border-b border-white/8">
        <div className="flex items-center gap-2 mb-1">
          <span className="material-symbols-outlined text-[14px] text-[#ec6d13]">link</span>
          <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-white/60">
            Tu URL en el marketplace
          </p>
        </div>
        <p className="font-['Manrope'] text-[12px] text-white/40 leading-snug">
          Esta URL identifica tu tienda en TELAR. Elígela con cuidado — cambiarla puede afectar links existentes.
        </p>
      </div>

      {/* Slug input */}
      <div className="px-5 py-4 border-b border-white/8">
        <div className="flex items-center gap-2 rounded-lg px-4 py-2.5" style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}>
          <span className="font-['Manrope'] text-[13px] text-white/30 shrink-0">{MARKETPLACE_DOMAIN}/tienda/</span>
          <input
            type="text"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="nombre-de-tu-tienda"
            className="flex-1 bg-transparent font-['Manrope'] text-[14px] font-[600] text-white focus:outline-none placeholder:text-white/20 min-w-0"
          />
          <span className={`material-symbols-outlined text-[18px] shrink-0 ${statusIcon.color}`}>
            {statusIcon.icon}
          </span>
        </div>
        {status === 'taken' && (
          <p className="mt-1.5 font-['Manrope'] text-[11px] text-[#ef4444]/80">
            Esta URL ya está en uso. Prueba con una variación.
          </p>
        )}
        {status === 'available' && slug !== currentSlug && (
          <p className="mt-1.5 font-['Manrope'] text-[11px] text-[#22c55e]/80">
            ¡Disponible! Guarda para confirmar.
          </p>
        )}
      </div>

      {/* URL previews */}
      <div className="px-5 py-4 flex flex-col gap-3 border-b border-white/8">
        {urls.map(({ icon, label, value, soon }) => (
          <div key={label} className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0" style={{ background: 'rgba(255,255,255,0.06)' }}>
              <span className="material-symbols-outlined text-[14px] text-[#ec6d13]/70">{icon}</span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-white/30 mb-0.5">{label}</p>
              {soon ? (
                <div className="flex items-center gap-2">
                  <span className="font-['Manrope'] text-[12px] text-white/20 italic">Configurable desde tu tienda</span>
                  <span className="px-1.5 py-0.5 rounded text-[8px] font-[800] uppercase tracking-widest" style={{ background: 'rgba(236,109,19,0.15)', color: '#ec6d13' }}>
                    Próximamente
                  </span>
                </div>
              ) : (
                <p className="font-['Manrope'] text-[13px] text-white/60 truncate">{value}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="px-5 py-4">
        <button
          type="button"
          onClick={handleSave}
          disabled={isSaving || (status !== 'available' && slug !== currentSlug) || !slug}
          className="w-full py-2.5 rounded-lg font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-white transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          style={{ background: status === 'available' || slug === currentSlug ? '#ec6d13' : 'rgba(255,255,255,0.08)' }}
        >
          {isSaving ? 'Guardando…' : 'Guardar URL'}
        </button>
      </div>
    </div>
  );
};

// ─── Category Multi-Picker ────────────────────────────────────────────────────

const TELAR_CATEGORY_DEFS: { name: string; icon: string }[] = [
  { name: 'Textiles y Moda',                    icon: 'apparel' },
  { name: 'Bolsos y Carteras',                   icon: 'shopping_bag' },
  { name: 'Joyería y Accesorios',                icon: 'diamond' },
  { name: 'Decoración del Hogar',                icon: 'home' },
  { name: 'Muebles',                             icon: 'chair' },
  { name: 'Vajillas y Cocina',                   icon: 'restaurant' },
  { name: 'Arte y Esculturas',                   icon: 'palette' },
  { name: 'Juguetes e Instrumentos Musicales',   icon: 'piano' },
  { name: 'Cuidado Personal',                    icon: 'spa' },
];

function resolveCatIcon(name: string): string {
  const def = TELAR_CATEGORY_DEFS.find(
    d => d.name === name || name.toLowerCase().includes(d.name.split(' ')[0].toLowerCase()),
  );
  return def?.icon ?? 'category';
}

interface CategoryMultiPickerProps {
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  onNamesChange: (names: string[]) => void;
}

export const CategoryMultiPicker: React.FC<CategoryMultiPickerProps> = ({ selectedIds, onChange, onNamesChange }) => {
  const [cats, setCats] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllCategories()
      .then(all => {
        const roots = all
          .filter(c => !c.parentId)
          .sort((a, b) => (a.displayOrder ?? 99) - (b.displayOrder ?? 99));
        setCats(roots);
        // Resolve names for pre-selected IDs (edit mode)
        const preselected = roots.filter(c => selectedIds.includes(c.id)).map(c => c.name);
        if (preselected.length > 0) onNamesChange(preselected);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const toggle = (cat: Category) => {
    const next = selectedIds.includes(cat.id)
      ? selectedIds.filter(id => id !== cat.id)
      : [...selectedIds, cat.id];
    const names = cats.filter(c => next.includes(c.id)).map(c => c.name);
    onChange(next);
    onNamesChange(names);
  };

  if (loading) return (
    <div className="flex items-center gap-2 py-4 text-[12px] text-[#54433e]/40">
      <span className="material-symbols-outlined text-[15px] animate-spin">progress_activity</span>
      Cargando categorías…
    </div>
  );

  if (cats.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
      {cats.map(cat => {
        const isSelected = selectedIds.includes(cat.id);
        return (
          <button
            key={cat.id}
            type="button"
            onClick={() => toggle(cat)}
            className="relative flex flex-col items-center justify-center p-3 rounded-xl transition-all text-center gap-1.5"
            style={{
              background: isSelected ? 'rgba(236,109,19,0.07)' : 'rgba(255,255,255,0.6)',
              border: isSelected ? '1.5px solid rgba(236,109,19,0.5)' : '1px solid rgba(226,213,207,0.4)',
            }}
          >
            {isSelected && (
              <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-[#ec6d13] flex items-center justify-center">
                <span className="material-symbols-outlined text-white" style={{ fontSize: 10, fontVariationSettings: "'FILL' 1" }}>check</span>
              </div>
            )}
            <span
              className="material-symbols-outlined text-[22px] transition-colors"
              style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
            >
              {resolveCatIcon(cat.name)}
            </span>
            <span
              className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-wider leading-tight transition-colors"
              style={{ color: isSelected ? '#ec6d13' : '#54433e' }}
            >
              {cat.name}
            </span>
          </button>
        );
      })}
    </div>
  );
};

// ─── Step 1 Identity ─────────────────────────────────────────────────────────

export const Step1Identity: React.FC<Props> = ({
  data,
  onChange,
  shopSlug = '',
  shopName: _shopName = '',
  onShopUpdate,
  userId,
}) => {
  const [showSlug, setShowSlug] = useState(false);
  const [catNames, setCatNames] = useState<string[]>([]);
  const [craftNames, setCraftNames] = useState<string[]>([]);
  const hasCraft = !!(data.craftIds?.length || data.craftId);

  return (
    <div className="flex flex-col gap-5">

      {/* ── Módulo 1: Foto + Nombre del artesano ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <div className="flex items-start gap-5">
          {/* Avatar — ocupa todo el alto del módulo */}
          <div className="w-28 shrink-0 self-stretch" style={{ minHeight: '112px' }}>
            <AvatarUploader
              value={data.artisanPhoto || ''}
              onChange={(url) => onChange({ artisanPhoto: url })}
            />
          </div>
          {/* Name */}
          <div className="flex-1 min-w-0 flex flex-col justify-center gap-1.5">
            <p className="font-['Manrope'] text-[9px] font-[800] uppercase tracking-widest text-[#54433e]/50">
              Nombre del artesano <span className="text-[#ef4444]">*</span>
            </p>
            <input
              type="text"
              value={data.artisanName}
              onChange={(e) => onChange({ artisanName: e.target.value })}
              placeholder="Tu nombre completo"
              className="w-full rounded-lg px-4 py-3 font-['Noto_Serif'] text-[20px] text-[#151b2d] border border-[#e2d5cf]/50 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/20 transition-all hover:border-[#e2d5cf]/80"
              style={inputBg}
            />
            <p className="font-['Manrope'] text-[10px] text-[#54433e]/35 leading-snug">
              Foto en contexto de trabajo — evita fondos distractores
            </p>
          </div>
        </div>
      </div>

      {/* ── Módulo 2: Nombre del taller + Slug ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label required>Nombre del taller</Label>
        <input
          type="text"
          value={data.artisticName}
          onChange={(e) => onChange({ artisticName: e.target.value })}
          placeholder="Ej. Tejidos Zenú, Taller del Barro…"
          className={inputCls}
          style={inputBg}
        />
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mt-2 leading-snug">
          Este es el nombre que aparecerá en el marketplace de TELAR, en tu tienda online y en todos los canales de venta.
        </p>

        {/* Slug CTA */}
        <button
          type="button"
          onClick={() => setShowSlug(v => !v)}
          className="mt-4 flex items-center gap-2 group"
        >
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2d5cf]/60 group-hover:border-[#ec6d13]/40 transition-colors" style={{ background: 'rgba(84,67,62,0.04)' }}>
            <span className="material-symbols-outlined text-[14px] text-[#ec6d13]/70">link</span>
            <span className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/55 group-hover:text-[#ec6d13] transition-colors">
              {showSlug ? 'Cerrar configurador' : 'Configurar tu URL'}
            </span>
            <span className="material-symbols-outlined text-[12px] text-[#54433e]/35 group-hover:text-[#ec6d13] transition-all" style={{ transform: showSlug ? 'rotate(180deg)' : 'none' }}>
              expand_more
            </span>
          </div>
          {shopSlug && !showSlug && (
            <span className="font-['Manrope'] text-[11px] text-[#54433e]/35 truncate max-w-[180px]">
              /{shopSlug}
            </span>
          )}
        </button>

        {showSlug && onShopUpdate && (
          <SlugCreator
            artisticName={data.artisticName}
            currentSlug={shopSlug}
            onSave={async (newSlug, name) => {
              await onShopUpdate({ shopSlug: newSlug, shopName: name });
            }}
          />
        )}
        {showSlug && !onShopUpdate && (
          <div className="mt-4 p-4 rounded-xl text-center" style={{ background: 'rgba(84,67,62,0.05)', border: '1px solid rgba(84,67,62,0.08)' }}>
            <p className="font-['Manrope'] text-[12px] text-[#54433e]/40">Guarda un borrador primero para activar el configurador de URL.</p>
          </div>
        )}
      </div>

      {/* ── Módulo 3: Categorías ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label>Categorías de tu taller</Label>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug mb-4">
          ¿En qué tipos de productos trabaja tu taller? Selecciona las categorías y te sugeriremos los oficios más relevantes.
        </p>
        <CategoryMultiPicker
          selectedIds={data.categoryIds ?? []}
          onChange={ids => onChange({ categoryIds: ids })}
          onNamesChange={setCatNames}
        />
      </div>

      {/* ── Módulo 4: Oficios ── */}
      <div className="rounded-xl p-5" style={glassCard}>
        <Label required>Tus oficios</Label>
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug mb-4">
          {catNames.length > 0
            ? `Oficios sugeridos para las categorías que elegiste. Puedes seleccionar varios.`
            : 'Los oficios artesanales que practicas en tu taller. Puedes seleccionar varios.'}
        </p>
        <CraftMultiPicker
          selectedCraftIds={data.craftIds?.length ? data.craftIds : (data.craftId ? [data.craftId] : [])}
          suggestedCategoryNames={catNames.length > 0 ? catNames : undefined}
          onChange={craftIds => {
            onChange({ craftIds, craftId: craftIds[0], techniqueIds: [] });
            if (userId) updateStoreArtisanalCraft(userId, craftIds[0] ?? null).catch(() => {});
          }}
          onNamesChange={setCraftNames}
        />
      </div>

      {/* ── Módulo 5: Técnicas ── */}
      {hasCraft && (
        <div className="rounded-xl p-5" style={glassCard}>
          <Label required>Técnicas artesanales</Label>
          <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug mb-4">
            Selecciona las técnicas que aplicas en tu oficio. Puedes elegir varias.
          </p>
          <TechniqueMultiPicker
            craftId={data.craftId}
            craftIds={data.craftIds}
            craftNames={craftNames}
            selectedIds={data.techniqueIds ?? []}
            onChange={(ids) => onChange({ techniqueIds: ids })}
            onSelectedNamesChange={(names) => onChange({ techniques: names })}
          />
        </div>
      )}


    </div>
  );
};
