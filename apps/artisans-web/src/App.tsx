
import React, { Suspense, lazy } from 'react';
import { Routes, Route, BrowserRouter, Navigate } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './App.css';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import { ErrorBoundary } from '@/components/ErrorBoundary';

// ─── Backoffice: imports lazy (no se cargan en el bundle inicial) ─────────────
import { BackofficeLayout } from '@/components/backoffice/BackofficeLayout';
import { BackofficeProtectedRoute } from '@/components/auth/BackofficeProtectedRoute';
import { BackofficePageSkeleton } from '@/components/backoffice/BackofficePageSkeleton';
const BackofficeLoginPage = lazy(() => import('@/pages/backoffice/BackofficeLoginPage'));
const AdminPage           = lazy(() => import('@/pages/Admin'));
const ModerationPage_lazy = lazy(() => import('@/pages/ModerationPage'));
const ProductAnalyticsPage_lazy = lazy(() => import('@/pages/ProductAnalyticsPage'));
const ProductReviewPage_lazy = lazy(() => import('@/pages/ProductReviewPage'));
const ShippingDashboardPage_lazy = lazy(() => import('@/pages/ShippingDashboardPage'));
const CmsAdminPage_lazy = lazy(() => import('@/pages/CmsAdminPage'));
const UserRolesAdminPage_lazy = lazy(() => import('@/pages/UserRolesAdminPage'));
const BlogPostsAdminPage_lazy = lazy(() => import('@/pages/BlogPostsAdminPage'));
const CollectionsAdminPage_lazy = lazy(() => import('@/pages/CollectionsAdminPage'));
const TaxonomyModerationPage_lazy = lazy(() => import('@/pages/admin/TaxonomyModerationPage'));
const DesignSystemEditorPage_lazy = lazy(() => import('@/pages/admin/DesignSystemEditorPage'));
const BackofficeOrdenesPage_lazy = lazy(() => import('@/pages/backoffice/BackofficeOrdenesPage'));
const BackofficeCuponesPage_lazy = lazy(() => import('@/pages/backoffice/BackofficeCuponesPage'));
const BackofficeImagenesPage_lazy = lazy(() => import('@/pages/backoffice/BackofficeImagenesPage'));
const BackofficeAuditoriaPage_lazy = lazy(() => import('@/pages/backoffice/BackofficeAuditoriaPage'));
const BackofficeTiendasPage_lazy = lazy(() => import('@/pages/backoffice/BackofficeTiendasPage'));
const BackofficePagosPage_lazy = lazy(() => import('@/pages/backoffice/BackofficePagosPage'));
const BackofficeHomePage_lazy = lazy(() => import('@/pages/backoffice/BackofficeHomePage'));
// ─────────────────────────────────────────────────────────────────────────────

// Create a client for React Query
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30000,
      refetchOnWindowFocus: true,
    },
  },
});

import { DataCacheProvider } from '@/context/DataCacheContext';
import { LanguageProvider } from '@/context/LanguageContext';
import { MasterAgentProvider } from '@/context/MasterAgentContext';
import { DesignSystemProvider } from '@/contexts/DesignSystemContext';
import { GamificationProvider } from '@/components/gamification/GamificationProvider';
import { useTaskAutoCompletion } from '@/hooks/useTaskAutoCompletion';
import { useAuthInit } from '@/hooks/useAuthInit';

// Arranca la validación de JWT + auto-refresh sin envolver estado
const AuthInitializer = ({ children }: { children: React.ReactNode }) => {
  useAuthInit();
  return <>{children}</>;
};

// Global task auto-completion listener
const TaskAutoCompletionWrapper = ({ children }: { children: React.ReactNode }) => {
  useTaskAutoCompletion();
  return <>{children}</>;
};
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';
import DashboardHome from './pages/DashboardHome';
import AgentDetails from './pages/AgentDetails';
import MaturityCalculator from './pages/MaturityCalculator';
import { OnboardingFlow } from './components/onboarding/OnboardingFlow';
import UserProgress from './pages/UserProgress';
import Login from './pages/auth/Login';
import GrowthValidation from './pages/GrowthValidation';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyPending from './pages/VerifyPending';
import VerifyEmail from './pages/auth/VerifyEmail';
import NotFound from './pages/NotFound';

import TasksDashboard from './pages/TasksDashboard';
import MasterCoordinatorChat from './pages/MasterCoordinatorChat';
import OnePager from './pages/OnePager';
import TwoPager from './pages/TwoPager';
import ThreePager from './pages/ThreePager';
import Profile from './pages/Profile';
import { BiomeConfigPage } from './pages/BiomeConfigPage';
import HelpPage from './pages/HelpPage';
// ArtisanDashboardPage removed - redirects to /profile
// CreateShopPage removed - tienda se crea automáticamente al completar el test de madurez
import PublicShopPage from './pages/PublicShopPage';
import PublicShopContact from './pages/PublicShopContact';
import { PublicProductPage } from './pages/PublicProductPage';
import { ProductIdentityPage } from './pages/product-identity';
import ShopConfigDashboard from './pages/ShopConfigDashboard';
import BrandIdentityWizardPage from './pages/config-wizards/BrandIdentityWizardPage';
import HeroImagesWizardPage from './pages/config-wizards/HeroImagesWizardPage';
import ContactLocationWizardPage from './pages/config-wizards/ContactLocationWizardPage';
import ReturnPolicyWizardPage from './pages/config-wizards/ReturnPolicyWizardPage';
import FaqWizardPage from './pages/config-wizards/FaqWizardPage';
import DesignTemplateWizardPage from './pages/config-wizards/DesignTemplateWizardPage';
import { ShopDirectoryPage } from './pages/ShopDirectoryPage';
import { ProductUploadPage } from './pages/ProductUploadPage';
import { ProductEditPage } from './pages/ProductEditPage';
// ShopDashboardPage removed - fusionado en /dashboard (CommercialDashboard)
import { LatestShopRedirect } from './components/shop/LatestShopRedirect';
import InventoryPage from './pages/InventoryPage';
import { StockWizard } from './pages/StockWizard';
import HeroSliderWizardPage from './pages/HeroSliderWizardPage';
import ContactWizardPage from './pages/ContactWizardPage';
import SocialLinksWizardPage from './pages/SocialLinksWizardPage';
import ArtisanProfileWizardPage from './pages/ArtisanProfileWizardPage';
import { DashboardLayout } from '@/components/dashboard/DashboardLayout';
import PublicArtisanProfile from './pages/PublicArtisanProfile';
import PublicShopCatalog from './pages/PublicShopCatalog';
import DebugArtisanPage from './pages/DebugArtisanPage';
import { CheckoutPage } from './components/checkout/CheckoutPage';
import { ShoppingCartProvider } from './contexts/ShoppingCartContext';
import DesignSystemPage from './pages/DesignSystemPage';
import DesignShowcasePage from './pages/DesignShowcasePage';
import { MilestoneProgressPage } from './pages/MilestoneProgressPage';
import { AdminDesignSystemFAB } from './components/admin/design-system/AdminDesignSystemFAB';
import BankDataPage from './pages/BankDataPage';
import ActivityPage from './pages/ActivityPage';
import NotificationsPage from './pages/NotificationsPage';
import ShopSalesPage from './pages/ShopSalesPage';
import BioLinkPage from './pages/BioLinkPage';

// Legal pages
import TerminosPage from './pages/legal/TerminosPage';
import PrivacidadPage from './pages/legal/PrivacidadPage';
import PublicidadPage from './pages/legal/PublicidadPage';

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <BrowserRouter>
            <DesignSystemProvider>
              <AuthInitializer>
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
                            <Route path="/verify-email" element={<VerifyEmail />} />

                            {/* Legal pages */}
                            <Route path="/terminos" element={<TerminosPage />} />
                            <Route path="/privacidad" element={<PrivacidadPage />} />
                            <Route path="/publicidad" element={<PublicidadPage />} />
                            <Route path="/terms" element={<Navigate to="/terminos" replace />} />
                            <Route path="/privacy" element={<Navigate to="/privacidad" replace />} />

                            {/* BIO link page (linktree-style, pública) */}
                            <Route path="/bio/:shopSlug" element={<BioLinkPage />} />

                            {/* Public shop routes */}
                            <Route path="/tiendas" element={<ShopDirectoryPage />} />
                            <Route path="/tienda/mas-reciente" element={<LatestShopRedirect />} />
                            <Route path="/tienda/:shopSlug" element={<PublicShopPage />} />
                            <Route path="/tienda/:shopSlug/catalogo" element={<PublicShopCatalog />} />
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
                              path="/product-identity"
                              element={<ProductIdentityPage />}
                            />
                            <Route
                              path="/checkout"
                              element={
                                <ShoppingCartProvider>
                                  <CheckoutPage />
                                </ShoppingCartProvider>
                              }
                            />
                            {/* Main dashboard route - inside DashboardLayout for unified sidebar */}

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
                              path="/onboarding"
                              element={
                                <ProtectedRoute>
                                  <OnboardingFlow />
                                </ProtectedRoute>
                              }
                            />
                            <Route
                              path="/maturity-calculator"
                              element={
                                <ProtectedRoute>
                                  <MaturityCalculator />
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
                            <Route path="/dashboard/artisan" element={<Navigate to="/profile" replace />} />
                            <Route path="/dashboard/create-shop" element={<Navigate to="/dashboard" replace />} />
                            <Route path="/mi-tienda" element={<Navigate to="/dashboard" replace />} />
                            <Route
                              path="/stock-wizard"
                              element={
                                <ProtectedRoute>
                                  <StockWizard />
                                </ProtectedRoute>
                              }
                            />

                            {/* Brand Wizard Route — deprecated, redirects to store config */}
                            <Route
                              path="/dashboard/brand-wizard"
                              element={<Navigate to="/mi-tienda/configurar" replace />}
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
                              element={
                                <ProtectedRoute>
                                  <DashboardLayout />
                                </ProtectedRoute>
                              }
                            >
                              <Route path="/dashboard" element={<DashboardHome />} />
                              <Route path="/profile" element={<Profile />} />
                              <Route path="/dashboard/tasks" element={<TasksDashboard />} />
                              <Route path="/dashboard/activity" element={<ActivityPage />} />
                              <Route path="/dashboard/inventory" element={<InventoryPage />} />
                              <Route path="/inventario" element={<Navigate to="/dashboard/inventory" replace />} />
                              <Route path="/mi-tienda/ventas" element={<ShopSalesPage />} />
                              <Route path="/productos/subir" element={<ProductUploadPage />} />
                              <Route path="/productos/editar/:productId" element={<ProductEditPage />} />
                              <Route path="/mi-cuenta/datos-bancarios" element={<BankDataPage />} />
                              <Route path="/dashboard/artisan-profile-wizard" element={<ArtisanProfileWizardPage />} />
                              <Route path="/mi-tienda/configurar" element={<ShopConfigDashboard />} />
                              <Route path="/mi-tienda/configurar/brand" element={<BrandIdentityWizardPage />} />
                              <Route path="/mi-tienda/configurar/hero" element={<HeroImagesWizardPage />} />
                              <Route path="/mi-tienda/configurar/contact" element={<ContactLocationWizardPage />} />
                              <Route path="/mi-tienda/configurar/return-policy" element={<ReturnPolicyWizardPage />} />
                              <Route path="/mi-tienda/configurar/faq" element={<FaqWizardPage />} />
                              <Route path="/mi-tienda/configurar/design" element={<DesignTemplateWizardPage />} />
                            </Route>
                            <Route
                              path="/tienda/:shopSlug/perfil-artesanal"
                              element={
                                <ShoppingCartProvider>
                                  <PublicArtisanProfile />
                                </ShoppingCartProvider>
                              }
                            />

                            {/* Redirects for navigation consistency */}
                            <Route path="/inventario" element={<Navigate to="/dashboard/inventory" replace />} />
                            <Route path="/tasks" element={<Navigate to="/dashboard/tasks" replace />} />
                            <Route path="/tienda" element={<Navigate to="/mi-tienda" replace />} />
                            <Route path="/marca" element={<Navigate to="/dashboard/brand-wizard" replace />} />
                            <Route path="/productos" element={<Navigate to="/tiendas" replace />} />
                            <Route path="/crear-tienda" element={<Navigate to="/dashboard/create-shop" replace />} />
                            <Route path="/perfil" element={<Navigate to="/profile" replace />} />

                            {/* Admin legacy typo redirect */}
                            <Route path="/admin/desing-system" element={<Navigate to="/backoffice/diseno" replace />} />
                            {/* Redirect old admin moderation route to new independent route */}
                            <Route path="/admin/moderation" element={<Navigate to="/backoffice/moderacion" replace />} />

                            {/* ═══════════════════════════════════════════════════════════
                                BACKOFFICE UNIFICADO — /backoffice/*
                                Panel único para administración y moderación.
                                Reemplaza /admin/* y /moderacion/* con navegación unificada.
                            ════════════════════════════════════════════════════════════ */}

                            {/* Login público del backoffice */}
                            <Route
                              path="/backoffice/login"
                              element={
                                <Suspense fallback={<BackofficePageSkeleton />}>
                                  <BackofficeLoginPage />
                                </Suspense>
                              }
                            />

                            {/* Rutas protegidas del backoffice con layout unificado */}
                            <Route element={<BackofficeProtectedRoute />}>
                              <Route element={<BackofficeLayout />}>

                                {/* Redirect /backoffice → /backoffice/home */}
                                <Route
                                  index
                                  path="/backoffice"
                                  element={<Navigate to="/backoffice/home" replace />}
                                />

                                {/* HOME — Panel de Operaciones (todos los roles) */}
                                <Route
                                  path="/backoffice/home"
                                  element={
                                    <BackofficeProtectedRoute section="home">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BackofficeHomePage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />

                                {/* MODERACIÓN (todos los roles de backoffice) */}
                                <Route
                                  path="/backoffice/moderacion"
                                  element={
                                    <BackofficeProtectedRoute section="moderation">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <ModerationPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/revisor"
                                  element={
                                    <BackofficeProtectedRoute section="revisor">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <ProductReviewPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/analytics"
                                  element={
                                    <BackofficeProtectedRoute section="analytics">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <ProductAnalyticsPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/envios"
                                  element={
                                    <BackofficeProtectedRoute section="envios">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <ShippingDashboardPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />

                                {/* CONTENIDO (admin+) */}
                                <Route
                                  path="/backoffice/cms"
                                  element={
                                    <BackofficeProtectedRoute section="cms">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <CmsAdminPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/historias"
                                  element={
                                    <BackofficeProtectedRoute section="historias">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BlogPostsAdminPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/colecciones"
                                  element={
                                    <BackofficeProtectedRoute section="colecciones">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <CollectionsAdminPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/taxonomia"
                                  element={
                                    <BackofficeProtectedRoute section="taxonomia">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <TaxonomyModerationPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />

                                {/* OPERACIONES + SISTEMA (super_admin) */}
                                <Route
                                  path="/backoffice/dashboard"
                                  element={
                                    <BackofficeProtectedRoute section="dashboard">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <AdminPage />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/usuarios"
                                  element={
                                    <BackofficeProtectedRoute section="usuarios">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <UserRolesAdminPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/diseno"
                                  element={
                                    <BackofficeProtectedRoute section="diseno">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <DesignSystemEditorPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/ordenes"
                                  element={
                                    <BackofficeProtectedRoute section="ordenes">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BackofficeOrdenesPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/cupones"
                                  element={
                                    <BackofficeProtectedRoute section="cupones">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BackofficeCuponesPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/imagenes"
                                  element={
                                    <BackofficeProtectedRoute section="imagenes">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BackofficeImagenesPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/tiendas"
                                  element={
                                    <BackofficeProtectedRoute section="tiendas">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BackofficeTiendasPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/pagos"
                                  element={
                                    <BackofficeProtectedRoute section="pagos">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BackofficePagosPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />
                                <Route
                                  path="/backoffice/auditoria"
                                  element={
                                    <BackofficeProtectedRoute section="auditoria">
                                      <Suspense fallback={<BackofficePageSkeleton />}>
                                        <BackofficeAuditoriaPage_lazy />
                                      </Suspense>
                                    </BackofficeProtectedRoute>
                                  }
                                />

                              </Route>
                            </Route>

                            {/* ═══════════════════════════════════════════════════════════
                                REDIRECTS DE COMPATIBILIDAD
                                Las rutas antiguas /admin y /moderacion redirigen al nuevo
                                /backoffice. Los bookmarks existentes siguen funcionando.
                            ════════════════════════════════════════════════════════════ */}
                            <Route path="/admin/login" element={<Navigate to="/backoffice/login" replace />} />
                            <Route path="/admin" element={<Navigate to="/backoffice/dashboard" replace />} />
                            <Route path="/admin/design-system" element={<Navigate to="/backoffice/diseno" replace />} />
                            <Route path="/admin/taxonomy-moderation" element={<Navigate to="/backoffice/taxonomia" replace />} />
                            <Route path="/admin/dummy-reset" element={<Navigate to="/backoffice/dashboard" replace />} />
                            <Route path="/moderacion" element={<Navigate to="/backoffice/moderacion" replace />} />
                            <Route path="/moderacion/analytics" element={<Navigate to="/backoffice/analytics" replace />} />
                            <Route path="/moderacion/revisor-productos" element={<Navigate to="/backoffice/revisor" replace />} />
                            <Route path="/moderacion/envios-dashboard" element={<Navigate to="/backoffice/envios" replace />} />
                            <Route path="/moderacion/cms" element={<Navigate to="/backoffice/cms" replace />} />
                            <Route path="/moderacion/usuarios" element={<Navigate to="/backoffice/usuarios" replace />} />
                            <Route path="/moderacion/historias-cms" element={<Navigate to="/backoffice/historias" replace />} />
                            <Route path="/moderacion/colecciones-cms" element={<Navigate to="/backoffice/colecciones" replace />} />

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
                        <SonnerToaster richColors position="bottom-right" />
                      </GamificationProvider>
                    </MasterAgentProvider>
                  </LanguageProvider>
                </DataCacheProvider>
              </AuthInitializer>
            </DesignSystemProvider>
          </BrowserRouter>
        </HelmetProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;
