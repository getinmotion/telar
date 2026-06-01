/**
 * BackofficeLayout
 *
 * Layout principal del panel unificado de administración y moderación.
 * Estructura:
 *   [Sidebar] | [Header + <Outlet> con Suspense]
 *
 * - El sidebar es adaptativo según los roles del usuario
 * - El Outlet carga páginas lazy con fallback de skeleton
 * - Un ErrorBoundary granular envuelve el contenido principal
 */
import React, { Suspense, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { BackofficeSidebar } from './BackofficeSidebar';
import { BackofficeHeader } from './BackofficeHeader';
import { BackofficePageSkeleton } from './BackofficePageSkeleton';

class BackofficeErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full p-8 text-center">
          <div className="text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-foreground mb-2">
            Algo salió mal en esta sección
          </h2>
          <p className="text-sm text-muted-foreground mb-4 max-w-md">
            {this.state.error?.message ?? 'Error desconocido'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export const BackofficeLayout: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar adaptativo */}
      <BackofficeSidebar
        collapsed={sidebarCollapsed}
        onCollapse={setSidebarCollapsed}
      />

      {/* Área principal */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        <BackofficeHeader />

        {/* Contenido de la página con Suspense + ErrorBoundary */}
        <main className="flex-1 overflow-y-auto">
          <BackofficeErrorBoundary>
            <Suspense fallback={<BackofficePageSkeleton />}>
              <Outlet />
            </Suspense>
          </BackofficeErrorBoundary>
        </main>
      </div>
    </div>
  );
};
