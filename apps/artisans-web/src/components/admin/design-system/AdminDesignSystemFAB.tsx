import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Palette } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useDesignSystemEditor } from '@/hooks/useDesignSystemEditor';
import { DesignSystemQuickEditor } from './DesignSystemQuickEditor';
import { supabase } from '@/integrations/supabase/client';

export function AdminDesignSystemFAB() {
  const [isAdmin, setIsAdmin] = useState(false);
  const { openEditor, hasUnsavedChanges } = useDesignSystemEditor();
  const location = useLocation();

  useEffect(() => {
    const checkAdminStatus = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      const { data, error } = await supabase.rpc('is_admin');
      if (!error && data === true) {
        setIsAdmin(true);
      }
    };

    checkAdminStatus();
  }, []);

  // Hide FAB on design system editor page
  if (!isAdmin || location.pathname === '/admin/design-system') return null;

  return (
    <>
      <button
        onClick={openEditor}
        className="fixed bottom-6 right-6 z-[100] group"
        aria-label="Abrir Design System Editor"
      >
        <div className="relative">
          {/* Badge de cambios sin guardar */}
          {hasUnsavedChanges && (
            <Badge 
              variant="destructive" 
              className="absolute -top-2 -right-2 w-5 h-5 p-0 flex items-center justify-center text-xs z-10"
            >
              !
            </Badge>
          )}
          
          {/* Botón principal */}
          <div className="w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg hover:shadow-xl transition-all flex items-center justify-center group-hover:scale-110">
            <Palette className="w-6 h-6" />
          </div>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            <div className="bg-foreground text-background text-xs px-3 py-1.5 rounded whitespace-nowrap shadow-lg">
              Design System Editor
              {hasUnsavedChanges && (
                <span className="ml-2 text-warning">● Cambios sin guardar</span>
              )}
            </div>
          </div>
        </div>
      </button>

      {/* Modal */}
      <DesignSystemQuickEditor />
    </>
  );
}
