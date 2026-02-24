import React from 'react';
import { LucideIcon } from 'lucide-react';
import { motion } from 'framer-motion';

export interface QuickAction {
  title: string;
  description: string;
  icon: LucideIcon;
  action: () => void;
  color?: string;
}

interface QuickActionsGridProps {
  actions: QuickAction[];
}

export const QuickActionsGrid: React.FC<QuickActionsGridProps> = ({ actions }) => {
  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-float border border-white/20">
      <h2 className="text-xl font-bold text-foreground mb-6">Acciones Rápidas</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            onClick={action.action}
            className="group cursor-pointer bg-gradient-to-br from-background/50 to-background border border-border/30 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-primary/30"
          >
            <div className={`w-12 h-12 rounded-full ${action.color || 'bg-gradient-to-br from-primary/80 to-primary'} flex items-center justify-center mb-3 shadow-md group-hover:scale-110 transition-transform`}>
              <action.icon className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-1">
              {action.title}
            </h3>
            <p className="text-sm text-muted-foreground">
              {action.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
