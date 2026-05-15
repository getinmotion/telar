import React from 'react';
import { glassPrimary, glassSecondary, SERIF, SANS, Pill } from '../dashboardStyles';

interface ChecklistItem {
  label: string;
  done: boolean;
  required: boolean;
  route: string;
}

interface Product { id: string; name?: string }

interface InventoryAlertsProps {
  isActivated: boolean;
  checklistItems: ChecklistItem[];
  lowStockProducts: Product[];
  draftProducts: Product[];
  onNavigate: (route: string) => void;
}

export const InventoryAlerts: React.FC<InventoryAlertsProps> = ({
  isActivated,
  checklistItems,
  lowStockProducts,
  draftProducts,
  onNavigate,
}) => {
  if (!isActivated) {
    return (
      <div style={{ ...glassPrimary, borderRadius: 32 }} className="overflow-hidden">
        {/* Illustration header */}
        <div
          className="h-36 flex items-center justify-center relative overflow-hidden"
          style={{ borderBottom: '1px solid rgba(236,109,19,0.08)', background: 'rgba(236,109,19,0.04)' }}
        >
          <div className="absolute w-24 h-24 rounded-full -rotate-12 translate-x-8 opacity-40" style={{ background: 'rgba(236,109,19,0.15)' }} />
          <div
            className="absolute w-20 h-20 rounded-2xl rotate-12 -translate-x-6 flex items-center justify-center"
            style={{ ...glassSecondary, borderRadius: 16 }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 32, color: 'rgba(236,109,19,0.3)' }}>inventory_2</span>
          </div>
          <div
            className="absolute w-14 h-14 rounded-full -translate-y-8 translate-x-4 flex items-center justify-center"
            style={{ ...glassPrimary, borderRadius: '50%', boxShadow: '0 4px 12px rgba(21,27,45,0.06)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 20, color: 'rgba(236,109,19,0.5)' }}>palette</span>
          </div>
        </div>

        <div className="p-8">
          <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', marginBottom: 24 }}>
            Faltantes para publicar
          </h3>
          <div className="space-y-4">
            {checklistItems.filter((i) => !i.done && i.required).map((item) => (
              <div key={item.label} className="flex flex-col gap-1 pb-4" style={{ borderBottom: '1px solid rgba(21,27,45,0.03)' }}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>{item.label}</span>
                    <Pill variant="error">Requerido</Pill>
                  </div>
                  <button
                    onClick={() => onNavigate(item.route)}
                    className="hover:underline shrink-0 ml-2"
                    style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
                  >
                    Ir
                  </button>
                </div>
              </div>
            ))}
            {checklistItems.filter((i) => !i.done && !i.required).map((item) => (
              <div key={item.label} className="flex justify-between items-center">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 700, color: 'rgba(84,67,62,0.7)' }}>{item.label}</span>
                  <Pill variant="success">Recomendado</Pill>
                </div>
                <button
                  onClick={() => onNavigate(item.route)}
                  className="hover:underline shrink-0 ml-2"
                  style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
                >
                  Agregar
                </button>
              </div>
            ))}
            {checklistItems.filter((i) => !i.done).length === 0 && (
              <p className="py-4 text-center" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#166534' }}>
                ¡Todo completo! Puedes publicar tu tienda.
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ ...glassPrimary, borderRadius: 32 }} className="overflow-hidden">
      <div
        className="h-32 flex items-center justify-center relative overflow-hidden"
        style={{ borderBottom: '1px solid rgba(21,27,45,0.04)', background: 'rgba(59,130,246,0.04)' }}
      >
        <div className="absolute w-20 h-20 rounded-full -top-8 -right-8 blur-xl opacity-40" style={{ background: 'rgba(59,130,246,0.3)' }} />
        <div className="relative">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center rotate-6"
            style={{ ...glassSecondary, borderRadius: 16, boxShadow: '0 4px 12px rgba(21,27,45,0.06)' }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 28, color: 'rgba(59,130,246,0.4)' }}>notifications</span>
          </div>
          {(lowStockProducts.length > 0 || draftProducts.length > 0) && (
            <div
              className="absolute -top-2 -right-2 w-7 h-7 rounded-full flex items-center justify-center"
              style={{ background: '#ec6d13', boxShadow: '0 2px 8px rgba(236,109,19,0.4)' }}
            >
              <span className="material-symbols-outlined" style={{ fontSize: 14, color: 'white' }}>priority_high</span>
            </div>
          )}
        </div>
      </div>

      <div className="p-8">
        <h3 style={{ fontFamily: SERIF, fontSize: 20, fontWeight: 700, color: '#151b2d', marginBottom: 24 }}>
          Alertas de tienda
        </h3>
        <div className="space-y-5">
          {lowStockProducts.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>Bajo stock</span>
                  <Pill variant="warning">{lowStockProducts.length} items</Pill>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>
                  Reponer para no pausar ventas.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/inventario')}
                className="hover:underline shrink-0 ml-3"
                style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
              >
                Revisar
              </button>
            </div>
          )}
          {draftProducts.length > 0 && (
            <div className="flex justify-between items-center">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>Borradores</span>
                  <Pill variant="draft">{draftProducts.length} items</Pill>
                </div>
                <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>
                  Completa para publicar.
                </p>
              </div>
              <button
                onClick={() => onNavigate('/inventario')}
                className="hover:underline shrink-0 ml-3"
                style={{ fontFamily: SANS, fontSize: 9, fontWeight: 900, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#ec6d13' }}
              >
                Completar
              </button>
            </div>
          )}
          {lowStockProducts.length === 0 && draftProducts.length === 0 && (
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined" style={{ fontSize: 18, color: '#166534', fontVariationSettings: "'FILL' 1" }}>check_circle</span>
              <div>
                <span style={{ fontFamily: SANS, fontSize: 14, fontWeight: 700, color: '#151b2d' }}>Todo en orden</span>
                <p style={{ fontFamily: SANS, fontSize: 10, fontWeight: 500, color: 'rgba(84,67,62,0.5)' }}>¡Tu catálogo está al día!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
