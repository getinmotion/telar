/**
 * Layout Component
 * Wrapper principal que incluye el Navbar con lógica centralizada de búsqueda
 */

// Navbar original (comentado temporalmente)
// import { Navbar } from "@/components/Navbar";

// Nuevo NavbarV2
import { NavbarV2 } from "@/components/NavbarV2";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useSearch } from "@/contexts/SearchContext";

export const Layout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    searchQuery,
    setSearchQuery,
    semanticSearchEnabled,
    setSemanticSearchEnabled,
    clearSearch,
  } = useSearch();

  /**
   * Handler para clic en logo - limpia búsqueda y navega a home
   */
  const handleHomeClick = () => {
    clearSearch();
    if (location.pathname !== '/') {
      navigate('/');
    }
  };

  /**
   * Handler para cambios en el input de búsqueda
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  /**
   * Handler para toggle de búsqueda semántica
   */
  const handleSemanticToggle = (enabled: boolean) => {
    setSemanticSearchEnabled(enabled);
  };

  return (
    <>
      {/* Navbar original (comentado temporalmente) */}
      {/* <Navbar
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        semanticSearchEnabled={semanticSearchEnabled}
        onSemanticSearchToggle={handleSemanticToggle}
        onHomeClick={handleHomeClick}
      /> */}

      {/* Nuevo NavbarV2 */}
      <NavbarV2
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        semanticSearchEnabled={semanticSearchEnabled}
        onSemanticSearchToggle={handleSemanticToggle}
        onHomeClick={handleHomeClick}
      />
      <Outlet />
    </>
  );
};
