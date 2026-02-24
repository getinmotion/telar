import { 
  Hammer, 
  Scissors, 
  Palette, 
  Shirt, 
  Package, 
  Sparkles,
  PaintBucket,
  Flower2,
  BookOpen,
  Wind,
  Trees,
  Target
} from "lucide-react";
import { normalizeCraft } from "./normalizationUtils";

// Mapeo de oficios artesanales a iconos de Lucide
export const CRAFT_ICONS: Record<string, any> = {
  "Carpintería y Ebanistería": Hammer,
  "Tejeduría": Scissors,
  "Cerámica": Palette,
  "Joyería": Sparkles,
  "Textiles No Tejidos": Shirt,
  "Marroquinería": Package,
  "Pintura Artesanal": PaintBucket,
  "Talla en Madera": Trees,
  "Cestería": Wind,
  "Arte Floral": Flower2,
  "Encuadernación": BookOpen,
  "Bisutería": Target,
};

// Obtener icono de un oficio
export const getCraftIcon = (craft: string, className?: string) => {
  const normalizedCraft = normalizeCraft(craft);
  const Icon = CRAFT_ICONS[normalizedCraft] || Hammer;
  return Icon;
};

// Mapeo de materiales a emojis
export const MATERIAL_EMOJIS: Record<string, string> = {
  "Madera": "🪵",
  "Cuero": "🦌",
  "Arcilla": "🏺",
  "Telas": "🧵",
  "Fibras Naturales": "🌾",
  "Lana": "🐑",
  "Algodón": "☁️",
  "Seda": "🎀",
  "Metales": "⚙️",
  "Oro": "✨",
  "Plata": "💎",
  "Vidrio": "🔮",
  "Papel": "📜",
  "Bambú": "🎋",
  "Caña Flecha": "🌿",
  "Fique": "🌱",
  "Cerámica": "🏺",
  "Piedra": "🗿",
  "Semillas": "🌰",
  "Cuentas": "📿",
};

// Obtener emoji de un material
export const getMaterialEmoji = (material: string): string => {
  return MATERIAL_EMOJIS[material] || "🌿";
};

// Formatear nombre de oficio para display
export const formatCraftName = (craft: string): string => {
  return craft;
};

// Obtener color temático para un oficio (opcional)
export const getCraftColor = (craft: string): string => {
  const colorMap: Record<string, string> = {
    "Carpintería y Ebanistería": "hsl(var(--primary))",
    "Tejeduría": "hsl(var(--accent))",
    "Cerámica": "hsl(var(--secondary))",
    "Joyería": "hsl(var(--primary))",
  };
  return colorMap[craft] || "hsl(var(--muted))";
};
