import React, { useState } from 'react';
import { AdminLogin } from '@/components/admin/AdminLogin';
import { AdminDashboard } from '@/components/admin/AdminDashboard';
import { DataManagementPanel } from '@/components/admin/DataManagementPanel';
import { UserManagement } from '@/components/admin/UserManagement';
import { ImageManager } from '@/components/admin/ImageManager';
import { CompanyDocuments } from '@/components/admin/CompanyDocuments';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/context/AuthContext';
import { SiteImageManager } from '@/components/admin/SiteImageManager';
import { ModeratorManagement } from '@/components/admin/ModeratorManagement';
import { CouponManagement } from '@/components/admin/CouponManagement';
import { GiftCardManagement } from '@/components/admin/GiftCardManagement';
import { AdminAuditLogViewer } from '@/components/admin/AdminAuditLogViewer';
import { AdminOrdersPanel } from '@/components/admin/AdminOrdersPanel';
import { AdminShopsPanel } from '@/components/admin/shops';
import { AdminImageOptimization } from '@/components/admin/AdminImageOptimization';

const Admin = () => {
  const { user, signOut, loading, isAuthorized } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  
  const handleLogout = async () => {
    await signOut();
  };

  const handleNavigateToTab = (tab: string) => {
    setActiveTab(tab);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-cream text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Verificando permisos...</p>
        </div>
      </div>
    );
  }

  if (!user || !isAuthorized) {
    return (
      <div className="min-h-screen bg-cream text-foreground">
        <AdminHeader onLogout={handleLogout} isAuthenticated={!!user} />
        
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-md mx-auto mt-16">
            <AdminLogin />
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-cream text-foreground">
      <AdminHeader onLogout={handleLogout} isAuthenticated={true} />
      
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-8 bg-white/80 backdrop-blur-sm border border-border">
              <TabsTrigger 
                value="dashboard"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Dashboard
              </TabsTrigger>
              <TabsTrigger 
                value="orders"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Órdenes
              </TabsTrigger>
              <TabsTrigger 
                value="shops"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Tiendas
              </TabsTrigger>
              <TabsTrigger 
                value="users"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Usuarios
              </TabsTrigger>
              <TabsTrigger 
                value="moderation"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Moderación
              </TabsTrigger>
              <TabsTrigger 
                value="promotions"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Promociones
              </TabsTrigger>
              <TabsTrigger 
                value="audit"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Auditoría
              </TabsTrigger>
              <TabsTrigger 
                value="media"
                className="data-[state=active]:bg-accent data-[state=active]:text-white"
              >
                Medios
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard" className="mt-6">
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <AdminDashboard onNavigateToTab={handleNavigateToTab} />
              </div>
            </TabsContent>

            <TabsContent value="orders" className="mt-6">
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <AdminOrdersPanel />
              </div>
            </TabsContent>

            <TabsContent value="shops" className="mt-6">
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <AdminShopsPanel />
              </div>
            </TabsContent>

            <TabsContent value="users" className="mt-6">
              <div className="space-y-6">
                <UserManagement />
                <DataManagementPanel />
              </div>
            </TabsContent>

            <TabsContent value="moderation" className="mt-6">
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <ModeratorManagement />
              </div>
            </TabsContent>

            <TabsContent value="promotions" className="mt-6">
              <div className="space-y-6">
                <Tabs defaultValue="coupons" className="w-full">
                  <TabsList className="bg-white/80 backdrop-blur-sm border border-border">
                    <TabsTrigger value="coupons">Cupones</TabsTrigger>
                    <TabsTrigger value="giftcards">Gift Cards</TabsTrigger>
                  </TabsList>
                  <TabsContent value="coupons" className="mt-4">
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                      <CouponManagement />
                    </div>
                  </TabsContent>
                  <TabsContent value="giftcards" className="mt-4">
                    <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                      <GiftCardManagement />
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            </TabsContent>

            <TabsContent value="audit" className="mt-6">
              <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                <AdminAuditLogViewer />
              </div>
            </TabsContent>

            <TabsContent value="media" className="mt-6">
              <div className="space-y-6">
                <AdminImageOptimization />
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <h3 className="text-lg font-semibold mb-4">Editor de Design System</h3>
                  <p className="text-sm text-muted-foreground mb-4">Ajusta colores y tokens en tiempo real</p>
                  <a href="/admin/design-system" className="inline-flex items-center rounded-md border border-border bg-background px-3 py-2 text-sm font-medium hover:bg-accent/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary">
                    Abrir Editor
                  </a>
                </div>
                <ImageManager />
                <SiteImageManager />
                <div className="bg-white rounded-xl border border-border shadow-sm p-6">
                  <CompanyDocuments />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
