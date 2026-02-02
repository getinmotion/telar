
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface UltraCompactFiltersProps {
  selectedStatus: string;
  selectedCategories: string[];
  categories: string[];
  onUpdateFilter: (key: string, value: string) => void;
  onToggleCategory: (category: string) => void;
  language: 'en' | 'es';
}

export const UltraCompactFilters: React.FC<UltraCompactFiltersProps> = ({
  selectedStatus,
  selectedCategories,
  categories,
  onUpdateFilter,
  onToggleCategory,
  language
}) => {
  const translations = {
    en: {
      all: "All",
      active: "Active",
      inactive: "Inactive",
      categories: "Categories:"
    },
    es: {
      all: "Todos",
      active: "Activos",
      inactive: "Inactivos",
      categories: "Categorías:"
    }
  };

  const t = translations[language];

  const statusOptions = [
    { value: 'all', label: t.all },
    { value: 'active', label: t.active },
    { value: 'inactive', label: t.inactive }
  ];

  // Category translations
  const categoryTranslations = {
    en: {
      'Financiera': 'Financial',
      'Legal': 'Legal',
      'Diagnóstico': 'Diagnostic',
      'Comercial': 'Commercial',
      'Operativo': 'Operational',
      'Comunidad': 'Community'
    },
    es: {
      'Financiera': 'Financiera',
      'Legal': 'Legal',
      'Diagnóstico': 'Diagnóstico',
      'Comercial': 'Comercial',
      'Operativo': 'Operativo',
      'Comunidad': 'Comunidad',
      'Financial': 'Financiera',
      'Diagnostic': 'Diagnóstico',
      'Commercial': 'Comercial',
      'Operational': 'Operativo',
      'Community': 'Comunidad'
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-3 h-full">
      <div className="flex flex-col h-full">
        {/* Status Filters */}
        <div className="flex gap-1 mb-2">
          {statusOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedStatus === option.value ? "default" : "outline"}
              size="sm"
              onClick={() => onUpdateFilter('status', option.value)}
              className="text-xs px-2 py-1 h-auto"
            >
              {option.label}
            </Button>
          ))}
        </div>

        {/* Category Filters */}
        <div className="flex-1">
          <span className="text-xs font-medium text-white mb-1 block">{t.categories}</span>
          <div className="flex flex-wrap gap-1">
            {categories.map(category => {
              const translatedCategory = categoryTranslations[language][category as keyof typeof categoryTranslations[typeof language]] || category;
              return (
                <Badge
                  key={category}
                  variant={selectedCategories.includes(category) ? "default" : "outline"}
                  className={`cursor-pointer transition-all text-xs px-2 py-1 ${
                    selectedCategories.includes(category)
                      ? 'bg-purple-600 text-white hover:bg-purple-700 border-purple-500'
                      : 'hover:bg-purple-50/10 text-purple-200 border-purple-300/50 hover:border-purple-300'
                  }`}
                  onClick={() => onToggleCategory(category)}
                >
                  {translatedCategory}
                </Badge>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
