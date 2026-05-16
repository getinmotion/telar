import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import {
  Package,
  Store,
  Tag,
  ImageOff,
  Star,
  ChevronRight,
  ChevronDown,
} from 'lucide-react';
import { QUEUE_SECTION_LABELS } from '@/constants/moderation-copy';

export type QueueSection =
  | 'products'
  | 'shops'
  | 'taxonomy'
  | 'visual_quality'
  | 'marketplace';

export type QueueSubsection = string;

interface SectionCounts {
  products?: {
    pending?: number;
    incomplete?: number;
    recently_edited?: number;
    changes_requested?: number;
    rejected?: number;
  };
  shops?: {
    pending_publish?: number;
    branding_incomplete?: number;
    no_bank_data?: number;
    identity_incomplete?: number;
  };
  taxonomy?: {
    materials?: number;
    crafts?: number;
    techniques?: number;
    styles?: number;
  };
  visual_quality?: {
    no_photos?: number;
    low_quality?: number;
    wrong_background?: number;
  };
  marketplace?: {
    featured?: number;
    collections?: number;
    campaigns?: number;
  };
}

interface QueueSidebarProps {
  activeSection: QueueSection;
  activeSubsection?: QueueSubsection;
  counts?: SectionCounts;
  onSectionChange: (section: QueueSection, subsection?: QueueSubsection) => void;
  className?: string;
}

const SECTION_ICONS: Record<QueueSection, React.ComponentType<any>> = {
  products: Package,
  shops: Store,
  taxonomy: Tag,
  visual_quality: ImageOff,
  marketplace: Star,
};

function CountBadge({ count }: { count?: number }) {
  if (!count) return null;
  return (
    <span className="ml-auto flex-shrink-0 rounded-full bg-foreground/8 px-1.5 py-0.5 text-[10px] font-medium tabular-nums text-muted-foreground">
      {count > 99 ? '99+' : count}
    </span>
  );
}

export const QueueSidebar: React.FC<QueueSidebarProps> = ({
  activeSection,
  activeSubsection,
  counts = {},
  onSectionChange,
  className,
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<QueueSection>>(
    new Set([activeSection]),
  );

  const toggleSection = (section: QueueSection) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(section)) {
        next.delete(section);
      } else {
        next.add(section);
      }
      return next;
    });
    onSectionChange(section);
  };

  const sections = Object.entries(QUEUE_SECTION_LABELS) as [
    QueueSection,
    (typeof QUEUE_SECTION_LABELS)[QueueSection],
  ][];

  return (
    <nav className={cn('flex flex-col gap-0.5 py-2', className)}>
      {sections.map(([sectionKey, sectionConfig]) => {
        const Icon = SECTION_ICONS[sectionKey];
        const isActive = activeSection === sectionKey;
        const isExpanded = expandedSections.has(sectionKey);
        const subsections = Object.entries(sectionConfig.subsections) as [string, string][];

        const sectionTotal = counts[sectionKey]
          ? Object.values(counts[sectionKey] as Record<string, number>).reduce(
              (a, b) => a + b,
              0,
            )
          : undefined;

        return (
          <div key={sectionKey}>
            <button
              onClick={() => toggleSection(sectionKey)}
              className={cn(
                'flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                isActive && 'bg-accent text-accent-foreground font-medium',
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
              <span className="flex-1 text-left">{sectionConfig.label}</span>
              <CountBadge count={sectionTotal} />
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-0.5 ml-4 border-l pl-3 flex flex-col gap-0.5 pb-1">
                {subsections.map(([subKey, subLabel]) => {
                  const subCount = counts[sectionKey]?.[subKey as keyof (typeof counts)[typeof sectionKey]];
                  const isSubActive = isActive && activeSubsection === subKey;

                  return (
                    <button
                      key={subKey}
                      onClick={() => onSectionChange(sectionKey, subKey)}
                      className={cn(
                        'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-xs transition-colors',
                        'hover:bg-accent hover:text-accent-foreground',
                        isSubActive && 'bg-accent/60 text-accent-foreground font-medium',
                      )}
                    >
                      <span className="flex-1 text-left text-muted-foreground">{subLabel}</span>
                      <CountBadge count={subCount as number | undefined} />
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}
    </nav>
  );
};
