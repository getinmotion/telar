
import React from 'react';
import { motion } from 'framer-motion';
import { CategoryScore } from '@/types/dashboard';

interface CreativeInsightsWidgetProps {
    language: 'en' | 'es';
    maturityScores: CategoryScore;
}

const t = {
    en: { insights: 'Creative Insights' },
    es: { insights: 'Insights Creativos' },
};

export const CreativeInsightsWidget: React.FC<CreativeInsightsWidgetProps> = ({
    language,
    maturityScores,
}) => {
    return (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.0, duration: 0.5 }}
            className="bg-slate-900/70 backdrop-blur-sm rounded-2xl border border-slate-700/80 p-6"
        >
            <h3 className="text-lg font-semibold text-white mb-4">{t[language].insights}</h3>
            <div className="space-y-4">
                {[
                    { label: 'Idea Validation', value: maturityScores.ideaValidation, color: 'bg-blue-500' },
                    { label: 'User Experience', value: maturityScores.userExperience, color: 'bg-green-500' },
                    { label: 'Market Fit', value: maturityScores.marketFit, color: 'bg-yellow-500' },
                    { label: 'Monetization', value: maturityScores.monetization, color: 'bg-purple-500' }
                ].map((item) => (
                    <div key={item.label} className="space-y-2">
                        <div className="flex justify-between text-sm">
                            <span className="text-slate-300">{item.label}</span>
                            <span className="font-medium text-white">{item.value}%</span>
                        </div>
                        <div className="w-full bg-slate-700 rounded-full h-2">
                            <motion.div
                                className={`h-2 rounded-full ${item.color}`}
                                initial={{ width: 0 }}
                                animate={{ width: `${item.value}%` }}
                                transition={{ delay: 1.2, duration: 0.8 }}
                            />
                        </div>
                    </div>
                ))}
            </div>
        </motion.div>
    );
};
