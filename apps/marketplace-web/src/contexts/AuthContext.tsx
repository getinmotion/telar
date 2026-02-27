import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { toast } from 'sonner';
import {
  signUpWithEmail,
  signInWithEmail,
  initiateGoogleAuth,
  sendOtp,
  verifyOtp,
  requestPasswordReset,
  updatePassword as updatePasswordService,
  signOut as signOutService,
  getCurrentUser,
} from '@/services/auth.actions';
import { AuthUser, AuthResponse, RegisterMarketplaceResponse, SignUpData } from '@/types/auth.types';

interface AuthContextType {
  user: AuthUser | null;
  loading: boolean;
  signUp: (data: SignUpData) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendCustomOTP: (email: string, channel: 'email' | 'whatsapp') => Promise<void>;
  verifyCustomOTP: (email: string, code: string) => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updatePassword: (newPassword: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar si hay una sesión existente al cargar
    const initializeAuth = async () => {
      try {
        const authResponse = await getCurrentUser();
        if (authResponse?.user) {
          setUser(authResponse.user);
          checkUserType(authResponse.user.id);
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, []);

  const checkUserType = async (userId: string) => {
    try {
      const authResponse = await getCurrentUser();
      if (authResponse?.userMasterContext) {
        // Si el usuario es un artesano, mostrar notificación
        if (authResponse.user.role === 'user' || authResponse.artisanShop) {
          toast.info(
            'Hola artesano! ¿Quieres ir a tu app?',
            {
              action: {
                label: 'Ir a mi App',
                onClick: () => window.open(authResponse.artisanShop.shopSlug || 'https://app.telar.co', '_blank')
              },
              duration: 10000
            }
          );
        }
      }
    } catch (error) {
      console.error('Error checking user type:', error);
    }
  };

  const signUp = async (data: SignUpData) => {
    try {
      const response: RegisterMarketplaceResponse = await signUpWithEmail(data);
      setUser({
        ...response.user,
        isSuperAdmin: false,
        rawUserMetaData: null,
        bannedUntil: null,
        deletedAt: null,
        isSsoUser: false,
      });
      toast.success(response.message);
    } catch (error: any) {
      throw error;
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const response = await signInWithEmail(email, password);
      setUser(response?.user);
      checkUserType(response.user.id);
      toast.success('Bienvenido de vuelta');
    } catch (error: any) {
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await initiateGoogleAuth();
    } catch (error: any) {
      console.error('Google auth error:', error);
      toast.error('Error al iniciar sesión con Google');
      throw error;
    }
  };

  const sendCustomOTP = async (email: string, channel: 'email' | 'whatsapp' = 'email') => {
    try {
      await sendOtp(email, channel);
      toast.success(`Código enviado a ${email}`);
    } catch (error: any) {
      console.error('Error al enviar OTP:', error);
      toast.error(error.response?.data?.message || 'Error al enviar código de verificación');
      throw error;
    }
  };

  const verifyCustomOTP = async (email: string, code: string) => {
    try {
      const response = await verifyOtp(email, code);
      setUser(response.user);
      checkUserType(response.user.id);
      toast.success('Verificación exitosa. Redirigiendo...');
    } catch (error: any) {
      console.error('Error al verificar OTP:', error);
      toast.error(error.response?.data?.message || 'Código inválido o expirado');
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await requestPasswordReset(email);
      toast.success('Revisa tu email para instrucciones de reset');
    } catch (error: any) {
      console.error('Error al resetear contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al solicitar reset de contraseña');
      throw error;
    }
  };

  const updatePassword = async (newPassword: string) => {
    try {
      await updatePasswordService(newPassword);
      toast.success('Contraseña actualizada exitosamente');
    } catch (error: any) {
      console.error('Error al actualizar contraseña:', error);
      toast.error(error.response?.data?.message || 'Error al actualizar contraseña');
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await signOutService();
      setUser(null);
      toast.success('Sesión cerrada');
    } catch (error: any) {
      console.error('Sign out error:', error);
      toast.error('Error al cerrar sesión');
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signInWithGoogle,
      sendCustomOTP,
      verifyCustomOTP,
      resetPassword,
      updatePassword,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
