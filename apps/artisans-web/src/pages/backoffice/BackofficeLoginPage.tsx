/**
 * BackofficeLoginPage
 *
 * Login unificado para el backoffice de Telar.
 * Reemplaza AdminLoginPage y ModerationLogin.
 *
 * - Usa la misma acción login() del backend NestJS
 * - Verifica que el usuario tenga rol de backoffice (admin/moderator/super_admin)
 * - Redirige a la sección correcta según el rol
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/components/ui/use-toast';
import { Eye, EyeOff } from 'lucide-react';
import { login } from '@/pages/auth/actions/login.actions';
import { useAuthStore } from '@/stores/authStore';
import { SANS, SERIF, glassPrimary, PURPLE, GREEN_MOD } from '@/components/dashboard/dashboardStyles';

export const BackofficeLoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  // Destino al que volver después del login
  const from = (location.state as any)?.from?.pathname ?? null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await login({ email: email.trim().toLowerCase(), password });

      // Leer acceso después del login (el store ya fue hidratado por login())
      const { user } = useAuthStore.getState();
      const jwtRoles: string[] = (user as any)?.roles ?? [];
      const isSuperAdmin = user?.isSuperAdmin === true;
      const isAdmin = isSuperAdmin || jwtRoles.includes('admin') || jwtRoles.includes('admin_global');

      // Roles granulares de Fase 3E — mismo criterio que useBackofficeAccess.isModerator
      const GRANULAR_ROLES = ['moderator_product', 'moderator_taxonomy', 'curator_marketplace', 'supervisor', 'admin_global'];
      const hasBackofficeRole =
        isSuperAdmin ||
        isAdmin ||
        jwtRoles.includes('moderator') ||
        jwtRoles.includes('supervisor') ||
        GRANULAR_ROLES.some((r) => jwtRoles.includes(r));

      if (!hasBackofficeRole) {
        useAuthStore.getState().clearAuth();
        toast({
          title: 'Acceso denegado',
          description: 'Tu usuario no tiene permisos de backoffice.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Bienvenido al backoffice',
        description: 'Sesión iniciada correctamente.',
      });

      // Redirigir según el rol o al destino guardado
      if (from && from !== '/backoffice/login') {
        navigate(from, { replace: true });
      } else if (isAdmin) {
        navigate('/backoffice/home', { replace: true });
      } else {
        navigate('/backoffice/moderacion-os', { replace: true });
      }
    } catch (error: any) {
      toast({
        title: 'Error de autenticación',
        description:
          error?.response?.data?.message ?? 'Credenciales incorrectas o acceso denegado.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{
        backgroundColor: '#f9f7f2',
        backgroundImage: `
          radial-gradient(circle at top left, rgba(167,139,250,0.22) 0%, transparent 38%),
          radial-gradient(circle at bottom right, rgba(187,247,208,0.22) 0%, transparent 42%),
          radial-gradient(circle at top right, rgba(255,244,223,0.75) 0%, transparent 34%)
        `,
        backgroundAttachment: 'fixed',
        fontFamily: SANS,
      }}
    >
      <div
        style={{
          ...glassPrimary,
          borderRadius: 28,
          width: '100%',
          maxWidth: 420,
          padding: '40px 36px',
          boxShadow: '0 8px 40px rgba(21,27,45,0.08)',
        }}
      >
        {/* Ícono split morado/verde */}
        <div className="flex justify-center mb-6">
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: `linear-gradient(135deg, rgba(124,58,237,0.12) 0%, rgba(21,128,61,0.12) 100%)`,
              border: '1px solid rgba(124,58,237,0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 26, color: PURPLE }}>
              admin_panel_settings
            </span>
          </div>
        </div>

        {/* Título */}
        <h1
          style={{
            fontFamily: "'League Spartan', Arial, sans-serif",
            fontSize: 26,
            fontWeight: 800,
            color: '#151b2d',
            textAlign: 'center',
            letterSpacing: '-0.02em',
            marginBottom: 4,
          }}
        >
          Backoffice Telar
        </h1>
        <p
          style={{
            fontFamily: SERIF,
            fontSize: 13,
            color: 'rgba(20,34,57,0.45)',
            fontStyle: 'italic',
            textAlign: 'center',
            marginBottom: 32,
          }}
        >
          Administración y moderación
        </p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(84,67,62,0.5)',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="admin@telar.co"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              autoFocus
              style={{
                width: '100%',
                background: 'rgba(255,255,255,0.6)',
                border: '1px solid rgba(21,27,45,0.08)',
                borderRadius: 12,
                padding: '12px 16px',
                fontFamily: SANS,
                fontSize: 14,
                fontWeight: 500,
                color: '#151b2d',
                outline: 'none',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(124,58,237,0.08)`; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(21,27,45,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Contraseña */}
          <div>
            <label
              htmlFor="password"
              style={{
                fontFamily: SANS,
                fontSize: 10,
                fontWeight: 800,
                letterSpacing: '0.15em',
                textTransform: 'uppercase',
                color: 'rgba(84,67,62,0.5)',
                display: 'block',
                marginBottom: 8,
              }}
            >
              Contraseña
            </label>
            <div style={{ position: 'relative' }}>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                style={{
                  width: '100%',
                  background: 'rgba(255,255,255,0.6)',
                  border: '1px solid rgba(21,27,45,0.08)',
                  borderRadius: 12,
                  padding: '12px 44px 12px 16px',
                  fontFamily: SANS,
                  fontSize: 14,
                  fontWeight: 500,
                  color: '#151b2d',
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = PURPLE; e.currentTarget.style.boxShadow = `0 0 0 3px rgba(124,58,237,0.08)`; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(21,27,45,0.08)'; e.currentTarget.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                tabIndex={-1}
                style={{
                  position: 'absolute',
                  right: 14,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'rgba(20,34,57,0.35)',
                  padding: 0,
                  display: 'flex',
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading || !email || !password}
            style={{
              background: isLoading || !email || !password
                ? 'rgba(124,58,237,0.35)'
                : `linear-gradient(135deg, ${PURPLE} 0%, #6d28d9 100%)`,
              color: 'white',
              border: 'none',
              borderRadius: 9999,
              padding: '13px 32px',
              fontFamily: SANS,
              fontSize: 14,
              fontWeight: 700,
              cursor: isLoading || !email || !password ? 'not-allowed' : 'pointer',
              boxShadow: isLoading || !email || !password ? 'none' : '0 4px 14px rgba(124,58,237,0.3)',
              transition: 'all 0.2s',
              width: '100%',
              marginTop: 4,
            }}
          >
            {isLoading ? 'Verificando...' : 'Acceder al backoffice'}
          </button>
        </form>

        {/* Footer dominios */}
        <div className="flex items-center justify-center gap-4 mt-6">
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 10, fontWeight: 700, color: PURPLE, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: PURPLE, display: 'inline-block' }} />
            Negocio
          </span>
          <span style={{ width: 1, height: 12, background: 'rgba(20,34,57,0.12)' }} />
          <span style={{ display: 'flex', alignItems: 'center', gap: 5, fontFamily: SANS, fontSize: 10, fontWeight: 700, color: GREEN_MOD, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: GREEN_MOD, display: 'inline-block' }} />
            Moderación
          </span>
        </div>

        <a
          href="/"
          style={{
            display: 'block',
            textAlign: 'center',
            marginTop: 16,
            fontFamily: SANS,
            fontSize: 12,
            color: 'rgba(20,34,57,0.35)',
            textDecoration: 'none',
          }}
        >
          ← Volver al portal
        </a>
      </div>
    </div>
  );
};

export default BackofficeLoginPage;
