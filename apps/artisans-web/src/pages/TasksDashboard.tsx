import React from 'react';
import { useTranslations } from '@/hooks/useTranslations';
import { useFixedTasksManager } from '@/hooks/useFixedTasksManager';
import { DashboardBackground } from '@/components/dashboard/DashboardBackground';
import { TasksHeader } from '@/components/dashboard/TasksHeader';
import { SimplifiedTaskList } from '@/components/dashboard/SimplifiedTaskList';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG } from '@/config/seo';

const TasksDashboard = () => {
  const { t, language } = useTranslations();
  const { tasks, completedTasks, loading } = useFixedTasksManager();

  const seoData = SEO_CONFIG.pages.dashboard[language];
  
  const totalProgress = tasks.length + completedTasks.length > 0 
    ? Math.round((completedTasks.length / (completedTasks.length + tasks.length)) * 100)
    : 0;

  return (
    <>
      <SEOHead
        title={`${seoData.title} - ${t.taskManagement.title}`}
        description={t.taskManagement.subtitle}
        keywords={seoData.keywords}
        url={`${SEO_CONFIG.siteUrl}/dashboard/tasks`}
        type="website"
        noIndex={true}
      />
      
      <DashboardBackground>
        <div className="min-h-screen bg-background">
          <TasksHeader 
            pendingCount={tasks.length}
            completedCount={completedTasks.length}
            totalProgress={totalProgress}
          />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
            <SimplifiedTaskList 
              tasks={tasks}
              completedTasks={completedTasks}
              loading={loading}
            />
          </div>
        </div>
      </DashboardBackground>
    </>
  );
};

export default TasksDashboard;
