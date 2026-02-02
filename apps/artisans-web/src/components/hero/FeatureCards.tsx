
import React from 'react';
import { Calculator, Store, Package, TrendingUp } from 'lucide-react';

interface FeatureCardsProps {
  motionPurpose: string;
  creativePlatform: string;
  creativePlatformDesc: string;
  businessSuite: string;
  businessSuiteDesc: string;
  timeProtector: string;
  timeProtectorDesc: string;
  growthPartner: string;
  growthPartnerDesc: string;
}

export const FeatureCards: React.FC<FeatureCardsProps> = ({
  motionPurpose,
  creativePlatform,
  creativePlatformDesc,
  businessSuite,
  businessSuiteDesc,
  timeProtector,
  timeProtectorDesc,
  growthPartner,
  growthPartnerDesc
}) => {
  return (
    <div className="w-full relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Feature Cards Grid - Financial App Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {/* Pricing Calculator Card */}
          <div className="bg-white rounded-2xl p-6 shadow-float hover:shadow-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-neon-green-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-green-400 to-neon-green-700 flex items-center justify-center mb-4 shadow-neon">
              <Calculator className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-charcoal">{creativePlatform}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{creativePlatformDesc}</p>
          </div>
          
          {/* Digital Shop Card */}
          <div className="bg-white rounded-2xl p-6 shadow-float hover:shadow-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-neon-green-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-green-600 to-neon-green-800 flex items-center justify-center mb-4 shadow-neon">
              <Store className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-charcoal">{businessSuite}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{businessSuiteDesc}</p>
          </div>
          
          {/* Inventory Manager Card */}
          <div className="bg-white rounded-2xl p-6 shadow-float hover:shadow-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-neon-green-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-green-400 to-neon-green-700 flex items-center justify-center mb-4 shadow-neon">
              <Package className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-charcoal">{timeProtector}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{timeProtectorDesc}</p>
          </div>
          
          {/* AI Growth Partner Card */}
          <div className="bg-white rounded-2xl p-6 shadow-float hover:shadow-hover transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-transparent hover:border-neon-green-200">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neon-green-600 to-neon-green-800 flex items-center justify-center mb-4 shadow-neon">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-charcoal">{growthPartner}</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">{growthPartnerDesc}</p>
          </div>
        </div>
        
        {/* Purpose Statement */}
        <div className="text-center pt-8">
          <div className="max-w-4xl mx-auto bg-gradient-to-r from-neon-green-50 to-neon-green-100 rounded-2xl p-8 shadow-float border-2 border-neon-green-200">
            <p className="text-2xl md:text-3xl font-semibold text-deep-green leading-relaxed">
              {motionPurpose}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
