import { Injectable, Inject } from '@nestjs/common';
import { DataSource } from 'typeorm';

export interface ComercialStats {
  gmvByChannel: {
    channel: 'marketplace' | 'tenant';
    orderCount: number;
    gmvMinor: number;
    netMinor: number;
    avgTicketMinor: number;
  }[];
  gmvTotal: number;
  gmvMarketplace: number;
  gmvTenant: number;
  orderCountTotal: number;
  avgTicketMinor: number;
  activeShopLast30d: number;
  repeatBuyers: number;
  totalBuyers: number;
  repeatBuyerRate: number;
  gmvByWeek: {
    week: string;
    gmvMinor: number;
    orderCount: number;
  }[];
  topShops: {
    shopId: string;
    shopName: string;
    shopSlug: string;
    saleContext: string;
    orderCount: number;
    gmvMinor: number;
  }[];
  gmvByRegion: {
    region: string;
    orderCount: number;
    gmvMinor: number;
  }[];
}

@Injectable()
export class AdminStatsService {
  constructor(
    @Inject('DATA_SOURCE')
    private readonly dataSource: DataSource,
  ) {}

  async getComercialStats(): Promise<ComercialStats> {
    const [
      channelRows,
      weekRows,
      shopRows,
      regionRows,
      activeShopRow,
      buyerRows,
    ] = await Promise.all([
      this.dataSource.query<any[]>(`
        SELECT
          c.context,
          COUNT(DISTINCT o.id)::int AS order_count,
          COALESCE(SUM(CAST(o.gross_subtotal_minor AS BIGINT)), 0) AS gmv_minor,
          COALESCE(SUM(CAST(o.net_to_seller_minor AS BIGINT)), 0)  AS net_minor
        FROM payments.orders o
        JOIN payments.checkouts c ON c.id = o.checkout_id
        WHERE o.status != 'canceled'
        GROUP BY c.context
      `),
      this.dataSource.query<any[]>(`
        SELECT
          DATE_TRUNC('week', o.created_at) AS week,
          COUNT(DISTINCT o.id)::int        AS order_count,
          COALESCE(SUM(CAST(o.gross_subtotal_minor AS BIGINT)), 0) AS gmv_minor
        FROM payments.orders o
        WHERE o.status != 'canceled'
          AND o.created_at >= NOW() - INTERVAL '8 weeks'
        GROUP BY DATE_TRUNC('week', o.created_at)
        ORDER BY week ASC
      `),
      this.dataSource.query<any[]>(`
        SELECT
          s.id          AS shop_id,
          s.shop_name,
          s.shop_slug,
          c.context     AS sale_context,
          COUNT(DISTINCT o.id)::int AS order_count,
          COALESCE(SUM(CAST(o.gross_subtotal_minor AS BIGINT)), 0) AS gmv_minor
        FROM payments.orders o
        JOIN shop.artisan_shops s  ON s.id = o.seller_shop_id
        JOIN payments.checkouts c  ON c.id = o.checkout_id
        WHERE o.status != 'canceled'
        GROUP BY s.id, s.shop_name, s.shop_slug, c.context
        ORDER BY gmv_minor DESC
        LIMIT 20
      `),
      this.dataSource.query<any[]>(`
        SELECT
          COALESCE(s.region, 'Sin región') AS region,
          COUNT(DISTINCT o.id)::int        AS order_count,
          COALESCE(SUM(CAST(o.gross_subtotal_minor AS BIGINT)), 0) AS gmv_minor
        FROM payments.orders o
        JOIN shop.artisan_shops s ON s.id = o.seller_shop_id
        WHERE o.status != 'canceled'
        GROUP BY COALESCE(s.region, 'Sin región')
        ORDER BY gmv_minor DESC
        LIMIT 20
      `),
      this.dataSource.query<any[]>(`
        SELECT COUNT(DISTINCT o.seller_shop_id)::int AS count
        FROM payments.orders o
        WHERE o.status != 'canceled'
          AND o.created_at >= NOW() - INTERVAL '30 days'
      `),
      this.dataSource.query<any[]>(`
        SELECT
          COUNT(*) FILTER (WHERE order_count > 1)::int AS repeat_buyers,
          COUNT(*)::int                                 AS total_buyers
        FROM (
          SELECT c.buyer_user_id, COUNT(DISTINCT o.id) AS order_count
          FROM payments.orders o
          JOIN payments.checkouts c ON c.id = o.checkout_id
          WHERE o.status != 'canceled'
          GROUP BY c.buyer_user_id
        ) buyer_counts
      `),
    ]);

    const gmvByChannel = channelRows.map((r) => {
      const count = Number(r.order_count) || 0;
      const gmv = Number(r.gmv_minor) || 0;
      return {
        channel: r.context as 'marketplace' | 'tenant',
        orderCount: count,
        gmvMinor: gmv,
        netMinor: Number(r.net_minor) || 0,
        avgTicketMinor: count > 0 ? Math.round(gmv / count) : 0,
      };
    });

    const gmvTotal = gmvByChannel.reduce((s, r) => s + r.gmvMinor, 0);
    const orderCountTotal = gmvByChannel.reduce((s, r) => s + r.orderCount, 0);
    const gmvMarketplace = gmvByChannel.find((r) => r.channel === 'marketplace')?.gmvMinor ?? 0;
    const gmvTenant = gmvByChannel.find((r) => r.channel === 'tenant')?.gmvMinor ?? 0;
    const avgTicketMinor = orderCountTotal > 0 ? Math.round(gmvTotal / orderCountTotal) : 0;

    const activeShopLast30d = Number(activeShopRow[0]?.count) || 0;
    const repeatBuyers = Number(buyerRows[0]?.repeat_buyers) || 0;
    const totalBuyers = Number(buyerRows[0]?.total_buyers) || 0;
    const repeatBuyerRate = totalBuyers > 0 ? Math.round((repeatBuyers / totalBuyers) * 100) : 0;

    return {
      gmvByChannel,
      gmvTotal,
      gmvMarketplace,
      gmvTenant,
      orderCountTotal,
      avgTicketMinor,
      activeShopLast30d,
      repeatBuyers,
      totalBuyers,
      repeatBuyerRate,
      gmvByWeek: weekRows.map((r) => ({
        week: r.week,
        gmvMinor: Number(r.gmv_minor) || 0,
        orderCount: Number(r.order_count) || 0,
      })),
      topShops: shopRows.map((r) => ({
        shopId: r.shop_id,
        shopName: r.shop_name,
        shopSlug: r.shop_slug,
        saleContext: r.sale_context,
        orderCount: Number(r.order_count) || 0,
        gmvMinor: Number(r.gmv_minor) || 0,
      })),
      gmvByRegion: regionRows.map((r) => ({
        region: r.region,
        orderCount: Number(r.order_count) || 0,
        gmvMinor: Number(r.gmv_minor) || 0,
      })),
    };
  }
}
