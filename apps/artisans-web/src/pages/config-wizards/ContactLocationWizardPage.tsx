import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { useBankData } from '@/hooks/useBankData';
import { useUnifiedUserData } from '@/hooks/user/useUnifiedUserData';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { getCounterparty } from '@/services/cobre.actions';
import { getUserProfileByUserId } from '@/services/userProfiles.actions';
import { BANKS_DATA } from '@/data/cobreBankData';
import { UnsavedChangesDialog } from '@/components/ui/UnsavedChangesDialog';
import { ConfigWizardShell } from '@/components/shop/config-wizards/ConfigWizardShell';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { T, inputStyle, divider } from '@/lib/telar-design';
import { EventBus } from '@/utils/eventBus';
import { NotificationTemplates } from '@/services/notificationService';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Tab = 'contacto' | 'rut' | 'banco';

interface BankFormData {
  holder_name: string;
  document_type: string;
  document_number: string;
  bank_code: string;
  account_type: string;
  account_number: string;
  country: string;
  currency: string;
}

interface CounterpartyMeta {
  account_number: string;
  beneficiary_institution: string;
  counterparty_fullname: string;
  counterparty_id_number: string;
  counterparty_id_type: string;
  registered_account: string;
}

// ── Helpers de UI ─────────────────────────────────────────────────────────────
const SectionTitle: React.FC<{ icon: string; label: string; sub: string }> = ({ icon, label, sub }) => (
  <div style={{ marginBottom: 20 }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
      <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.orange }}>{icon}</span>
      <p style={{ fontFamily: T.serif, fontSize: 17, fontWeight: 700, color: T.dark, margin: 0 }}>{label}</p>
    </div>
    <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}65`, lineHeight: 1.5, margin: 0, paddingLeft: 26 }}>{sub}</p>
  </div>
);

const Field: React.FC<{ label: string; hint?: string; children: React.ReactNode }> = ({ label, hint, children }) => (
  <div>
    <div style={{ marginBottom: 5, display: 'flex', alignItems: 'baseline', gap: 6 }}>
      <span style={{ fontFamily: T.sans, fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: `${T.muted}65` }}>{label}</span>
      {hint && <span style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}38` }}>{hint}</span>}
    </div>
    {children}
  </div>
);

// ── AI cards por tab ──────────────────────────────────────────────────────────
const AI_CONTACTO = {
  cards: [
    { label: 'Canales de contacto', text: 'WhatsApp es el canal principal de la plataforma. Los compradores te escriben directamente desde la ficha de tu tienda. Asegúrate de que el número tenga formato internacional (+57...).' },
    { label: 'Datos de despacho', text: 'La dirección comercial es el punto de origen para calcular envíos con Servientrega y otros operadores. Debe ser la dirección real desde donde despachas tus pedidos.' },
    { label: 'Redes sociales', text: 'Tus redes aparecen como íconos en tu tienda pública. Son el lugar donde los compradores ven tu proceso, tu trabajo diario y deciden confiar en tu taller.' },
  ],
  next: 'Con tus datos de contacto y despacho completos, los envíos se calculan automáticamente desde tu ubicación y los compradores pueden contactarte sin fricciones.',
};

const AI_RUT = {
  cards: [
    { label: 'Por qué registrar el RUT', text: 'Con el RUT activo tu tienda puede emitir facturas, operar legalmente y acceder a pasarelas de pago. Es el primer paso para profesionalizar tu negocio artesanal.' },
    { label: 'Verificación', text: 'Una vez enviado, nuestro equipo revisa y confirma tu RUT en menos de 24 horas hábiles. Recibirás una notificación cuando esté listo.' },
    { label: 'RUT vs NIT', text: 'Si eres persona natural usa tu RUT con cédula. Si tienes empresa constituida, usa el NIT. Ambos formatos son válidos en la plataforma.' },
  ],
  next: 'Con el RUT registrado podrás activar los datos bancarios y empezar a recibir pagos de tus ventas directamente en tu cuenta.',
};

const AI_BANCO = {
  cards: [
    { label: 'Seguridad', text: 'Tus datos bancarios están cifrados con AES-256. Solo se usan para transferirte el dinero de tus ventas. Nunca se comparten con terceros.' },
    { label: 'Tiempo de pago', text: 'Los pagos se transfieren en 1–3 días hábiles después de que el comprador confirma la recepción del pedido. Sin comisiones ocultas.' },
    { label: 'Cobre', text: 'Usamos Cobre como procesador de pagos. Tu cuenta debe estar a nombre de quien figure en el RUT registrado para evitar rechazos.' },
  ],
  next: 'Una vez configurada la cuenta bancaria, recibirás pagos automáticamente por cada venta confirmada sin necesidad de hacer nada adicional.',
};

// ── Página principal ──────────────────────────────────────────────────────────
export default function ContactLocationWizardPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const returnTo = (location.state as any)?.returnTo ?? '/mi-tienda/configurar';
  const { user } = useAuth();
  const { shop, loading } = useArtisanShop();
  const { bankData, saveBankData, updateBankData } = useBankData();
  const { profile, updateProfile } = useUnifiedUserData();

  // Tab activo
  const initialTab = (searchParams.get('tab') as Tab) ?? 'contacto';
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);

  // ── Estado: Tab Contacto ──────────────────────────────────────────────────
  const [regWhatsapp,   setRegWhatsapp]   = useState('');
  const [regEmail,      setRegEmail]      = useState('');
  const [regCity,       setRegCity]       = useState('');
  const [showRegBanner, setShowRegBanner] = useState(false);
  const [whatsapp,      setWhatsapp]      = useState('');
  const [email,         setEmail]         = useState('');
  const [address,       setAddress]       = useState('');
  const [phone,         setPhone]         = useState('');
  const [hours,         setHours]         = useState('');
  const [socialInsta,   setSocialInsta]   = useState('');
  const [socialFb,      setSocialFb]      = useState('');
  const [socialTiktok,  setSocialTiktok]  = useState('');
  const [socialWeb,     setSocialWeb]     = useState('');
  const [saving,        setSaving]        = useState(false);
  const [showGuard,     setShowGuard]     = useState(false);
  const initRef = useRef('');

  // ── Estado: Tab RUT ───────────────────────────────────────────────────────
  const [rutNumber, setRutNumber] = useState('');
  const [savingRut, setSavingRut] = useState(false);

  // ── Estado: Tab Banco ─────────────────────────────────────────────────────
  const [bankForm, setBankForm] = useState<BankFormData>({
    holder_name: '', document_type: 'cc', document_number: '',
    bank_code: '', account_type: 'ch', account_number: '',
    country: 'Colombia', currency: 'COP',
  });
  const [counterpartyData, setCounterpartyData]         = useState<CounterpartyMeta | null>(null);
  const [hasCounterparty,  setHasCounterparty]           = useState(false);
  const [loadingCounterparty, setLoadingCounterparty]   = useState(true);
  const [isEditingBanco,   setIsEditingBanco]            = useState(false);
  const [showConfirmBanco, setShowConfirmBanco]          = useState(false);
  const [savingBanco,      setSavingBanco]               = useState(false);

  // ── Cargar datos del perfil de registro ──────────────────────────────────
  useEffect(() => {
    if (!user?.id) return;
    getUserProfileByUserId(user.id).then(p => {
      const prof = p as any;
      setRegWhatsapp(prof?.whatsappE164 ?? '');
      setRegEmail((user as any)?.email ?? '');
      setRegCity(prof?.city ?? '');
    }).catch(() => {});
  }, [user?.id]);

  // ── Cargar datos del shop (contacto) ─────────────────────────────────────
  useEffect(() => {
    if (!shop) return;
    const s  = shop as any;
    const cc = s.contactConfig ?? {};
    const sl = s.socialLinks ?? {};
    setWhatsapp(cc.whatsapp ?? '');
    setEmail(cc.email ?? '');
    setAddress(cc.address ?? '');
    setPhone(cc.phone ?? '');
    setHours(cc.hours ?? '');
    setSocialInsta(sl.instagram ?? '');
    setSocialFb(sl.facebook ?? '');
    setSocialTiktok(sl.tiktok ?? '');
    setSocialWeb(sl.website ?? '');
    initRef.current = JSON.stringify({
      whatsapp: cc.whatsapp ?? '', email: cc.email ?? '', address: cc.address ?? '',
      phone: cc.phone ?? '', hours: cc.hours ?? '',
      instagram: sl.instagram ?? '', facebook: sl.facebook ?? '',
      tiktok: sl.tiktok ?? '', website: sl.website ?? '',
    });
    if (!cc.whatsapp && !cc.email) setShowRegBanner(true);
  }, [shop?.id]);

  // ── Cargar datos bancarios (contraparte) ──────────────────────────────────
  useEffect(() => {
    if (!user?.id) { setLoadingCounterparty(false); return; }
    const s = shop as any;
    if (!s?.idContraparty) { setHasCounterparty(false); setLoadingCounterparty(false); return; }
    setHasCounterparty(true);
    getCounterparty(s.idContraparty)
      .then(data => setCounterpartyData(data.metadata as CounterpartyMeta))
      .catch(() => {})
      .finally(() => setLoadingCounterparty(false));
  }, [user?.id, (shop as any)?.idContraparty]);

  // ── Cargar bankData en el formulario ──────────────────────────────────────
  useEffect(() => {
    if (bankData && !hasCounterparty) {
      setBankForm(prev => ({
        ...prev,
        holder_name:     bankData.holder_name     || '',
        document_type:   bankData.document_type   || 'cc',
        document_number: bankData.document_number || '',
        bank_code:       bankData.bank_code        || '',
        account_type:    bankData.account_type     || 'ch',
        account_number:  bankData.account_number   || '',
      }));
    }
  }, [bankData, hasCounterparty]);

  // ── Pre-fill al entrar en modo edición banco ──────────────────────────────
  useEffect(() => {
    if (isEditingBanco && counterpartyData) {
      const bank = BANKS_DATA.find(b => b.name === counterpartyData.beneficiary_institution || b.code === counterpartyData.beneficiary_institution);
      const mapAccountType = (t: string) => ({ ahorros: 'ch', ch: 'ch', corriente: 'cc', cc: 'cc', r2p: 'r2p', dp: 'dp', 'breb-key': 'breb-key', r2p_breb: 'r2p_breb' } as any)[t?.toLowerCase()] ?? 'ch';
      setBankForm({
        holder_name:     counterpartyData.counterparty_fullname  || '',
        document_type:   counterpartyData.counterparty_id_type   || 'cc',
        document_number: counterpartyData.counterparty_id_number || '',
        bank_code:       bank?.code || counterpartyData.beneficiary_institution || '',
        account_type:    mapAccountType(counterpartyData.registered_account),
        account_number:  counterpartyData.account_number         || '',
        country: 'Colombia', currency: 'COP',
      });
    }
  }, [isEditingBanco, counterpartyData]);

  // ── Cargar RUT ────────────────────────────────────────────────────────────
  useEffect(() => {
    if (profile?.rut) setRutNumber(profile.rut);
  }, [profile?.rut]);

  // ── Helpers contacto ──────────────────────────────────────────────────────
  const applyRegistrationData = () => {
    if (regWhatsapp) setWhatsapp(regWhatsapp);
    if (regEmail)    setEmail(regEmail);
    setShowRegBanner(false);
  };

  const snapshot = () => JSON.stringify({ whatsapp, email, address, phone, hours, instagram: socialInsta, facebook: socialFb, tiktok: socialTiktok, website: socialWeb });
  const isDirty = snapshot() !== initRef.current;

  const saveContactData = async () => {
    if (!shop) return;
    const s = shop as any;
    await updateArtisanShop(shop.id, {
      contactConfig: { ...(s.contactConfig ?? {}), whatsapp, email, address, phone, hours },
      socialLinks:   { instagram: socialInsta, facebook: socialFb, tiktok: socialTiktok, website: socialWeb },
    } as any);
    initRef.current = snapshot();
  };

  const handleFinishContacto = async () => {
    setSaving(true);
    try { await saveContactData(); toast.success('Datos de contacto guardados'); navigate(returnTo); }
    catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  const handleSaveAndExit = async () => {
    setSaving(true);
    try { await saveContactData(); toast.success('Guardado'); navigate(returnTo); }
    catch { toast.error('Error al guardar'); setSaving(false); }
  };

  const handleBack = () => {
    if (activeTab === 'contacto' && isDirty) { setShowGuard(true); return; }
    navigate(returnTo);
  };

  // ── Handlers RUT ──────────────────────────────────────────────────────────
  const handleFinishRut = async () => {
    if (!rutNumber.trim()) { toast.error('Ingresa un número de RUT válido'); return; }
    setSavingRut(true);
    try {
      await updateProfile({ rut: rutNumber.trim(), rutPendiente: false } as any);
      toast.success('RUT guardado correctamente');
      navigate(returnTo);
    } catch {
      toast.error('Error al guardar el RUT');
    } finally {
      setSavingRut(false);
    }
  };

  // ── Handlers Banco ────────────────────────────────────────────────────────
  const handleSubmitBanco = () => {
    if (hasCounterparty && isEditingBanco) { setShowConfirmBanco(true); return; }
    performSaveBanco();
  };

  const performSaveBanco = async () => {
    setSavingBanco(true);
    let result: any;
    if (hasCounterparty && isEditingBanco) {
      result = await updateBankData({ ...bankForm, status: 'complete', geo: 'col' });
    } else {
      result = await saveBankData({ ...bankForm, status: 'complete', geo: 'col' });
    }
    setSavingBanco(false);

    if (result.success && result.id_contraparty && user) {
      EventBus.publish('bank.data.completed', { userId: user.id });
      await NotificationTemplates.bankDataConfigured(user.id);

      if (isEditingBanco) {
        setIsEditingBanco(false);
        setLoadingCounterparty(true);
        try {
          const data = await getCounterparty(result.id_contraparty);
          if (data?.metadata) setCounterpartyData(data.metadata as CounterpartyMeta);
        } finally {
          setLoadingCounterparty(false);
        }
        toast.success('Datos bancarios actualizados');
      } else {
        toast.success('Datos bancarios guardados');
        navigate(returnTo);
      }
    } else {
      toast.error('Error al guardar los datos bancarios');
    }
  };

  const handleBankChange = (field: string, value: string) =>
    setBankForm(prev => ({ ...prev, [field]: value }));

  // ── Helpers labels banco ──────────────────────────────────────────────────
  const getDocTypeLabel = (t: string) => ({ cc: 'Cédula de Ciudadanía', pa: 'Pasaporte', nit: 'NIT', ce: 'Cédula de Extranjería' } as any)[t] || t;
  const getAccountTypeLabel = (t: string) => ({ ch: 'Ahorros', cc: 'Corriente', r2p: 'R2P', dp: 'Depósito electrónico', 'breb-key': 'Llave Bre-b', r2p_breb: 'Recaudo Bre-b' } as any)[t] || t;

  // ── AI dinámico ────────────────────────────────────────────────────────────
  const ai = activeTab === 'rut' ? AI_RUT : activeTab === 'banco' ? AI_BANCO : AI_CONTACTO;

  // ── Submit y label dinámicos ──────────────────────────────────────────────
  const submitLabel  = activeTab === 'contacto' ? 'Guardar contacto' : activeTab === 'rut' ? 'Guardar RUT' : 'Guardar datos bancarios';
  const isSubmitting = activeTab === 'contacto' ? saving : activeTab === 'rut' ? savingRut : savingBanco;
  const onSubmit     = activeTab === 'contacto' ? handleFinishContacto : activeTab === 'rut' ? handleFinishRut : handleSubmitBanco;

  // ── Loading ───────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: T.orange }}>progress_activity</span>
    </div>
  );

  const s          = shop as any;
  const department = s?.department ?? s?.artisanProfile?.department ?? '';
  const muni       = s?.municipality ?? s?.artisanProfile?.municipality ?? '';

  // ── Tab pill bar ──────────────────────────────────────────────────────────
  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: 'contacto', icon: 'chat',          label: 'Contacto y envíos'  },
    { id: 'rut',      icon: 'receipt_long',  label: 'Información fiscal' },
    { id: 'banco',    icon: 'account_balance', label: 'Datos de cobro'  },
  ];

  const TabBar = (
    <div style={{ display: 'flex', gap: 6, padding: '4px', borderRadius: 14, background: 'rgba(84,67,62,0.06)', width: 'fit-content', marginBottom: 28 }}>
      {tabs.map(t => {
        const active = activeTab === t.id;
        return (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 10, border: 'none', cursor: 'pointer',
              fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.04em',
              background: active ? T.dark : 'transparent',
              color: active ? 'white' : `${T.muted}70`,
              transition: 'all 0.18s ease',
            }}
          >
            <span className="material-symbols-outlined" style={{ fontSize: 14 }}>{t.icon}</span>
            {t.label}
          </button>
        );
      })}
    </div>
  );

  return (
    <>
      {/* Dialogs */}
      {showGuard && (
        <UnsavedChangesDialog
          onSaveAndExit={handleSaveAndExit}
          onDiscardAndExit={() => navigate(returnTo)}
          onStay={() => setShowGuard(false)}
          isSaving={saving}
        />
      )}

      <AlertDialog open={showConfirmBanco} onOpenChange={setShowConfirmBanco}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Confirmar cambios?</AlertDialogTitle>
            <AlertDialogDescription>
              Los datos bancarios anteriores serán reemplazados. Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={performSaveBanco}>Confirmar cambios</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ConfigWizardShell
        icon="contacts"
        title="Contacto y pagos"
        subtitle="Canales, fiscal y datos bancarios"
        onBack={handleBack}
        onSaveProgress={activeTab === 'contacto' && isDirty ? handleSaveAndExit : undefined}
        isSavingProgress={saving}
        aiCards={ai.cards}
        aiNext={ai.next}
        submitLabel={submitLabel}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        onSaveAndExit={activeTab === 'contacto' && isDirty ? handleSaveAndExit : undefined}
        isSavingAndExiting={saving}
      >

        {/* Tab bar */}
        {TabBar}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 1: Contacto y envíos                                          */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'contacto' && (
          <>
            {/* Banner: usar datos del registro */}
            {showRegBanner && (regWhatsapp || regEmail) && (
              <div style={{ padding: '16px 20px', borderRadius: 12, background: 'rgba(236,109,19,0.06)', border: '1px solid rgba(236,109,19,0.18)', display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: T.orange, flexShrink: 0, marginTop: 1 }}>contact_page</span>
                  <div>
                    <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 700, color: T.dark, margin: '0 0 4px' }}>Detectamos datos de tu registro</p>
                    <p style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}70`, margin: 0, lineHeight: 1.5 }}>Estos son los datos con los que te registraste. Los contactos de tu tienda pueden ser distintos (ej. WhatsApp del taller vs. el tuyo personal).</p>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, paddingLeft: 28 }}>
                  {regWhatsapp && <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.dark, background: 'rgba(84,67,62,0.07)', padding: '4px 10px', borderRadius: 100 }}>📱 {regWhatsapp}</span>}
                  {regEmail    && <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.dark, background: 'rgba(84,67,62,0.07)', padding: '4px 10px', borderRadius: 100 }}>✉️ {regEmail}</span>}
                  {regCity     && <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 600, color: T.dark, background: 'rgba(84,67,62,0.07)', padding: '4px 10px', borderRadius: 100 }}>📍 {regCity}</span>}
                </div>
                <div style={{ display: 'flex', gap: 10, paddingLeft: 28, flexWrap: 'wrap' }}>
                  <button onClick={applyRegistrationData} style={{ padding: '8px 18px', borderRadius: 100, background: T.dark, color: 'white', border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}>
                    Usar estos datos para la tienda
                  </button>
                  <button onClick={() => setShowRegBanner(false)} style={{ padding: '8px 18px', borderRadius: 100, background: 'transparent', color: `${T.muted}80`, border: `1px solid rgba(84,67,62,0.2)`, cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 700 }}>
                    Configurar datos distintos
                  </button>
                </div>
              </div>
            )}

            {/* 1. Canales de contacto */}
            <div>
              <SectionTitle icon="chat" label="Canales de contacto" sub="Cómo se comunican los compradores contigo desde la plataforma." />
              <div className="flex flex-col gap-4">
                <Field label="WhatsApp" hint="Canal principal — obligatorio">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}35`, flexShrink: 0 }}>phone_iphone</span>
                    <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+57 300 000 0000" style={inputStyle} />
                  </div>
                </Field>
                <Field label="Correo electrónico público">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}35`, flexShrink: 0 }}>mail</span>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="taller@ejemplo.com" style={inputStyle} />
                  </div>
                </Field>
              </div>
            </div>

            <div style={divider} />

            {/* 2. Datos comerciales / despacho */}
            <div>
              <SectionTitle icon="local_shipping" label="Datos comerciales y despacho" sub="Dirección y horarios desde donde salen tus pedidos. Se usa para calcular envíos automáticamente." />
              {(department || muni) && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, padding: '12px 14px', borderRadius: 10, background: 'rgba(84,67,62,0.04)', border: '1px solid rgba(84,67,62,0.08)', marginBottom: 20 }}>
                  {[{ label: 'Departamento', value: department }, { label: 'Municipio', value: muni }].map(({ label, value }) => (
                    <div key={label}>
                      <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: `${T.muted}45`, margin: '0 0 2px' }}>{label}</p>
                      <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: value ? T.dark : `${T.muted}30`, fontStyle: value ? 'normal' : 'italic', margin: 0 }}>{value || 'Sin definir'}</p>
                    </div>
                  ))}
                  <p style={{ gridColumn: '1 / -1', fontFamily: T.sans, fontSize: 10, color: `${T.muted}40`, margin: '6px 0 0' }}>
                    Datos del perfil artesanal — edita allí para cambiarlos
                  </p>
                </div>
              )}
              <div className="flex flex-col gap-4">
                <Field label="Dirección de despacho" hint="Calle, número, barrio">
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}35`, flexShrink: 0 }}>location_on</span>
                    <input value={address} onChange={e => setAddress(e.target.value)} placeholder="Cra. 12 #45-67, Barrio Centro" style={inputStyle} />
                  </div>
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Teléfono fijo" hint="Opcional">
                    <input value={phone} onChange={e => setPhone(e.target.value)} placeholder="601 000 0000" style={inputStyle} />
                  </Field>
                  <Field label="Horario de atención / despacho">
                    <input value={hours} onChange={e => setHours(e.target.value)} placeholder="Lun–Vie 8am–5pm" style={inputStyle} />
                  </Field>
                </div>
              </div>
            </div>

            <div style={divider} />

            {/* 3. Redes sociales */}
            <div>
              <SectionTitle icon="share" label="Redes sociales" sub="Aparecen como íconos en tu tienda pública. Comparte los perfiles donde muestras tu trabajo." />
              <div className="flex flex-col gap-4">
                {([
                  ['Instagram', 'photo_camera', socialInsta,  setSocialInsta,  'https://instagram.com/tu-taller'],
                  ['Facebook',  'thumb_up',     socialFb,     setSocialFb,     'https://facebook.com/tu-taller'],
                  ['TikTok',    'music_video',  socialTiktok, setSocialTiktok, 'https://tiktok.com/@tu-taller'],
                  ['Sitio web', 'language',     socialWeb,    setSocialWeb,    'https://tu-sitio.com'],
                ] as [string, string, string, React.Dispatch<React.SetStateAction<string>>, string][]).map(([label, icon, val, set, ph]) => (
                  <Field key={label} label={label}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}35`, flexShrink: 0 }}>{icon}</span>
                      <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
                    </div>
                  </Field>
                ))}
              </div>
            </div>
          </>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 2: RUT / Información fiscal                                   */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'rut' && (
          <div>
            <SectionTitle icon="receipt_long" label="RUT / NIT" sub="Número de identificación tributaria para operar legalmente y recibir pagos." />

            {/* Badge estado */}
            {profile?.rut && !profile?.rutPendiente && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(22,101,52,0.07)', border: '1px solid rgba(22,101,52,0.18)', marginBottom: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#166534' }}>check_circle</span>
                <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: '#166534' }}>RUT registrado: {profile.rut}</span>
              </div>
            )}
            {profile?.rutPendiente && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(236,109,19,0.07)', border: '1px solid rgba(236,109,19,0.2)', marginBottom: 20 }}>
                <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.orange }}>schedule</span>
                <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: T.orange }}>Verificación pendiente — revisaremos en menos de 24 horas</span>
              </div>
            )}

            <div className="flex flex-col gap-4">
              <Field label="Número de RUT" hint="Sin puntos ni guiones — ej. 1234567890-1">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 18, color: `${T.muted}35`, flexShrink: 0 }}>badge</span>
                  <input
                    value={rutNumber}
                    onChange={e => setRutNumber(e.target.value)}
                    placeholder="900123456-1"
                    style={inputStyle}
                  />
                </div>
              </Field>
            </div>

            <div style={{ marginTop: 24, padding: '14px 16px', borderRadius: 10, background: 'rgba(84,67,62,0.04)', border: '1px solid rgba(84,67,62,0.08)' }}>
              <p style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}60`, margin: 0, lineHeight: 1.6 }}>
                Si eres <strong>persona natural</strong>, ingresa el número de tu RUT (igual a tu cédula). Si tienes una <strong>empresa constituida</strong>, usa el NIT con dígito de verificación. Ambos formatos son válidos.
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════ */}
        {/* TAB 3: Datos de cobro (banco)                                     */}
        {/* ══════════════════════════════════════════════════════════════════ */}
        {activeTab === 'banco' && (
          <div>
            <SectionTitle icon="account_balance" label="Datos de cobro" sub="Cuenta bancaria donde recibirás los pagos de tus ventas. Procesado por Cobre." />

            {/* Vista read-only */}
            {hasCounterparty && counterpartyData && !isEditingBanco && !loadingCounterparty && (
              <div className="flex flex-col gap-4">
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(22,101,52,0.07)', border: '1px solid rgba(22,101,52,0.18)' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 16, color: '#166534' }}>check_circle</span>
                  <span style={{ fontFamily: T.sans, fontSize: 12, fontWeight: 700, color: '#166534' }}>Cuenta configurada — recibirás pagos automáticamente</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', borderRadius: 10, background: 'rgba(84,67,62,0.04)', border: '1px solid rgba(84,67,62,0.08)', marginBottom: 4 }}>
                  <span className="material-symbols-outlined" style={{ fontSize: 15, color: `${T.muted}50`, flexShrink: 0 }}>shield</span>
                  <span style={{ fontFamily: T.sans, fontSize: 11, color: `${T.muted}60` }}>Tus datos bancarios están cifrados y protegidos.</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {[
                    { label: 'Titular', value: counterpartyData.counterparty_fullname },
                    { label: 'Tipo de documento', value: getDocTypeLabel(counterpartyData.counterparty_id_type) },
                    { label: 'Número de documento', value: counterpartyData.counterparty_id_number },
                    { label: 'Banco', value: counterpartyData.beneficiary_institution },
                    { label: 'Tipo de cuenta', value: getAccountTypeLabel(counterpartyData.registered_account) },
                    { label: 'Número de cuenta', value: counterpartyData.account_number ? `****${counterpartyData.account_number.slice(-4)}` : '-' },
                  ].map(({ label, value }) => (
                    <div key={label} style={{ padding: '12px 14px', borderRadius: 10, background: 'rgba(84,67,62,0.03)', border: '1px solid rgba(84,67,62,0.07)' }}>
                      <p style={{ fontFamily: T.sans, fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase' as const, color: `${T.muted}45`, margin: '0 0 4px' }}>{label}</p>
                      <p style={{ fontFamily: T.sans, fontSize: 13, fontWeight: 600, color: T.dark, margin: 0 }}>{value || '-'}</p>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                  <button
                    onClick={() => setIsEditingBanco(true)}
                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '9px 20px', borderRadius: 100, background: T.dark, color: 'white', border: 'none', cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 800, letterSpacing: '0.06em' }}
                  >
                    <span className="material-symbols-outlined" style={{ fontSize: 14 }}>edit</span>
                    Editar datos
                  </button>
                </div>
              </div>
            )}

            {/* Loading contraparte */}
            {loadingCounterparty && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: 16 }}>
                <span className="material-symbols-outlined animate-spin" style={{ fontSize: 20, color: T.orange }}>progress_activity</span>
                <span style={{ fontFamily: T.sans, fontSize: 12, color: `${T.muted}60` }}>Cargando datos bancarios...</span>
              </div>
            )}

            {/* Formulario */}
            {(!hasCounterparty || isEditingBanco) && !loadingCounterparty && (
              <div className="flex flex-col gap-4">
                {isEditingBanco && (
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, padding: '12px 14px', borderRadius: 10, background: 'rgba(236,109,19,0.06)', border: '1px solid rgba(236,109,19,0.18)' }}>
                    <span className="material-symbols-outlined" style={{ fontSize: 16, color: T.orange, flexShrink: 0, marginTop: 1 }}>warning</span>
                    <p style={{ fontFamily: T.sans, fontSize: 12, color: T.orange, margin: 0, lineHeight: 1.5 }}>
                      <strong>Importante:</strong> Se crearán nuevos datos bancarios que reemplazarán los actuales.
                    </p>
                  </div>
                )}

                <Field label="Nombre del titular" hint="Requerido">
                  <input
                    value={bankForm.holder_name}
                    onChange={e => handleBankChange('holder_name', e.target.value)}
                    placeholder="Nombre completo como aparece en la cuenta"
                    style={inputStyle}
                  />
                </Field>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Tipo de documento" hint="Requerido">
                    <select value={bankForm.document_type} onChange={e => handleBankChange('document_type', e.target.value)} style={inputStyle}>
                      <option value="cc">Cédula de Ciudadanía</option>
                      <option value="pa">Pasaporte</option>
                      <option value="nit">NIT</option>
                      <option value="ce">Cédula de Extranjería</option>
                    </select>
                  </Field>
                  <Field label="Número de documento" hint="Requerido">
                    <input
                      value={bankForm.document_number}
                      onChange={e => handleBankChange('document_number', e.target.value)}
                      placeholder="Ej: 1234567890"
                      style={inputStyle}
                    />
                  </Field>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  <Field label="Banco" hint="Requerido">
                    <select value={bankForm.bank_code} onChange={e => handleBankChange('bank_code', e.target.value)} style={inputStyle}>
                      <option value="">Selecciona tu banco</option>
                      {BANKS_DATA.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
                    </select>
                  </Field>
                  <Field label="Tipo de cuenta" hint="Requerido">
                    <select value={bankForm.account_type} onChange={e => handleBankChange('account_type', e.target.value)} style={inputStyle}>
                      <option value="ch">Ahorros</option>
                      <option value="cc">Corriente</option>
                      <option value="r2p">R2P</option>
                      <option value="dp">Depósito electrónico</option>
                      <option value="breb-key">Llave Bre-b</option>
                      <option value="r2p_breb">Recaudo Bre-b</option>
                    </select>
                  </Field>
                </div>

                <Field
                  label={bankForm.account_type === 'breb-key' || bankForm.account_type === 'r2p_breb' ? 'Llave Bre-b' : 'Número de cuenta'}
                  hint="Requerido"
                >
                  <input
                    value={bankForm.account_number}
                    onChange={e => {
                      const isBreB = bankForm.account_type === 'breb-key' || bankForm.account_type === 'r2p_breb';
                      handleBankChange('account_number', isBreB ? e.target.value : e.target.value.replace(/\D/g, ''));
                    }}
                    placeholder={bankForm.account_type === 'breb-key' || bankForm.account_type === 'r2p_breb' ? 'Ej: @tunombre o llave Bre-b' : 'Solo números'}
                    style={inputStyle}
                  />
                </Field>

                {isEditingBanco && (
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={() => setIsEditingBanco(false)}
                      style={{ padding: '8px 18px', borderRadius: 100, background: 'transparent', color: `${T.muted}70`, border: `1px solid rgba(84,67,62,0.2)`, cursor: 'pointer', fontFamily: T.sans, fontSize: 11, fontWeight: 700 }}
                    >
                      Cancelar edición
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

      </ConfigWizardShell>
    </>
  );
}
