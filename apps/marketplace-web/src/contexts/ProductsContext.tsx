import { createContext, useContext, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import * as ProductsActions from '@/services/products.actions';
import type {
  Product,
  ProductsResponse,
  ProductsFilters,
  CreateProductRequest,
  UpdateProductRequest,
} from '@/types/products.types';

interface ProductsContextType {
  products: Product[];
  currentProduct: Product | null;
  loading: boolean;
  total: number;
  page: number;
  limit: number;
  fetchProducts: (filters?: ProductsFilters) => Promise<void>;
  fetchProductById: (id: string) => Promise<Product | null>;
  fetchActiveProducts: () => Promise<void>;
  fetchFeaturedProducts: () => Promise<void>;
  fetchProductsByShop: (shopId: string) => Promise<void>;
  fetchProductsByUser: (userId: string) => Promise<void>;
  createProduct: (data: CreateProductRequest) => Promise<Product | null>;
  updateProduct: (id: string, data: UpdateProductRequest) => Promise<Product | null>;
  deleteProduct: (id: string) => Promise<boolean>;
  clearCurrentProduct: () => void;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export const ProductsProvider = ({ children }: { children: ReactNode }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [currentProduct, setCurrentProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);

  const fetchProducts = async (filters?: ProductsFilters) => {
    setLoading(true);
    try {
      const response: ProductsResponse = await ProductsActions.getProducts(filters);
      setProducts(response.data);
      setTotal(response.total);
      setPage(response.page);
      setLimit(response.limit);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar los productos';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (id: string): Promise<Product | null> => {
    setLoading(true);
    try {
      const product = await ProductsActions.getProductById(id);
      setCurrentProduct(product);
      return product;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar el producto';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const fetchActiveProducts = async () => {
    setLoading(true);
    try {
      const activeProducts = await ProductsActions.getActiveProducts();
      setProducts(activeProducts.data);
      setTotal(activeProducts.total);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar productos activos';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    setLoading(true);
    try {
      const featuredProducts = await ProductsActions.getFeaturedProducts();
      setProducts(featuredProducts);
      setTotal(featuredProducts.length);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar productos destacados';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByShop = async (shopId: string) => {
    setLoading(true);
    try {
      const shopProducts = await ProductsActions.getProductsByShop(shopId);
      setProducts(shopProducts);
      setTotal(shopProducts.length);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar productos de la tienda';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const fetchProductsByUser = async (userId: string) => {
    setLoading(true);
    try {
      const userProducts = await ProductsActions.getProductsByUser(userId);
      setProducts(userProducts);
      setTotal(userProducts.length);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al cargar tus productos';
      toast.error(errorMessage);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (
    data: CreateProductRequest
  ): Promise<Product | null> => {
    setLoading(true);
    try {
      const newProduct = await ProductsActions.createProduct(data);
      setProducts([newProduct, ...products]);
      setTotal(total + 1);
      toast.success('Producto creado exitosamente');
      return newProduct;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al crear el producto';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    id: string,
    data: UpdateProductRequest
  ): Promise<Product | null> => {
    setLoading(true);
    try {
      const updatedProduct = await ProductsActions.updateProduct(id, data);
      setProducts(
        products.map((p) => (p.id === id ? updatedProduct : p))
      );
      if (currentProduct?.id === id) {
        setCurrentProduct(updatedProduct);
      }
      toast.success('Producto actualizado exitosamente');
      return updatedProduct;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al actualizar el producto';
      toast.error(errorMessage);
      return null;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setLoading(true);
    try {
      const result = await ProductsActions.deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      setTotal(total - 1);
      if (currentProduct?.id === id) {
        setCurrentProduct(null);
      }
      toast.success(result.message || 'Producto eliminado exitosamente');
      return true;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message || 'Error al eliminar el producto';
      toast.error(errorMessage);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearCurrentProduct = () => {
    setCurrentProduct(null);
  };

  return (
    <ProductsContext.Provider
      value={{
        products,
        currentProduct,
        loading,
        total,
        page,
        limit,
        fetchProducts,
        fetchProductById,
        fetchActiveProducts,
        fetchFeaturedProducts,
        fetchProductsByShop,
        fetchProductsByUser,
        createProduct,
        updateProduct,
        deleteProduct,
        clearCurrentProduct,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
};

export const useProducts = () => {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts debe usarse dentro de ProductsProvider');
  }
  return context;
};
