import React from 'react';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { CategoryScore } from '@/types/dashboard';
import { motion } from 'framer-motion';

interface MaturityVisualizationProps {
  scores: CategoryScore;
  language: 'en' | 'es';
}

export const MaturityVisualization: React.FC<MaturityVisualizationProps> = ({ scores, language }) => {
  const t = {
    en: {
      title: 'Your Maturity Overview',
      ideaValidation: 'Idea Validation',
      userExperience: 'User Experience',
      marketFit: 'Market Fit',
      monetization: 'Monetization',
      score: 'Score'
    },
    es: {
      title: 'Resumen de tu Madurez',
      ideaValidation: 'Validación de Idea',
      userExperience: 'Experiencia de Usuario',
      marketFit: 'Ajuste al Mercado',
      monetization: 'Monetización',
      score: 'Puntuación'
    }
  };

  // Prepare data for radar chart
  const radarData = [
    {
      category: t[language].ideaValidation,
      score: scores.ideaValidation,
      fullMark: 100
    },
    {
      category: t[language].userExperience,
      score: scores.userExperience,
      fullMark: 100
    },
    {
      category: t[language].marketFit,
      score: scores.marketFit,
      fullMark: 100
    },
    {
      category: t[language].monetization,
      score: scores.monetization,
      fullMark: 100
    }
  ];

  // Prepare data for bar chart
  const barData = [
    {
      name: t[language].ideaValidation,
      score: scores.ideaValidation
    },
    {
      name: t[language].userExperience,
      score: scores.userExperience
    },
    {
      name: t[language].marketFit,
      score: scores.marketFit
    },
    {
      name: t[language].monetization,
      score: scores.monetization
    }
  ];

  const getBarColor = (value: number) => {
    if (value >= 80) return '#10b981'; // green
    if (value >= 60) return '#3b82f6'; // blue
    if (value >= 40) return '#f59e0b'; // amber
    return '#ef4444'; // red
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8"
    >
      <h3 className="text-2xl font-bold text-center text-foreground mb-6">
        {t[language].title}
      </h3>

      {/* Radar Chart */}
      <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={radarData}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="category" 
              tick={{ fill: '#475569', fontSize: 12 }}
            />
            <PolarRadiusAxis 
              angle={90} 
              domain={[0, 100]}
              tick={{ fill: '#64748b', fontSize: 10 }}
            />
            <Radar
              name={t[language].score}
              dataKey="score"
              stroke="#8b5cf6"
              fill="#8b5cf6"
              fillOpacity={0.6}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>

      {/* Bar Chart */}
      <div className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border shadow-lg p-6">
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={barData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fill: '#475569', fontSize: 11 }}
              angle={-15}
              textAnchor="end"
              height={80}
            />
            <YAxis 
              domain={[0, 100]}
              tick={{ fill: '#64748b' }}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #e2e8f0',
                borderRadius: '8px'
              }}
            />
            <Bar 
              dataKey="score" 
              fill="#8b5cf6"
              radius={[8, 8, 0, 0]}
            >
              {barData.map((entry, index) => (
                <motion.rect
                  key={`bar-${index}`}
                  initial={{ height: 0 }}
                  animate={{ height: 'auto' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
