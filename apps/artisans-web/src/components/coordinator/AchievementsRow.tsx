import React from 'react';
import { CompletedFixedTask } from '@/hooks/useFixedTasksManager';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

interface AchievementsRowProps {
  completedTasks: CompletedFixedTask[];
}

export const AchievementsRow: React.FC<AchievementsRowProps> = ({ completedTasks }) => {
  if (completedTasks.length === 0) return null;

  return (
    <div>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
        <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#f59e0b' }}>emoji_events</span>
        <span style={{ fontFamily: SERIF, fontSize: 13, color: 'rgba(0,0,0,0.45)', fontWeight: 600 }}>
          Logros desbloqueados
        </span>
      </div>

      {/* Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {completedTasks.map(task => (
          <div
            key={task.id}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#f9fafb',
              border: '1px solid rgba(74,222,128,0.25)',
              borderRadius: 8,
              padding: '6px 10px',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14, color: '#4ade80' }}>check_circle</span>
            <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(0,0,0,0.55)', whiteSpace: 'nowrap' }}>
              {task.title}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
