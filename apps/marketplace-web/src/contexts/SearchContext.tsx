/**
 * Search Context
 * Contexto global para el estado de búsqueda en toda la aplicación
 */

import { createContext, useContext, useState, ReactNode } from 'react';

interface SearchContextType {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  semanticSearchEnabled: boolean;
  setSemanticSearchEnabled: (enabled: boolean) => void;
  clearSearch: () => void;
}

const SearchContext = createContext<SearchContextType | undefined>(undefined);

interface SearchProviderProps {
  children: ReactNode;
}

export const SearchProvider = ({ children }: SearchProviderProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [semanticSearchEnabled, setSemanticSearchEnabled] = useState(true);

  const clearSearch = () => {
    setSearchQuery("");
    setSemanticSearchEnabled(true);
  };

  return (
    <SearchContext.Provider
      value={{
        searchQuery,
        setSearchQuery,
        semanticSearchEnabled,
        setSemanticSearchEnabled,
        clearSearch,
      }}
    >
      {children}
    </SearchContext.Provider>
  );
};

/**
 * Hook para consumir el contexto de búsqueda
 *
 * @throws Error si se usa fuera de SearchProvider
 * @returns SearchContextType
 *
 * @example
 * const { searchQuery, setSearchQuery, clearSearch } = useSearch();
 */
export const useSearch = () => {
  const context = useContext(SearchContext);
  if (!context) {
    throw new Error('useSearch must be used within SearchProvider');
  }
  return context;
};
