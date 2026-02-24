import React from 'react';

interface DescriptiveSectionProps {
  title: string;
  subtitle: string;
}

export const DescriptiveSection: React.FC<DescriptiveSectionProps> = ({
  title,
  subtitle
}) => {
  return (
    <section className="py-16 px-4 bg-muted">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-2xl md:text-3xl font-medium text-foreground mb-4 tracking-wide">
          {title}
        </h2>
        <p className="text-lg text-muted-foreground leading-relaxed">
          {subtitle}
        </p>
      </div>
    </section>
  );
};