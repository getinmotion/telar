/**
 * NavbarV2 Component
 * Desktop: 2-row layout (Search | Logo | Icons) + nav links + mega menu
 * Mobile: Logo + icons + hamburger → slide-out drawer
 */

import { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  User,
  LogOut,
  Heart,
  LogIn,
  Menu,
  X,
  ChevronRight,
} from "lucide-react";
import { CategoriesMegaMenu } from "@/components/CategoriesMegaMenu";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useCart } from "@/contexts/CartContext";
import { SemanticSearchToggle } from "@/components/SemanticSearchToggle";
import { CartDrawer } from "@/components/CartDrawer";
import GuestAuthModal from "@/components/GuestAuthModal";
import telarHorizontal from "@/assets/telar-horizontal.svg";

interface NavbarV2Props {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  semanticSearchEnabled?: boolean;
  onSemanticSearchToggle?: (enabled: boolean) => void;
  onHomeClick?: () => void;
}

// ── Nav links config ────────────────────────────────
const NAV_LINKS: readonly { to: string; label: string; hasMegaMenu?: boolean }[] = [
  { to: "/explorar", label: "Explorar" },
  { to: "/categorias", label: "Categorías", hasMegaMenu: true },
  { to: "/giftcards", label: "Regalos" },
  { to: "/colecciones", label: "Colecciones" },
  { to: "/tiendas", label: "Talleres" },
  { to: "/historias", label: "Historias" },
  { to: "/sobre-telar", label: "Sobre Telar" },
];

export const NavbarV2 = ({
  searchQuery = "",
  onSearchChange = () => {},
  semanticSearchEnabled = true,
  onSemanticSearchToggle = () => {},
  onHomeClick,
}: NavbarV2Props) => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { totalItems, openCart } = useCart();
  const [guestModalOpen, setGuestModalOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchVisible, setSearchVisible] = useState(false);
  const [megaMenuOpen, setMegaMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchVisible, setMobileSearchVisible] = useState(false);
  const megaMenuTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [localSearchQuery, setLocalSearchQuery] = useState(searchQuery);

  useEffect(() => {
    setLocalSearchQuery(searchQuery);
  }, [searchQuery]);

  // Scroll detection
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (window.scrollY <= 50) setSearchVisible(false);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileMenuOpen]);

  const handleCartClick = () => {
    if (!user) {
      navigate("/auth");
    } else {
      openCart();
    }
  };

  const toggleSearch = () => setSearchVisible(!searchVisible);

  const handleSearch = () => {
    if (localSearchQuery.trim().length > 0) {
      onSearchChange(localSearchQuery);
      navigate(`/productos?q=${encodeURIComponent(localSearchQuery)}`);
      setMobileMenuOpen(false);
      setMobileSearchVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleSearch();
  };

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full border-b border-border/20 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm transition-all duration-300 ${isScrolled ? "shadow-md" : ""}`}
      >
        <div className="container mx-auto px-4 relative">
          {/* ════════════ MOBILE TOP BAR (< lg) ════════════ */}
          <div className="flex lg:hidden items-center justify-between py-3">
            {/* Left: Hamburger */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-foreground"
              aria-label="Abrir menú"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Center: Logo */}
            {onHomeClick ? (
              <button onClick={onHomeClick} className="flex items-center">
                <img
                  src={telarHorizontal}
                  alt="TELAR"
                  className="h-7"
                />
              </button>
            ) : (
              <Link to="/?reset=true" className="flex items-center">
                <img
                  src={telarHorizontal}
                  alt="TELAR"
                  className="h-7"
                />
              </Link>
            )}

            {/* Right: Search + Cart */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setMobileSearchVisible(!mobileSearchVisible)}
                className="p-2 text-foreground"
                aria-label="Buscar"
              >
                <Search className="w-5 h-5" />
              </button>
              <button
                onClick={handleCartClick}
                className="p-2 text-foreground relative"
                aria-label="Carrito"
              >
                <ShoppingCart className="w-5 h-5" />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Mobile search bar (slides down) */}
          {mobileSearchVisible && (
            <div className="lg:hidden pb-3 border-t border-border/10">
              <div className="relative mt-2">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos, artesanos..."
                  className="pl-10 pr-20 h-10 bg-muted/30 border-border/40"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  autoFocus
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                  onClick={handleSearch}
                  disabled={localSearchQuery.trim().length === 0}
                >
                  Buscar
                </Button>
              </div>
            </div>
          )}

          {/* ════════════ DESKTOP TOP BAR (>= lg) ════════════ */}
          <div
            className={`hidden lg:grid grid-cols-[1fr_auto_1fr] gap-8 items-center transition-all duration-300 ${isScrolled ? "py-2" : "py-4"}`}
          >
            {/* Col 1: Search */}
            <div className="flex items-center gap-2">
              {!isScrolled ? (
                <>
                  <div className="relative w-3/4 min-w-[200px]">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Buscar productos, artesanos..."
                      className="pl-10 pr-24 h-10 bg-muted/30 border-border/40"
                      value={localSearchQuery}
                      onChange={(e) => setLocalSearchQuery(e.target.value)}
                      onKeyDown={handleKeyDown}
                    />
                    <Button
                      size="sm"
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
                      onClick={handleSearch}
                      disabled={localSearchQuery.trim().length === 0}
                    >
                      Buscar
                    </Button>
                  </div>
                  {searchQuery && onSemanticSearchToggle && (
                    <SemanticSearchToggle
                      enabled={semanticSearchEnabled}
                      onToggle={onSemanticSearchToggle}
                    />
                  )}
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={toggleSearch}
                  >
                    <Search className="h-4 w-4" />
                  </Button>
                  <div
                    className={`overflow-hidden transition-all duration-300 ${searchVisible ? "w-64 opacity-100" : "w-0 opacity-0"}`}
                  >
                    {searchVisible && (
                      <div className="relative">
                        <Input
                          type="search"
                          placeholder="Buscar..."
                          className="h-8 text-sm pr-16"
                          value={localSearchQuery}
                          onChange={(e) => setLocalSearchQuery(e.target.value)}
                          onKeyDown={handleKeyDown}
                          autoFocus
                        />
                        <Button
                          size="sm"
                          className="absolute right-1 top-1/2 -translate-y-1/2 h-6 text-xs px-2"
                          onClick={handleSearch}
                          disabled={localSearchQuery.trim().length === 0}
                        >
                          Ir
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Col 2: Logo */}
            <div className="flex flex-col items-center gap-1">
              {onHomeClick ? (
                <button
                  onClick={onHomeClick}
                  className="flex flex-col items-center gap-1"
                >
                  <img
                    src={telarHorizontal}
                    alt="TELAR"
                    className={`transition-all duration-300 ${isScrolled ? "h-6 md:h-7" : "h-8 md:h-10"}`}
                  />
                </button>
              ) : (
                <Link
                  to="/?reset=true"
                  className="flex flex-col items-center gap-1"
                >
                  <img
                    src={telarHorizontal}
                    alt="TELAR"
                    className={`transition-all duration-300 ${isScrolled ? "h-6 md:h-7" : "h-8 md:h-10"}`}
                  />
                </Link>
              )}
            </div>

            {/* Col 3: Icons */}
            <div className="flex items-center justify-end gap-2">
              <Link to="/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-10 w-10"
                  title="Mis favoritos"
                >
                  <Heart className="h-5 w-5" />
                </Button>
              </Link>

              <Button
                variant="ghost"
                size="icon"
                className="relative h-10 w-10"
                onClick={handleCartClick}
              >
                <ShoppingCart className="h-5 w-5" />
                {totalItems > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {totalItems}
                  </Badge>
                )}
              </Button>
              <CartDrawer />

              <GuestAuthModal
                isOpen={guestModalOpen}
                onClose={() => setGuestModalOpen(false)}
                onSuccess={() => {
                  setGuestModalOpen(false);
                  openCart();
                }}
              />

              {user ? (
                <>
                  <Link to="/profile">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={isScrolled ? "h-8 w-8" : "h-10 w-10"}
                      title="Mi cuenta"
                    >
                      <User className={isScrolled ? "h-4 w-4" : "h-5 w-5"} />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    className={isScrolled ? "h-8 w-8" : "h-10 w-10"}
                    onClick={signOut}
                    title="Cerrar sesión"
                  >
                    <LogOut
                      className={isScrolled ? "h-4 w-4" : "h-5 w-5"}
                    />
                  </Button>
                </>
              ) : (
                <Link to="/auth">
                  {isScrolled ? (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      title="Iniciar sesión"
                    >
                      <LogIn className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button variant="default" size="sm">
                      Iniciar Sesión
                    </Button>
                  )}
                </Link>
              )}
            </div>
          </div>

          {/* ════════════ DESKTOP NAV LINKS (>= lg) ════════════ */}
          <nav
            className={`hidden lg:block border-t border-border/10 transition-all duration-300 ${isScrolled ? "bg-muted/30" : ""}`}
          >
            <div
              className={`flex items-center justify-center gap-8 transition-all duration-300 ${isScrolled ? "py-1.5" : "py-3"}`}
            >
              {NAV_LINKS.map((link) =>
                link.hasMegaMenu ? (
                  <div
                    key={link.label}
                    className="relative"
                    onMouseEnter={() => {
                      if (megaMenuTimer.current)
                        clearTimeout(megaMenuTimer.current);
                      setMegaMenuOpen(true);
                    }}
                    onMouseLeave={() => {
                      megaMenuTimer.current = setTimeout(
                        () => setMegaMenuOpen(false),
                        150,
                      );
                    }}
                  >
                    <Link
                      to={link.to}
                      className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? "text-xs" : "text-sm"} ${megaMenuOpen ? "text-[#ec6d13]" : ""}`}
                    >
                      {link.label}
                      {megaMenuOpen && (
                        <span className="absolute -bottom-1 left-0 w-full h-[1px] bg-[#ec6d13]" />
                      )}
                    </Link>
                  </div>
                ) : (
                  <Link
                    key={link.label}
                    to={link.to}
                    className={`font-semibold text-foreground/80 hover:text-foreground transition-colors ${isScrolled ? "text-xs" : "text-sm"}`}
                  >
                    {link.label}
                  </Link>
                ),
              )}
            </div>
          </nav>

          {/* Desktop Mega Menu */}
          {megaMenuOpen && (
            <div
              className="hidden lg:block"
              onMouseEnter={() => {
                if (megaMenuTimer.current)
                  clearTimeout(megaMenuTimer.current);
              }}
              onMouseLeave={() => {
                megaMenuTimer.current = setTimeout(
                  () => setMegaMenuOpen(false),
                  150,
                );
              }}
            >
              <CategoriesMegaMenu onClose={() => setMegaMenuOpen(false)} />
            </div>
          )}
        </div>
      </header>

      {/* ════════════ MOBILE DRAWER OVERLAY ════════════ */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={closeMobileMenu}
          />

          {/* Drawer */}
          <nav className="absolute top-0 left-0 bottom-0 w-[85%] max-w-[360px] bg-background shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-5 border-b border-border/20">
              <Link to="/?reset=true" onClick={closeMobileMenu}>
                <img src={telarHorizontal} alt="TELAR" className="h-7" />
              </Link>
              <button
                onClick={closeMobileMenu}
                className="p-2 -mr-2 text-foreground/60 hover:text-foreground"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Search inside drawer */}
            <div className="p-4 border-b border-border/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar productos..."
                  className="pl-10 pr-16 h-10 bg-muted/30 border-border/40 text-sm"
                  value={localSearchQuery}
                  onChange={(e) => setLocalSearchQuery(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleSearch();
                    }
                  }}
                />
                <Button
                  size="sm"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 text-xs"
                  onClick={handleSearch}
                  disabled={localSearchQuery.trim().length === 0}
                >
                  Buscar
                </Button>
              </div>
            </div>

            {/* Nav Links */}
            <div className="flex-1 overflow-y-auto py-2">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.label}
                  to={link.to}
                  onClick={closeMobileMenu}
                  className="flex items-center justify-between px-6 py-4 text-[15px] font-medium text-foreground/80 hover:text-foreground hover:bg-muted/40 transition-colors active:bg-muted/60"
                >
                  <span>{link.label}</span>
                  <ChevronRight className="w-4 h-4 text-foreground/30" />
                </Link>
              ))}
            </div>

            {/* Drawer Footer: User actions */}
            <div className="border-t border-border/20 p-4 space-y-2">
              {/* Quick action row */}
              <div className="flex items-center gap-2 mb-3">
                <Link
                  to="/wishlist"
                  onClick={closeMobileMenu}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-muted/40 text-sm font-medium text-foreground/70 hover:bg-muted/60 transition-colors"
                >
                  <Heart className="w-4 h-4" />
                  <span>Favoritos</span>
                </Link>
                <button
                  onClick={() => {
                    closeMobileMenu();
                    handleCartClick();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-md bg-muted/40 text-sm font-medium text-foreground/70 hover:bg-muted/60 transition-colors relative"
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>Carrito</span>
                  {totalItems > 0 && (
                    <span className="bg-destructive text-destructive-foreground text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                      {totalItems}
                    </span>
                  )}
                </button>
              </div>

              {user ? (
                <div className="flex items-center gap-2">
                  <Link
                    to="/profile"
                    onClick={closeMobileMenu}
                    className="flex-1 flex items-center justify-center gap-2 py-3 rounded-md bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Mi cuenta
                  </Link>
                  <button
                    onClick={() => {
                      closeMobileMenu();
                      signOut();
                    }}
                    className="px-4 py-3 rounded-md border border-border/40 text-foreground/60 hover:text-foreground hover:border-border transition-colors"
                    title="Cerrar sesión"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/auth"
                  onClick={closeMobileMenu}
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-md bg-foreground text-background text-sm font-semibold hover:bg-foreground/90 transition-colors"
                >
                  <LogIn className="w-4 h-4" />
                  Iniciar Sesión
                </Link>
              )}
            </div>
          </nav>
        </div>
      )}
    </>
  );
};
