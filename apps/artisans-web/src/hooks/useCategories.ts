import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductCategory } from '@/types/category';
import { useToast } from '@/hooks/use-toast';

export const useCategories = () => {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Build hierarchical structure
      const categoryMap = new Map<string, ProductCategory>();
      const rootCategories: ProductCategory[] = [];

      // First pass: create all categories
      data.forEach(category => {
        categoryMap.set(category.id, { ...category, children: [] });
      });

      // Second pass: build hierarchy
      data.forEach(category => {
        const cat = categoryMap.get(category.id)!;
        if (category.parent_id) {
          const parent = categoryMap.get(category.parent_id);
          if (parent) {
            parent.children!.push(cat);
            cat.parent = parent;
            cat.level = (parent.level || 0) + 1;
          }
        } else {
          cat.level = 0;
          rootCategories.push(cat);
        }
      });

      setCategories(rootCategories);
    } catch (err: any) {
      setError(err.message);
      console.error('Error fetching categories:', err);
      toast({
        title: "Error",
        description: "No se pudieron cargar las categorías.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryById = (id: string): ProductCategory | null => {
    const findCategory = (cats: ProductCategory[]): ProductCategory | null => {
      for (const cat of cats) {
        if (cat.id === id) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCategory(categories);
  };

  const getCategoryBySlug = (slug: string): ProductCategory | null => {
    const findCategory = (cats: ProductCategory[]): ProductCategory | null => {
      for (const cat of cats) {
        if (cat.slug === slug) return cat;
        if (cat.children) {
          const found = findCategory(cat.children);
          if (found) return found;
        }
      }
      return null;
    };
    return findCategory(categories);
  };

  const getAllCategories = (): ProductCategory[] => {
    const flatten = (cats: ProductCategory[]): ProductCategory[] => {
      let result: ProductCategory[] = [];
      cats.forEach(cat => {
        result.push(cat);
        if (cat.children) {
          result.push(...flatten(cat.children));
        }
      });
      return result;
    };
    return flatten(categories);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  return {
    categories,
    loading,
    error,
    getCategoryById,
    getCategoryBySlug,
    getAllCategories,
    refreshCategories: fetchCategories,
  };
};