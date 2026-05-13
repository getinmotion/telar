import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useArtisanShop } from '@/hooks/useArtisanShop';
import { updateArtisanShop } from '@/services/artisanShops.actions';
import { WizardHeader } from '@/components/shop/new-product-wizard/components/WizardHeader';
import { WizardFooter } from '@/components/shop/new-product-wizard/components/WizardFooter';

const T = {
  dark:  '#151b2d',
  orange:'#ec6d13',
  muted: '#54433e',
  sans:  "'Manrope', sans-serif",
  serif: "'Noto Serif', serif",
};
const glass: React.CSSProperties = {
  background: 'rgba(255,255,255,0.82)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  border: '1px solid rgba(255,255,255,0.65)',
};
const inputStyle: React.CSSProperties = {
  width: '100%', padding: '12px 16px', borderRadius: 12,
  border: '1px solid rgba(84,67,62,0.14)', outline: 'none',
  fontFamily: T.sans, fontSize: 14, color: T.dark,
  background: 'rgba(247,244,239,0.5)',
};
const Label: React.FC<{ children: React.ReactNode; hint?: string }> = ({ children, hint }) => (
  <div style={{ marginBottom: 6 }}>
    <span style={{ fontFamily: T.sans, fontSize: 11, fontWeight: 700, color: `${T.muted}80` }}>{children}</span>
    {hint && <span style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}40`, marginLeft: 6 }}>{hint}</span>}
  </div>
);

const TOTAL_STEPS = 2;

export default function ContactLocationWizardPage() {
  const navigate = useNavigate();
  const { shop, loading } = useArtisanShop();
  const [step, setStep] = useState(1);
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [socialInsta, setSocialInsta] = useState('');
  const [socialFb, setSocialFb] = useState('');
  const [socialTiktok, setSocialTiktok] = useState('');
  const [socialWeb, setSocialWeb] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!shop) return;
    const s = shop as any;
    const cc = s.contactConfig ?? {};
    const sl = s.socialLinks ?? {};
    setWhatsapp(cc.whatsapp ?? '');
    setEmail(cc.email ?? '');
    setSocialInsta(sl.instagram ?? '');
    setSocialFb(sl.facebook ?? '');
    setSocialTiktok(sl.tiktok ?? '');
    setSocialWeb(sl.website ?? '');
  }, [shop?.id]);

  const handleFinish = async () => {
    if (!shop) return;
    setSaving(true);
    try {
      const s = shop as any;
      await updateArtisanShop(shop.id, {
        contactConfig: { ...(s.contactConfig ?? {}), whatsapp, email },
        socialLinks:   { instagram: socialInsta, facebook: socialFb, tiktok: socialTiktok, website: socialWeb },
      } as any);
      toast.success('Datos de contacto guardados');
      navigate('/mi-tienda/configurar');
    } catch { toast.error('Error al guardar'); }
    finally { setSaving(false); }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin" style={{ fontSize: 32, color: T.orange }}>progress_activity</span>
    </div>
  );

  const s = shop as any;
  const department = s?.department ?? s?.artisanProfile?.department ?? '';
  const municipality = s?.municipality ?? s?.artisanProfile?.municipality ?? '';

  return (
    <div className="flex flex-col min-h-screen" style={{ background: '#f9f7f2' }}>
      <WizardHeader
        step={step} totalSteps={TOTAL_STEPS}
        icon="contacts" title="Contacto y ubicación"
        subtitle="Cómo encontrar y contactar tu taller"
      />

      <div className="flex-1 overflow-y-auto px-6 py-8 pb-28">
        <div className="max-w-xl mx-auto">

          {step === 1 && (
            <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
              <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                Canales de contacto
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                ¿Cómo pueden contactarte los compradores? WhatsApp es el canal principal en la plataforma.
              </p>

              {/* Location (read-only, from artisan profile) */}
              {(department || municipality) && (
                <div className="grid grid-cols-2 gap-3 mb-6 p-4 rounded-xl" style={{ background: `${T.dark}04`, border: `1px solid ${T.dark}07` }}>
                  {[{ label: 'Departamento', value: department }, { label: 'Municipio', value: municipality }].map(({ label, value }) => (
                    <div key={label}>
                      <Label>{label}</Label>
                      <p style={{ fontFamily: T.sans, fontSize: 13, color: value ? T.dark : `${T.muted}35`, fontStyle: value ? 'normal' : 'italic' }}>{value || 'No definido'}</p>
                    </div>
                  ))}
                  <p className="col-span-2" style={{ fontFamily: T.sans, fontSize: 10, color: `${T.muted}45`, marginTop: 4 }}>
                    Estos datos vienen de tu perfil artesanal
                  </p>
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div>
                  <Label hint="Principal canal de contacto">WhatsApp</Label>
                  <input value={whatsapp} onChange={e => setWhatsapp(e.target.value)} placeholder="+57 300 000 0000" style={inputStyle} />
                </div>
                <div>
                  <Label>Correo electrónico público</Label>
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="taller@ejemplo.com" style={inputStyle} />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div style={{ ...glass, borderRadius: 24, padding: 32 }}>
              <p style={{ fontFamily: T.serif, fontSize: 22, fontWeight: 700, color: T.dark, marginBottom: 8 }}>
                Redes sociales
              </p>
              <p style={{ fontFamily: T.sans, fontSize: 13, color: `${T.muted}70`, lineHeight: 1.6, marginBottom: 24 }}>
                Agrega los perfiles donde compartes tu trabajo. Aparecerán como íconos en tu tienda.
              </p>
              <div className="flex flex-col gap-5">
                {([
                  ['Instagram',  'photo_camera',  socialInsta,   setSocialInsta,   'https://instagram.com/tu-taller'],
                  ['Facebook',   'thumb_up',      socialFb,      setSocialFb,      'https://facebook.com/tu-taller'],
                  ['TikTok',     'music_video',   socialTiktok,  setSocialTiktok,  'https://tiktok.com/@tu-taller'],
                  ['Sitio web',  'language',      socialWeb,     setSocialWeb,     'https://tu-sitio.com'],
                ] as [string, string, string, React.Dispatch<React.SetStateAction<string>>, string][]).map(([label, icon, val, set, ph]) => (
                  <div key={label}>
                    <Label>{label}</Label>
                    <div className="flex items-center gap-3">
                      <span className="material-symbols-outlined shrink-0" style={{ fontSize: 18, color: `${T.muted}35` }}>{icon}</span>
                      <input value={val} onChange={e => set(e.target.value)} placeholder={ph} style={inputStyle} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <WizardFooter
        step={step} totalSteps={TOTAL_STEPS}
        onBack={step > 1 ? () => setStep(s => s - 1) : undefined}
        onNext={step < TOTAL_STEPS ? () => setStep(s => s + 1) : undefined}
        isFinalStep={step === TOTAL_STEPS}
        onSubmit={handleFinish}
        isSubmitting={saving}
        submitLabel="Guardar contacto"
        leftOffset={80}
      />
    </div>
  );
}
