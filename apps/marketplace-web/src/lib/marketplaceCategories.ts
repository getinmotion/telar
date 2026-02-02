import * as Icons from 'lucide-react';
import joyeriaImg from '@/assets/categories/joyeria.png';
import decoracionImg from '@/assets/categories/decoracion.png';
import textilesImg from '@/assets/categories/textiles.png';
import bolsosImg from '@/assets/categories/bolsos.png';
import vajillasImg from '@/assets/categories/vajillas.png';
import mueblesImg from '@/assets/categories/muebles.png';
import arteImg from '@/assets/categories/arte.png';

export interface MarketplaceCategory {
  name: string;
  icon: keyof typeof Icons;
  description: string;
  color: string;
  imageUrl: string;
  keywords: string[];
}

export const MARKETPLACE_CATEGORIES: MarketplaceCategory[] = [
  {
    name: "Joyería y Accesorios",
    icon: "Gem",
    description: "Piezas únicas para complementar tu estilo",
    color: "from-amber-500/20 to-yellow-500/20",
    imageUrl: joyeriaImg,
    keywords: ["joyería", "bisutería", "collar", "aretes", "pulsera", "anillo", "accesorio", "plata", "oro", "piedras"]
  },
  {
    name: "Decoración del Hogar",
    icon: "Home",
    description: "Dale personalidad a tus espacios",
    color: "from-blue-500/20 to-cyan-500/20",
    imageUrl: decoracionImg,
    keywords: ["decoración", "hogar", "escultura", "cuadro", "jarrón", "tapiz", "adorno", "artesanal"]
  },
  {
    name: "Textiles y Moda",
    icon: "Shirt",
    description: "Textiles tradicionales con diseño contemporáneo",
    color: "from-purple-500/20 to-pink-500/20",
    imageUrl: textilesImg,
    keywords: ["textil", "tejido", "ropa", "bufanda", "ruana", "mantel", "cojín", "tapete", "hamaca", "tela"]
  },
  {
    name: "Bolsos y Carteras",
    icon: "ShoppingBag",
    description: "Complementos funcionales hechos a mano",
    color: "from-green-500/20 to-emerald-500/20",
    imageUrl: bolsosImg,
    keywords: ["bolso", "cartera", "mochila", "morral", "canasta", "estuche", "monedero", "cuero", "fique"]
  },
  {
    name: "Vajillas y Cocina",
    icon: "UtensilsCrossed",
    description: "Arte funcional para tu mesa",
    color: "from-orange-500/20 to-red-500/20",
    imageUrl: vajillasImg,
    keywords: ["vajilla", "cocina", "plato", "taza", "bowl", "bandeja", "cubierto", "utensilio", "cerámica"]
  },
  {
    name: "Muebles",
    icon: "Armchair",
    description: "Mobiliario artesanal para tu hogar",
    color: "from-brown-500/20 to-amber-500/20",
    imageUrl: mueblesImg,
    keywords: ["mueble", "mesa", "silla", "estantería", "baúl", "madera", "mobiliario"]
  },
  {
    name: "Arte y Esculturas",
    icon: "Palette",
    description: "Piezas únicas de expresión artística",
    color: "from-indigo-500/20 to-violet-500/20",
    imageUrl: arteImg,
    keywords: ["arte", "escultura", "figura", "madera", "piedra", "metal", "artístico", "decorativo"]
  }
];

export const MARKETPLACE_CATEGORY_NAMES = MARKETPLACE_CATEGORIES.map(c => c.name);
