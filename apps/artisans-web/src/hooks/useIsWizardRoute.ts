import { useLocation } from 'react-router-dom';

const WIZARD_ROUTE_PREFIXES = [
  '/productos/subir',
  '/productos/editar',
  '/dashboard/artisan-profile',
  // Con slash final: /mi-tienda/configurar exacto es el hub, no un wizard
  '/mi-tienda/configurar/',
  '/stock-wizard',
];

export const useIsWizardRoute = (): boolean => {
  const { pathname } = useLocation();
  return WIZARD_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));
};
