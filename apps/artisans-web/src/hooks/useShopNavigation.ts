import { useNavigate } from 'react-router-dom';
import { useMasterAgent } from '@/context/MasterAgentContext';

/**
 * Hook centralizado para navegación de tienda
 * Determina si el usuario tiene tienda y proporciona rutas/textos dinámicos
 */
export const useShopNavigation = () => {
  const { masterState } = useMasterAgent();
  const navigate = useNavigate();
  
  const hasShop = masterState.tienda.has_shop;
  
  return {
    hasShop,
    shopRoute: hasShop ? '/mi-tienda' : '/dashboard/create-shop',
    shopButtonText: hasShop ? 'Mi Tienda' : 'Crear Tienda',
    shopButtonTextLong: hasShop ? 'Ver Mi Tienda' : 'Crear Tienda Digital',
    shopButtonVariant: hasShop ? 'ghost' as const : 'default' as const,
    navigateToShop: () => navigate(hasShop ? '/mi-tienda' : '/dashboard/create-shop'),
  };
};
