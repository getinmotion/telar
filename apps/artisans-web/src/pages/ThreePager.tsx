
import React, { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import {
  Lightbulb,
  Sparkles,
  Target,
  DollarSign,
  Globe,
  Users,
  Calendar,
} from 'lucide-react';
import { threePagerTranslations } from './threePager/threePagerTranslations';
import { Section } from '../pages/onePager/Section';
import { ThreePagerLayout } from './threePager/ThreePagerLayout';

const ThreePager = () => {
  const { language } = useLanguage();
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'es'>(
    language as 'en' | 'es'
  );

  const t = threePagerTranslations[selectedLanguage];

  const handleTabChange = (value: string) => {
    setSelectedLanguage(value as 'en' | 'es');
  };

  return (
    <ThreePagerLayout
      selectedLanguage={selectedLanguage}
      title={t.title}
      subtitle={t.subtitle}
      backText={t.nav.back}
      onLanguageChange={handleTabChange}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
        <Section
          icon={<Lightbulb className="h-8 w-8 text-accent" />}
          title={t.sections.problem.title}
          content={t.sections.problem.content}
        />

        <Section
          icon={<Sparkles className="h-8 w-8 text-accent" />}
          title={t.sections.solution.title}
          content={t.sections.solution.content}
          bullets={t.sections.solution.bullets}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Section
          icon={<Target className="h-8 w-8 text-accent" />}
          title={t.sections.traction.title}
          bullets={t.sections.traction.bullets}
        />

        <Section
          icon={<DollarSign className="h-8 w-8 text-accent" />}
          title={t.sections.business.title}
          bullets={t.sections.business.bullets}
        />

        <Section
          icon={<Globe className="h-8 w-8 text-accent" />}
          title={t.sections.market.title}
          bullets={t.sections.market.bullets}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        <Section
          icon={<Users className="h-8 w-8 text-accent" />}
          title={t.sections.team.title}
          bullets={t.sections.team.bullets}
        />

        <Section
          icon={<Calendar className="h-8 w-8 text-accent" />}
          title={t.sections.roadmap.title}
          bullets={t.sections.roadmap.bullets}
        />

        <Section
          icon={<DollarSign className="h-8 w-8 text-accent" />}
          title={t.sections.raising.title}
          content={t.sections.raising.content}
          bullets={t.sections.raising.bullets}
        />
      </div>
    </ThreePagerLayout>
  );
};

export default ThreePager;
