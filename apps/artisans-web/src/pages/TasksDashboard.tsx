import React, { useEffect, useMemo } from 'react';
import { useFixedTasksManager } from '@/hooks/useFixedTasksManager';
import { MissionsSection } from '@/components/coordinator/sections/MissionsSection';
import { MissionsAgentCard } from '@/components/coordinator/MissionsAgentCard';
import { SEOHead } from '@/components/seo/SEOHead';
import { NotificationCenter } from '@/components/notifications/NotificationCenter';
import { useOraculo } from '@/components/oraculo/OraculoContext';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const CORE_MISSION_IDS = ['create_shop','first_product','five_products','create_artisan_profile','create_brand','review_brand'];

const TasksDashboard = () => {
  const { tasks, completedTasks, completedTaskIds, loading } = useFixedTasksManager();

  const completedCoreCount = useMemo(
    () => completedTaskIds.filter(id => CORE_MISSION_IDS.includes(id)).length,
    [completedTaskIds]
  );
  const nextMission = useMemo(() => {
    const next = tasks.find(t => CORE_MISSION_IDS.includes(t.id)) ?? tasks[0] ?? null;
    if (!next) return null;
    return { title: next.title, route: next.action.destination, icon: next.icon };
  }, [tasks]);

  const { setNode, clearNode } = useOraculo();
  useEffect(() => {
    setNode(<MissionsAgentCard completedCount={completedCoreCount} totalCount={CORE_MISSION_IDS.length} nextMission={nextMission} loading={loading} />);
    return clearNode;
  }, [completedCoreCount, nextMission, loading]);

  return (
    <>
      <SEOHead
        title="Mis Misiones — TELAR"
        description="Tu camino artesanal paso a paso"
        noIndex={true}
      />

      <div className="h-full flex flex-col min-h-0 overflow-hidden" style={{ background: '#fdfaf6' }}>
        <header
          className="sticky top-0 z-30 px-4 md:px-12 pt-4 pb-3 flex flex-col md:grid md:items-center gap-2 md:gap-0"
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
