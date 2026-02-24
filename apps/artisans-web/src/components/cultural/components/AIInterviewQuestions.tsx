import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { MessageCircle, Send, User, Bot } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface AIQuestion {
  question: string;
  context: string;
}

interface AIInterviewQuestionsProps {
  questions: AIQuestion[];
  language: 'en' | 'es';
  isLoading?: boolean;
  onAnswersSubmit?: (answers: { question: string; answer: string }[]) => void;
}

export const AIInterviewQuestions: React.FC<AIInterviewQuestionsProps> = ({
  questions,
  language,
  isLoading = false,
  onAnswersSubmit
}) => {
  const [answers, setAnswers] = useState<{ [key: number]: string }>({});

  const t = {
    en: {
      title: "Tell me more",
      subtitle: "Just curious about your project",
      noQuestions: "No questions at the moment",
      loading: "Preparing some questions...",
      answerPlaceholder: "Type here...",
      submitAnswers: "Done"
    },
    es: {
      title: "Cuéntame más",
      subtitle: "Solo curiosidad por tu proyecto",
      noQuestions: "No hay preguntas en este momento",
      loading: "Preparando algunas preguntas...",
      answerPlaceholder: "Escribe aquí...",
      submitAnswers: "Listo"
    }
  };

  const handleAnswerChange = (index: number, value: string) => {
    setAnswers(prev => ({ ...prev, [index]: value }));
  };

  const handleSubmit = () => {
    if (onAnswersSubmit) {
      const formattedAnswers = questions.map((question, index) => ({
        question: question.question,
        answer: answers[index] || ''
      }));
      onAnswersSubmit(formattedAnswers);
    }
  };

  const hasAnswers = Object.values(answers).some(answer => answer.trim() !== '');

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg p-8"
      >
        <div className="flex items-center justify-center space-x-3">
          <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full"></div>
          <span className="text-primary font-medium">{t[language].loading}</span>
        </div>
      </motion.div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 shadow-lg p-8 text-center"
      >
        <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">{t[language].noQuestions}</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="bg-background/80 backdrop-blur-sm rounded-2xl border border-border/50 overflow-hidden shadow-lg max-w-2xl mx-auto"
    >
      {/* Header */}
      <div className="bg-primary/5 border-b border-border/30 p-4">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
            <Bot className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-foreground">
              {t[language].title}
            </h3>
            <p className="text-xs text-muted-foreground">
              {t[language].subtitle}
            </p>
          </div>
        </div>
      </div>

      {/* Chat-style questions */}
      <div className="p-4 space-y-4">
        {questions.map((question, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * index }}
            className="space-y-3"
          >
            {/* AI Question */}
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-1">
                <Bot className="w-3 h-3 text-primary" />
              </div>
              <div className="bg-primary/5 rounded-2xl rounded-tl-md px-4 py-3 max-w-[85%]">
                <p className="text-sm text-foreground font-medium">
                  {question.question}
                </p>
              </div>
            </div>
            
            {/* User Answer */}
            <div className="flex items-start space-x-3 justify-end">
              <div className="max-w-[85%] w-full">
                <Textarea
                  placeholder={t[language].answerPlaceholder}
                  value={answers[index] || ''}
                  onChange={(e) => handleAnswerChange(index, e.target.value)}
                  className="min-h-[60px] resize-none bg-muted/50 border-border/30 rounded-2xl rounded-tr-md text-sm"
                />
              </div>
              <div className="w-6 h-6 rounded-full bg-muted/50 flex items-center justify-center flex-shrink-0 mt-1">
                <User className="w-3 h-3 text-muted-foreground" />
              </div>
            </div>
          </motion.div>
        ))}
        
        {hasAnswers && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="pt-4 border-t border-border/20"
          >
            <Button 
              onClick={handleSubmit}
              className="w-full rounded-xl"
              size="sm"
            >
              {t[language].submitAnswers}
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};