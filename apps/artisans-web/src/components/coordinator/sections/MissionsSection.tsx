import React, { useMemo } from 'react';
import { FixedTask } from '@/types/fixedTask';
import { CompletedFixedTask } from '@/hooks/useFixedTasksManager';
import { MissionsAgentCard } from '@/components/coordinator/MissionsAgentCard';
import { MissionCard } from '@/components/coordinator/MissionCard';
import { AchievementsRow } from '@/components/coordinator/AchievementsRow';

const SERIF = "'Noto Serif', serif";

const CORE_MISSION_IDS = [
  'create_shop',
  'first_product',
  'five_products',
  'create_artisan_profile',
  'create_brand',
  'review_brand',
] as const;

interface MissionsSectionProps {
  pendingTasks: FixedTask[];
  completedTasks: CompletedFixedTask[];
  completedTaskIds: string[];
  loading: boolean;
}

export const MissionsSection: React.FC<MissionsSectionProps> = ({
  pendingTasks,
  completedTasks,
  completedTaskIds,
  loading,
}) => {
  const completedCoreCount = useMemo(
    () => completedTaskIds.filter(id => (CORE_MISSION_IDS as readonly string[]).includes(id)).length,
    [completedTaskIds]
  );

  const nextMission = useMemo(() => {
    const next = pendingTasks.find(t => (CORE_MISSION_IDS as readonly string[]).includes(t.id)) ?? pendingTasks[0] ?? null;
    if (!next) return null;
    return { title: next.title, route: next.action.destination, icon: next.icon };
  }, [pendingTasks]);

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Agent card skeleton */}
        <div style={{ background: '#151b2d', borderRadius: 16, padding: '20px 24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {[80, 60, 40].map(w => (
              <div key={w} style={{ height: 14, borderRadius: 7, background: 'rgba(255,255,255,0.06)', width: `${w}%` }} />
            ))}
          </div>
        </div>
        {/* Mission card skeletons */}
        {[1, 2].map(i => (
          <div key={i} style={{ height: 68, borderRadius: 12, background: 'rgba(0,0,0,0.04)', animation: 'pulse 1.5s infinite' }} />
        ))}
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* AI Agent card */}
      <MissionsAgentCard
        completedCount={completedCoreCount}
        totalCount={CORE_MISSION_IDS.length}
        nextMission={nextMission}
      />

      {/* Pending missions */}
      {pendingTasks.length > 0 && (
        <div>
          <p style={{
            fontFamily: SERIF, fontSize: 13, fontWeight: 700,
            color: 'rgba(0,0,0,0.5)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em'
          }}>
            Próximas misiones
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {pendingTasks.map((task, i) => (
              <MissionCard
                key={task.id}
                title={task.title}
                description={task.description}
                milestone={task.milestone}
                ctaRoute={task.action.destination}
                icon={task.icon}
                estimatedMinutes={task.estimatedMinutes}
                isNext={i === 0}
              />
            ))}
          </div>
        </div>
      )}

      {/* Achievements */}
      <AchievementsRow completedTasks={completedTasks} />
    </div>
  );
};
