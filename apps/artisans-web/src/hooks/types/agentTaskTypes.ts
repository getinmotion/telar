
export interface TaskSubtask {
  id: string;
  title: string;
  completed: boolean;
  created_at: string;
}

export interface TaskResource {
  id: string;
  title: string;
  url?: string;
  description?: string;
  type: 'link' | 'file' | 'note';
}

export interface AgentTask {
  id: string;
  user_id: string;
  agent_id: string;
  conversation_id: string | null;
  title: string;
  description: string | null;
  relevance: 'low' | 'medium' | 'high';
  progress_percentage: number;
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  priority: number;
  due_date: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
  subtasks: TaskSubtask[];
  notes: string;
  steps_completed: Record<string, boolean>;
  resources: TaskResource[];
  time_spent: number;
  is_archived: boolean;
  deliverableType?: string; // Mapped from deliverable_type in DB
  deliverable_type?: string; // DB column name (snake_case)
  milestone_category?: string; // Category linking task to milestone
}

export interface PaginatedTasks {
  tasks: AgentTask[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
}
