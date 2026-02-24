// DEPRECATED: This component has been replaced by AgentTasksManager.tsx
// 
// TaskManager.tsx was the older, more limited version of task management.
// All functionality has been consolidated into AgentTasksManager.tsx which provides:
// - Better AI integration
// - More modern UI/UX
// - Consistent task formatting with formatTaskTitleForDisplay
// - Better integration with the Master Coordinator
//
// This file is kept for reference only and should not be used.
// Use AgentTasksManager instead.

import React from 'react';

export const TaskManager: React.FC = () => {
  return (
    <div className="text-center p-8 text-gray-500">
      <p>This component has been deprecated.</p>
      <p>Use AgentTasksManager instead.</p>
    </div>
  );
};