import React from 'react';
import { useNavigate } from 'react-router-dom';

const SERIF = "'Noto Serif', serif";
const SANS  = "'Manrope', sans-serif";

const ICON_MAP: Record<string, string> = {
  storefront:    'storefront',
  inventory_2:   'inventory_2',
  person_pin:    'person_pin',
  palette:       'palette',
  verified:      'verified',
  // legacy Lucide names mapped forward
  Store:         'storefront',
  Package:       'inventory_2',
  FileText:      'person_pin',
  Palette:       'palette',
  CheckCircle:   'verified',
};

interface MissionCardProps {
  title: string;
  description: string;
  milestone: string;
  ctaRoute: string;
  icon: string;
  estimatedMinutes?: number;
  isNext?: boolean;
}

export const MissionCard: React.FC<MissionCardProps> = ({
  title,
  description,
  milestone,
  ctaRoute,
  icon,
  estimatedMinutes,
  isNext,
}) => {
  const navigate = useNavigate();
  const materialIcon = ICON_MAP[icon] || 'task_alt';

  return (
    <div
      onClick={() => navigate(ctaRoute)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        background: 'white',
        border: isNext ? '1px solid rgba(0,0,0,0.07)' : '1px solid rgba(0,0,0,0.07)',
        borderLeft: isNext ? '3px solid #ec6d13' : '3px solid transparent',
        borderRadius: 12,
        padding: '14px 16px',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s',
      }}
      onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)')}
      onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = 'none')}
    >
      {/* Icon */}
      <div style={{
        width: 40, height: 40, borderRadius: 10, flexShrink: 0,
        background: isNext ? 'rgba(236,109,19,0.1)' : 'rgba(0,0,0,0.04)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span className="material-symbols-outlined" style={{ fontSize: 20, color: isNext ? '#ec6d13' : '#888' }}>
          {materialIcon}
        </span>
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: SERIF, fontSize: 14, fontWeight: 700, color: '#1a1a2e', margin: '0 0 2px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {title}
        </p>
        <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(0,0,0,0.5)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {description}
        </p>
        {estimatedMinutes && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
            <span className="material-symbols-outlined" style={{ fontSize: 12, color: 'rgba(0,0,0,0.35)' }}>schedule</span>
            <span style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(0,0,0,0.35)' }}>{estimatedMinutes} min</span>
          </div>
        )}
      </div>

      {/* Arrow */}
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: isNext ? '#ec6d13' : 'rgba(0,0,0,0.3)', flexShrink: 0 }}>
        arrow_forward
      </span>
    </div>
  );
};
