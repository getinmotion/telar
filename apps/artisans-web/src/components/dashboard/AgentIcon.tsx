
import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AgentIconProps {
  icon: React.ReactNode | LucideIcon | string;
  className?: string;
}

export const AgentIcon: React.FC<AgentIconProps> = ({ icon, className = "" }) => {
  console.log('AgentIcon: Rendering with icon:', typeof icon);

  // Handle null/undefined
  if (!icon) {
    return (
      <div className={`w-6 h-6 bg-muted rounded flex items-center justify-center ${className}`}>
        <span className="text-xs text-muted-foreground">?</span>
      </div>
    );
  }

  // Handle string (emoji or text)
  if (typeof icon === 'string') {
    return (
      <span className={`inline-flex items-center justify-center w-6 h-6 ${className}`}>
        {icon}
      </span>
    );
  }

  // Handle Lucide React components (functions)
  if (typeof icon === 'function') {
    try {
      const IconComponent = icon as LucideIcon;
      return <IconComponent className={`w-6 h-6 ${className}`} size={24} />;
    } catch (error) {
      console.warn('AgentIcon: Error rendering Lucide icon:', error);
      return (
        <div className={`w-6 h-6 bg-muted rounded flex items-center justify-center ${className}`}>
          <span className="text-xs text-muted-foreground">⚠</span>
        </div>
      );
    }
  }

  // Handle React elements
  if (React.isValidElement(icon)) {
    try {
      return React.cloneElement(icon as React.ReactElement, { 
        className: `w-6 h-6 ${className}` 
      });
    } catch (error) {
      console.warn('AgentIcon: Error cloning React element:', error);
      return (
        <div className={`w-6 h-6 bg-muted rounded flex items-center justify-center ${className}`}>
          <span className="text-xs text-muted-foreground">⚠</span>
        </div>
      );
    }
  }

  // Fallback for any other case
  console.warn('AgentIcon: Unknown icon type, using fallback');
  return (
    <div className={`w-6 h-6 bg-muted rounded flex items-center justify-center ${className}`}>
      <span className="text-xs text-muted-foreground">?</span>
    </div>
  );
};
