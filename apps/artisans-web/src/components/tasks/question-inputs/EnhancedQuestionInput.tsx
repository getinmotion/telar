import React from 'react';
import { SingleChoiceInput } from './SingleChoiceInput';
import { MultipleChoiceInput } from './MultipleChoiceInput';
import { SliderInput } from './SliderInput';
import { QuickAnswerInput } from './QuickAnswerInput';
import { TextAreaWithVoice } from './TextAreaWithVoice';

export interface IntelligentQuestion {
  question: string;
  context: string;
  category: string;
  type: 'text' | 'single-choice' | 'multiple-choice' | 'slider' | 'quick-answer' | 'number' | 'url' | 'email';
  options?: string[];
  suggestedAnswers?: string[];
  min?: number;
  max?: number;
  unit?: string;
  placeholder?: string;
  helpText?: string;
  marketData?: string;
}

interface EnhancedQuestionInputProps {
  question: IntelligentQuestion;
  value: string | string[] | number;
  onChange: (value: string | string[] | number) => void;
  language: 'en' | 'es';
}

export const EnhancedQuestionInput: React.FC<EnhancedQuestionInputProps> = ({
  question,
  value,
  onChange,
  language
}) => {
  switch (question.type) {
    case 'single-choice':
      return (
        <SingleChoiceInput
          options={question.options || []}
          value={value as string}
          onChange={onChange as (value: string) => void}
          helpText={question.helpText}
        />
      );

    case 'multiple-choice':
      return (
        <MultipleChoiceInput
          options={question.options || []}
          value={(value as string[]) || []}
          onChange={onChange as (value: string[]) => void}
          helpText={question.helpText}
        />
      );

    case 'slider':
      return (
        <SliderInput
          value={typeof value === 'number' ? value : (question.min || 0)}
          onChange={onChange as (value: number) => void}
          min={question.min || 0}
          max={question.max || 100}
          unit={question.unit}
          helpText={question.helpText}
        />
      );

    case 'quick-answer':
      return (
        <QuickAnswerInput
          suggestedAnswers={question.suggestedAnswers || []}
          value={value as string}
          onChange={onChange as (value: string) => void}
          placeholder={question.placeholder}
          helpText={question.helpText}
          language={language}
        />
      );

    case 'text':
    default:
      return (
        <TextAreaWithVoice
          value={value as string}
          onChange={onChange as (value: string) => void}
          placeholder={question.placeholder}
          helpText={question.helpText}
          language={language}
        />
      );
  }
};
