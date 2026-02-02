
import { useEffect } from 'react';
import { SEO_CONFIG, generateJsonLd } from '@/config/seo';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  canonicalUrl?: string;
}

export const SEOHead: React.FC<SEOHeadProps> = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  canonicalUrl
}) => {
  const language = 'en'; // Fixed to English only
  
  const siteTitle = title || SEO_CONFIG.defaultTitle;
  const siteDescription = description || SEO_CONFIG.defaultDescription;
  const siteImage = image ? `${SEO_CONFIG.siteUrl}${image}` : `${SEO_CONFIG.siteUrl}${SEO_CONFIG.defaultImage}`;
  const siteUrl = url || window.location.href;
  const canonical = canonicalUrl || siteUrl;
  
  useEffect(() => {
    // Update document title
    document.title = siteTitle;
    
    // Update or create meta tags
    const updateMeta = (name: string, content: string, property?: boolean) => {
      const attribute = property ? 'property' : 'name';
      let meta = document.querySelector(`meta[${attribute}="${name}"]`);
      
      if (!meta) {
        meta = document.createElement('meta');
        meta.setAttribute(attribute, name);
        document.head.appendChild(meta);
      }
      
      meta.setAttribute('content', content);
    };
    
    // Basic meta tags
    updateMeta('description', siteDescription);
    updateMeta('keywords', keywords || SEO_CONFIG.keywords.join(', '));
    updateMeta('author', SEO_CONFIG.author);
    updateMeta('language', language);
    
    if (noIndex) {
      updateMeta('robots', 'noindex, nofollow');
    } else {
      updateMeta('robots', 'index, follow');
    }
    
    // Open Graph tags
    updateMeta('og:title', siteTitle, true);
    updateMeta('og:description', siteDescription, true);
    updateMeta('og:image', siteImage, true);
    updateMeta('og:url', siteUrl, true);
    updateMeta('og:type', type, true);
    updateMeta('og:site_name', SEO_CONFIG.siteName, true);
    updateMeta('og:locale', 'en_US', true);
    
    // Twitter Card tags
    updateMeta('twitter:card', 'summary_large_image');
    updateMeta('twitter:site', SEO_CONFIG.twitterHandle);
    updateMeta('twitter:title', siteTitle);
    updateMeta('twitter:description', siteDescription);
    updateMeta('twitter:image', siteImage);
    
    // Canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', canonical);
    
    // Language alternate links
    let alternateEs = document.querySelector('link[hreflang="es"]');
    if (!alternateEs) {
      alternateEs = document.createElement('link');
      alternateEs.setAttribute('rel', 'alternate');
      alternateEs.setAttribute('hreflang', 'es');
      document.head.appendChild(alternateEs);
    }
    alternateEs.setAttribute('href', siteUrl);
    
    let alternateEn = document.querySelector('link[hreflang="en"]');
    if (!alternateEn) {
      alternateEn = document.createElement('link');
      alternateEn.setAttribute('rel', 'alternate');
      alternateEn.setAttribute('hreflang', 'en');
      document.head.appendChild(alternateEn);
    }
    alternateEn.setAttribute('href', siteUrl);
    
    // JSON-LD structured data
    const removeExistingJsonLd = () => {
      const existing = document.querySelectorAll('script[type="application/ld+json"]');
      existing.forEach(script => script.remove());
    };
    
    const addJsonLd = (data: any) => {
      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.textContent = JSON.stringify(data);
      document.head.appendChild(script);
    };
    
    removeExistingJsonLd();
    
    // Organization schema
    addJsonLd(generateJsonLd('organization'));
    
    // Website schema
    addJsonLd(generateJsonLd('website'));
    
  }, [siteTitle, siteDescription, siteImage, siteUrl, canonical, keywords, language, type, noIndex]);
  
  return null;
};
