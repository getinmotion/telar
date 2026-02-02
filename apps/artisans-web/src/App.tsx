
import React from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { Toaster } from '@/components/ui/toaster';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: true,
    },
  },
});

import { AuthProvider } from '@/context/AuthContext';
import { DataCacheProvider } from '@/context/DataCacheContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { MasterAgentProvider } from '@/context/MasterAgentContext';
import { DesignSystemProvider } from '@/contexts/DesignSystemContext';
import { GamificationProvider } from '@/components/gamification/GamificationProvider';
import { useTaskAutoCompletion } from '@/hooks/useTaskAutoCompletion';
import { useSubdomain } from '@/hooks/useSubdomain';
import { ModerationApp } from './ModerationApp';

// Global task auto-completion listener
const TaskAutoCompletionWrapper = ({ children }: { children: React.ReactNode }) => {
  useTaskAutoCompletion();
  return <>{children}</>;
};
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import { AdminProtectedRoute } from '@/components/auth/AdminProtectedRoute';
import { ModeratorProtectedRoute } from '@/components/auth/ModeratorProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import AgentDetails from './pages/AgentDetails';
import MaturityCalculator from './pages/MaturityCalculator';
import UserProgress from './pages/UserProgress';
import Login from './pages/auth/Login';
import GrowthValidation from './pages/GrowthValidation';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyPending from './pages/VerifyPending';
import VerifyEmail from './pages/auth/VerifyEmail';
import NotFound from './pages/NotFound';
import Admin from './pages/Admin';
import AdminDummyReset from './pages/AdminDummyReset';
import TasksDashboard from './pages/TasksDashboard';
import MasterCoordinatorChat from './pages/MasterCoordinatorChat';
import OnePager from './pages/OnePager';
import TwoPager from './pages/TwoPager';
import ThreePager from './pages/ThreePager';
import Profile from './pages/Profile';
import { BiomeConfigPage } from './pages/BiomeConfigPage';
import HelpPage from './pages/HelpPage';
import AdminLoginPage from './pages/AdminLoginPage';
// ArtisanDashboardPage removed - redirects to /profile
import { CreateShopPage } from './pages/CreateShopPage';
import PublicShopPage from './pages/PublicShopPage';
import PublicShopAbout from './pages/PublicShopAbout';
import PublicShopContact from './pages/PublicShopContact';
import { PublicProductPage } from './pages/PublicProductPage';
import ShopConfigDashboard from './pages/ShopConfigDashboard';
import { ShopDirectoryPage } from './pages/ShopDirectoryPage';
import { ProductUploadPage } from './pages/ProductUploadPage';
import { ProductEditPage } from './pages/ProductEditPage';
import { ShopDashboardPage } from './pages/ShopDashboardPage';
import { LatestShopRedirect } from './components/shop/LatestShopRedirect';
import InventoryPage from './pages/InventoryPage';
import { StockWizard } from './pages/StockWizard';
import IntelligentBrandWizardPage from './pages/IntelligentBrandWizardPage';
import HeroSliderWizardPage from './pages/HeroSliderWizardPage';
import AboutWizardPage from './pages/AboutWizardPage';
import ContactWizardPage from './pages/ContactWizardPage';
import SocialLinksWizardPage from './pages/SocialLinksWizardPage';
import ArtisanProfileWizardPage from './pages/ArtisanProfileWizardPage';
import PublicArtisanProfile from './pages/PublicArtisanProfile';
import DebugArtisanPage from './pages/DebugArtisanPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { ShoppingCartProvider } from './contexts/ShoppingCartContext';
import DesignSystemPage from './pages/DesignSystemPage';
import DesignShowcasePage from './pages/DesignShowcasePage';
import DesignSystemEditorPage from './pages/admin/DesignSystemEditorPage';
import { MilestoneProgressPage } from './pages/MilestoneProgressPage';
import { AdminDesignSystemFAB } from './components/admin/design-system/AdminDesignSystemFAB';
import ModerationPage from './pages/ModerationPage';
import BankDataPage from './pages/BankDataPage';
import ActivityPage from './pages/ActivityPage';
import NotificationsPage from './pages/NotificationsPage';
import ShopSalesPage from './pages/ShopSalesPage';

// Legal pages
import TerminosPage from './pages/legal/TerminosPage';
import PrivacidadPage from './pages/legal/PrivacidadPage';
import PublicidadPage from './pages/legal/PublicidadPage';

function App() {
  const { isModerationSubdomain } = useSubdomain();

  // Si estamos en el subdominio de moderación, usar ModerationApp
  if (isModerationSubdomain) {
    return (
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <HelmetProvider>
            <BrowserRouter>
              <DesignSystemProvider>
                <AuthProvider>
                  <DataCacheProvider>
                    <LanguageProvider>
                      <ModerationApp />
                    </LanguageProvider>
                  </DataCacheProvider>
                </AuthProvider>
              </DesignSystemProvider>
            </BrowserRouter>
          </HelmetProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    );
  }

  // App principal normal
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <DesignSystemProvider>
              <AuthProvider>
                <DataCacheProvider>
                  <LanguageProvider>
                    <MasterAgentProvider>
                      <GamificationProvider>
                        <div className="min-h-screen">
                        {/* Design System FAB - Solo visible para admins */}
                        <AdminDesignSystemFAB />

                        <Routes>
                          {/* Redirect root to login - Landing está en proyecto separado */}
                          <Route path="/" element={<Navigate to="/login" replace />} />
                          <Route path="/login" element={<Login />} />
                          <Route path="/register" element={<Register />} />
                          <Route path="/forgot-password" element={<ForgotPassword />} />
                          <Route path="/reset-password" element={<ResetPassword />} />
                          <Route path="/auth/verify-pending" element={<VerifyPending />} />
                          <Route path="/auth/verify" element={<VerifyEmail />} />
                          <Route path="/verify-email" element={<VerifyEmail />} />

                          {/* Legal pages */}
                          <Route path="/terminos" element={<TerminosPage />} />
                          <Route path="/privacidad" element={<PrivacidadPage />} />
                          <Route path="/publicidad" element={<PublicidadPage />} />
                          <Route path="/terms" element={<Navigate to="/terminos" replace />} />
                          <Route path="/privacy" element={<Navigate to="/privacidad" replace />} />

                          {/* Public shop routes */}
                          <Route path="/tiendas" element={<ShopDirectoryPage />} />
                          <Route path="/tienda/mas-reciente" element={<LatestShopRedirect />} />
                          <Route path="/tienda/:shopSlug" element={<PublicShopPage />} />
                          <Route
                            path="/tienda/:shopSlug/nosotros"
                            element={
                              <ShoppingCartProvider>
                                <PublicShopAbout />
                              </ShoppingCartProvider>
                            }
                          />
                          <Route
                            path="/tienda/:shopSlug/contacto"
                            element={
                              <ShoppingCartProvider>
                                <PublicShopContact />
                              </ShoppingCartProvider>
                            }
                          />
                          <Route
                            path="/tienda/:shopSlug/producto/:productId"
                            element={
                              <ShoppingCartProvider>
                                <PublicProductPage />
                              </ShoppingCartProvider>
                            }
                          />
                          <Route
                            path="/producto/:productId"
                            element={
                              <ShoppingCartProvider>
                                <PublicProductPage />
                              </ShoppingCartProvider>
                            }
                          />
                          <Route
                            path="/checkout"
                            element={
                              <ShoppingCartProvider>
                                <CheckoutPage />
                              </ShoppingCartProvider>
                            }
                          />
                          {/* Main dashboard route - Master Coordinator as entry point */}
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute>
                                <DashboardHome />
                              </ProtectedRoute>
                            }
                          />

                          {/* Unified coordinator chat route */}
                          <Route
                            path="/dashboard/coordinator-chat"
                            element={
                              <ProtectedRoute>
                                <MasterCoordinatorChat />
                              </ProtectedRoute>
                            }
                          />

                          {/* Legacy redirects for backward compatibility */}
                          <Route
                            path="/dashboard/home"
                            element={<Navigate to="/dashboard" replace />}
                          />
                          <Route
                            path="/dashboard/agent/master-coordinator"
                            element={<Navigate to="/dashboard/coordinator-chat" replace />}
                          />
                          {/* 
                FASE 1.1 COMPLETADA: Rutas directas a agentes eliminadas.
                Todo pasa por el Coordinador Maestro en /dashboard
              */}
                          <Route
                            path="/maturity-calculator"
                            element={
                              <ProtectedRoute>
                                <MaturityCalculator />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute>
                                <Profile />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/activity"
                            element={
                              <ProtectedRoute>
                                <ActivityPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/notifications"
                            element={
                              <ProtectedRoute>
                                <NotificationsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/progress"
                            element={
                              <ProtectedRoute>
                                <UserProgress />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/milestone-progress"
                            element={
                              <ProtectedRoute>
                                <MilestoneProgressPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/tasks"
                            element={
                              <ProtectedRoute>
                                <TasksDashboard />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/dashboard/artisan" element={<Navigate to="/profile" replace />} />
                          <Route
                            path="/dashboard/create-shop"
                            element={
                              <ProtectedRoute>
                                <CreateShopPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/mi-tienda" element={<ProtectedRoute><ShopDashboardPage /></ProtectedRoute>} />
                          <Route path="/mi-tienda/ventas" element={<ProtectedRoute><ShopSalesPage /></ProtectedRoute>} />
                          <Route path="/mi-tienda/configurar" element={<ProtectedRoute><ShopConfigDashboard /></ProtectedRoute>} />
                          <Route path="/mi-cuenta/datos-bancarios" element={<ProtectedRoute><BankDataPage /></ProtectedRoute>} />
                          <Route
                            path="/productos/subir"
                            element={
                              <ProtectedRoute>
                                <ProductUploadPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/productos/editar/:productId"
                            element={
                              <ProtectedRoute>
                                <ProductEditPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/dashboard/inventory" element={<ProtectedRoute><InventoryPage /></ProtectedRoute>} />
                          <Route
                            path="/inventario"
                            element={
                              <ProtectedRoute>
                                <InventoryPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/stock-wizard"
                            element={
                              <ProtectedRoute>
                                <StockWizard />
                              </ProtectedRoute>
                            }
                          />

                          {/* Brand Wizard Route */}
                          <Route
                            path="/dashboard/brand-wizard"
                            element={
                              <ProtectedRoute>
                                <IntelligentBrandWizardPage />
                              </ProtectedRoute>
                            }
                          />
                          {/* Redirect old diagnosis results page to unified wizard */}
                          <Route
                            path="/brand-diagnosis-results"
                            element={<Navigate to="/dashboard/brand-wizard" replace />}
                          />
                          <Route path="/brand-wizard" element={<Navigate to="/dashboard/brand-wizard" replace />} />

                          {/* Shop Configuration Wizards */}
                          <Route
                            path="/dashboard/shop-hero-wizard"
                            element={
                              <ProtectedRoute>
                                <HeroSliderWizardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/shop-about-wizard"
                            element={
                              <ProtectedRoute>
                                <AboutWizardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/shop-contact-wizard"
                            element={
                              <ProtectedRoute>
                                <ContactWizardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/social-links-wizard"
                            element={
                              <ProtectedRoute>
                                <TaskAutoCompletionWrapper>
                                  <SocialLinksWizardPage />
                                </TaskAutoCompletionWrapper>
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/dashboard/artisan-profile-wizard"
                            element={
                              <ProtectedRoute>
                                <ArtisanProfileWizardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route path="/tienda/:shopSlug/perfil-artesanal" element={<PublicArtisanProfile />} />

                          {/* Redirects for navigation consistency */}
                          <Route path="/inventario" element={<Navigate to="/dashboard/inventory" replace />} />
                          <Route path="/tasks" element={<Navigate to="/dashboard/tasks" replace />} />
                          <Route path="/tienda" element={<Navigate to="/mi-tienda" replace />} />
                          <Route path="/marca" element={<Navigate to="/dashboard/brand-wizard" replace />} />
                          <Route path="/productos" element={<Navigate to="/tiendas" replace />} />
                          <Route path="/crear-tienda" element={<Navigate to="/dashboard/create-shop" replace />} />
                          <Route path="/perfil" element={<Navigate to="/profile" replace />} />

                          <Route path="/admin/login" element={<AdminLoginPage />} />
                          <Route
                            path="/admin"
                            element={
                              <AdminProtectedRoute>
                                <Admin />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/dummy-reset"
                            element={
                              <AdminProtectedRoute>
                                <AdminDummyReset />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route
                            path="/admin/design-system"
                            element={
                              <AdminProtectedRoute>
                                <DesignSystemEditorPage />
                              </AdminProtectedRoute>
                            }
                          />
                          <Route path="/admin/desing-system" element={<Navigate to="/admin/design-system" replace />} />

                          {/* Moderation routes - independent from admin */}
                          <Route
                            path="/moderacion"
                            element={
                              <ModeratorProtectedRoute>
                                <ModerationPage />
                              </ModeratorProtectedRoute>
                            }
                          />
                          {/* Redirect old admin moderation route to new independent route */}
                          <Route path="/admin/moderation" element={<Navigate to="/moderacion" replace />} />
                          <Route path="/help" element={<HelpPage />} />
                          <Route path="/design-system" element={<DesignSystemPage />} />
                          <Route path="/design-showcase" element={<DesignShowcasePage />} />
                          <Route path="/biome-config" element={<BiomeConfigPage />} />
                          <Route path="/one-pager" element={<OnePager />} />
                          <Route path="/two-pager" element={<TwoPager />} />
                          <Route path="/three-pager" element={<ThreePager />} />

                          {/* Debug Route */}
                          <Route
                            path="/debug-artisan"
                            element={
                              <ProtectedRoute>
                                <DebugArtisanPage />
                              </ProtectedRoute>
                            }
                          />

                          {/* Growth Module Validator Route */}
                          <Route
                            path="/growth-validation"
                            element={
                              <ProtectedRoute>
                                <GrowthValidation />
                              </ProtectedRoute>
                            }
                          />

                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </div>
                        <Toaster />
                      </GamificationProvider>
                    </MasterAgentProvider>
                  </LanguageProvider>
                </DataCacheProvider>
              </AuthProvider>
            </DesignSystemProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
