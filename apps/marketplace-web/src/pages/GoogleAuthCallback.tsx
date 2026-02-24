import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

/**
 * Página de callback para Google OAuth
 * Maneja la redirección desde el backend después de autenticarse con Google
 * Extrae el token de la URL, lo guarda en localStorage y redirige al home
 */
export default function GoogleAuthCallback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, loading } = useAuth();

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Extraer el token de la URL si está presente
        const token = searchParams.get('token');
        
        if (token) {
          // Guardar el token en localStorage
          localStorage.setItem('telar_token', token);
        }

        // Si el usuario ya está cargado en el contexto (getCurrentUser lo hizo),
        // redirigir al home
        if (user) {
          toast.success('Bienvenido con Google!');
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Error en callback de Google:', error);
        toast.error('Error al completar la autenticación');
        navigate('/auth', { replace: true });
      }
    };

    // Solo ejecutar cuando el loading sea false (el contexto ya se inicializó)
    if (!loading) {
      handleCallback();
    }
  }, [user, loading, navigate, searchParams]);

  // Mostrar pantalla de carga mientras se procesa
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <div className="mb-4">
          <div className="inline-block">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
          </div>
        </div>
        <h1 className="text-xl font-semibold text-gray-800">Completando autenticación...</h1>
        <p className="text-gray-600 mt-2">Te estamos redirigiendo al inicio</p>
      </div>
    </div>
  );
}
