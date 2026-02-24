import React from 'react';
import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wand2, Zap, Package, Check } from 'lucide-react';

interface UploadMethodSelectorProps {
  onSelectMethod: (method: 'wizard' | 'quick' | 'batch') => void;
}

const methods = [
  {
    id: 'wizard' as const,
    icon: Wand2,
    title: 'Asistente Guiado',
    subtitle: 'Paso a paso con IA',
    features: [
      'Análisis IA completo',
      '5 pasos detallados',
      'Mejor para productos únicos',
      'Personalización total'
    ],
    color: 'from-primary to-primary-glow',
    recommended: true
  },
  {
    id: 'quick' as const,
    icon: Zap,
    title: 'Publicación Express',
    subtitle: 'Rápido y simple',
    features: [
      'Solo 1 foto + precio',
      'Publicación en segundos',
      'Ideal para pruebas',
      'Editable después'
    ],
    color: 'from-secondary to-accent'
  },
  {
    id: 'batch' as const,
    icon: Package,
    title: 'Carga Masiva',
    subtitle: 'Hasta 20 productos',
    features: [
      'Procesamiento automático',
      'Análisis IA en lote',
      'Ahorra tiempo',
      'Ideal para catálogos'
    ],
    color: 'from-accent to-secondary'
  }
];

export const UploadMethodSelector: React.FC<UploadMethodSelectorProps> = ({ onSelectMethod }) => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-3"
      >
        <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
          ¿Cómo prefieres subir tus productos?
        </h2>
        <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
          Elige la modalidad que mejor se adapte a tus necesidades
        </p>
      </motion.div>

      {/* Method Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {methods.map((method, index) => {
          const Icon = method.icon;
          return (
            <motion.div
              key={method.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="relative p-6 h-full hover:shadow-card transition-shadow cursor-pointer group">
                {method.recommended && (
                  <div className="absolute -top-3 right-4">
                    <span className="bg-gradient-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold shadow-lg">
                      ⭐ Recomendado
                    </span>
                  </div>
                )}

                <div className="space-y-4">
                  {/* Icon */}
                  <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${method.color} flex items-center justify-center`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>

                  {/* Title */}
                  <div>
                    <h3 className="text-xl font-bold mb-1">{method.title}</h3>
                    <p className="text-sm text-muted-foreground">{method.subtitle}</p>
                  </div>

                  {/* Features */}
                  <ul className="space-y-2">
                    {method.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm">
                        <Check className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>

                  {/* Button */}
                  <Button
                    onClick={() => onSelectMethod(method.id)}
                    className={`w-full bg-gradient-to-r ${method.color} hover:shadow-glow transition-all duration-300`}
                  >
                    Usar este método
                  </Button>
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Help Text */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
        className="text-center text-sm text-muted-foreground"
      >
        💡 Puedes cambiar de método en cualquier momento desde los tabs superiores
      </motion.p>
    </div>
  );
};
