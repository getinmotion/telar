import React from 'react';
import { cn } from '@/lib/utils';
import { 
  User, 
  Store, 
  Settings, 
  CreditCard, 
  Bell, 
  Shield, 
  HelpCircle,
  LogOut,
  FileText
} from 'lucide-react';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

export type ProfileSection = 
  | 'personal' 
  | 'shop' 
  | 'preferences' 
  | 'payment' 
  | 'fiscal'
  | 'notifications' 
  | 'security' 
  | 'support';

interface NavItem {
  id: ProfileSection;
  label: string;
  shortLabel: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { id: 'personal', label: 'Información Personal', shortLabel: 'Personal', icon: User },
  { id: 'shop', label: 'Mi Taller', shortLabel: 'Taller', icon: Store },
  { id: 'preferences', label: 'Preferencias', shortLabel: 'Ajustes', icon: Settings },
  { id: 'payment', label: 'Métodos de Pago', shortLabel: 'Pagos', icon: CreditCard },
  { id: 'fiscal', label: 'Información Fiscal', shortLabel: 'Fiscal', icon: FileText },
  { id: 'notifications', label: 'Notificaciones', shortLabel: 'Alertas', icon: Bell },
  { id: 'security', label: 'Seguridad', shortLabel: 'Seguridad', icon: Shield },
  { id: 'support', label: 'Soporte', shortLabel: 'Ayuda', icon: HelpCircle },
];

interface ProfileNavigationProps {
  activeSection: ProfileSection;
  onSectionChange: (section: ProfileSection) => void;
  onLogout: () => void;
}

export const ProfileNavigation: React.FC<ProfileNavigationProps> = ({
  activeSection,
  onSectionChange,
  onLogout,
}) => {
  return (
    <>
      {/* Desktop Navigation - Sidebar */}
      <nav className="hidden lg:flex flex-col w-64 shrink-0 sticky top-24 h-fit">
        <div className="glass-card rounded-2xl p-2 space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeSection === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onSectionChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200",
                  isActive
                    ? "bg-[#ec6d13] text-white font-semibold shadow-sm"
                    : "text-[#54433e]/70 hover:bg-white/60 hover:text-[#151b2d]"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="font-['Manrope'] text-[13px]">{item.label}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-3 glass-card-sm rounded-2xl p-2">
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 text-red-500/80 hover:bg-red-50/60 hover:text-red-600"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            <span className="font-['Manrope'] text-[13px] font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </nav>

      {/* Mobile/Tablet Navigation - Icon + Short Label */}
      <div className="lg:hidden sticky top-[57px] z-10 glass-header border-b border-white/40 -mx-3 sm:-mx-4 px-2">
        <ScrollArea className="w-full">
          <div className="flex gap-0.5 py-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onSectionChange(item.id)}
                  className={cn(
                    "flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg min-w-[52px] transition-all duration-200",
                    isActive
                      ? "bg-[#ec6d13] text-white"
                      : "text-[#54433e]/70 hover:bg-white/60"
                  )}
                >
                  <Icon className="h-4 w-4" />
                  <span className="text-[10px] font-medium truncate max-w-[50px]">{item.shortLabel}</span>
                </button>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </>
  );
};
