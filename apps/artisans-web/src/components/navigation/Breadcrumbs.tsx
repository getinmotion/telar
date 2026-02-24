import React from 'react';
import { ChevronRight, Home } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path?: string;
}

interface BreadcrumbsProps {
  items?: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ items, className = '' }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // Auto-generate breadcrumbs from URL if not provided
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { label: 'Inicio', path: '/' }
    ];

    // Build breadcrumbs from path segments
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      // Convert segment to readable label
      let label = segment.replace(/-/g, ' ');
      label = label.charAt(0).toUpperCase() + label.slice(1);
      
      // Custom labels for known paths
      const customLabels: Record<string, string> = {
        'productos': 'Productos',
        'tienda': 'Tiendas',
        'crear-tienda': 'Crear Tienda',
        'dashboard': 'Panel',
        'checkout': 'Finalizar Compra',
        'mi-tienda': 'Mi Tienda',
        'subir-productos': 'Subir Productos',
      };

      label = customLabels[segment] || label;

      breadcrumbs.push({
        label,
        path: index === pathSegments.length - 1 ? undefined : currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items || generateBreadcrumbs();

  if (breadcrumbItems.length <= 1) {
    return null;
  }

  return (
    <nav className={`flex items-center space-x-1 text-sm text-muted-foreground ${className}`}>
      {breadcrumbItems.map((item, index) => (
        <div key={index} className="flex items-center">
          {index > 0 && (
            <ChevronRight className="h-4 w-4 mx-1" />
          )}
          
          {item.path ? (
            <button
              onClick={() => navigate(item.path!)}
              className="flex items-center hover:text-primary transition-colors story-link"
            >
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {item.label}
            </button>
          ) : (
            <span className="flex items-center text-foreground font-medium">
              {index === 0 && <Home className="h-4 w-4 mr-1" />}
              {item.label}
            </span>
          )}
        </div>
      ))}
    </nav>
  );
};