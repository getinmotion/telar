import { telarApi } from '@/integrations/api/telarApi';

export interface GmvChannelRow {
  channel: 'marketplace' | 'tenant';
  orderCount: number;
  gmvMinor: number;
  netMinor: number;
  avgTicketMinor: number;
}

export interface GmvWeekRow {
  week: string;
  gmvMinor: number;
  orderCount: number;
}

export interface TopShopRow {
  shopId: string;
  shopName: string;
  shopSlug: string;
  saleContext: string;
  orderCount: number;
  gmvMinor: number;
}

export interface GmvRegionRow {
  region: string;
  orderCount: number;
  gmvMinor: number;
}

export interface ComercialStats {
  gmvByChannel: GmvChannelRow[];
  gmvTotal: number;
  gmvMarketplace: number;
  gmvTenant: number;
  orderCountTotal: number;
  avgTicketMinor: number;
  activeShopLast30d: number;
  repeatBuyers: number;
  totalBuyers: number;
  repeatBuyerRate: number;
  gmvByWeek: GmvWeekRow[];
  topShops: TopShopRow[];
  gmvByRegion: GmvRegionRow[];
}

export async function getComercialStats(): Promise<ComercialStats> {
  const { data } = await telarApi.get<ComercialStats>('/admin-stats/comercial');
  return data;
}
