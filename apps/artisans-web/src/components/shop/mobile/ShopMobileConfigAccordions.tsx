import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus,
  ArrowRight,
  Sparkles,
  Mail,
  FileText,
  BarChart3,
  Palette,
  CreditCard,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ShopMobileConfigAccordionsProps {
  shop: any;
  products: any[];
}

export const ShopMobileConfigAccordions: React.FC<ShopMobileConfigAccordionsProps> = ({
  shop,
  products
}) => {
  const navigate = useNavigate();

  const inventoryItems = [
    {
      icon: Package,
      title: 'Subir Productos',
      description: 'Agregar nuevos productos',
      badge: `${products.length} productos`,
      badgeVariant: 'secondary' as const,
      route: '/productos/subir',
      highlight: true
    },
    {
      icon: Package,
      title: 'Ver Inventario',
      description: 'Gestiona todos tus productos',
      badge: products.length.toString(),
      badgeVariant: 'secondary' as const,
      route: '/dashboard/inventory'
    },
    {
      icon: BarChart3,
      title: 'Control Stock',
      description: 'Gestiona inventario',
      badge: `${products.filter(p => (p.inventory ?? 0) <= 5).length} bajo`,
      badgeVariant: 'secondary' as const,
      route: '/stock-wizard'
    }
  ];

  const configItems = [
    {
      icon: Sparkles,
      title: 'Hero Slider',
      description: 'Portada de tu tienda',
      badge: (shop as any).hero_config?.slides?.length > 0 ? 'OK' : 'Pendiente',
      badgeVariant: ((shop as any).hero_config?.slides?.length > 0 ? 'default' : 'destructive') as 'default' | 'destructive',
      route: '/dashboard/shop-hero-wizard'
    },
    {
      icon: FileText,
      title: 'Perfil Artesanal',
      description: 'Tu historia profunda',
      badge: (shop as any).artisan_profile_completed ? 'OK' : 'Pendiente',
      badgeVariant: ((shop as any).artisan_profile_completed ? 'default' : 'destructive') as 'default' | 'destructive',
      route: '/dashboard/artisan-profile-wizard'
    },
    {
      icon: Mail,
      title: 'Contacto',
      description: 'Info de contacto',
      badge: (shop as any).contact_config?.welcomeMessage ? 'OK' : 'Pendiente',
      badgeVariant: ((shop as any).contact_config?.welcomeMessage ? 'default' : 'destructive') as 'default' | 'destructive',
      route: '/dashboard/shop-contact-wizard'
    },
    {
      icon: Palette,
      title: 'Mi Marca',
      description: 'Logo y colores',
      badge: shop.logo_url ? 'OK' : 'Pendiente',
      badgeVariant: (shop.logo_url ? 'default' : 'destructive') as 'default' | 'destructive',
      route: '/dashboard/brand-wizard'
    },
    {
      icon: CreditCard,
      title: 'Datos Bancarios',
      description: 'Para publicar',
      badge: shop.id_contraparty ? 'OK' : 'Requerido',
      badgeVariant: (shop.id_contraparty ? 'default' : 'destructive') as 'default' | 'destructive',
      route: '/mi-cuenta/datos-bancarios',
      warning: !shop.id_contraparty
    }
  ];

  const pendingConfigCount = configItems.filter(item => item.badgeVariant === 'destructive').length;

  const renderItem = (item: {
    icon: any;
    title: string;
    description: string;
    badge: string;
    badgeVariant: 'default' | 'secondary' | 'destructive';
    route: string;
    highlight?: boolean;
    warning?: boolean;
  }, index: number) => (
    <div
      key={index}
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg border border-border bg-background/50 hover:bg-muted/50 transition-all cursor-pointer",
        item.highlight && "bg-gradient-to-br from-accent/10 to-golden/10 border-accent/30",
        item.warning && "bg-gradient-to-br from-warning/10 to-destructive/10 border-warning/30"
      )}
      onClick={() => navigate(item.route)}
    >
      <div className={cn(
        "p-2 rounded-xl flex-shrink-0",
        item.highlight ? "bg-accent/20" : "bg-primary/10"
      )}>
        <item.icon className={cn(
          "w-4 h-4",
          item.highlight ? "text-accent" : "text-primary"
        )} />
      </div>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-foreground">{item.title}</h4>
        <p className="text-xs text-muted-foreground truncate">{item.description}</p>
      </div>
      <Badge variant={item.badgeVariant} className="text-xs flex-shrink-0">
        {item.badge}
      </Badge>
      <button className="w-7 h-7 rounded-full bg-foreground text-background flex items-center justify-center flex-shrink-0">
        {item.highlight ? <Plus className="w-3 h-3" /> : <ArrowRight className="w-3 h-3" />}
      </button>
    </div>
  );

  return (
    <div className="lg:hidden space-y-3">
      <Accordion type="multiple" className="space-y-3">
        <AccordionItem value="inventory" className="border rounded-xl bg-card overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-accent/10">
                <Package className="w-4 h-4 text-accent" />
              </div>
              <span className="font-semibold text-foreground">Gestionar Inventario</span>
              <Badge variant="secondary" className="text-xs">
                {products.length}
              </Badge>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            {inventoryItems.map(renderItem)}
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="config" className="border rounded-xl bg-card overflow-hidden">
          <AccordionTrigger className="px-4 py-3 hover:no-underline">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Settings className="w-4 h-4 text-primary" />
              </div>
              <span className="font-semibold text-foreground">Configurar Tienda</span>
              {pendingConfigCount > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {pendingConfigCount} pendientes
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4 space-y-2">
            {configItems.map(renderItem)}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
};
