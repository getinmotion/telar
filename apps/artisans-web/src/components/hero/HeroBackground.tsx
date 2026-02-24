
import React from 'react';

export const HeroBackground: React.FC = () => {
  return (
    <>
      {/* Sophisticated artistic background elements - only blur circles */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-[20%] left-10 w-60 h-60 rounded-full bg-accent/30 blur-[100px]"></div>
        <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-primary/30 blur-[120px]"></div>
        <div className="absolute top-1/2 left-1/3 w-96 h-96 rounded-full bg-secondary/30 blur-[150px]"></div>
      </div>

      {/* Simple geometric elements for sophistication */}
      <div className="absolute inset-0 overflow-hidden opacity-10">
        <div className="absolute -top-10 -right-10 w-40 h-40 border border-accent/20 rounded-full"></div>
        <div className="absolute bottom-20 left-20 w-60 h-60 border border-primary/20 rounded-full"></div>
        <div className="absolute top-40 right-1/4 w-20 h-20 border border-accent/20 rounded-full"></div>
      </div>
    </>
  );
};
