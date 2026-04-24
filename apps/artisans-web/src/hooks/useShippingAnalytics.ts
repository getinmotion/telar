import { useState, useCallback } from 'react';
import {
  getShopsWithPhysicalSpecs,
  quoteStandalone,
  type ShopPhysicalSpecsRow,
  type StandaloneQuoteParams,
  type StandaloneQuoteResponse,
} from '@/services/shipping.actions';

export interface ShopWithProducts {
  shopId: string;
  shopName: string;
  department: string;
  municipality: string;
  region: string;
  servientregaCoverage: boolean;
  products: ProductSpec[];
}

export interface ProductSpec {
  productId: string;
  productName: string;
  heightCm: number;
  widthCm: number;
  lengthCm: number;
  weightKg: number;
  priceCop: number;
}

function groupByShop(rows: ShopPhysicalSpecsRow[]): ShopWithProducts[] {
  const map = new Map<string, ShopWithProducts>();

  for (const row of rows) {
    if (!map.has(row.shop_id)) {
      map.set(row.shop_id, {
        shopId: row.shop_id,
        shopName: row.shop_name,
        department: row.department || '',
        municipality: row.municipality || '',
        region: row.region || '',
        servientregaCoverage: row.servientrega_coverage ?? false,
        products: [],
      });
    }

    if (row.product_id) {
      const priceCop = row.base_price_minor
        ? parseInt(row.base_price_minor, 10) / 100
        : 0;

      map.get(row.shop_id)!.products.push({
        productId: row.product_id,
        productName: row.product_name || 'Sin nombre',
        heightCm: row.height_cm ?? 0,
        widthCm: row.width_cm ?? 0,
        lengthCm: row.length_or_diameter_cm ?? 0,
        weightKg: row.real_weight_kg ?? 0,
        priceCop,
      });
    }
  }

  return Array.from(map.values());
}

/** Runs promises in batches of `size` */
async function batchPromises<T>(
  tasks: (() => Promise<T>)[],
  size: number,
  onProgress?: (completed: number, total: number) => void,
): Promise<T[]> {
  const results: T[] = [];
  for (let i = 0; i < tasks.length; i += size) {
    const batch = tasks.slice(i, i + size);
    const batchResults = await Promise.all(batch.map((fn) => fn()));
    results.push(...batchResults);
    onProgress?.(Math.min(i + size, tasks.length), tasks.length);
  }
  return results;
}

export const useShippingAnalytics = () => {
  const [shopsData, setShopsData] = useState<ShopWithProducts[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchShopsData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await getShopsWithPhysicalSpecs();
      setShopsData(groupByShop(rows));
    } catch (err: any) {
      setError(err.message || 'Error cargando datos');
    } finally {
      setLoading(false);
    }
  }, []);

  const quoteBox = useCallback(
    async (params: StandaloneQuoteParams): Promise<StandaloneQuoteResponse> => {
      return quoteStandalone(params);
    },
    [],
  );

  const quoteBulkForCity = useCallback(
    async (
      products: { piece: StandaloneQuoteParams }[],
      onProgress?: (completed: number, total: number) => void,
    ): Promise<StandaloneQuoteResponse[]> => {
      const tasks = products.map(
        ({ piece }) => () => quoteStandalone(piece),
      );
      return batchPromises(tasks, 5, onProgress);
    },
    [],
  );

  return {
    shopsData,
    loading,
    error,
    fetchShopsData,
    quoteBox,
    quoteBulkForCity,
  };
};
