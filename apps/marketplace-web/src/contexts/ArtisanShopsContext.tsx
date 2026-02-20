import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import * as ArtisanShopsActions from '@/services/artisan-shops.actions';
import type {
  ArtisanShop,
  ArtisanShopsResponse,
  ArtisanShopsFilters,
  CreateArtisanShopRequest,
  UpdateArtisanShopRequest,
} from '@/types/artisan-shops.types';

interface ArtisanShopsContextType {
  shops: ArtisanShop[];
  currentShop: ArtisanShop | null;
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  fetchShops: (filters?: ArtisanShopsFilters) => Promise<void>;
  fetchShopById: (id: string) => Promise<ArtisanShop | null>;
  fetchShopBySlug: (slug: string) => Promise<ArtisanShop | null>;
  fetchFeaturedShops: (limit?: number) => Promise<void>;
  fetchShopsByUser: (userId: string) => Promise<void>;
  createShop: (data: CreateArtisanShopRequest) => Promise<ArtisanShop | null>;
  updateShop: (id: string, data: UpdateArtisanShopRequest) => Promise<ArtisanShop | null>;
  deleteShop: (id: string) => Promise<boolean>;
  clearCurrentShop: () => void;
}

const ArtisanShopsContext = createContext<ArtisanShopsContextType | undefined>(undefined);

export const ArtisanShopsProvider = ({ children }: { children: ReactNode }) => {
  const [shops, setShops] = useState<ArtisanShop[]>([]);
  const [currentShop, setCurrentShop] = useState<ArtisanShop | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchShops = async (filters?: ArtisanShopsFilters) => {
    setLoading(true);
    try {
      const response: ArtisanShopsResponse = await ArtisanShopsActions.getArtisanShops(filters);
      setShops(response.data);
      setTotal(response.total);
      setPage(response.page);
      setLimit(response.limit);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar las tiendas';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchShopById = async (id: string): Promise<ArtisanShop | null> => {
    setLoading(true);
    try {
      const shop = await ArtisanShopsActions.getArtisanShopById(id);
      setCurrentShop(shop);
      return shop;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar la tienda';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchShopBySlug = async (slug: string): Promise<ArtisanShop | null> => {
    setLoading(true);
    try {
      const shop = await ArtisanShopsActions.getArtisanShopBySlug(slug);
      setCurrentShop(shop);
      return shop;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar la tienda';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedShops = async (limitParam: number = 8) => {
    setLoading(true);
    try {
      const featuredShops = await ArtisanShopsActions.getFeaturedShops(limitParam);
      setShops(featuredShops);
      setTotal(featuredShops.length);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar tiendas destacadas';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchShopsByUser = async (userId: string) => {
    setLoading(true);
    try {
      const userShops = await ArtisanShopsActions.getShopsByUser(userId);
      setShops(userShops);
      setTotal(userShops.length);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar tus tiendas';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createShop = async (
    data: CreateArtisanShopRequest
  ): Promise<ArtisanShop | null> => {
    setLoading(true);
    try {
      const newShop = await ArtisanShopsActions.createArtisanShop(data);
      setShops([newShop, ...shops]);
      setTotal(total + 1);
      toast.success('Tienda creada exitosamente');
      return newShop;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al crear la tienda';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateShop = async (
    id: string,
    data: UpdateArtisanShopRequest
  ): Promise<ArtisanShop | null> => {
    setLoading(true);
    try {
      const updatedShop = await ArtisanShopsActions.updateArtisanShop(id, data);
      setShops(
        shops.map((s) => (s.id === id ? updatedShop : s))
      );
      if (currentShop?.id === id) {
        setCurrentShop(updatedShop);
      }
      toast.success('Tienda actualizada exitosamente');
      return updatedShop;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar la tienda';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteShop = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await ArtisanShopsActions.deleteArtisanShop(id);
      setShops(shops.filter((s) => s.id !== id));
      setTotal(total - 1);
      if (currentShop?.id === id) {
        setCurrentShop(null);
      }
      toast.success(result.message || 'Tienda eliminada exitosamente');
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar la tienda';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentShop = () => {
    setCurrentShop(null);
  };

  return (
    <ArtisanShopsContext.Provider
      value={{
        shops,
        currentShop,
        loading,
        total,
        page,
        limit,
        fetchShops,
        fetchShopById,
        fetchShopBySlug,
        fetchFeaturedShops,
        fetchShopsByUser,
        createShop,
        updateShop,
        deleteShop,
        clearCurrentShop,
      }}
    >
      {children}
    </ArtisanShopsContext.Provider>
  );
};

export const useArtisanShops = () => {
  const context = useContext(ArtisanShopsContext);
  if (!context) {
    throw new Error('useArtisanShops debe usarse dentro de ArtisanShopsProvider');
  }
  return context;
};
