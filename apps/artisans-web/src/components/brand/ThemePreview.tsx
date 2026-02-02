import React from 'react';
import { ShopThemeProvider, useShopTheme } from '@/contexts/ShopThemeContext';

interface ShopTheme {
  themeId?: string;
  palette?: any;
  styleContext?: {
    tone: string;
    emotion: string;
    contrastMode: string;
    textureHint: string;
  };
  brandClaim?: string;
  logoUrl?: string;
}

interface ThemePreviewProps {
  theme: ShopTheme;
  previewDescription?: string;
}

export const ThemePreview: React.FC<ThemePreviewProps> = ({ theme, previewDescription }) => {
  return (
    <ShopThemeProvider theme={theme}>
      <div className="space-y-6">
        {previewDescription && (
          <div className="text-center mb-6">
            <div className="text-xl font-semibold mb-2">✨ Tu paleta está lista</div>
            <p className="text-muted-foreground text-sm">{previewDescription}</p>
            {theme.styleContext?.emotion && (
              <p className="text-sm text-muted-foreground/80 mt-2 italic">
                {theme.styleContext.emotion}
              </p>
            )}
          </div>
        )}
        <ThemePreviewContent />
      </div>
    </ShopThemeProvider>
  );
};

const ThemePreviewContent = () => {
  const { 
    getPrimaryColor, 
    getSecondaryColor, 
    getNeutralColor, 
    getAccentColor,
    theme 
  } = useShopTheme();
  
  return (
    <div className="space-y-6 p-6 rounded-2xl border" style={{ backgroundColor: getNeutralColor(50) }}>
      {/* Hero preview */}
      <div 
        className="p-8 rounded-xl text-center"
        style={{ 
          background: `linear-gradient(135deg, ${getPrimaryColor(500)}, ${getSecondaryColor(500)})` 
        }}
      >
        <h2 className="text-2xl font-bold text-white mb-2">
          {theme.brandClaim || 'Tu Marca Artesanal'}
        </h2>
        <p className="text-white/90">Ejemplo de sección destacada con tu paleta</p>
      </div>
      
      {/* Buttons preview */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button 
          className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 shadow-sm"
          style={{
            backgroundColor: getPrimaryColor(500),
            color: getNeutralColor(50),
          }}
        >
          Botón Principal
        </button>
        
        <button 
          className="px-5 py-2.5 rounded-lg font-semibold border-2 transition-all hover:scale-105"
          style={{
            borderColor: getPrimaryColor(500),
            color: getPrimaryColor(500),
            backgroundColor: 'transparent'
          }}
        >
          Botón Secundario
        </button>
        
        <button 
          className="px-5 py-2.5 rounded-lg font-semibold transition-all hover:scale-105 shadow-sm"
          style={{
            backgroundColor: getAccentColor(500),
            color: getNeutralColor(50),
          }}
        >
          Botón de Acento
        </button>
      </div>
      
      {/* Card preview */}
      <div 
        className="p-5 rounded-xl shadow-md"
        style={{ 
          backgroundColor: getNeutralColor(100),
          borderLeft: `4px solid ${getPrimaryColor(500)}`
        }}
      >
        <h3 className="text-lg font-bold mb-2" style={{ color: getNeutralColor(900) }}>
          Card de Producto
        </h3>
        <p className="text-sm mb-3" style={{ color: getNeutralColor(600) }}>
          Descripción del producto artesanal
        </p>
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-xl font-bold" style={{ color: getPrimaryColor(600) }}>
            $45.000
          </span>
          <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{
            backgroundColor: getAccentColor(100),
            color: getAccentColor(700),
          }}>
            Destacado
          </span>
        </div>
      </div>
      
      {/* Typography preview */}
      <div className="space-y-2">
        <h3 className="text-2xl font-bold" style={{ color: getPrimaryColor(700) }}>
          Títulos Principales
        </h3>
        <h4 className="text-xl font-semibold" style={{ color: getSecondaryColor(600) }}>
          Subtítulos Secundarios
        </h4>
        <p className="text-base" style={{ color: getNeutralColor(800) }}>
          Texto de párrafo normal - Lorem ipsum dolor sit amet
        </p>
        <p className="text-sm" style={{ color: getNeutralColor(600) }}>
          Texto secundario o descripciones
        </p>
      </div>

      {/* Color palette display */}
      <div className="pt-4 border-t" style={{ borderColor: getNeutralColor(200) }}>
        <p className="text-xs font-medium mb-3" style={{ color: getNeutralColor(600) }}>
          Paleta de colores
        </p>
        <div className="flex gap-2 flex-wrap">
          {[50, 100, 200, 300, 400, 500, 600, 700, 800, 900].map(shade => (
            <div 
              key={shade}
              className="w-8 h-8 rounded-md shadow-sm border"
              style={{ 
                backgroundColor: getPrimaryColor(shade),
                borderColor: getNeutralColor(200)
              }}
              title={`Primary ${shade}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
