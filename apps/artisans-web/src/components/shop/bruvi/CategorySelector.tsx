import React from 'react';
import { motion } from 'framer-motion';

interface Category {
  name: string;
  icon: string;
  count: number;
}

interface CategorySelectorProps {
  categories: Category[];
  onCategoryClick: (category: string) => void;
}

const categoryIcons: Record<string, string> = {
  'ceramica': '🏺',
  'ceramics': '🏺',
  'tejeduria': '🧵',
  'textiles': '🧵',
  'cesteria': '🧺',
  'basketry': '🧺',
  'madera': '🪵',
  'woodwork': '🪵',
  'joyeria': '💍',
  'jewelry': '💍',
  'cuero': '👜',
  'leather': '👜',
  'metalurgia': '⚒️',
  'metalwork': '⚒️',
  'vidrio': '🔮',
  'glasswork': '🔮',
  'pintura': '🎨',
  'painting': '🎨',
  'escultura': '🗿',
  'sculpture': '🗿',
  'papel': '📜',
  'paper': '📜',
  'default': '✨'
};

const getCategoryIcon = (category: string): string => {
  const normalizedCategory = category.toLowerCase().replace(/[- ]/g, '');
  return categoryIcons[normalizedCategory] || categoryIcons['default'];
};

export const CategorySelector: React.FC<CategorySelectorProps> = ({
  categories,
  onCategoryClick
}) => {
  if (categories.length === 0) return null;

  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-10"
        >
          <h2 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-4">
            Explora por tipo de pieza
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Cada categoría representa una tradición artesanal única
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 max-w-4xl mx-auto">
          {categories.slice(0, 4).map((category, index) => (
            <motion.button
              key={category.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              onClick={() => onCategoryClick(category.name)}
              className="group relative bg-card rounded-2xl p-6 shadow-card hover:shadow-hover transition-all duration-300 border border-border/50"
            >
              <div className="flex flex-col items-center gap-4">
                <span className="text-5xl group-hover:scale-110 transition-transform duration-300">
                  {getCategoryIcon(category.name)}
                </span>
                <div className="text-center">
                  <h3 className="font-semibold text-foreground capitalize">
                    {category.name.replace(/-/g, ' ')}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {category.count} {category.count === 1 ? 'pieza' : 'piezas'}
                  </p>
                </div>
              </div>
              
              {/* Hover indicator */}
              <div className="absolute inset-x-0 bottom-0 h-1 bg-primary scale-x-0 group-hover:scale-x-100 transition-transform duration-300 rounded-b-2xl" />
            </motion.button>
          ))}
        </div>
      </div>
    </section>
  );
};
