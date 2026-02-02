
import React from 'react';
import { MotionLogo } from '@/components/MotionLogo';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Footer } from '@/components/Footer';
import { ArrowRight } from 'lucide-react';

interface OnePagerLayoutProps {
  selectedLanguage: 'en' | 'es';  // Update the type here to be more specific
  title: string;
  subtitle: string;
  backText: string;
  children: React.ReactNode;
  onLanguageChange: (value: string) => void;
}

export const OnePagerLayout = ({ 
  selectedLanguage, 
  title, 
  subtitle, 
  backText, 
  children, 
  onLanguageChange 
}: OnePagerLayoutProps) => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-950 to-purple-950">
      <header className="sticky top-0 z-50 backdrop-blur-md bg-indigo-950/80 border-b border-indigo-800/30 shadow-md">
        <div className="container mx-auto py-4 px-4 flex justify-between items-center">
          <MotionLogo variant="light" />
          <div className="flex items-center gap-4">
            <div className="bg-indigo-900/40 p-2 rounded-lg">
              <Tabs value={selectedLanguage} onValueChange={onLanguageChange} className="w-[180px]">
                <TabsList className="grid w-full grid-cols-2 bg-indigo-900/50">
                  <TabsTrigger 
                    value="en" 
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white"
                  >
                    English
                  </TabsTrigger>
                  <TabsTrigger 
                    value="es"
                    className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500/80 data-[state=active]:to-purple-600/80 data-[state=active]:text-white"
                  >
                    Español
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <Button 
              variant="outline" 
              className="text-xs sm:text-sm border-pink-500 text-pink-200 hover:bg-pink-900/30 hover:text-pink-100"
              onClick={() => window.location.href = "/"}
            >
              {backText} <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 md:py-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-pink-300 to-purple-300">
            {title}
          </h1>
          <p className="text-xl md:text-2xl text-indigo-200 max-w-3xl mx-auto">
            {subtitle}
          </p>
        </div>
        
        {children}
      </main>

      <Footer />
    </div>
  );
};
