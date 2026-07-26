import { useMemo, useState } from 'react';

/**
 * Forma mínima que el rail de tiendas (Product Studio / Store Studio) necesita.
 * Tanto StudioShop como ModerationShop la satisfacen estructuralmente.
 */
export interface RailShop {
  id: string;
  shopName: string;
  logoUrl: string | null;
  region: string | null;
  craftType: string | null;
  agreementName: string | null;
  marketplaceApproved: boolean | null;
  createdAt: string;
  healthScore?: number;
}

export type ShopStatusFilter = 'all' | 'approved' | 'pending';
export type ShopSort = 'az' | 'za' | 'recent' | 'health';

export interface ShopRailController<T extends RailShop> {
  search: string;            setSearch: (v: string) => void;
  statusFilter: ShopStatusFilter; setStatusFilter: (v: ShopStatusFilter) => void;
  regionFilter: string;      setRegionFilter: (v: string) => void;
  craftFilter: string;       setCraftFilter: (v: string) => void;
  agreementFilter: string;   setAgreementFilter: (v: string) => void;
  sort: ShopSort;            setSort: (v: ShopSort) => void;
  filteredShops: T[];
  regionOptions: string[];
  craftOptions: string[];
  agreementOptions: string[];
  stats: { total: number; approved: number; pending: number };
}

/**
 * Estado + lógica de filtrado/orden compartida por los rails de Studio.
 * Mantiene consistentes los filtros (estado, región, oficio, convenio, orden)
 * y la información entre Product Studio y Store Studio.
 */
export function useShopRailFilters<T extends RailShop>(shops: T[]): ShopRailController<T> {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ShopStatusFilter>('all');
  const [regionFilter, setRegionFilter] = useState('all');
  const [craftFilter, setCraftFilter] = useState('all');
  const [agreementFilter, setAgreementFilter] = useState('all');
  const [sort, setSort] = useState<ShopSort>('az');

  const regionOptions = useMemo(
    () => [...new Set(shops.map((s) => s.region).filter(Boolean) as string[])].sort(),
    [shops],
  );
  const craftOptions = useMemo(
    () => [...new Set(shops.map((s) => s.craftType).filter(Boolean) as string[])].sort(),
    [shops],
  );
  const agreementOptions = useMemo(
    () => [...new Set(shops.map((s) => s.agreementName).filter(Boolean) as string[])].sort(),
    [shops],
  );

  const filteredShops = useMemo(() => {
    const q = search.toLowerCase().trim();
    const list = shops.filter((s) => {
      if (statusFilter === 'approved' && !s.marketplaceApproved) return false;
      if (statusFilter === 'pending' && s.marketplaceApproved) return false;
      if (regionFilter !== 'all' && s.region !== regionFilter) return false;
      if (craftFilter !== 'all' && s.craftType !== craftFilter) return false;
      if (agreementFilter !== 'all' && s.agreementName !== agreementFilter) return false;
      if (q) {
        return (
          s.shopName.toLowerCase().includes(q) ||
          (s.region ?? '').toLowerCase().includes(q) ||
          (s.craftType ?? '').toLowerCase().includes(q) ||
          (s.agreementName ?? '').toLowerCase().includes(q)
        );
      }
      return true;
    });
    return [...list].sort((a, b) => {
      if (sort === 'az') return a.shopName.localeCompare(b.shopName);
      if (sort === 'za') return b.shopName.localeCompare(a.shopName);
      if (sort === 'recent') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (sort === 'health') return (b.healthScore ?? 0) - (a.healthScore ?? 0);
      return 0;
    });
  }, [shops, search, statusFilter, regionFilter, craftFilter, agreementFilter, sort]);

  const stats = useMemo(
    () => ({
      total: shops.length,
      approved: shops.filter((s) => s.marketplaceApproved).length,
      pending: shops.filter((s) => !s.marketplaceApproved).length,
    }),
    [shops],
  );

  return {
    search, setSearch,
    statusFilter, setStatusFilter,
    regionFilter, setRegionFilter,
    craftFilter, setCraftFilter,
    agreementFilter, setAgreementFilter,
    sort, setSort,
    filteredShops, regionOptions, craftOptions, agreementOptions, stats,
  };
}
