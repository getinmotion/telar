import React from 'react';
import { useFixedTasksManager } from '@/hooks/useFixedTasksManager';
import { MissionsSection } from '@/components/coordinator/sections/MissionsSection';
import { SEOHead } from '@/components/seo/SEOHead';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const TasksDashboard = () => {
  const { tasks, completedTasks, completedTaskIds, loading } = useFixedTasksManager();

  return (
    <>
      <SEOHead
        title="Mis Misiones — TELAR"
        description="Tu camino artesanal paso a paso"
        noIndex={true}
      />

      <div className="h-full flex flex-col min-h-0 overflow-hidden" style={{ background: '#fdfaf6' }}>
        <header
          className="sticky top-0 z-30 px-12 pt-4 pb-3 grid items-center"
          style={{ gridTemplateColumns: '1fr auto 1fr' }}
        >
          <div />
          <div className="flex flex-col items-center text-center">
            <h1 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', lineHeight: 1.2 }}>
              Camino Artesanal
            </h1>
            <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 500, color: 'rgba(84,67,62,0.7)', marginTop: 2 }}>
              {completedTasks.length} logros · {tasks.length} por completar
            </p>
          </div>
          <div className="flex items-center gap-3 justify-end">
            <NotificationCenter />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto pb-20" style={{ overscrollBehavior: 'contain' }}>
          <div style={{ maxWidth: 680, margin: '0 auto', padding: '24px 24px 48px' }}>
            <MissionsSection
              pendingTasks={tasks}
              completedTasks={completedTasks}
              completedTaskIds={completedTaskIds}
              loading={loading}
            />
          </div>
        </main>
      </div>
    </>
  );
};

export default TasksDashboard;
