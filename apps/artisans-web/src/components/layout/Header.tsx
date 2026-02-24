
import React from 'react';
import { MotionLogo } from '@/components/MotionLogo';

import { Button } from '@/components/ui/button';
import { Menu, X, UserPlus, LogIn, Settings } from 'lucide-react';
import { useState } from 'react';

interface HeaderProps {
  onAccessClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAccessClick }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="absolute top-0 left-0 right-0 z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-8 pt-6 md:pt-8">
        <div className="flex items-start justify-between">
          {/* Left Floating Menu - Navigation - Artisan style */}
          <nav className="hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-xl rounded-full px-6 py-3 shadow-card border border-primary/10">
            <a 
              href="/dashboard" 
              className="px-4 py-2 text-foreground hover:text-primary font-medium transition-all duration-300 hover:bg-primary-subtle rounded-full flex items-center gap-2"
            >
              🤖 Dashboard
            </a>
            
            <a 
              href="/dashboard/artisan" 
              className="px-4 py-2 text-foreground hover:text-primary font-medium transition-all duration-300 hover:bg-primary-subtle rounded-full flex items-center gap-2"
            >
              🎨 Taller Artesanal
            </a>
            
            <a 
              href="/tiendas" 
              className="px-4 py-2 text-foreground hover:text-primary font-medium transition-all duration-300 hover:bg-primary-subtle rounded-full flex items-center gap-2"
            >
              🏪 Tiendas
            </a>
          </nav>

          {/* Right Floating Menu - Auth & Admin - Artisan style */}
          <nav className="hidden md:flex items-center gap-3 bg-white/95 backdrop-blur-xl rounded-full px-6 py-3 shadow-card border border-primary/10">
            <Button
              onClick={() => window.location.href = '/login'}
              variant="ghost"
              size="sm"
              className="text-foreground hover:text-primary hover:bg-primary-subtle rounded-full"
            >
              <LogIn className="w-4 h-4 mr-2" />
              Iniciar Sesión
            </Button>
            
            <Button
              onClick={onAccessClick}
              className="bg-gradient-primary text-white hover:shadow-hover rounded-full px-6 transition-all hover:scale-105"
              size="sm"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Registro
            </Button>

            <a 
              href="/admin"
              className="p-2 text-muted-foreground hover:text-primary transition-all duration-200 rounded-full hover:bg-primary-subtle"
              title="Admin"
            >
              <Settings className="w-4 h-4" />
            </a>
          </nav>

          {/* Mobile Menu Button - Artisan style */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-3 bg-white/95 backdrop-blur-xl rounded-full shadow-card border border-primary/10 text-foreground hover:text-primary hover:bg-primary-subtle transition-all"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu - Artisan style */}
      {isMenuOpen && (
        <div className="md:hidden mt-4 mx-4 bg-white/98 backdrop-blur-xl border border-primary/20 rounded-2xl shadow-elegant p-4 space-y-2">
          <a 
            href="/dashboard" 
            className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-primary font-medium transition-all duration-200 hover:bg-primary-subtle rounded-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <span>🤖</span>
            Dashboard
          </a>

          <a 
            href="/dashboard/artisan" 
            className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-primary font-medium transition-all duration-200 hover:bg-primary-subtle rounded-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <span>🎨</span>
            Taller Artesanal
          </a>

          <a 
            href="/tiendas" 
            className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-primary font-medium transition-all duration-200 hover:bg-primary-subtle rounded-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <span>🏪</span>
            Tiendas
          </a>

          <a 
            href="/login" 
            className="flex items-center gap-3 px-4 py-3 text-foreground hover:text-primary font-medium transition-all duration-200 hover:bg-primary-subtle rounded-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <LogIn className="w-4 h-4" />
            Iniciar Sesión
          </a>
          
          <Button
            onClick={() => {
              onAccessClick();
              setIsMenuOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-gradient-primary hover:shadow-hover text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 hover:scale-105"
          >
            <UserPlus className="w-4 h-4" />
            Registro
          </Button>

          <a 
            href="/admin"
            className="flex items-center gap-3 px-4 py-2 text-muted-foreground hover:text-primary text-sm transition-all duration-200 hover:bg-primary-subtle rounded-xl"
            onClick={() => setIsMenuOpen(false)}
          >
            <Settings className="w-4 h-4" />
            Admin
          </a>
        </div>
      )}
    </header>
  );
};
