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
import { SANS, GREEN_MOD } from '@/components/dashboard/dashboardStyles';

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
    <span
      style={{
        marginLeft: 'auto',
        flexShrink: 0,
        borderRadius: 9999,
        padding: '1px 7px',
        fontSize: 9,
        fontFamily: SANS,
        fontWeight: 800,
        background: active ? `rgba(21,128,61,0.12)` : 'rgba(21,27,45,0.06)',
        color: active ? GREEN_MOD : 'rgba(84,67,62,0.5)',
      }}
    >
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
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 10px 4px', marginTop: 4 }}>
                <div style={{ flex: 1, height: 1, background: 'rgba(21,128,61,0.1)' }} />
                <span style={{ fontFamily: SANS, fontSize: 8, fontWeight: 800, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.35)', whiteSpace: 'nowrap' }}>
                  Tiendas
                </span>
                <div style={{ flex: 1, height: 1, background: 'rgba(21,128,61,0.1)' }} />
              </div>
            )}
            <button
              onClick={() => toggleSection(sectionKey)}
              style={{
                display: 'flex',
                width: '100%',
                alignItems: 'center',
                gap: 8,
                borderRadius: 8,
                padding: '7px 10px',
                fontFamily: SANS,
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? GREEN_MOD : 'rgba(84,67,62,0.65)',
                background: isActive ? 'rgba(21,128,61,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(21,128,61,0.15)' : '1px solid transparent',
                cursor: 'pointer',
                transition: 'all 0.15s',
                textAlign: 'left',
              }}
              onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'rgba(21,128,61,0.04)'; }}
              onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
            >
              <Icon className="h-4 w-4 flex-shrink-0" style={{ color: isActive ? GREEN_MOD : 'rgba(84,67,62,0.4)' }} />
              <span style={{ flex: 1 }}>{sectionConfig.label}</span>
              <CountBadge count={sectionTotal} active={isActive} />
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" style={{ color: 'rgba(84,67,62,0.35)' }} />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" style={{ color: 'rgba(84,67,62,0.35)' }} />
              )}
            </button>

            {isExpanded && (
              <div
                style={{
                  marginTop: 2,
                  marginLeft: 16,
                  paddingLeft: 12,
                  borderLeft: `1px solid rgba(21,128,61,0.15)`,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 1,
                  paddingBottom: 4,
                }}
              >
                {subsections.map(([subKey, subLabel]) => {
                  const subCount = counts[sectionKey]?.[subKey as keyof (typeof counts)[typeof sectionKey]];
                  const isSubActive = isActive && activeSubsection === subKey;

                  return (
                    <button
                      key={subKey}
                      onClick={() => onSectionChange(sectionKey, subKey)}
                      style={{
                        display: 'flex',
                        width: '100%',
                        alignItems: 'center',
                        gap: 6,
                        borderRadius: 6,
                        padding: '5px 8px',
                        fontFamily: SANS,
                        fontSize: 11,
                        fontWeight: isSubActive ? 700 : 400,
                        color: isSubActive ? GREEN_MOD : 'rgba(84,67,62,0.55)',
                        background: isSubActive ? 'rgba(21,128,61,0.06)' : 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.12s',
                        textAlign: 'left',
                      }}
                      onMouseEnter={(e) => { if (!isSubActive) (e.currentTarget as HTMLElement).style.background = 'rgba(21,128,61,0.04)'; }}
                      onMouseLeave={(e) => { if (!isSubActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                    >
                      <span style={{ flex: 1 }}>{subLabel}</span>
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
