
import React from 'react';

interface DashboardBackgroundProps {
  children: React.ReactNode;
}

// Simplified background - just clean, minimal styling
export const DashboardBackground: React.FC<DashboardBackgroundProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  );
};
