import { useLocation } from 'react-router-dom';

const WIZARD_ROUTE_PREFIXES = [
  '/productos/subir',
  '/dashboard/artisan-profile',
  '/dashboard/brand-wizard',
  '/config-wizards/',
];

export const useIsWizardRoute = (): boolean => {
  const { pathname } = useLocation();
  return WIZARD_ROUTE_PREFIXES.some(prefix => pathname.startsWith(prefix));
};
