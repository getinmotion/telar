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

function CountBadge({ count, active }: { count?: number; active?: boolean }) {
  if (!count) return null;
  return (
    <span className={cn(
      'ml-auto shrink-0 rounded-full px-1.5 py-px text-[9px] font-extrabold',
      active ? 'bg-green-700/12 text-green-700' : 'bg-stone-900/6 text-stone-400',
    )}>
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
    <nav className={cn('flex flex-col gap-0.5 py-2 px-2', className)}>
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
            {sectionKey === 'shops' && (
              <div className="flex items-center gap-2 px-2.5 py-1.5 mt-1">
                <div className="flex-1 h-px bg-green-700/10" />
                <span className="text-[8px] font-extrabold tracking-[0.18em] uppercase text-stone-400/60 whitespace-nowrap">
                  Tiendas
                </span>
                <div className="flex-1 h-px bg-green-700/10" />
              </div>
            )}
            <button
              onClick={() => toggleSection(sectionKey)}
              className={cn(
                'flex w-full items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs transition-all text-left border',
                isActive
                  ? 'font-bold text-green-700 bg-green-700/8 border-green-700/15'
                  : 'font-medium text-stone-500 bg-transparent border-transparent hover:bg-green-700/4',
              )}
            >
              <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-green-700' : 'text-stone-400')} />
              <span className="flex-1">{sectionConfig.label}</span>
              <CountBadge count={sectionTotal} active={isActive} />
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5 text-stone-400/50" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-stone-400/50" />
              )}
            </button>

            {isExpanded && (
              <div className="mt-0.5 ml-4 pl-3 border-l border-green-700/15 flex flex-col gap-0.5 pb-1">
                {subsections.map(([subKey, subLabel]) => {
                  const subCount = counts[sectionKey]?.[subKey as keyof (typeof counts)[typeof sectionKey]];
                  const isSubActive = isActive && activeSubsection === subKey;

                  return (
                    <button
                      key={subKey}
                      onClick={() => onSectionChange(sectionKey, subKey)}
                      className={cn(
                        'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-[11px] transition-all text-left',
                        isSubActive
                          ? 'font-bold text-green-700 bg-green-700/6'
                          : 'font-normal text-stone-500 hover:bg-green-700/4',
                      )}
                    >
                      <span className="flex-1">{subLabel}</span>
                      <CountBadge count={subCount as number | undefined} active={isSubActive} />
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
