import React, { useEffect } from 'react';
import { UserProgressDashboard } from '@/components/dashboard/UserProgressDashboard';
import { SEOHead } from '@/components/seo/SEOHead';
import { SEO_CONFIG } from '@/config/seo';
import { useLanguage } from '@/context/LanguageContext';

const UserProgress = () => {
  const { language } = useLanguage();

  // Scroll to top when component mounts
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const seoData = SEO_CONFIG.pages.dashboard[language];

  return (
    <>
      <SEOHead
        title={'Progress Dashboard - ' + seoData.title}
        description={seoData.description}
        keywords={seoData.keywords}
        url={`${SEO_CONFIG.siteUrl}/dashboard/progress`}
        type="website"
        noIndex={true}
      />
      
      <UserProgressDashboard />
    </>
  );
};

export default UserProgress;