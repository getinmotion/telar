import React from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  language: 'en' | 'es';
}

export const TaskPagination: React.FC<TaskPaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  language
}) => {
  const t = {
    en: {
      showing: 'Showing',
      of: 'of',
      items: 'items',
      previous: 'Previous',
      next: 'Next'
    },
    es: {
      showing: 'Mostrando',
      of: 'de',
      items: 'elementos',
      previous: 'Anterior',
      next: 'Siguiente'
    }
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className="flex items-center justify-between space-x-2 py-4 border-t border-gray-200 mt-4">
      <div className="text-sm text-muted-foreground font-medium">
        {t[language].showing} {startItem}-{endItem} {t[language].of} {totalItems} {t[language].items}
      </div>
      
      <div className="flex items-center space-x-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="border-2 hover:bg-neon-green-50 hover:border-neon-green-200 hover:text-deep-green disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          {t[language].previous}
        </Button>
        
        <div className="flex items-center space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter(page => 
              page === 1 || 
              page === totalPages || 
              Math.abs(page - currentPage) <= 1
            )
            .map((page, index, array) => (
              <div key={page}>
                {index > 0 && array[index - 1] !== page - 1 && (
                  <span className="px-2 text-muted-foreground">...</span>
                )}
                <Button
                  variant={page === currentPage ? "default" : "outline"}
                  size="sm"
                  onClick={() => onPageChange(page)}
                  className={cn(
                    "w-8 h-8 p-0",
                    page === currentPage
                      ? "bg-gradient-to-br from-neon-green-400 to-neon-green-700 text-white shadow-float border-0"
                      : "bg-white border-2 border-gray-200 text-charcoal hover:bg-neon-green-50 hover:border-neon-green-200"
                  )}
                >
                  {page}
                </Button>
              </div>
            ))}
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="border-2 hover:bg-neon-green-50 hover:border-neon-green-200 hover:text-deep-green disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {t[language].next}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
};
