
import React from 'react';
import { motion } from 'framer-motion';
import { Agent } from '@/types/dashboard';
import { PremiumAgentCard } from '../PremiumAgentCard';

interface ActiveAgentsWidgetProps {
    language: 'en' | 'es';
    agents: Agent[];
    onSelectAgent: (id: string) => void;
}

const t = {
    en: {
        myAgents: 'Your AI Creative Team',
    },
    es: {
        myAgents: 'Tu Equipo Creativo IA',
    }
};

export const ActiveAgentsWidget: React.FC<ActiveAgentsWidgetProps> = ({
    language,
    agents,
    onSelectAgent,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/80 p-6"
        >
            <div className="mb-4">
                <h3 className="text-lg font-semibold text-white">{t[language].myAgents}</h3>
            </div>
            
            <div className="space-y-3">
                {agents.slice(0, 4).map((agent, index) => (
                    <motion.div
                        key={agent.id}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1, duration: 0.4 }}
                    >
                        <PremiumAgentCard
                            agent={agent}
                            language={language}
                            onSelect={() => onSelectAgent(agent.id)}
                        />
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
};
