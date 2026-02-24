import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, Target, Users, DollarSign, Lightbulb } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface MaturityAction {
  id: string;
  action_type: string;
  category: string;
  points: number;
  description: string;
  created_at: string;
}

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'ideaValidation':
      return <Lightbulb className="w-4 h-4" />;
    case 'userExperience':
      return <Users className="w-4 h-4" />;
    case 'marketFit':
      return <Target className="w-4 h-4" />;
    case 'monetization':
      return <DollarSign className="w-4 h-4" />;
    default:
      return <TrendingUp className="w-4 h-4" />;
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'ideaValidation':
      return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    case 'userExperience':
      return 'bg-purple-500/10 text-purple-700 dark:text-purple-400';
    case 'marketFit':
      return 'bg-green-500/10 text-green-700 dark:text-green-400';
    case 'monetization':
      return 'bg-orange-500/10 text-orange-700 dark:text-orange-400';
    default:
      return 'bg-gray-500/10 text-gray-700 dark:text-gray-400';
  }
};

export const MaturityProgressHistory: React.FC = () => {
  const { user } = useAuth();
  const [actions, setActions] = useState<MaturityAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActions = async () => {
      if (!user?.id) return;

      try {
        const { data, error } = await supabase
          .from('user_maturity_actions')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(20);

        if (error) {
          console.error('Error fetching maturity actions:', error);
        } else {
          setActions(data || []);
        }
      } catch (err) {
        console.error('Unexpected error fetching actions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchActions();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Historial de Progreso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Cargando...</p>
        </CardContent>
      </Card>
    );
  }

  if (actions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Historial de Progreso
          </CardTitle>
          <CardDescription>
            Aquí verás todas las acciones que aumentan tu nivel de madurez
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Aún no has realizado acciones que aumenten tu nivel de madurez. 
            ¡Comienza completando tareas, usando agentes, o registrando ventas!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-primary" />
          Historial de Progreso
        </CardTitle>
        <CardDescription>
          Acciones que han aumentado tu nivel de madurez
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px] pr-4">
          <div className="space-y-3">
            {actions.map((action) => (
              <div
                key={action.id}
                className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className={`p-2 rounded-full ${getCategoryColor(action.category)}`}>
                  {getCategoryIcon(action.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {action.description}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {format(new Date(action.created_at), "d 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                  </p>
                </div>
                <Badge variant="secondary" className="ml-auto flex-shrink-0">
                  +{action.points}%
                </Badge>
              </div>
            ))}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};
