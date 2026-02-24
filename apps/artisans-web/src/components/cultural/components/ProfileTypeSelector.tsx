
import React from 'react';
import { motion } from 'framer-motion';
import { ProfileType } from '@/types/dashboard';
import { Lightbulb, User, Users } from 'lucide-react';

interface ProfileTypeSelectorProps {
  profileType: ProfileType | null;
  onSelect: (type: ProfileType) => void;
  t: any;
}

export const ProfileTypeSelector: React.FC<ProfileTypeSelectorProps> = React.memo(({ 
  profileType, 
  onSelect, 
  t 
}) => (
  <div className="space-y-6">
    <div>
      <h4 className="text-xl font-semibold text-foreground mb-2">{t.profileTypeTitle}</h4>
      <p className="text-muted-foreground mb-6">{t.profileTypeSubtitle}</p>
    </div>

    <div className="grid gap-4">
      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
          profileType === 'idea'
            ? 'border-primary bg-primary/10'
            : 'border-border hover:border-primary'
        }`}
        onClick={() => onSelect('idea')}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-secondary/10 rounded-full flex items-center justify-center">
            <Lightbulb className="h-6 w-6 text-secondary" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-foreground mb-2">
              🟡 {t.idea.title}
            </h5>
            <p className="text-sm text-muted-foreground">{t.idea.description}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
          profileType === 'solo'
            ? 'border-purple-500 bg-purple-50'
            : 'border-border hover:border-primary'
        }`}
        onClick={() => onSelect('solo')}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
            <User className="h-6 w-6 text-success" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-foreground mb-2">
              🟢 {t.solo.title}
            </h5>
            <p className="text-sm text-muted-foreground">{t.solo.description}</p>
          </div>
        </div>
      </motion.div>

      <motion.div
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`p-6 rounded-lg border-2 cursor-pointer transition-all ${
          profileType === 'team'
            ? 'border-purple-500 bg-purple-50'
            : 'border-border hover:border-primary'
        }`}
        onClick={() => onSelect('team')}
      >
        <div className="flex items-start space-x-4">
          <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <Users className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h5 className="font-semibold text-foreground mb-2">
              🔵 {t.team.title}
            </h5>
            <p className="text-sm text-muted-foreground">{t.team.description}</p>
          </div>
        </div>
      </motion.div>
    </div>
  </div>
));

ProfileTypeSelector.displayName = 'ProfileTypeSelector';
