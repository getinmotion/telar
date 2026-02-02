import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import { CheckoutProvider } from "@/contexts/CheckoutContext";
import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import ShopDetail from "./pages/ShopDetail";
import Shops from "./pages/Shops";
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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
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
                <Route path="/auth" element={<Auth />} />
                <Route path="/cart" element={<Cart />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/wishlist" element={<Wishlist />} />
                <Route path="/categorias" element={<Categories />} />
                <Route path="/giftcards" element={<GiftCards />} />
                <Route path="/recategorize" element={<RecategorizeProducts />} />
                <Route path="/create-view" element={<CreateMarketplaceView />} />
                <Route path="/confirm-purchase" element={<ConfirmPurchase />} />
                <Route path="/payment-pending" element={<PaymentPending />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </CheckoutProvider>
        </CartProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
