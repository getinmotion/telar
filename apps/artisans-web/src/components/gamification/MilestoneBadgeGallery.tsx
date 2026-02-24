import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { 
  FileCheck, 
  Palette, 
  Store, 
  TrendingUp, 
  Users, 
  Lock,
  Sparkles
} from 'lucide-react';
import { useUserProgress } from '@/hooks/user/useUserProgress';

const milestoneIcons: Record<string, React.ReactNode> = {
  'milestone_formalization': <FileCheck className="w-8 h-8" />,
  'milestone_brand': <Palette className="w-8 h-8" />,
  'milestone_shop': <Store className="w-8 h-8" />,
  'milestone_sales': <TrendingUp className="w-8 h-8" />,
  'milestone_community': <Users className="w-8 h-8" />
};

interface MilestoneBadgeGalleryProps {
  variant?: 'compact' | 'detailed';
}

export const MilestoneBadgeGallery: React.FC<MilestoneBadgeGalleryProps> = ({
  variant = 'detailed'
}) => {
  const { achievements, loading } = useUserProgress();

  // Filter milestone achievements
  const milestoneBadges = achievements.filter(a => 
    a.id.startsWith('milestone_')
  );

  const unlockedCount = milestoneBadges.filter(b => b.isUnlocked).length;
  const totalBadges = milestoneBadges.length;

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cargando logros...</CardTitle>
        </CardHeader>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-2 flex-wrap">
        {milestoneBadges.map((badge) => (
          <motion.div
            key={badge.id}
            whileHover={{ scale: badge.isUnlocked ? 1.1 : 1 }}
            className={`relative ${badge.isUnlocked ? 'cursor-pointer' : ''}`}
            title={badge.isUnlocked ? badge.title : '🔒 Bloqueado'}
          >
            <div 
              className={`
                w-12 h-12 rounded-full flex items-center justify-center
                ${badge.isUnlocked 
                  ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-lg' 
                  : 'bg-muted text-muted-foreground opacity-40'
                }
              `}
            >
              {badge.isUnlocked ? (
                milestoneIcons[badge.id]
              ) : (
                <Lock className="w-5 h-5" />
              )}
            </div>
            {badge.isUnlocked && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-success rounded-full flex items-center justify-center"
              >
                <Sparkles className="w-3 h-3 text-success-foreground" />
              </motion.div>
            )}
          </motion.div>
        ))}
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>🏆 Logros de Hitos</span>
          <Badge variant="secondary">
            {unlockedCount}/{totalBadges} completados
          </Badge>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Desbloquea badges al completar cada hito del Camino del Artesano
        </p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {milestoneBadges.map((badge, index) => (
            <motion.div
              key={badge.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div 
                className={`
                  relative p-4 rounded-lg border-2 transition-all
                  ${badge.isUnlocked 
                    ? 'bg-gradient-to-br from-primary/10 to-accent/10 border-primary hover:shadow-lg cursor-pointer' 
                    : 'bg-muted/30 border-muted opacity-50'
                  }
                `}
              >
                <div className="flex flex-col items-center gap-3">
                  <div 
                    className={`
                      w-16 h-16 rounded-full flex items-center justify-center
                      ${badge.isUnlocked 
                        ? 'bg-gradient-to-br from-primary to-accent text-primary-foreground shadow-md' 
                        : 'bg-muted text-muted-foreground'
                      }
                    `}
                  >
                    {badge.isUnlocked ? (
                      milestoneIcons[badge.id]
                    ) : (
                      <Lock className="w-7 h-7" />
                    )}
                  </div>
                  
                  <div className="text-center space-y-1">
                    <h4 className="font-semibold text-sm line-clamp-2">
                      {badge.title}
                    </h4>
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {badge.description}
                    </p>
                  </div>

                  {badge.isUnlocked && badge.unlockedAt && (
                    <Badge variant="outline" className="text-xs">
                      {new Date(badge.unlockedAt).toLocaleDateString('es-ES', {
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Badge>
                  )}

                  {badge.isUnlocked && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 w-8 h-8 bg-success rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Sparkles className="w-4 h-4 text-success-foreground" />
                    </motion.div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
