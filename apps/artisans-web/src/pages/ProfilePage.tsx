import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, ShieldCheck, Shield } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user';
import { useIsModerator } from '@/hooks/useIsModerator';

import { ProfileNavigation, ProfileSection } from '@/components/profile/ProfileNavigation';
import { ProfileHeaderCompact, RutStatus } from '@/components/profile/ProfileHeaderCompact';
import { PersonalInfoSection } from '@/components/profile/sections/PersonalInfoSection';
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

  const { isModerator, isAdmin } = useIsModerator();

  const [activeSection, setActiveSection] = useState<ProfileSection>('personal');
  const [showLogoutDialog, setShowLogoutDialog] = useState(false);

  const rutStatus: RutStatus = profile?.rut
    ? (profile.rutPendiente ? 'pending' : 'verified')
    : 'none';

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const handleSavePersonalInfo = async (data: any) => {
    await updateProfile(data);
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
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
            rut={profile?.rut}
            rutPendiente={profile?.rutPendiente}
            onSave={handleSavePersonalInfo}
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
    <div className="flex-1 overflow-y-auto">
      {/* Main Content */}
      <main className="container max-w-7xl mx-auto px-3 sm:px-4 py-3 sm:py-6">
        <div className="mb-4 sm:mb-6">
          <ProfileHeaderCompact
            fullName={profile?.fullName || ''}
            brandName={profile?.brandName}
            avatarUrl={profile?.avatarUrl}
            rutStatus={rutStatus}
            email={user?.email}
          />
        </div>

        {/* Layout with Navigation */}
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-8">
          {/* Sidebar Navigation */}
          <div className="flex flex-col gap-3">
            <ProfileNavigation
              activeSection={activeSection}
              onSectionChange={setActiveSection}
              onLogout={() => setShowLogoutDialog(true)}
            />

            {/* Admin / Moderator access panel */}
            {(isAdmin || isModerator) && (
              <div className="glass-card-sm rounded-2xl p-4 space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                  Acceso privilegiado
                </p>
                {isAdmin && (
                  <button
                    onClick={() => navigate('/admin')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors hover:bg-muted"
                  >
                    <ShieldCheck className="h-4 w-4 text-brand-orange shrink-0" />
                    Panel de administración
                  </button>
                )}
                {isModerator && (
                  <button
                    onClick={() => navigate('/moderacion')}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-colors hover:bg-muted"
                  >
                    <Shield className="h-4 w-4 text-success shrink-0" />
                    Panel de moderación
                  </button>
                )}
              </div>
            )}
          </div>

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
