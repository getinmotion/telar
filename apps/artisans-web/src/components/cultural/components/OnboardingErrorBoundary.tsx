
import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class OnboardingErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Onboarding error:', error, errorInfo);
  }

  handleReset = () => {
    // ✅ FIX: Limpiar localStorage corrupto y redirigir
    try {
      // Intentar limpiar progreso corrupto
      const userId = localStorage.getItem('userId'); // Si existe
      if (userId) {
        const key = `fused_maturity_calculator_progress_${userId}`;
        localStorage.removeItem(key);
        console.log('🧹 [ERROR-RECOVERY] Cleaned user-namespaced progress');
      }
      // También limpiar global por si acaso
      localStorage.removeItem('fused_maturity_calculator_progress');
      console.log('🧹 [ERROR-RECOVERY] Cleaned global progress');
    } catch (e) {
      console.error('❌ [ERROR-RECOVERY] Failed to clean storage:', e);
    }
    
    // Resetear estado del error
    this.setState({ hasError: false, error: undefined });
    
    // Redirigir al dashboard para reinicio limpio
    console.log('🔄 [ERROR-RECOVERY] Redirecting to dashboard...');
    window.location.href = '/dashboard/home';
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="border-2 border-red-100 rounded-3xl shadow-lg bg-white/95 backdrop-blur-sm max-w-md mx-auto">
          <CardContent className="pt-8 px-8 text-center">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-red-700 mb-2">
              Something went wrong
            </h3>
            <p className="text-muted-foreground mb-6">
              There was an error loading the assessment. Please try again.
            </p>
            <Button 
              onClick={this.handleReset}
              className="flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </Button>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}
