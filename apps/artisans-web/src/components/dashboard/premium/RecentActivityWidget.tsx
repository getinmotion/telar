
import React from 'react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AgentConversation } from '@/hooks/useAgentConversations';

interface RecentActivityWidgetProps {
    language: 'en' | 'es';
    activityLoading: boolean;
    recentConversations: AgentConversation[];
    onSelectAgent: (id: string) => void;
}

const t = {
    en: { recentActivity: 'Recent Activity' },
    es: { recentActivity: 'Actividad Reciente' },
};

export const RecentActivityWidget: React.FC<RecentActivityWidgetProps> = ({
    language,
    activityLoading,
    recentConversations,
    onSelectAgent,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.1, duration: 0.5 }}
            className="bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/80 p-6"
        >
            <h3 className="text-lg font-semibold text-white mb-4">{t[language].recentActivity}</h3>
            {activityLoading ? (
                <div className="flex justify-center items-center h-24">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-400"></div>
                </div>
            ) : (
                <div className="space-y-3">
                    {recentConversations.map((conv) => (
                        <div key={conv.id} className="flex items-start gap-3 p-2.5 rounded-lg bg-black/20 hover:bg-black/40 transition-colors cursor-pointer" onClick={() => onSelectAgent(conv.agent_id)}>
                            <div className="w-2 h-2 rounded-full bg-purple-500 mt-1.5 flex-shrink-0"></div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate text-slate-200">
                                    {conv.title || 'Nueva conversación'}
                                </p>
                                <p className="text-xs text-slate-400">
                                    {formatDistanceToNow(new Date(conv.updated_at), { 
                                        addSuffix: true, 
                                        locale: language === 'es' ? es : undefined 
                                    })}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </motion.div>
    );
};
