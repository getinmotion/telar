
export const SEO_CONFIG = {
  siteName: 'Motion',
  siteUrl: 'https://motion.lovable.app',
  defaultTitle: 'Motion - AI Agents para Creadores Culturales',
  defaultDescription: 'Agentes de IA especializados para empoderar a creadores culturales, artistas y artesanos con soluciones de back office incluyendo soporte legal, contable y administrativo.',
  defaultImage: '/lovable-uploads/e2faf820-4987-4cf2-a69b-0b534fbbecbd.png',
  twitterHandle: '@motion_project',
  author: 'Motion Project',
  keywords: [
    'AI agents',
    'agentes IA',
    'creadores culturales',
    'artistas',
    'artesanos',
    'gestión empresarial',
    'automatización',
    'back office',
    'legal',
    'contabilidad',
    'administración'
  ],
  
  pages: {
    home: {
      es: {
        title: 'Motion - AI Agents para Creadores Culturales',
        description: 'Agentes de IA especializados para empoderar a creadores culturales, artistas y artesanos con soluciones de back office incluyendo soporte legal, contable y administrativo.',
        keywords: 'AI agents, creadores culturales, artistas, artesanos, gestión empresarial, automatización'
      },
      en: {
        title: 'Motion - AI Agents for Cultural Creators',
        description: 'AI agents designed to empower cultural creators, artists and artisans with back office solutions including legal, accounting and administrative support.',
        keywords: 'AI agents, cultural creators, artists, artisans, business management, automation'
      }
    },
    agents: {
      es: {
        title: 'Galería de Agentes IA - Motion',
        description: 'Explora nuestra colección de agentes especializados en diferentes áreas: legal, contabilidad, marketing, ventas y más. Encuentra el agente perfecto para tu negocio cultural.',
        keywords: 'agentes IA, galería agentes, especialistas, legal, contabilidad, marketing'
      },
      en: {
        title: 'AI Agents Gallery - Motion',
        description: 'Explore our collection of specialized agents in different areas: legal, accounting, marketing, sales and more. Find the perfect agent for your cultural business.',
        keywords: 'AI agents, agents gallery, specialists, legal, accounting, marketing'
      }
    },
    dashboard: {
      es: {
        title: 'Dashboard - Motion',
        description: 'Gestiona tus agentes de IA, revisa el progreso de tus tareas y accede a herramientas especializadas para hacer crecer tu negocio cultural.',
        keywords: 'dashboard, gestión agentes, tareas, progreso, herramientas'
      },
      en: {
        title: 'Dashboard - Motion',
        description: 'Manage your AI agents, review task progress and access specialized tools to grow your cultural business.',
        keywords: 'dashboard, agent management, tasks, progress, tools'
      }
    },
    maturityCalculator: {
      es: {
        title: 'Calculadora de Madurez Empresarial - Motion',
        description: 'Evalúa el nivel de madurez de tu proyecto cultural y recibe recomendaciones personalizadas de agentes IA para hacer crecer tu negocio.',
        keywords: 'calculadora madurez, evaluación empresarial, recomendaciones, crecimiento'
      },
      en: {
        title: 'Business Maturity Calculator - Motion',
        description: 'Assess your cultural project maturity level and receive personalized AI agent recommendations to grow your business.',
        keywords: 'maturity calculator, business assessment, recommendations, growth'
      }
    }
  }
};

export const generateJsonLd = (type: 'organization' | 'website' | 'breadcrumbs', data?: any) => {
  const baseUrl = SEO_CONFIG.siteUrl;
  
  switch (type) {
    case 'organization':
      return {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": SEO_CONFIG.siteName,
        "url": baseUrl,
        "logo": `${baseUrl}${SEO_CONFIG.defaultImage}`,
        "description": SEO_CONFIG.defaultDescription,
        "sameAs": [
          "https://twitter.com/motion_project"
        ]
      };
      
    case 'website':
      return {
        "@context": "https://schema.org",
        "@type": "WebSite",
        "name": SEO_CONFIG.siteName,
        "url": baseUrl,
        "description": SEO_CONFIG.defaultDescription,
        "potentialAction": {
          "@type": "SearchAction",
          "target": `${baseUrl}/agents?search={search_term_string}`,
          "query-input": "required name=search_term_string"
        }
      };
      
    case 'breadcrumbs':
      return {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": data || []
      };
      
    default:
      return null;
  }
};
