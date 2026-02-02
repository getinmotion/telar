import React from 'react';
import { LazyImage } from './LazyImage';

interface Category {
  id: string;
  name: string;
  image: string;
  productCount: number;
}

interface CategoriesSectionProps {
  categories: Category[];
  onCategoryClick?: (categoryId: string) => void;
}

export const CategoriesSection: React.FC<CategoriesSectionProps> = ({ 
  categories, 
  onCategoryClick 
}) => {
  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {categories.map((category) => (
            <div
              key={category.id}
              className="group cursor-pointer"
              onClick={() => onCategoryClick?.(category.id)}
            >
              <div className="aspect-[4/3] overflow-hidden rounded-lg bg-muted">
                <LazyImage
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="mt-4 text-center">
                <h3 className="text-lg font-medium text-foreground group-hover:text-primary transition-colors">
                  {category.name}
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {category.productCount} productos
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};