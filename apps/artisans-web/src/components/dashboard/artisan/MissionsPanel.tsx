import React, { useState } from 'react';
import { Sparkles, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SimpleMissionCard } from './SimpleMissionCard';
import { TaskWizardModal } from '@/components/wizard/TaskWizardModal';
import { getMilestoneSteps } from '@/lib/wizards/milestoneWizards';

interface Mission {
  id: string;
  title: string;
  description: string;
  milestone: string;
  ctaLabel: string;
  ctaRoute: string;
  isCompleted: boolean;
  isLocked: boolean;
  icon: string;
  estimatedMinutes?: number;
}

interface MissionsPanelProps {
  missions?: Mission[];
  onDiscoverMissions?: () => void;
}

export const MissionsPanel: React.FC<MissionsPanelProps> = ({
  missions = [],
  onDiscoverMissions
}) => {

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-display font-bold text-moss-green-900">
            🧭 Tus Misiones
          </h2>
          <p className="text-wood-brown-600 mt-1">
            Cada paso te acerca a la maestría
          </p>
        </div>

        <Button
          onClick={onDiscoverMissions}
          variant="outline"
          className="border-terracotta-500 text-terracotta-700 hover:bg-terracotta-50"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Descubrir Misiones
        </Button>
      </div>

      {/* Missions List */}
      {missions.length === 0 ? (
        <div className="bg-gradient-to-br from-linen-white-50 to-golden-hour-50 border-2 border-dashed border-terracotta-200 rounded-2xl p-12 text-center">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-terracotta-100 rounded-full mb-4">
            <Sparkles className="w-10 h-10 text-terracotta-600" />
          </div>
          <h3 className="text-xl font-display font-bold text-moss-green-900 mb-2">
            ¡Celebra tu momento presente!
          </h3>
          <p className="text-wood-brown-600 mb-6 max-w-md mx-auto">
            Has completado todas tus misiones actuales. Es tiempo de descansar o descubrir nuevos caminos.
          </p>
          <Button
            onClick={onDiscoverMissions}
            size="lg"
            className="bg-gradient-to-r from-terracotta-600 to-terracotta-700 text-white hover:from-terracotta-700 hover:to-terracotta-800 shadow-lg"
          >
            <Plus className="w-5 h-5 mr-2" />
            Explorar Nuevas Misiones
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          {missions.map((mission) => (
            <SimpleMissionCard
              key={mission.id}
              {...mission}
            />
          ))}
        </div>
      )}
    </div>
  );
};
