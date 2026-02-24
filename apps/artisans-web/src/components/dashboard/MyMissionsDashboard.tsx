import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Target, 
  Play, 
  CheckCircle, 
  Clock, 
  Search, 
  ArrowRight,
  BarChart3,
  Users,
  Trash2,
  TrendingUp,
  Timer,
  AlertCircle,
  Archive,
  ArchiveRestore
} from 'lucide-react';
import { useAgentTasks } from '@/hooks/useAgentTasks';
import { useAuth } from '@/context/AuthContext';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { useTranslations } from '@/hooks/useTranslations';
import { useTaskLimits } from '@/hooks/useTaskLimits';
import { AgentTask } from '@/hooks/types/agentTaskTypes';
import { formatTaskTitleForDisplay } from '@/hooks/utils/agentTaskUtils';
import { ClearAllTasksDialog } from './ClearAllTasksDialog';
import { DetailedTaskCard } from './DetailedTaskCard';
import { toast } from 'sonner';

interface MyMissionsDashboardProps {
  onTaskSelect: (task: AgentTask) => void;
}

export const MyMissionsDashboard: React.FC<MyMissionsDashboardProps> = ({ onTaskSelect }) => {
  const { user } = useAuth();
  const { t } = useTranslations();
  const { context } = useUnifiedUserData();
  const navigate = useNavigate();
  const { tasks, loading, startTaskDevelopment, deleteAllTasks, archiveTask, unarchiveTask, deleteTask } = useAgentTasks();
  const { activeTasksCount, completedTasksCount, remainingSlots, getProgressColor } = useTaskLimits(tasks);
  
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'in_progress' | 'completed' | 'archived'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | '1' | '2' | '3'>('all');
  const [agentFilter, setAgentFilter] = useState<string>('all');
  const [showClearAllDialog, setShowClearAllDialog] = useState(false);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [updatingTasks, setUpdatingTasks] = useState<Set<string>>(new Set());


  // Filter and search tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           task.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === 'all' || 
                           (statusFilter === 'archived' && task.is_archived) ||
                           (statusFilter !== 'archived' && task.status === statusFilter && !task.is_archived);
      const matchesPriority = priorityFilter === 'all' || task.priority.toString() === priorityFilter;
      const matchesAgent = agentFilter === 'all' || task.agent_id === agentFilter;
      
      // For 'all' filter, exclude archived tasks
      if (statusFilter === 'all' && task.is_archived) return false;
      
      return matchesSearch && matchesStatus && matchesPriority && matchesAgent;
    });
  }, [tasks, searchTerm, statusFilter, priorityFilter, agentFilter]);

  // Get unique agents for filter
  const availableAgents = useMemo(() => {
    const agents = Array.from(new Set(tasks.map(task => task.agent_id)));
    return agents.map(agentId => ({
      id: agentId,
      name: agentId.charAt(0).toUpperCase() + agentId.slice(1)
    }));
  }, [tasks]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': 
        return { variant: 'default' as const, className: 'bg-success/20 text-success border-success/30', icon: CheckCircle };
      case 'in_progress': 
        return { variant: 'default' as const, className: 'bg-primary/20 text-primary border-primary/30', icon: Clock };
      case 'pending': 
        return { variant: 'outline' as const, className: 'text-muted-foreground', icon: Target };
      default: 
        return { variant: 'outline' as const, className: 'text-muted-foreground', icon: Target };
    }
  };

  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1: return { text: "Alta", className: 'bg-destructive/10 text-destructive border-destructive/20' };
      case 2: return { text: "Media", className: 'bg-warning/10 text-warning-foreground border-warning/20' };
      case 3: return { text: "Baja", className: 'bg-success/10 text-success border-success/20' };
      default: return { text: "Media", className: 'bg-muted text-muted-foreground border-border' };
    }
  };

  const getTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return "Hoy";
    if (diffDays === 2) return "Ayer";
    return `Hace ${diffDays - 1} días`;
  };

  const handleTaskAction = async (task: AgentTask) => {
    if (task.status === 'pending') {
      await startTaskDevelopment(task.id);
    }
    onTaskSelect(task);
  };

  // Multi-selection handlers
  const handleSelectTask = (taskId: string, selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      newSelected.add(taskId);
    } else {
      newSelected.delete(taskId);
    }
    setSelectedTasks(newSelected);
  };

  const handleSelectAll = (tasks: AgentTask[], selected: boolean) => {
    const newSelected = new Set(selectedTasks);
    if (selected) {
      tasks.forEach(task => newSelected.add(task.id));
    } else {
      tasks.forEach(task => newSelected.delete(task.id));
    }
    setSelectedTasks(newSelected);
  };

  const clearSelection = () => setSelectedTasks(new Set());

  // Batch operations
  const handleBatchDelete = async () => {
    const taskIds = Array.from(selectedTasks);
    setUpdatingTasks(new Set(taskIds));
    
    try {
      await Promise.all(taskIds.map(id => deleteTask(id)));
      toast.success(`${taskIds.length} tareas eliminadas`);
      clearSelection();
    } catch (error) {
      toast.error('Error al eliminar tareas');
    } finally {
      setUpdatingTasks(new Set());
    }
  };

  const handleBatchArchive = async () => {
    const taskIds = Array.from(selectedTasks);
    setUpdatingTasks(new Set(taskIds));
    
    try {
      await Promise.all(taskIds.map(id => archiveTask(id)));
      toast.success(`${taskIds.length} tareas archivadas`);
      clearSelection();
    } catch (error) {
      toast.error('Error al archivar tareas');
    } finally {
      setUpdatingTasks(new Set());
    }
  };

  const handleBatchUnarchive = async () => {
    const taskIds = Array.from(selectedTasks);
    setUpdatingTasks(new Set(taskIds));
    
    try {
      await Promise.all(taskIds.map(id => unarchiveTask(id)));
      toast.success(`${taskIds.length} tareas desarchivadas`);
      clearSelection();
    } catch (error) {
      toast.error('Error al desarchivar tareas');
    } finally {
      setUpdatingTasks(new Set());
    }
  };


  const activeTasks = filteredTasks.filter(task => (task.status === 'pending' || task.status === 'in_progress') && !task.is_archived);
  const completedTasks = filteredTasks.filter(task => task.status === 'completed' && !task.is_archived);
  const archivedTasks = filteredTasks.filter(task => task.is_archived);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">{t.ui.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Modern Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center group-hover:bg-blue-100 transition-colors">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.taskManagement.activeTasks}</p>
                <p className="text-2xl font-bold text-foreground">{activeTasksCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-success/10 rounded-xl flex items-center justify-center group-hover:bg-success/20 transition-colors">
                <CheckCircle className="w-6 h-6 text-success" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.taskManagement.completedTasks}</p>
                <p className="text-2xl font-bold text-foreground">{completedTasksCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-50 rounded-xl flex items-center justify-center group-hover:bg-orange-100 transition-colors">
                <Target className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">{t.taskManagement.freeSlots}</p>
                <p className="text-2xl font-bold text-foreground">{remainingSlots}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center group-hover:bg-purple-100 transition-colors">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-muted-foreground">Progreso General</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-purple-500 to-purple-600 transition-all duration-300"
                      style={{ width: `${(completedTasksCount / (activeTasksCount + completedTasksCount)) * 100 || 0}%` }}
                    />
                  </div>
                  <span className="text-sm font-medium text-foreground">
                    {Math.round((completedTasksCount / (activeTasksCount + completedTasksCount)) * 100 || 0)}%
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>


      {/* Modern Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input
                  placeholder="Buscar tareas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={(value: any) => setStatusFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="pending">Pendiente</SelectItem>
                  <SelectItem value="in_progress">En Progreso</SelectItem>
                  <SelectItem value="completed">Completada</SelectItem>
                  <SelectItem value="archived">Archivada</SelectItem>
                </SelectContent>
              </Select>

              <Select value={priorityFilter} onValueChange={(value: any) => setPriorityFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Prioridad" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="1">Alta</SelectItem>
                  <SelectItem value="2">Media</SelectItem>
                  <SelectItem value="3">Baja</SelectItem>
                </SelectContent>
              </Select>

              <Select value={agentFilter} onValueChange={setAgentFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Agente" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  {availableAgents.map(agent => (
                    <SelectItem key={agent.id} value={agent.id}>{agent.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Delete All Tasks Button */}
              {tasks.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowClearAllDialog(true)}
                  className="text-destructive border-destructive/20 hover:bg-destructive/10"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete All Tasks
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modern Task Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="grid w-full grid-cols-4 bg-muted">
          <TabsTrigger value="all" className="data-[state=active]:bg-background">
            Todas
          </TabsTrigger>
          <TabsTrigger value="active" className="data-[state=active]:bg-background">
            Activas ({activeTasks.length})
          </TabsTrigger>
          <TabsTrigger value="completed" className="data-[state=active]:bg-background">
            Completadas ({completedTasks.length})
          </TabsTrigger>
          <TabsTrigger value="archived" className="data-[state=active]:bg-background">
            Archivadas ({archivedTasks.length})
          </TabsTrigger>
        </TabsList>

        {/* Batch Actions Bar */}
        <AnimatePresence>
          {selectedTasks.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50"
            >
              <Card className="shadow-lg border-primary/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium">
                      {selectedTasks.size} tarea{selectedTasks.size !== 1 ? 's' : ''} seleccionada{selectedTasks.size !== 1 ? 's' : ''}
                    </span>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchDelete}
                        disabled={Array.from(selectedTasks).some(id => updatingTasks.has(id))}
                        className="text-red-600 border-red-200 hover:bg-red-50"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        Eliminar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleBatchArchive}
                        disabled={Array.from(selectedTasks).some(id => updatingTasks.has(id))}
                        className="text-blue-600 border-blue-200 hover:bg-blue-50"
                      >
                        <Archive className="w-4 h-4 mr-1" />
                        Archivar
                      </Button>
                      {statusFilter === 'archived' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleBatchUnarchive}
                          disabled={Array.from(selectedTasks).some(id => updatingTasks.has(id))}
                          className="text-success border-success/20 hover:bg-success/10"
                        >
                          <ArchiveRestore className="w-4 h-4 mr-1" />
                          Desarchivar
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSelection}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        <TabsContent value="all" className="space-y-4 mt-6">
          {filteredTasks.length === 0 ? (
            <Card>
              <CardContent className="py-16 px-8 text-center">
                <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-6">
                  <Target className="h-8 w-8 text-muted-foreground" />
                </div>
                <h3 className="text-xl font-semibold mb-3">Sin tareas disponibles</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">Comienza creando tu primera tarea para organizar el crecimiento de tu negocio</p>
                <Button onClick={() => navigate('/maturity-calculator')} size="lg">
                  Crear primera tarea
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Select All checkbox */}
              <div className="flex items-center gap-2 px-2">
                <Checkbox
                  checked={filteredTasks.length > 0 && filteredTasks.every(task => selectedTasks.has(task.id))}
                  onCheckedChange={(checked) => handleSelectAll(filteredTasks, checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">
                  Seleccionar todo ({filteredTasks.length})
                </span>
              </div>
              
              <div className="space-y-3">
                {filteredTasks.map((task, index) => (
                  <DetailedTaskCard
                    key={task.id}
                    task={task}
                    language="es"
                    onStartDevelopment={() => startTaskDevelopment(task.id)}
                    onCompleteTask={() => {}}
                    onChatWithAgent={() => onTaskSelect(task)}
                    onDelete={deleteTask}
                    onArchive={archiveTask}
                    onUnarchive={unarchiveTask}
                    isUpdating={updatingTasks.has(task.id)}
                    allTasks={tasks}
                    isSelected={selectedTasks.has(task.id)}
                    onSelect={handleSelectTask}
                    showSelection={true}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="active" className="space-y-4 mt-6">
          {activeTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 px-8 text-center">
                <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay tareas activas</h3>
                <p className="text-muted-foreground">¡Todo al día! No tienes tareas activas por ahora.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Select All checkbox */}
              <div className="flex items-center gap-2 px-2">
                <Checkbox
                  checked={activeTasks.length > 0 && activeTasks.every(task => selectedTasks.has(task.id))}
                  onCheckedChange={(checked) => handleSelectAll(activeTasks, checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">
                  Seleccionar todo ({activeTasks.length})
                </span>
              </div>
              
              <div className="space-y-3">
                {activeTasks.map((task, index) => (
                  <DetailedTaskCard
                    key={task.id}
                    task={task}
                    language="es"
                    onStartDevelopment={() => startTaskDevelopment(task.id)}
                    onCompleteTask={() => {}}
                    onChatWithAgent={() => onTaskSelect(task)}
                    onDelete={deleteTask}
                    onArchive={archiveTask}
                    onUnarchive={unarchiveTask}
                    isUpdating={updatingTasks.has(task.id)}
                    allTasks={tasks}
                    isSelected={selectedTasks.has(task.id)}
                    onSelect={handleSelectTask}
                    showSelection={true}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="completed" className="space-y-4 mt-6">
          {completedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 px-8 text-center">
                <div className="w-16 h-16 bg-success/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-8 w-8 text-success" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No completed tasks</h3>
                <p className="text-muted-foreground">Start working on tasks to see your progress here.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Select All checkbox */}
              <div className="flex items-center gap-2 px-2">
                <Checkbox
                  checked={completedTasks.length > 0 && completedTasks.every(task => selectedTasks.has(task.id))}
                  onCheckedChange={(checked) => handleSelectAll(completedTasks, checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">
                  Seleccionar todo ({completedTasks.length})
                </span>
              </div>
              
              <div className="space-y-3">
                {completedTasks.map((task, index) => (
                  <DetailedTaskCard
                    key={task.id}
                    task={task}
                    language="es"
                    onStartDevelopment={() => startTaskDevelopment(task.id)}
                    onCompleteTask={() => {}}
                    onChatWithAgent={() => onTaskSelect(task)}
                    onDelete={deleteTask}
                    onArchive={archiveTask}
                    onUnarchive={unarchiveTask}
                    isUpdating={updatingTasks.has(task.id)}
                    allTasks={tasks}
                    isSelected={selectedTasks.has(task.id)}
                    onSelect={handleSelectTask}
                    showSelection={true}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="archived" className="space-y-4 mt-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold">Tareas archivadas</h3>
            {archivedTasks.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Bulk delete archived tasks
                  archivedTasks.forEach(task => deleteTask(task.id));
                  toast.success('Todas las tareas archivadas eliminadas');
                }}
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Eliminar todas las archivadas
              </Button>
            )}
          </div>
          
          {archivedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-12 px-8 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Archive className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No hay tareas archivadas</h3>
                <p className="text-muted-foreground">Las tareas archivadas aparecerán aquí.</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {/* Select All checkbox */}
              <div className="flex items-center gap-2 px-2">
                <Checkbox
                  checked={archivedTasks.length > 0 && archivedTasks.every(task => selectedTasks.has(task.id))}
                  onCheckedChange={(checked) => handleSelectAll(archivedTasks, checked as boolean)}
                />
                <span className="text-sm text-muted-foreground">
                  Seleccionar todo ({archivedTasks.length})
                </span>
              </div>
              
              <div className="space-y-3">
                {archivedTasks.map((task, index) => (
                  <DetailedTaskCard
                    key={task.id}
                    task={task}
                    language="es"
                    onStartDevelopment={() => startTaskDevelopment(task.id)}
                    onCompleteTask={() => {}}
                    onChatWithAgent={() => onTaskSelect(task)}
                    onDelete={deleteTask}
                    onArchive={archiveTask}
                    onUnarchive={unarchiveTask}
                    isUpdating={updatingTasks.has(task.id)}
                    allTasks={tasks}
                    isSelected={selectedTasks.has(task.id)}
                    onSelect={handleSelectTask}
                    showSelection={true}
                  />
                ))}
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Clear All Tasks Dialog */}
      <ClearAllTasksDialog
        isOpen={showClearAllDialog}
        onClose={() => setShowClearAllDialog(false)}
        onConfirm={async () => {
          await deleteAllTasks();
        }}
        taskCount={tasks.length}
        language="es"
      />
    </div>
  );
};