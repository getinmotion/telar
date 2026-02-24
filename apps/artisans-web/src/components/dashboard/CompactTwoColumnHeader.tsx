
import React from 'react';
import { CompactStatsHeader } from './CompactStatsHeader';
import { UltraCompactFilters } from '../agent-manager/UltraCompactFilters';

interface CompactTwoColumnHeaderProps {
  title: string;
  subtitle: string;
  totalAgents: number;
  activeAgents: number;
  recommendedAgents: number;
  selectedStatus: string;
  selectedCategories: string[];
  categories: string[];
  onUpdateFilter: (key: string, value: string) => void;
  onToggleCategory: (category: string) => void;
  language: 'en' | 'es';
}

export const CompactTwoColumnHeader: React.FC<CompactTwoColumnHeaderProps> = ({
  title,
  subtitle,
  totalAgents,
  activeAgents,
  recommendedAgents,
  selectedStatus,
  selectedCategories,
  categories,
  onUpdateFilter,
  onToggleCategory,
  language
}) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 mb-4">
      {/* Stats Column - 70% */}
      <div className="lg:col-span-5">
        <CompactStatsHeader
          title={title}
          subtitle={subtitle}
          totalAgents={totalAgents}
          activeAgents={activeAgents}
          recommendedAgents={recommendedAgents}
          language={language}
        />
      </div>
      
      {/* Filters Column - 30% */}
      <div className="lg:col-span-2">
        <UltraCompactFilters
          selectedStatus={selectedStatus}
          selectedCategories={selectedCategories}
          categories={categories}
          onUpdateFilter={onUpdateFilter}
          onToggleCategory={onToggleCategory}
          language={language}
        />
      </div>
    </div>
  );
};
