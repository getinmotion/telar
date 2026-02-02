import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, fullName: string, userType?: string) => Promise<void>;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  sendCustomOTP: (email: string, channel: 'email' | 'whatsapp') => Promise<void>;
  verifyCustomOTP: (email: string, code: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false);
        
        // Check user type after login
        if (session?.user) {
          setTimeout(() => {
            checkUserType(session.user.id);
          }, 0);
        }
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const checkUserType = async (userId: string) => {
    const { data } = await supabase
      .from('user_profiles')
      .select('user_type, artisan_app_url')
      .eq('id', userId)
      .single();
      
    if (data?.user_type === 'artisan') {
      toast.info(
        'Hola artesano! ¿Quieres ir a tu app?',
        {
          action: {
            label: 'Ir a mi App',
            onClick: () => window.open(data.artisan_app_url || 'https://app.telar.co', '_blank')
          },
          duration: 10000
        }
      );
    }
  };

  const signUp = async (email: string, password: string, fullName: string, userType: string = 'marketplace_customer') => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: {
          full_name: fullName,
          user_type: userType
        }
      }
    });

    if (error) throw error;
    toast.success('Cuenta creada exitosamente');
  };

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    toast.success('Bienvenido de vuelta');
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  };

  const sendCustomOTP = async (email: string, channel: 'email' | 'whatsapp' = 'email') => {
    try {
      const { data, error } = await supabase.functions.invoke('send-otp', {
        body: { email, channel }
      });

      if (error) throw error;
      toast.success(`Código enviado a ${email}`);
    } catch (error: any) {
      console.error('Error al enviar OTP:', error);
      toast.error(error.message || 'Error al enviar código de verificación');
      throw error;
    }
  };

  const verifyCustomOTP = async (email: string, code: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('verify-otp', {
        body: { email, code }
      });

      if (error) throw error;

      // Establecer la sesión usando el token_hash devuelto por el backend
      if (data?.token_hash) {
        const { error: verifyError } = await supabase.auth.verifyOtp({
          type: 'magiclink',
          token_hash: data.token_hash,
        });
        
        if (verifyError) {
          console.error('Error verificando token_hash:', verifyError);
          throw verifyError;
        }
      }
      toast.success('Verificación exitosa. Redirigiendo...');
    } catch (error: any) {
      console.error('Error al verificar OTP:', error);
      toast.error(error.message || 'Código inválido o expirado');
      throw error;
    }
  };
  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    toast.success('Sesión cerrada');
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signUp, signIn, signInWithGoogle, sendCustomOTP, verifyCustomOTP, signOut }}>
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
