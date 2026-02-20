# Ejemplos de Integración Frontend

## 🚀 Implementación Rápida en React

### 1. Servicio de Autenticación

```typescript
// services/authService.ts
export class AuthService {
  private apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:3040/telar/server';

  /**
   * Inicia el flujo de Google OAuth
   */
  loginWithGoogle(): void {
    window.location.href = `${this.apiUrl}/auth/google`;
  }

  /**
   * Guarda el token JWT
   */
  saveToken(token: string): void {
    localStorage.setItem('access_token', token);
  }

  /**
   * Obtiene el token guardado
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  /**
   * Configura headers con JWT
   */
  getHeaders(): Record<string, string> {
    const token = this.getToken();
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  }

  /**
   * Valida si el token es válido
   */
  async validateToken(): Promise<boolean> {
    const token = this.getToken();
    if (!token) return false;

    try {
      const response = await fetch(`${this.apiUrl}/auth/validate`, {
        headers: this.getHeaders(),
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Obtiene el perfil del usuario autenticado
   */
  async getProfile() {
    const response = await fetch(`${this.apiUrl}/auth/profile`, {
      headers: this.getHeaders(),
    });
    return await response.json();
  }

  /**
   * Cierra sesión
   */
  logout(): void {
    localStorage.removeItem('access_token');
    window.location.href = '/';
  }
}

export const authService = new AuthService();
```

---

### 2. Componente de Login

```typescript
// pages/LoginPage.tsx
import { useEffect, useState } from 'react';
import { authService } from '@/services/authService';

export function LoginPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Verificar si ya está autenticado
    authService.validateToken().then((isValid) => {
      if (isValid) {
        window.location.href = '/dashboard';
      }
      setIsLoading(false);
    });
  }, []);

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  return (
    <div className="login-container">
      <h1>Bienvenido a Telar</h1>
      
      <button
        onClick={() => authService.loginWithGoogle()}
        className="google-login-btn"
      >
        🔐 Iniciar sesión con Google
      </button>

      <p>o </p>

      <button onClick={() => window.location.href = '/login-tradicional'}>
        Iniciar sesión con email y contraseña
      </button>
    </div>
  );
}
```

---

### 3. Página de Callback (después de Google)

```typescript
// pages/AuthCallbackPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '@/services/authService';

export function AuthCallbackPage() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Esperar a que Google complete el flujo
    const handleCallback = async () => {
      try {
        // El token debería estar en la URL o en la respuesta anterior
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('access_token');

        if (token) {
          authService.saveToken(token);
          navigate('/dashboard');
        } else {
          // Si no hay token en URL, esperar 2 segundos (Google puede estar procesando)
          setTimeout(() => {
            const savedToken = authService.getToken();
            if (savedToken) {
              navigate('/dashboard');
            } else {
              setError('No se pudo completar la autenticación');
            }
          }, 2000);
        }
      } catch (err) {
        setError('Error durante la autenticación');
        console.error(err);
      }
    };

    handleCallback();
  }, [navigate]);

  if (error) {
    return (
      <div className="auth-error">
        <h2>Error de Autenticación</h2>
        <p>{error}</p>
        <button onClick={() => window.location.href = '/login'}>
          Volver al login
        </button>
      </div>
    );
  }

  return <div>Completando autenticación...</div>;
}
```

---

### 4. Context/Hook Personalizado

```typescript
// hooks/useAuth.ts
import { useEffect, useState, useCallback } from 'react';
import { authService } from '@/services/authService';

interface User {
  id: string;
  email: string;
  role: string;
  isSuperAdmin: boolean;
  [key: string]: any;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const checkAuth = useCallback(async () => {
    const isValid = await authService.validateToken();
    if (isValid) {
      try {
        const profile = await authService.getProfile();
        setUser(profile);
        setIsAuthenticated(true);
      } catch (error) {
        authService.logout();
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const login = useCallback(() => {
    authService.loginWithGoogle();
  }, []);

  const logout = useCallback(() => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  return {
    user,
    isAuthenticated,
    isLoading,
    login,
    logout,
    checkAuth,
  };
}

// Uso:
// const { user, isAuthenticated, login, logout } = useAuth();
```

---

### 5. Componente Protegido

```typescript
// components/ProtectedRoute.tsx
import { useAuth } from '@/hooks/useAuth';
import { Navigate } from 'react-router-dom';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return <div>Cargando...</div>;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <>{children}</>;
}

// Uso:
// <ProtectedRoute requiredRole="admin">
//   <AdminDashboard />
// </ProtectedRoute>
```

---

## 🔗 Javascript Vanilla (Sin Framework)

```html
<!DOCTYPE html>
<html>
<head>
    <title>Login - Telar</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            margin: 0;
            background: #f5f5f5;
        }
        .container {
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            text-align: center;
        }
        .google-btn {
            background: #4285F4;
            color: white;
            padding: 12px 24px;
            border: none;
            border-radius: 4px;
            font-size: 16px;
            cursor: pointer;
            margin: 10px 0;
        }
        .google-btn:hover {
            background: #357AB9;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Telar</h1>
        <p>Plataforma de artesanos colombianos</p>
        
        <button class="google-btn" onclick="loginWithGoogle()">
            🔐 Iniciar sesión con Google
        </button>
    </div>

    <script>
        const API_URL = 'http://localhost:3040/telar/server';

        function loginWithGoogle() {
            window.location.href = `${API_URL}/auth/google`;
        }

        function saveToken(token) {
            localStorage.setItem('access_token', token);
        }

        function getToken() {
            return localStorage.getItem('access_token');
        }

        async function validateToken() {
            const token = getToken();
            if (!token) return false;

            try {
                const response = await fetch(`${API_URL}/auth/validate`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                return response.ok;
            } catch (error) {
                return false;
            }
        }

        async function checkAuth() {
            const isValid = await validateToken();
            if (isValid) {
                window.location.href = '/dashboard';
            }
        }

        // Verificar autenticación al cargar
        checkAuth();
    </script>
</body>
</html>
```

---

## 📱 React Native / Expo

```typescript
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://192.168.x.x:3040/telar/server'; // Tu IP local

export function useGoogleAuth() {
  const [token, setToken] = React.useState<string | null>(null);

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com',
    redirectUrl: AuthSession.getRedirectUrl(),
    scopes: ['profile', 'email'],
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const { authentication } = response;
      exchangeToken(authentication?.accessToken);
    }
  }, [response]);

  async function exchangeToken(googleToken: string | undefined) {
    if (!googleToken) return;

    try {
      // Enviar token de Google a nuestro backend
      const response = await fetch(`${API_URL}/auth/google/callback`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ googleToken }),
      });

      const data = await response.json();
      
      if (data.access_token) {
        await AsyncStorage.setItem('access_token', data.access_token);
        setToken(data.access_token);
      }
    } catch (error) {
      console.error('Error al autenticar:', error);
    }
  }

  return { token, loginWithGoogle: promptAsync };
}
```

---

## 🔐 Fetch con Interceptor de Token

```typescript
// utils/api.ts
class APIClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = localStorage.getItem('access_token');
    
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...options.headers as Record<string, string>,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expirado
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }

    if (!response.ok) {
      throw new Error(`API Error: ${response.statusText}`);
    }

    return await response.json();
  }

  get<T>(endpoint: string) {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  post<T>(endpoint: string, body: any) {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  }

  // ... más métodos
}

export const api = new APIClient('http://localhost:3040/telar/server');

// Uso:
// const user = await api.get('/auth/profile');
// await api.post('/users', { name: 'Juan' });
```

---

## 📝 Variables de Entorno (Frontend)

```bash
# .env
REACT_APP_API_URL=http://localhost:3040/telar/server
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id

# Producción .env.production
REACT_APP_API_URL=https://api.tudominio.com/telar/server
REACT_APP_GOOGLE_CLIENT_ID=your_production_google_client_id
```

---

## ✅ Checklist de Implementación

- [ ] Crear Authentication Service
- [ ] Crear Login Page con botón de Google
- [ ] Crear Auth Callback Handler
- [ ] Implementar useAuth Hook
- [ ] Proteger rutas privadas
- [ ] Agregar interceptor de token
- [ ] Manejo de errores de autenticación
- [ ] Logout functionality
- [ ] Refresh token (si aplica)
- [ ] Persistencia de sesión
- [ ] Testing en desarrollo
- [ ] Testing en producción

---

## 🐛 Debugging

```typescript
// Debug: Ver qué está pasando en el callback
useEffect(() => {
  console.log('URL actual:', window.location.href);
  console.log('Token guardado:', localStorage.getItem('access_token'));
  
  // Esperar respuesta del servidor
  fetch('http://localhost:3040/telar/server/auth/validate', {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('access_token')}`
    }
  })
    .then(r => r.json())
    .then(data => console.log('Token válido:', data))
    .catch(e => console.error('Error:', e));
}, []);
```

---

¡Tu Google OAuth está listo para integración con frontend! 🚀
