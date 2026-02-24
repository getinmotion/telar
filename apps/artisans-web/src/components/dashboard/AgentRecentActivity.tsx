
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MessageSquare } from 'lucide-react';

interface Conversation {
  id: string;
  title?: string;
  updated_at: string;
}

interface AgentRecentActivityProps {
  language: 'en' | 'es';
  conversations: Conversation[];
}

export const AgentRecentActivity: React.FC<AgentRecentActivityProps> = ({
  language,
  conversations
}) => {
  const t = {
    en: {
      recentActivity: "Recent Activity",
      noRecentActivity: "No recent activity"
    },
    es: {
      recentActivity: "Actividad Reciente", 
      noRecentActivity: "No hay actividad reciente"
    }
  };

  return (
    <Card className="bg-white/5 backdrop-blur border-white/10">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <MessageSquare className="w-5 h-5 text-accent-foreground" />
          {t[language].recentActivity}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {conversations.slice(0, 5).map((conv) => (
            <div key={conv.id} className="flex items-center gap-3 p-2 bg-white/5 rounded-lg backdrop-blur">
              <div className="w-2 h-2 rounded-full bg-accent"></div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate text-white">
                  {conv.title || 'Nueva conversación'}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(conv.updated_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
          {conversations.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              {t[language].noRecentActivity}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
