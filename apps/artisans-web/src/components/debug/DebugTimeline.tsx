import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Clock, 
  CheckCircle2, 
  Activity, 
  AlertCircle, 
  Database,
  XCircle,
  Filter
} from 'lucide-react';

interface TimelineEvent {
  timestamp: string;
  type: 'question_answered' | 'checkpoint' | 'craft_detected' | 'db_save' | 'error';
  message: string;
  data?: any;
}

interface DebugTimelineProps {
  events: TimelineEvent[];
}

export const DebugTimeline: React.FC<DebugTimelineProps> = ({ events }) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('all');
  const [expandedEvents, setExpandedEvents] = useState<Set<number>>(new Set());

  const eventTypeConfig = {
    checkpoint: {
      icon: CheckCircle2,
      color: 'text-green-500',
      bgColor: 'bg-green-50 border-green-200',
      label: 'Checkpoint'
    },
    question_answered: {
      icon: Activity,
      color: 'text-blue-500',
      bgColor: 'bg-blue-50 border-blue-200',
      label: 'Pregunta'
    },
    craft_detected: {
      icon: AlertCircle,
      color: 'text-purple-500',
      bgColor: 'bg-purple-50 border-purple-200',
      label: 'Craft Detectado'
    },
    db_save: {
      icon: Database,
      color: 'text-orange-500',
      bgColor: 'bg-orange-50 border-orange-200',
      label: 'DB Save'
    },
    error: {
      icon: XCircle,
      color: 'text-red-500',
      bgColor: 'bg-red-50 border-red-200',
      label: 'Error'
    }
  };

  const filteredEvents = selectedFilter === 'all' 
    ? events 
    : events.filter(e => e.type === selectedFilter);

  const toggleEventExpansion = (index: number) => {
    const newExpanded = new Set(expandedEvents);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedEvents(newExpanded);
  };

  const groupEventsByDate = (events: TimelineEvent[]) => {
    const groups: Record<string, TimelineEvent[]> = {};
    
    events.forEach(event => {
      const date = new Date(event.timestamp);
      const today = new Date();
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      let groupKey: string;
      if (date.toDateString() === today.toDateString()) {
        groupKey = 'Hoy';
      } else if (date.toDateString() === yesterday.toDateString()) {
        groupKey = 'Ayer';
      } else {
        groupKey = date.toLocaleDateString();
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(event);
    });
    
    return groups;
  };

  const groupedEvents = groupEventsByDate(filteredEvents);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Timeline de Eventos
          </CardTitle>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <div className="flex gap-1">
              <Button
                variant={selectedFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedFilter('all')}
              >
                Todos
              </Button>
              {Object.entries(eventTypeConfig).map(([type, config]) => (
                <Button
                  key={type}
                  variant={selectedFilter === type ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedFilter(type)}
                  className="hidden md:flex"
                >
                  <config.icon className="w-3 h-3 mr-1" />
                  {config.label}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEvents.length === 0 ? (
          <div className="text-center py-8">
            <Clock className="w-12 h-12 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground">No hay eventos registrados</p>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedEvents).map(([dateGroup, groupEvents]) => (
              <div key={dateGroup}>
                <div className="flex items-center gap-2 mb-3">
                  <Badge variant="outline" className="font-semibold">{dateGroup}</Badge>
                  <div className="flex-1 h-px bg-border" />
                </div>
                
                <div className="space-y-3 relative before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                  {groupEvents.map((event, index) => {
                    const config = eventTypeConfig[event.type];
                    const Icon = config.icon;
                    const isExpanded = expandedEvents.has(index);
                    
                    return (
                      <div
                        key={index}
                        className="flex items-start gap-3 relative"
                      >
                        <div className={`flex-shrink-0 w-10 h-10 rounded-full border-2 ${config.bgColor} flex items-center justify-center z-10`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div
                            className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-sm transition-all ${config.bgColor}`}
                            onClick={() => event.data && toggleEventExpansion(index)}
                          >
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <Badge variant="outline" className="font-mono text-xs">
                                {config.label}
                              </Badge>
                              <span className="text-xs text-muted-foreground whitespace-nowrap">
                                {new Date(event.timestamp).toLocaleTimeString()}
                              </span>
                            </div>
                            
                            <p className="text-sm font-medium mt-2">{event.message}</p>
                            
                            {event.data && isExpanded && (
                              <pre className="text-xs bg-background/50 p-3 rounded mt-3 overflow-auto max-h-48">
                                {JSON.stringify(event.data, null, 2)}
                              </pre>
                            )}
                            
                            {event.data && !isExpanded && (
                              <p className="text-xs text-muted-foreground mt-2">
                                Click para ver detalles →
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
