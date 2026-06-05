import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProductsProvider } from "@/contexts/ProductsContext";
import { ArtisanShopsProvider } from "@/contexts/ArtisanShopsContext";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import { SearchProvider } from "@/contexts/SearchContext";
import { Layout } from "@/components/Layout";
import { ScrollToTop } from "@/components/ScrollToTop";
import { StoryblokBridgeListener } from "@/components/StoryblokBridgeListener";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ShopDetail from "./pages/ShopDetail";
import Shops from "./pages/Shops";
import FavoriteShops from "./pages/FavoriteShops";
import Auth from "./pages/Auth";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import Wishlist from "./pages/Wishlist";
import Categories from "./pages/Categories";
import RecategorizeProducts from "./pages/RecategorizeProducts";
import CreateMarketplaceView from "./pages/CreateMarketplaceView";
import NotFound from "./pages/NotFound";
import { ConfirmPurchase } from "./pages/ConfirmPurchase";
import PaymentPending from "./pages/PaymentPending";
import GiftCards from "./pages/GiftCards";
import PoliticaDePrivacidad from "./pages/legal/PoliticaDePrivacidad";
import TerminosYCondiciones from "./pages/legal/TerminosYCondiciones";
import PoliticaDeCookies from "./pages/legal/PoliticaDeCookies";
import PoliticaDeGarantias from "./pages/legal/PoliticaDeGarantias";
import DataTreatment from "./pages/DataTreatment";
import ResetPassword from "./pages/ResetPassword";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import OrderConfirmed from "./pages/OrderConfirmed";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";
import CategoryDetail from "./pages/CategoryDetail";
import ArtisanProfile from "./pages/ArtisanProfile";
import ExploreProducts from "./pages/ExploreProducts";
import Explorar from "./pages/Explorar";
import Newsletter from "./pages/Newsletter";
import Territory from "./pages/Territory";
import Territorios from "./pages/Territorios";
import SobreTelar from "./pages/SobreTelar";
import Tecnicas from "./pages/Tecnicas";
import TecnicaDetail from "./pages/TecnicaDetail";
import Colecciones from "./pages/Colecciones";
import ColeccionDetail from "./pages/ColeccionDetail";
import Ayuda from "./pages/Ayuda";
import FAQs from "./pages/ayuda/FAQs";
import ComoComprar from "./pages/ayuda/ComoComprar";
import Envios from "./pages/ayuda/Envios";
import Devoluciones from "./pages/ayuda/Devoluciones";
import Contacto from "./pages/ayuda/Contacto";
import Historias from "./pages/Historias";
import HistoriaDetail from "./pages/HistoriaDetail";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <ProductsProvider>
            <ArtisanShopsProvider>
              <CartProvider>
                <CheckoutProvider>
                  <SearchProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                      <ScrollToTop />
                      <StoryblokBridgeListener />
                      <Routes>
                        {/* Rutas con Layout (con Navbar) */}
                        <Route element={<Layout />}>
                          <Route path="/" element={<Index />} />
                          <Route path="/productos" element={<ExploreProducts />} />
                          <Route path="/product/:id" element={<ProductDetail />} />
                          <Route path="/tienda/:shopSlug" element={<ShopDetail />} />
                          <Route path="/tiendas" element={<Shops />} />
                          <Route path="/tiendas-favoritas" element={<FavoriteShops />} />
                          <Route path="/cart" element={<Cart />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/wishlist" element={<Wishlist />} />
                          <Route path="/categorias" element={<Categories />} />
                          <Route path="/giftcards" element={<GiftCards />} />
                          <Route path="/confirm-purchase" element={<ConfirmPurchase />} />
                          <Route path="/payment-pending" element={<PaymentPending />} />
                          <Route path="/legal/politica-de-privacidad" element={<PoliticaDePrivacidad />} />
                          <Route path="/legal/terminos-y-condiciones" element={<TerminosYCondiciones />} />
                          <Route path="/legal/tratamiento-de-datos" element={<DataTreatment />} />
                          <Route path="/legal/politica-de-cookies" element={<PoliticaDeCookies />} />
                          <Route path="/legal/politica-de-garantias" element={<PoliticaDeGarantias />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/blog/:slug" element={<BlogArticle />} />
                          <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                          <Route path="/explorar" element={<Explorar />} />
                          <Route path="/categoria/:slug" element={<CategoryDetail />} />
                          <Route path="/artesano/:slug" element={<ArtisanProfile />} />
                          <Route path="/newsletter" element={<Newsletter />} />
                          <Route path="/territorios" element={<Territorios />} />
                          <Route path="/territorio/:slug" element={<Territory />} />
                          <Route path="/tecnicas" element={<Tecnicas />} />
                          <Route path="/tecnica/:slug" element={<TecnicaDetail />} />
                          <Route path="/colecciones" element={<Colecciones />} />
                          <Route path="/coleccion/:slug" element={<ColeccionDetail />} />
                          <Route path="/historias" element={<Historias />} />
                          <Route path="/historia/:slug" element={<HistoriaDetail />} />
                          <Route path="/sobre-telar" element={<SobreTelar />} />
                          <Route path="/ayuda" element={<Ayuda />} />
                          <Route path="/ayuda/faqs" element={<FAQs />} />
                          <Route path="/ayuda/como-comprar" element={<ComoComprar />} />
                          <Route path="/ayuda/envios" element={<Envios />} />
                          <Route path="/ayuda/devoluciones" element={<Devoluciones />} />
                          <Route path="/ayuda/contacto" element={<Contacto />} />
                        </Route>

                        {/* Rutas SIN Layout (sin Navbar) */}
                        <Route path="/auth" element={<Auth />} />
                        <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                        <Route path="/reset-password" element={<ResetPassword />} />
                        {/* <Route path="/recategorize" element={<RecategorizeProducts />} />
                        <Route path="/create-view" element={<CreateMarketplaceView />} /> */}

                        {/* Catch-all */}
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </BrowserRouter>
                  </SearchProvider>
                </CheckoutProvider>
              </CartProvider>
            </ArtisanShopsProvider>
          </ProductsProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;
