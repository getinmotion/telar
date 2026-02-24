import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, LogOut, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useEmailPreferences } from '@/hooks/useEmailPreferences';
import { useMasterAgent } from '@/context/MasterAgentContext';
import { supabase } from '@/integrations/supabase/client';
import { getArtisanShopByUserId } from '@/services/artisanShops.actions';

import { ProfileNavigation, ProfileSection } from '@/components/profile/ProfileNavigation';
import { ProfileHeaderCompact } from '@/components/profile/ProfileHeaderCompact';
import { PersonalInfoSection } from '@/components/profile/sections/PersonalInfoSection';
import { ShopInfoSection } from '@/components/profile/sections/ShopInfoSection';
import { PreferencesSection } from '@/components/profile/sections/PreferencesSection';
import { PaymentSection } from '@/components/profile/sections/PaymentSection';
import { RutSection } from '@/components/profile/sections/RutSection';
import { NotificationsSection } from '@/components/profile/sections/NotificationsSection';
import { SecuritySection } from '@/components/profile/sections/SecuritySection';
import { SupportSection } from '@/components/profile/sections/SupportSection';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

const ProfilePage: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { profile, loading: profileLoading, updateProfile } = useUnifiedUserData();
  const { shop, loading: shopLoading } = useArtisanShop();
  const { preferences, loading: prefsLoading, saving: prefsSaving, updateCategory } = useEmailPreferences();
  const { masterState } = useMasterAgent();
  
  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);
  const [hasBankData, setHasBankData] = useState(false);
  const [bankStatus, setBankStatus] = useState<'incomplete' | 'complete' | 'pending_review' | 'rejected'>('incomplete');

  // Calculate maturity level
  const maturityLevel = useMemo(() => {
    const nivel = masterState?.growth?.nivel_madurez;
    if (nivel && typeof nivel === 'object' && 'overall' in nivel) {
      return Math.round((nivel as any).overall);
    }
    return 0;
  }, [masterState]);

  // Check bank data status
  useEffect(() => {
    const checkBankData = async () => {
      if (!user?.id) return;
      
      try {
        const data = await getArtisanShopByUserId(user.id);
        
        if (data?.idContraparty) {
          setHasBankData(true);
          setBankStatus('complete');
        }
      } catch (error) {
        console.error('Error checking bank data:', error);
      }
    };
    
    checkBankData();
  }, [user?.id]);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSavePersonalInfo = async (data: any) => {
    await updateProfile(data);
  };


  const handleNotificationToggle = async (category: string, value: boolean) => {
    await updateCategory(category as any, value);
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'personal':
        return (
          <PersonalInfoSection
            fullName={profile?.fullName || ''}
            email={user?.email || ''}
            phone={profile?.whatsappE164}
            department={profile?.department}
            city={profile?.city}
            onSave={handleSavePersonalInfo}
          />
        );
      case 'shop':
        return (
          <ShopInfoSection
            shop={shop}
            isLoading={shopLoading}
          />
        );
      case 'preferences':
        return <PreferencesSection />;
      case 'payment':
        return (
          <PaymentSection
            hasBankData={hasBankData}
            bankStatus={bankStatus}
          />
        );
      case 'fiscal':
        return (
          <RutSection
            rut={profile?.rut}
            rutPending={profile?.rutPendiente}
          />
        );
      case 'notifications':
        return (
          <NotificationsSection
            preferences={preferences}
            loading={prefsLoading}
            saving={prefsSaving}
            onToggle={handleNotificationToggle}
          />
        );
      case 'security':
        return <SecuritySection />;
      case 'support':
        return <SupportSection />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-20 bg-background/95 backdrop-blur-sm border-b border-border">
        <div className="container max-w-7xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
          <div className="flex items-center justify-between">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/dashboard')}
              className="gap-1 sm:gap-2 px-2 sm:px-3"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al Dashboard</span>
              <span className="sm:hidden">Volver</span>
            </Button>
            
            {/* Mobile logout button */}
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => setShowLogoutDialog(true)}
              className="lg:hidden text-destructive hover:text-destructive hover:bg-destructive/10 px-2"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <ProfileHeaderCompact
            fullName={profile?.fullName || ''}
            brandName={profile?.brandName || shop?.shop_name}
            avatarUrl={profile?.avatarUrl || shop?.logo_url}
            maturityLevel={maturityLevel}
            isVerified={!!profile?.rut && !profile?.rutPendiente}
            email={user?.email}
          />
        </div>

        {/* Layout with Navigation */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar Navigation */}
          <ProfileNavigation
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onLogout={() => setShowLogoutDialog(true)}
          />

          {/* Content Area */}
          <div className="flex-1 min-w-0 mt-2 lg:mt-0">
            {renderActiveSection()}
          </div>
        </div>
      </main>

      {/* Logout Confirmation Dialog */}
      <AlertDialog open={showLogoutDialog} onOpenChange={setShowLogoutDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Tendrás que volver a iniciar sesión para acceder a tu cuenta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Cerrar Sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ProfilePage;
