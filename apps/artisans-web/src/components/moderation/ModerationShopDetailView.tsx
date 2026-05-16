import React, { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Store,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertTriangle,
  Trash2,
  ShieldAlert,
  Loader2,
  Phone,
  Mail,
  MessageCircle,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import { ModerationShop } from '@/hooks/useShopModeration';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { SANS, SERIF, GREEN_MOD, glassPrimary, glassGreen } from '@/components/dashboard/dashboardStyles';

interface ModerationShopDetailViewProps {
  shop: ModerationShop;
  onApprovalChange: (shopId: string, approved: boolean, comment?: string) => Promise<void>;
  onPublishChange?: (shopId: string, action: 'publish' | 'unpublish', comment?: string) => Promise<boolean>;
  updating: boolean;
  isAdmin?: boolean;
  onDeleteShop?: (shopId: string, reason: string) => Promise<void>;
  onRefresh?: () => void;
}

export const ModerationShopDetailView: React.FC<ModerationShopDetailViewProps> = ({
  shop,
  onApprovalChange,
  updating,
  isAdmin = false,
  onDeleteShop,
}) => {
  const [comment, setComment] = useState('');
  const [isApproving, setIsApproving] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  const isApproved = shop.marketplaceApproved === true;

  const hasLogo = !!shop.logoUrl;
  const hasDescription = !!(shop.description && shop.description.length >= 30);
  const hasBankData = !!shop.hasBankData;
  const checks = [
    { label: 'Logo subido', ok: hasLogo },
    { label: 'Descripción (+30 caracteres)', ok: hasDescription },
    { label: 'Datos bancarios registrados', ok: hasBankData },
  ];
  const allGood = checks.every((c) => c.ok);

  const handleApprove = async () => {
    setIsApproving(true);
    try {
      await onApprovalChange(shop.id, true, comment);
      setComment('');
    } finally {
      setIsApproving(false);
    }
  };

  const handleRemove = async () => {
    setIsRemoving(true);
    try {
      await onApprovalChange(shop.id, false, comment);
      setComment('');
    } finally {
      setIsRemoving(false);
    }
  };

  const handleDelete = async () => {
    if (!onDeleteShop || deleteReason.trim().length < 10) return;
    setIsDeleting(true);
    try {
      await onDeleteShop(shop.id, deleteReason);
      setIsDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
      setDeleteReason('');
    }
  };

  const labelStyle: React.CSSProperties = {
    fontFamily: SANS,
    fontSize: 9,
    fontWeight: 800,
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    color: 'rgba(84,67,62,0.4)',
    marginBottom: 12,
  };

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden', background: '#f9f7f2' }}>

      {/* ── COLUMNA IZQUIERDA ── */}
      <div style={{ flex: '0 0 55%', overflowY: 'auto', padding: '28px 24px 28px 28px' }}>

        {/* Hero */}
        <div style={{ ...glassPrimary, borderRadius: 16, padding: 20, marginBottom: 16 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>

            {/* Logo */}
            <div style={{
              width: 72, height: 72, borderRadius: 12, overflow: 'hidden', flexShrink: 0,
              background: 'rgba(21,128,61,0.06)', border: '1px solid rgba(21,128,61,0.12)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              {shop.logoUrl ? (
                <img src={shop.logoUrl} alt={shop.shopName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <Store style={{ width: 28, height: 28, color: 'rgba(21,128,61,0.35)' }} />
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ marginBottom: 6 }}>
                {isApproved ? (
                  <span style={{ background: 'rgba(21,128,61,0.1)', color: GREEN_MOD, borderRadius: 9999, padding: '2px 10px', fontSize: 9, fontWeight: 800, fontFamily: SANS, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    En marketplace
                  </span>
                ) : (
                  <span style={{ background: 'rgba(21,27,45,0.06)', color: 'rgba(84,67,62,0.55)', borderRadius: 9999, padding: '2px 10px', fontSize: 9, fontWeight: 800, fontFamily: SANS, letterSpacing: '0.12em', textTransform: 'uppercase' }}>
                    Pendiente
                  </span>
                )}
              </div>

              <p style={{ fontFamily: SERIF, fontSize: 22, fontWeight: 700, color: '#151b2d', lineHeight: 1.2, marginBottom: 2 }}>
                {shop.shopName}
              </p>
              <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.5)', marginBottom: 10 }}>
                @{shop.shopSlug}
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                {shop.region && (
                  <span style={{ background: 'rgba(21,27,45,0.05)', color: 'rgba(84,67,62,0.65)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontFamily: SANS, fontWeight: 600 }}>
                    📍 {shop.region}
                  </span>
                )}
                {shop.craftType && (
                  <span style={{ background: 'rgba(21,27,45,0.05)', color: 'rgba(84,67,62,0.65)', borderRadius: 6, padding: '3px 8px', fontSize: 10, fontFamily: SANS, fontWeight: 600 }}>
                    🎨 {shop.craftType}
                  </span>
                )}
              </div>

              <a
                href={`https://${shop.shopSlug}.telar.co`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: SANS, fontWeight: 600, color: GREEN_MOD, textDecoration: 'none' }}
              >
                <ExternalLink style={{ width: 11, height: 11 }} />
                Ver tienda
              </a>
            </div>
          </div>
        </div>

        {/* Descripción */}
        {shop.description ? (
          <div style={{ ...glassPrimary, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <p style={labelStyle}>Descripción</p>
            <p style={{ fontFamily: SANS, fontSize: 13, color: 'rgba(84,67,62,0.85)', lineHeight: 1.65 }}>
              {shop.description}
            </p>
            {shop.description.length < 30 && (
              <p style={{ marginTop: 8, fontSize: 10, fontFamily: SANS, color: '#d97706', fontWeight: 600 }}>
                ⚠ Descripción muy corta (menos de 30 caracteres)
              </p>
            )}
          </div>
        ) : (
          <div style={{ ...glassPrimary, borderRadius: 14, padding: '16px 20px', marginBottom: 16 }}>
            <p style={labelStyle}>Descripción</p>
            <p style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.4)', fontStyle: 'italic' }}>Sin descripción</p>
          </div>
        )}

        {/* Stats productos */}
        <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
          {[
            { label: 'Total', value: shop.productCounts?.total ?? 0, color: 'rgba(84,67,62,0.65)' },
            { label: 'Aprobados', value: shop.productCounts?.approved ?? 0, color: GREEN_MOD },
            { label: 'Pendientes', value: shop.productCounts?.pending ?? 0, color: '#d97706' },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ flex: 1, ...glassPrimary, borderRadius: 12, padding: '12px 14px', textAlign: 'center' }}>
              <p style={{ fontFamily: SANS, fontSize: 24, fontWeight: 800, color, lineHeight: 1 }}>{value}</p>
              <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 700, color: 'rgba(84,67,62,0.45)', textTransform: 'uppercase', letterSpacing: '0.1em', marginTop: 4 }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Contacto */}
        {(shop.contactConfig?.phone || shop.contactConfig?.email || shop.contactConfig?.whatsapp) && (
          <div style={{ ...glassPrimary, borderRadius: 14, padding: '16px 20px' }}>
            <p style={labelStyle}>Contacto</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {shop.contactConfig?.email && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Mail style={{ width: 13, height: 13, color: 'rgba(84,67,62,0.4)', flexShrink: 0 }} />
                  <a href={`mailto:${shop.contactConfig.email}`} style={{ fontFamily: SANS, fontSize: 12, color: GREEN_MOD, textDecoration: 'none' }}>
                    {shop.contactConfig.email}
                  </a>
                </div>
              )}
              {shop.contactConfig?.phone && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Phone style={{ width: 13, height: 13, color: 'rgba(84,67,62,0.4)', flexShrink: 0 }} />
                  <a href={`tel:${shop.contactConfig.phone}`} style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.75)', textDecoration: 'none' }}>
                    {shop.contactConfig.phone}
                  </a>
                </div>
              )}
              {shop.contactConfig?.whatsapp && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <MessageCircle style={{ width: 13, height: 13, color: '#22c55e', flexShrink: 0 }} />
                  <a
                    href={`https://wa.me/57${shop.contactConfig.whatsapp.replace(/\D/g, '')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ fontFamily: SANS, fontSize: 12, color: 'rgba(84,67,62,0.75)', textDecoration: 'none' }}
                  >
                    WhatsApp: {shop.contactConfig.whatsapp}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── COLUMNA DERECHA ── */}
      <div style={{ flex: '0 0 45%', overflowY: 'auto', padding: '28px 28px 28px 16px', borderLeft: '1px solid rgba(21,128,61,0.08)' }}>

        {/* Decisión principal */}
        <div style={{ ...glassGreen, borderRadius: 16, padding: 24, marginBottom: 16 }}>
          <p style={{ fontFamily: SERIF, fontSize: 16, fontWeight: 700, color: '#151b2d', marginBottom: 4 }}>
            ¿Esta tienda entra al marketplace de Telar?
          </p>
          <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.55)', marginBottom: 20 }}>
            Esta decisión determina si los productos de la tienda aparecen en telar.co.
          </p>

          {/* Estado actual */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20, padding: '10px 14px',
            borderRadius: 10, background: isApproved ? 'rgba(21,128,61,0.08)' : 'rgba(21,27,45,0.04)',
          }}>
            {isApproved ? (
              <CheckCircle style={{ width: 16, height: 16, color: GREEN_MOD, flexShrink: 0 }} />
            ) : (
              <XCircle style={{ width: 16, height: 16, color: 'rgba(84,67,62,0.3)', flexShrink: 0 }} />
            )}
            <div>
              <p style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, color: isApproved ? GREEN_MOD : 'rgba(84,67,62,0.6)' }}>
                {isApproved ? 'Aprobada para el marketplace' : 'No está en el marketplace'}
              </p>
              {shop.marketplaceApprovedAt && (
                <p style={{ fontFamily: SANS, fontSize: 10, color: 'rgba(84,67,62,0.45)', marginTop: 1 }}>
                  {formatDistanceToNow(new Date(shop.marketplaceApprovedAt), { addSuffix: true, locale: es })}
                </p>
              )}
            </div>
          </div>

          {/* Comentario */}
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.4)', marginBottom: 6 }}>
              Comentario (opcional)
            </p>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Razón de la decisión..."
              rows={2}
              style={{
                width: '100%', resize: 'vertical', padding: '10px 12px', borderRadius: 10,
                border: '1px solid rgba(21,128,61,0.18)', background: 'rgba(255,255,255,0.8)',
                fontFamily: SANS, fontSize: 12, color: '#151b2d', outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* CTA */}
          {!isApproved ? (
            <button
              onClick={handleApprove}
              disabled={updating || isApproving}
              style={{
                width: '100%', padding: '14px', borderRadius: 12, border: 'none',
                background: updating || isApproving ? 'rgba(21,128,61,0.4)' : GREEN_MOD,
                color: 'white', fontFamily: SANS, fontSize: 14, fontWeight: 800,
                cursor: updating || isApproving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              {isApproving ? (
                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              ) : (
                <CheckCircle style={{ width: 16, height: 16 }} />
              )}
              {isApproving ? 'Aprobando...' : 'Aprobar para el marketplace'}
            </button>
          ) : (
            <button
              onClick={handleRemove}
              disabled={updating || isRemoving}
              style={{
                width: '100%', padding: '14px', borderRadius: 12,
                border: '1px solid rgba(217,119,6,0.3)',
                background: 'rgba(217,119,6,0.08)',
                color: '#92400e', fontFamily: SANS, fontSize: 14, fontWeight: 800,
                cursor: updating || isRemoving ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                transition: 'all 0.15s',
              }}
            >
              {isRemoving ? (
                <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
              ) : (
                <XCircle style={{ width: 16, height: 16 }} />
              )}
              {isRemoving ? 'Retirando...' : 'Retirar del marketplace'}
            </button>
          )}
        </div>

        {/* Checklist requisitos */}
        <div style={{ ...glassPrimary, borderRadius: 14, padding: '18px 20px', marginBottom: 16 }}>
          <p style={{ fontFamily: SANS, fontSize: 9, fontWeight: 800, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'rgba(84,67,62,0.4)', marginBottom: 14 }}>
            Requisitos
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {checks.map(({ label, ok }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {ok ? (
                  <CheckCircle style={{ width: 15, height: 15, color: GREEN_MOD, flexShrink: 0 }} />
                ) : (
                  <XCircle style={{ width: 15, height: 15, color: '#ef4444', flexShrink: 0 }} />
                )}
                <span style={{ fontFamily: SANS, fontSize: 12, color: ok ? 'rgba(84,67,62,0.8)' : '#b91c1c', fontWeight: ok ? 400 : 600 }}>
                  {label}
                </span>
              </div>
            ))}
          </div>
          {!allGood && (
            <div style={{ marginTop: 14, padding: '8px 12px', borderRadius: 8, background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.12)' }}>
              <p style={{ fontFamily: SANS, fontSize: 11, color: '#b91c1c' }}>
                La tienda tiene requisitos incompletos. Puede aprobarla si lo considera apropiado.
              </p>
            </div>
          )}
        </div>

        {/* Zona admin */}
        {isAdmin && onDeleteShop && (
          <div style={{ borderRadius: 14, border: '1px solid rgba(239,68,68,0.2)', overflow: 'hidden' }}>
            <button
              onClick={() => setIsAdminOpen((prev) => !prev)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', gap: 8,
                padding: '12px 16px', background: 'rgba(239,68,68,0.04)',
                border: 'none', cursor: 'pointer', textAlign: 'left',
              }}
            >
              <ShieldAlert style={{ width: 14, height: 14, color: '#ef4444', flexShrink: 0 }} />
              <span style={{ flex: 1, fontFamily: SANS, fontSize: 11, fontWeight: 700, color: '#b91c1c' }}>
                Zona de administrador
              </span>
              {isAdminOpen ? (
                <ChevronDown style={{ width: 13, height: 13, color: 'rgba(239,68,68,0.5)' }} />
              ) : (
                <ChevronRight style={{ width: 13, height: 13, color: 'rgba(239,68,68,0.5)' }} />
              )}
            </button>

            {isAdminOpen && (
              <div style={{ padding: 16, background: 'white' }}>
                <p style={{ fontFamily: SANS, fontSize: 11, color: 'rgba(84,67,62,0.65)', marginBottom: 12 }}>
                  Esta acción eliminará permanentemente la tienda, todos sus productos y datos relacionados.
                </p>

                <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                  <AlertDialogTrigger asChild>
                    <button style={{
                      width: '100%', padding: '10px', borderRadius: 10,
                      background: '#ef4444', border: 'none', color: 'white',
                      fontFamily: SANS, fontSize: 12, fontWeight: 700, cursor: 'pointer',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                    }}>
                      <Trash2 style={{ width: 13, height: 13 }} />
                      Eliminar tienda permanentemente
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-destructive flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5" />
                        ¿Eliminar "{shop.shopName}"?
                      </AlertDialogTitle>
                      <AlertDialogDescription className="space-y-3">
                        <p>Esta acción eliminará permanentemente:</p>
                        <ul className="list-disc list-inside text-sm space-y-1">
                          <li>La tienda y toda su configuración</li>
                          <li>{shop.productCounts?.total || 0} productos</li>
                          <li>Analytics e historial</li>
                          <li>Todos los datos relacionados</li>
                        </ul>
                        <p className="font-medium text-destructive">Esta acción NO se puede deshacer.</p>
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="space-y-2 py-4">
                      <label htmlFor="delete-reason" className="font-medium text-sm block">
                        Razón de eliminación (obligatorio, mín. 10 caracteres)
                      </label>
                      <textarea
                        id="delete-reason"
                        placeholder="Explica por qué eliminas esta tienda..."
                        value={deleteReason}
                        onChange={(e) => setDeleteReason(e.target.value)}
                        rows={3}
                        style={{
                          width: '100%', resize: 'none', padding: '8px 12px', borderRadius: 8,
                          border: '1px solid rgba(239,68,68,0.3)', fontFamily: SANS, fontSize: 12,
                          outline: 'none', boxSizing: 'border-box',
                        }}
                      />
                      {deleteReason.length > 0 && deleteReason.length < 10 && (
                        <p className="text-xs text-destructive">
                          Mínimo 10 caracteres ({deleteReason.length}/10)
                        </p>
                      )}
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={(e) => {
                          e.preventDefault();
                          handleDelete();
                        }}
                        disabled={deleteReason.trim().length < 10 || isDeleting}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        {isDeleting ? 'Eliminando...' : 'Sí, eliminar tienda'}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
