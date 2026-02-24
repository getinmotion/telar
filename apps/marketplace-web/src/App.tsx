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
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import DataTreatment from "./pages/DataTreatment";
import ResetPassword from "./pages/ResetPassword";
import Blog from "./pages/Blog";
import BlogArticle from "./pages/BlogArticle";
import OrderConfirmed from "./pages/OrderConfirmed";
import GoogleAuthCallback from "./pages/GoogleAuthCallback";

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
                  <Toaster />
                  <Sonner />
                <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/productos" element={<Products />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/tienda/:shopSlug" element={<ShopDetail />} />
                  <Route path="/tiendas" element={<Shops />} />
                  <Route path="/tiendas-favoritas" element={<FavoriteShops />} />
                  <Route path="/auth" element={<Auth />} />
                  <Route path="/auth/google/callback" element={<GoogleAuthCallback />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/categorias" element={<Categories />} />
                  <Route path="/giftcards" element={<GiftCards />} />
                  <Route path="/recategorize" element={<RecategorizeProducts />} />
                  <Route path="/create-view" element={<CreateMarketplaceView />} />
                  <Route path="/confirm-purchase" element={<ConfirmPurchase />} />
                  <Route path="/payment-pending" element={<PaymentPending />} />
                  <Route path="/privacidad" element={<Privacy />} />
                  <Route path="/terminos" element={<Terms />} />
                  <Route path="/datos-personales" element={<DataTreatment />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:slug" element={<BlogArticle />} />
                  <Route path="/order-confirmed/:orderId" element={<OrderConfirmed />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
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
