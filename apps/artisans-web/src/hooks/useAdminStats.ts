import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { isPickupOrder, isGiftCardPayment, getRealRevenueFromOrder } from '@/utils/orderHelpers';

export interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  payment_status: string | null;
  fulfillment_status: string | null;
  created_at: string;
  shop_name?: string;
}

export interface RecentTransaction {
  id: string;
  reference: string;
  type: 'order' | 'gift_card';
  customer_name: string;
  customer_email: string;
  total: number;
  status: string;
  created_at: string;
  details: string;
  isPickup?: boolean;
  // Discriminated payment info
  paymentMethod?: string;
  shippingCost?: number;
  giftCardUsed?: boolean;
  giftCardAmount?: number;
  realMoneyAmount?: number;
}

export interface CobreBalance {
  available: number;
  pending: number;
  currency: string;
  lastUpdated?: string;
}

export interface ShopStats {
  total: number;
  active: number;
  inactive: number;
  published: number;
  pendingPublish: number;
  marketplaceApproved: number;
  marketplacePending: number;
  withBankData: number;
  withoutBankData: number;
}

export interface AdminStats {
  totalUsers: number;
  totalShops: number;
  totalProducts: number;
  totalOrders: number;
  pendingModeration: number;
  activeShops: number;
  publishedProducts: number;
  recentOrders: number;
  // Financial metrics
  totalRevenue: number;
  monthlyRevenue: number;
  avgOrderValue: number;
  pendingShipment: number;
  pendingPickup: number;
  unpaidOrders: number;
  // Discriminated revenue
  giftCardRevenue: number;
  realMoneyRevenue: number;
  monthlyGiftCardRevenue: number;
  monthlyRealMoneyRevenue: number;
  // Recent orders list
  recentOrdersList: RecentOrder[];
  // Recent transactions (orders + gift cards)
  recentTransactions: RecentTransaction[];
  // Alerts
  overdueOrders: number;
  expiringCoupons: number;
  // Cobre balance
  cobreBalance?: CobreBalance;
  // Shop breakdown
  shopStats: ShopStats;
}

const fetchAdminStats = async (): Promise<AdminStats> => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const sevenDaysFromNow = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();

  // Log all Supabase queries (executed before Promise.all for proper tracking)
  
  const [
    usersResult,
    shopsResult,
    productsResult,
    ordersResult,
    pendingModerationResult,
    activeShopsResult,
    publishedProductsResult,
    recentOrdersCountResult,
    // Financial queries
    allOrdersForRevenue,
    monthlyOrdersResult,
    pendingShipmentResult,
    unpaidOrdersResult,
    // Recent orders list
    recentOrdersListResult,
    // Alerts
    overdueOrdersResult,
    expiringCouponsResult,
    // Gift cards
    giftCardsResult,
    monthlyGiftCardsResult,
    // Shop breakdown - get all shops with relevant fields
    allShopsResult
  ] = await Promise.all([
    // TODO: Crear endpoint para conteo de user_profiles en NestJS
    supabase.from('user_profiles').select('*', { count: 'exact', head: true }),
    supabase.from('artisan_shops').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase.from('orders').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('moderation_status', 'pending_moderation'),
    supabase.from('artisan_shops').select('*', { count: 'exact', head: true }).eq('active', true),
    supabase.from('products').select('*', { count: 'exact', head: true }).eq('moderation_status', 'approved'),
    supabase.from('orders').select('*', { count: 'exact', head: true }).gte('created_at', sevenDaysAgo),
    // Get all orders for total revenue - include payment_method, notes, shipping_cost
    supabase.from('orders').select('total, payment_status, payment_method, notes, shipping_cost'),
    // Get monthly orders for revenue
    supabase.from('orders').select('total, payment_status, payment_method, notes, shipping_cost').gte('created_at', startOfMonth),
    // Pending fulfillment - get full data to filter pickup vs shipping
    supabase.from('orders').select('id, fulfillment_status, shipping_address, shipping_cost').or('fulfillment_status.is.null,fulfillment_status.eq.pending,fulfillment_status.eq.unfulfilled'),
    // Unpaid orders
    supabase.from('orders').select('*', { count: 'exact', head: true }).or('payment_status.is.null,payment_status.eq.pending,payment_status.eq.unpaid'),
    // Recent orders list - fetch separately to avoid join issues
    supabase.from('orders')
      .select('id, order_number, customer_name, customer_email, total, status, payment_status, payment_method, fulfillment_status, created_at, shop_id, shipping_address, shipping_cost, notes')
      .order('created_at', { ascending: false })
      .limit(10),
    // Overdue orders (pending > 3 days)
    supabase.from('orders')
      .select('*', { count: 'exact', head: true })
      .lt('created_at', threeDaysAgo)
      .or('fulfillment_status.is.null,fulfillment_status.eq.pending,fulfillment_status.eq.unfulfilled'),
    // Expiring coupons (within 7 days)
    supabase.from('coupons')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .lte('end_date', sevenDaysFromNow)
      .gte('end_date', now.toISOString()),
    // Gift cards sold (all time) - include more fields for transactions list
    supabase.from('gift_cards').select('id, code, initial_amount, created_at, purchaser_email, status'),
    // Gift cards sold this month
    supabase.from('gift_cards').select('initial_amount').gte('created_at', startOfMonth),
    // All shops for detailed breakdown
    supabase.from('artisan_shops').select('active, publish_status, marketplace_approval_status, bank_data_status')
  ]);

  // Fetch shop names separately to avoid join issues
  const ordersData = recentOrdersListResult.data || [];
  const shopIds = [...new Set(ordersData.map((o: any) => o.shop_id).filter(Boolean))];

  let shopMap = new Map<string, string>();
  if (shopIds.length > 0) {
    const { data: shops } = await supabase
      .from('artisan_shops')
      .select('id, shop_name')
      .in('id', shopIds);

    if (shops) {
      shopMap = new Map(shops.map((s: any) => [s.id, s.shop_name]));
    }
  }

  // Calculate financial metrics with proper gift card logic
  const allOrders = allOrdersForRevenue.data || [];
  const allGiftCards = giftCardsResult.data || [];

  // Gift cards vendidas = ingreso real (inicial)
  const giftCardRevenue = allGiftCards.reduce((sum, gc) => sum + (gc.initial_amount || 0), 0);

  // Para órdenes: solo contar dinero real, NO lo pagado con gift cards
  const paidOrders = allOrders.filter(o => o.payment_status === 'paid' || o.payment_status === 'completed');
  const realMoneyRevenue = paidOrders.reduce((sum, order) => {
    // Si pagó 100% con gift card, no sumar nada (ya se contó en la venta de la gift card)
    if (order.payment_method === 'gift_card') return sum;

    // Si pagó con credit_card pero usó gift card parcialmente (notas mencionan gift card)
    // Solo sumar el shipping que se pagó con dinero real
    const notes = (order.notes || '').toLowerCase();
    if (notes.includes('gift card') || notes.includes('giftcard')) {
      return sum + (order.shipping_cost || 0);
    }

    // Orden normal sin gift card - sumar el total
    return sum + (order.total || 0);
  }, 0);

  // Total revenue = gift cards vendidas + pagos reales de órdenes
  const totalRevenue = giftCardRevenue + realMoneyRevenue;

  // Monthly calculations with same logic
  const monthlyOrders = monthlyOrdersResult.data || [];
  const monthlyGiftCards = monthlyGiftCardsResult.data || [];
  const monthlyGiftCardRevenue = monthlyGiftCards.reduce((sum, gc) => sum + (gc.initial_amount || 0), 0);
  const monthlyRealMoneyRevenue = monthlyOrders
    .filter(o => o.payment_status === 'paid' || o.payment_status === 'completed')
    .reduce((sum, order) => {
      if (order.payment_method === 'gift_card') return sum;
      const notes = (order.notes || '').toLowerCase();
      if (notes.includes('gift card') || notes.includes('giftcard')) {
        return sum + (order.shipping_cost || 0);
      }
      return sum + (order.total || 0);
    }, 0);
  const monthlyRevenue = monthlyGiftCardRevenue + monthlyRealMoneyRevenue;

  // Total transactions for avg calculation (only count real paid transactions)
  const paidOrdersCount = paidOrders.filter(o => o.payment_method !== 'gift_card').length;
  const totalTransactions = paidOrdersCount + allGiftCards.length;
  const avgOrderValue = totalTransactions > 0
    ? totalRevenue / totalTransactions
    : 0;

  // Use shared isPickupOrder helper from orderHelpers.ts

  // Calculate pending shipment vs pending pickup from full data
  const pendingFulfillmentData = pendingShipmentResult.data || [];
  const pendingShipment = pendingFulfillmentData.filter(order => !isPickupOrder(order)).length;
  const pendingPickup = pendingFulfillmentData.filter(order => isPickupOrder(order)).length;

  // Process recent orders list with shop names from separate query
  const recentOrdersList: RecentOrder[] = ordersData.map((order: any) => ({
    id: order.id,
    order_number: order.order_number,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    total: order.total,
    status: order.status,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    created_at: order.created_at,
    shop_name: shopMap.get(order.shop_id) || 'Sin tienda'
  }));

  // Create unified transactions list (orders + gift cards)
  const recentTransactions: RecentTransaction[] = [
    ...ordersData.map((order: any) => {
      const notes = (order.notes || '').toLowerCase();
      const usedGiftCard = notes.includes('gift card') || notes.includes('giftcard') || order.payment_method === 'gift_card';

      // Calculate discriminated amounts
      let giftCardAmount = 0;
      let realMoneyAmount = 0;

      if (order.payment_method === 'gift_card') {
        // 100% gift card payment
        giftCardAmount = order.total;
        realMoneyAmount = 0;
      } else if (usedGiftCard) {
        // Partial gift card - real money is only shipping
        giftCardAmount = order.total - (order.shipping_cost || 0);
        realMoneyAmount = order.shipping_cost || 0;
      } else {
        // No gift card used
        giftCardAmount = 0;
        realMoneyAmount = order.total;
      }

      return {
        id: order.id,
        reference: order.order_number,
        type: 'order' as const,
        customer_name: order.customer_name,
        customer_email: order.customer_email,
        total: order.total,
        status: order.fulfillment_status || order.status || 'pending',
        created_at: order.created_at,
        details: shopMap.get(order.shop_id) || 'Sin tienda',
        isPickup: isPickupOrder(order),
        paymentMethod: order.payment_method,
        shippingCost: order.shipping_cost || 0,
        giftCardUsed: usedGiftCard,
        giftCardAmount,
        realMoneyAmount
      };
    }),
    ...allGiftCards.map((gc: any) => ({
      id: gc.id,
      reference: gc.code,
      type: 'gift_card' as const,
      customer_name: 'Gift Card',
      customer_email: gc.purchaser_email,
      total: gc.initial_amount,
      status: gc.status || 'active',
      created_at: gc.created_at,
      details: 'Gift Card',
      isPickup: false,
      paymentMethod: 'gift_card_sale',
      shippingCost: 0,
      giftCardUsed: false,
      giftCardAmount: 0,
      realMoneyAmount: gc.initial_amount // Gift card sale is real money income
    }))
  ].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    .slice(0, 10);

  // Calculate shop stats breakdown
  const allShops = allShopsResult.data || [];
  const shopStats: ShopStats = {
    total: allShops.length,
    active: allShops.filter(s => s.active === true).length,
    inactive: allShops.filter(s => s.active === false).length,
    published: allShops.filter(s => s.publish_status === 'published').length,
    pendingPublish: allShops.filter(s => s.publish_status === 'pending_publish' || !s.publish_status).length,
    marketplaceApproved: allShops.filter(s => s.marketplace_approval_status === 'approved').length,
    marketplacePending: allShops.filter(s => s.marketplace_approval_status === 'pending').length,
    withBankData: allShops.filter(s => s.bank_data_status === 'verified' || s.bank_data_status === 'pending').length,
    withoutBankData: allShops.filter(s => !s.bank_data_status || s.bank_data_status === 'missing').length,
  };

  // Fetch Cobre balance (don't fail if it errors)
  let cobreBalance: CobreBalance | undefined;
  try {
    const { data: session } = await supabase.auth.getSession();
    if (session?.session?.access_token) {
      const balanceResponse = await supabase.functions.invoke('get-cobre-balance', {
        headers: {
          Authorization: `Bearer ${session.session.access_token}`
        }
      });

      if (balanceResponse.data?.success && balanceResponse.data?.balance) {
        cobreBalance = {
          available: balanceResponse.data.balance.available,
          pending: balanceResponse.data.balance.pending,
          currency: (balanceResponse.data.balance.currency || 'COP').toUpperCase(),
          lastUpdated: balanceResponse.data.balance.lastUpdated
        };
      }
    }
  } catch (e) {
    console.warn('Could not fetch Cobre balance:', e);
  }

  return {
    totalUsers: usersResult.count || 0,
    totalShops: shopsResult.count || 0,
    totalProducts: productsResult.count || 0,
    totalOrders: (ordersResult.count || 0) + allGiftCards.length,
    pendingModeration: pendingModerationResult.count || 0,
    activeShops: activeShopsResult.count || 0,
    publishedProducts: publishedProductsResult.count || 0,
    recentOrders: recentOrdersCountResult.count || 0,
    // Financial
    totalRevenue,
    monthlyRevenue,
    avgOrderValue: Math.round(avgOrderValue),
    pendingShipment,
    pendingPickup,
    unpaidOrders: unpaidOrdersResult.count || 0,
    // Discriminated revenue
    giftCardRevenue,
    realMoneyRevenue,
    monthlyGiftCardRevenue,
    monthlyRealMoneyRevenue,
    // Orders list
    recentOrdersList,
    // Transactions list (orders + gift cards)
    recentTransactions,
    // Alerts
    overdueOrders: overdueOrdersResult.count || 0,
    expiringCoupons: expiringCouponsResult.count || 0,
    // Cobre balance
    cobreBalance,
    // Shop breakdown
    shopStats
  };
};

export const useAdminStats = () => {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['admin-stats'],
    queryFn: fetchAdminStats,
    staleTime: 30000, // 30 seconds
    refetchOnWindowFocus: true,
    refetchInterval: 60000, // 1 minute auto-refresh
  });

  // Realtime subscriptions for products and orders
  useEffect(() => {
    const productsChannel = supabase
      .channel('admin-products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    const ordersChannel = supabase
      .channel('admin-orders-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    const shopsChannel = supabase
      .channel('admin-shops-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'artisan_shops' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(productsChannel);
      supabase.removeChannel(ordersChannel);
      supabase.removeChannel(shopsChannel);
    };
  }, [queryClient]);

  return {
    stats: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
    dataUpdatedAt: query.dataUpdatedAt,
    isFetching: query.isFetching
  };
};
