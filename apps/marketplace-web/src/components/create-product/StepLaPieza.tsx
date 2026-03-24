import { useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { MOCK_CATEGORIES, type CreateProductV2Data } from './types';

interface StepLaPiezaProps {
  data: CreateProductV2Data;
  onChange: (updates: Partial<CreateProductV2Data>) => void;
  onImageUpload: (files: FileList) => void;
}

export function StepLaPieza({ data, onChange, onImageUpload }: StepLaPiezaProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="max-w-3xl mx-auto">
      {/* Section header */}
      <div className="text-center mb-12">
        <span className="text-primary font-bold uppercase text-[10px] tracking-[0.3em] mb-3 block">
          Paso 1 de 4
        </span>
        <h2 className="text-4xl lg:text-5xl font-serif italic text-charcoal mb-4">
          La Pieza
        </h2>
        <p className="text-charcoal/50 text-sm italic max-w-md mx-auto">
          Cuéntanos sobre tu creación. Un buen nombre y una descripción clara ayudan a que tu pieza
          encuentre su hogar.
        </p>
      </div>

      <div className="space-y-10">
        {/* Nombre */}
        <div className="space-y-3">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Nombre de la pieza *
          </Label>
          <Input
            value={data.name}
            onChange={(e) => onChange({ name: e.target.value })}
            placeholder="Ej: Almohadón Tejido Artesanal Azul"
            className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-lg font-serif italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent"
          />
        </div>

        {/* Descripción corta */}
        <div className="space-y-3">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Descripción corta *
          </Label>
          <Textarea
            value={data.shortDescription}
            onChange={(e) => onChange({ shortDescription: e.target.value })}
            placeholder="Una frase que capture la esencia de tu pieza..."
            rows={2}
            className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-sm italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent resize-none"
          />
          <p className="text-[10px] text-charcoal/30">
            {data.shortDescription.length}/200 caracteres
          </p>
        </div>

        {/* Historia */}
        <div className="space-y-3">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Historia de la pieza
          </Label>
          <Textarea
            value={data.history ?? ''}
            onChange={(e) => onChange({ history: e.target.value })}
            placeholder="Cuenta la historia detrás de esta creación: su inspiración, el proceso, lo que la hace especial..."
            rows={4}
            className="border-0 border-b border-charcoal/15 rounded-none px-0 py-3 text-sm italic placeholder:text-charcoal/20 focus-visible:ring-0 focus-visible:border-charcoal bg-transparent resize-none"
          />
        </div>

        {/* Categoría */}
        <div className="space-y-3">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Categoría
          </Label>
          <div className="flex flex-wrap gap-3">
            {MOCK_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => onChange({ categoryId: cat.id })}
                className={`border px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] font-bold transition-all ${
                  data.categoryId === cat.id
                    ? 'bg-charcoal text-white border-charcoal'
                    : 'border-charcoal/15 text-charcoal/50 hover:border-charcoal/40 hover:text-charcoal/80'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Imágenes */}
        <div className="space-y-4">
          <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-charcoal/50">
            Imágenes de la pieza
          </Label>

          {data.images.length > 0 && (
            <div className="grid grid-cols-4 gap-4">
              {data.images.map((img, idx) => (
                <div
                  key={idx}
                  className="aspect-square bg-charcoal/5 rounded-lg overflow-hidden relative group"
                >
                  <img src={img} alt={`Imagen ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() =>
                      onChange({ images: data.images.filter((_, i) => i !== idx) })
                    }
                    className="absolute top-2 right-2 w-6 h-6 bg-charcoal/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <span className="material-symbols-outlined text-xs">close</span>
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => fileInputRef.current?.click()}
            className="w-full border-2 border-dashed border-charcoal/15 py-12 flex flex-col items-center gap-3 hover:border-primary/40 transition-colors group"
          >
            <span className="material-symbols-outlined text-3xl text-charcoal/20 group-hover:text-primary/50 transition-colors">
              add_photo_alternate
            </span>
            <span className="text-[11px] uppercase tracking-[0.15em] font-bold text-charcoal/30 group-hover:text-charcoal/50">
              Agregar imágenes
            </span>
            <span className="text-[10px] text-charcoal/20">
              JPG, PNG o WebP. Máximo 5MB por imagen.
            </span>
          </button>

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files && onImageUpload(e.target.files)}
          />
        </div>
      </div>
    </div>
  );
}
