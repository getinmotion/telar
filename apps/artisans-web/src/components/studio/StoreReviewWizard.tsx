import React, { useEffect, useState } from "react";
import type {
  ArtisanShop,
  UpdateArtisanShopPayload,
} from "@/types/artisanShop.types";
import type {
  StorePoliciesConfig,
  StorePoliciesConfigPayload,
} from "@/services/storePoliciesConfig.actions";
import {
  type ArtisanProfileData,
  DEFAULT_ARTISAN_PROFILE,
} from "@/types/artisanProfile";
import { WizardModeProvider } from "@/components/shop/new-product-wizard/context/WizardModeContext";
import { Step1Identity } from "@/components/shop/wizards/artisan-profile/Step1Identity";
import { Step2Origin } from "@/components/shop/wizards/artisan-profile/Step2Origin";
import { Step5Craft } from "@/components/shop/wizards/artisan-profile/Step5Craft";
import { Step4Workshop } from "@/components/shop/wizards/artisan-profile/Step4Workshop";
import { Step7Preview } from "@/components/shop/wizards/artisan-profile/Step7Preview";
import { useBankData } from "@/hooks/useBankData";
import { BANKS_DATA } from "@/data/cobreBankData";
import { getAllCountries } from "@/services/countries.actions";
import type { Country } from "@/types/country.types";
import { uploadImage, UploadFolder } from "@/services/fileUpload.actions";
import { ImageUploadSlot } from "@/components/ui/ImageUploadSlot";
import { updateArtisanShop } from "@/services/artisanShops.actions";

/**
 * StoreReviewWizard — vista foco de moderación de una tienda.
 *
 * Compone la revisión de TODAS las secciones desde el objeto shop
 * (`GET /artisan-shops/:id`), sin endpoints nuevos:
 *  - Perfil artesanal → re-monta los pasos REALES del ArtisanProfileWizard
 *    (Identidad/Historia/Arte/Taller/Preview). Los pasos son prop-driven
 *    (data/onChange), igual que ProductReviewWizard.
 *  - Config comercial (Marca/Contacto/Portada/Políticas) → paneles compuestos
 *    del shop.
 *
 * Modo edición (espejo de ProductReviewWizard): un toggle Editar/Guardar/Cancelar
 * desbloquea los pasos de perfil (fieldset) y convierte los paneles de config en
 * inputs. Guardar persiste vía `PATCH /artisan-shops/:id` (onSave) SIN cambiar el
 * estado de moderación (la aprobación/rechazo vive en la ModerationActionBar).
 */

type SectionKind = "profile" | "config";
interface Section {
  key: string;
  label: string;
  icon: string;
  kind: SectionKind;
  step?: number;
}

const SECTIONS: Section[] = [
  {
    key: "identidad",
    label: "Identidad",
    icon: "person",
    kind: "profile",
    step: 1,
  },
  {
    key: "historia",
    label: "Historia",
    icon: "history_edu",
    kind: "profile",
    step: 2,
  },
  {
    key: "arte",
    label: "Arte",
    icon: "auto_fix_high",
    kind: "profile",
    step: 3,
  },
  {
    key: "taller",
    label: "Taller",
    icon: "storefront",
    kind: "profile",
    step: 4,
  },
  {
    key: "preview",
    label: "Preview",
    icon: "visibility",
    kind: "profile",
    step: 5,
  },
  { key: "marca", label: "Marca", icon: "palette", kind: "config" },
  { key: "contacto", label: "Contacto", icon: "call", kind: "config" },
  { key: "hero", label: "Portada", icon: "image", kind: "config" },
  { key: "politicas", label: "Políticas", icon: "gavel", kind: "config" },
  {
    key: "bancarios",
    label: "Datos Bancarios",
    icon: "account_balance",
    kind: "config",
  },
];

const noop = () => {};

// ─── Estado editable de la config comercial ──────────────────────────────────────
interface ConfigDraft {
  brandClaim: string;
  primaryColors: string; // coma-separado mientras se edita
  secondaryColors: string;
  email: string;
  phone: string;
  whatsapp: string;
  address: string;
  hours: string;
  department: string;
  municipality: string;
  instagram: string;
  facebook: string;
  twitter: string;
  youtube: string;
  returnPolicy: string;
}

const buildConfigDraft = (
  shop: ArtisanShop,
  policies?: StorePoliciesConfig | null,
): ConfigDraft => {
  const s = shop as ArtisanShop & Record<string, any>;
  const c = s.contactConfig ?? {};
  const social = s.socialLinks ?? {};
  return {
    brandClaim: s.brandClaim ?? "",
    primaryColors: (s.primaryColors ?? []).join(", "),
    secondaryColors: (s.secondaryColors ?? []).join(", "),
    email: c.email ?? "",
    phone: c.phone ?? "",
    whatsapp: c.whatsapp ?? "",
    address: c.address ?? "",
    hours: c.hours ?? "",
    department: s.department ?? "",
    municipality: s.municipality ?? "",
    instagram: social.instagram ?? "",
    facebook: social.facebook ?? "",
    twitter: social.twitter ?? "",
    youtube: social.youtube ?? "",
    // Las políticas NO son columna de la tienda: vienen de /store-policies-config.
    returnPolicy: policies?.returnPolicy ?? "",
  };
};

const splitColors = (v: string): string[] =>
  v
    .split(",")
    .map((x) => x.trim())
    .filter(Boolean);

// ─── Estado editable de datos bancarios (independiente del wizard global) ────────
interface BankDataDraft {
  holder_name: string;
  document_type: string;
  document_number: string;
  bank_code: string;
  account_type: string;
  account_number: string;
  country: string;
  currency: string;
}

const EMPTY_BANK_DRAFT: BankDataDraft = {
  holder_name: "",
  document_type: "",
  document_number: "",
  bank_code: "",
  account_type: "",
  account_number: "",
  country: "",
  currency: "",
};

// ─── Presentación ────────────────────────────────────────────────────────────────

const Field: React.FC<{ label: string; value?: React.ReactNode }> = ({
  label,
  value,
}) => (
  <div className="border-b border-slate-100 py-2.5">
    <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
      {label}
    </p>
    <div className="mt-0.5 text-[13px] text-slate-800">
      {value === undefined || value === null || value === "" ? (
        <span className="text-slate-300">—</span>
      ) : (
        value
      )}
    </div>
  </div>
);

const editInputClass =
  "w-full rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-800 focus:border-[#ec6d13]/50 focus:outline-none focus:ring-2 focus:ring-[#ec6d13]/10";

/** Campo que alterna entre lectura (Field) y edición (input/textarea). */
const EditableField: React.FC<{
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}> = ({ label, value, editing, onChange, multiline, placeholder }) => {
  if (!editing) return <Field label={label} value={value || undefined} />;
  return (
    <div className="border-b border-slate-100 py-2.5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      {multiline ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          placeholder={placeholder}
          className={`${editInputClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={editInputClass}
        />
      )}
    </div>
  );
};

/** Campo select que alterna entre lectura (Field) y edición (select). */
const SelectField: React.FC<{
  label: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}> = ({ label, value, editing, onChange, options }) => {
  if (!editing) {
    const displayLabel =
      options.find((o) => o.value === value)?.label || value || undefined;
    return <Field label={label} value={displayLabel} />;
  }
  return (
    <div className="border-b border-slate-100 py-2.5">
      <p className="mb-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
        {label}
      </p>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={editInputClass}
      >
        <option value="">— Seleccionar —</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
};

const ID_TYPE_OPTIONS = [
  { value: "CC", label: "Cédula de Ciudadanía" },
  { value: "PA", label: "Pasaporte" },
  { value: "NIT", label: "NIT" },
  { value: "CE", label: "Cédula de Extranjería" },
];

const ACCOUNT_TYPE_OPTIONS = [
  { value: "ch", label: "Ahorros" },
  { value: "cc", label: "Corriente" },
  { value: "r2p", label: "R2P" },
  { value: "dp", label: "Depósito electrónico" },
  { value: "breb-key", label: "Llave Bre-b" },
  { value: "r2p_breb", label: "Recaudo Bre-b" },
];

const BANK_OPTIONS = BANKS_DATA.map((b) => ({ value: b.code, label: b.name }));

const CURRENCY_OPTIONS = [
  { value: "COP", label: "COP" },
  { value: "USD", label: "USD" },
];

const ConfigPanel: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <div className="mx-auto max-w-2xl p-6">
    <h3 className="mb-3 text-sm font-bold text-slate-800">{title}</h3>
    <div className="rounded-xl border border-slate-200 bg-white px-4">
      {children}
    </div>
  </div>
);

// ─── Componente ──────────────────────────────────────────────────────────────────

interface StoreReviewWizardProps {
  shop: ArtisanShop;
  /** Políticas de la tienda (recurso /store-policies-config, enlazado por idPoliciesConfig). */
  policies?: StorePoliciesConfig | null;
  /** Persiste la edición (PATCH /artisan-shops/:id). Devuelve true si guardó. */
  onSave?: (payload: UpdateArtisanShopPayload) => Promise<boolean>;
  /** Persiste las políticas en su propio recurso. Devuelve true si guardó. */
  onSavePolicies?: (payload: StorePoliciesConfigPayload) => Promise<boolean>;
  saving?: boolean;
}

export const StoreReviewWizard: React.FC<StoreReviewWizardProps> = ({
  shop,
  policies,
  onSave,
  onSavePolicies,
  saving = false,
}) => {
  const [current, setCurrent] = useState(0);
  const [editable, setEditable] = useState(false);
  const [data, setData] = useState<ArtisanProfileData>(() => ({
    ...DEFAULT_ARTISAN_PROFILE,
    ...((shop.artisanProfile as unknown as ArtisanProfileData) ?? {}),
  }));
  const [config, setConfig] = useState<ConfigDraft>(() =>
    buildConfigDraft(shop, policies),
  );

  // ─── Bank data (independent edit lifecycle) ──────────────────────────────────
  const [bankEditing, setBankEditing] = useState(false);
  const [bankDraft, setBankDraft] = useState<BankDataDraft>(EMPTY_BANK_DRAFT);
  const {
    bankData,
    loading: bankLoading,
    saveBankData,
    updateBankData,
    refetch: refetchBankData,
  } = useBankData(shop.userId);

  // ─── Countries for bank data ─────────────────────────────────────────────────
  const [countries, setCountries] = useState<Country[]>([]);
  useEffect(() => {
    getAllCountries()
      .then((data) => setCountries(data))
      .catch(() => {});
  }, []);
  const countryOptions = countries.map((c) => ({ value: c.id, label: c.name }));

  // ─── Logo upload state ─────────────────────────────────────────────────────────
  const [logoUrl, setLogoUrl] = useState(shop.logoUrl ?? "");
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Sync logoUrl when shop changes
  useEffect(() => {
    setLogoUrl(shop.logoUrl ?? "");
  }, [shop.logoUrl]);

  const handleLogoFile = async (file: File) => {
    setUploadingLogo(true);
    try {
      const r = await uploadImage(file, UploadFolder.SHOPS);
      setLogoUrl(r.url);
      await updateArtisanShop(shop.id, { logoUrl: r.url } as any);
    } catch {
      // Error handled silently, ImageUploadSlot shows state
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleLogoRemove = async () => {
    setLogoUrl("");
    await updateArtisanShop(shop.id, { logoUrl: "" } as any);
  };

  useEffect(() => {
    setData({
      ...DEFAULT_ARTISAN_PROFILE,
      ...((shop.artisanProfile as unknown as ArtisanProfileData) ?? {}),
    });
    setConfig(buildConfigDraft(shop, policies));
    setCurrent(0);
    setEditable(false);
    setBankEditing(false);
  }, [shop]); // eslint-disable-line react-hooks/exhaustive-deps

  // Las políticas cargan aparte (llegan después de la tienda).
  useEffect(() => {
    if (editable) return;
    setConfig((prev) => ({
      ...prev,
      returnPolicy: policies?.returnPolicy ?? "",
    }));
  }, [policies, editable]);

  const s = shop as ArtisanShop & Record<string, any>;
  const section = SECTIONS[current];

  const updateProfile = (updates: Partial<ArtisanProfileData>) =>
    setData((prev) => ({ ...prev, ...updates }));
  const setCfg = (patch: Partial<ConfigDraft>) =>
    setConfig((prev) => ({ ...prev, ...patch }));

  const handleSave = async () => {
    if (!onSave) return;
    // Editar NO cambia el estado de moderación: se omiten los campos de aprobación.
    const payload: UpdateArtisanShopPayload = {
      artisanProfile:
        data as unknown as UpdateArtisanShopPayload["artisanProfile"],
      brandClaim: config.brandClaim,
      primaryColors: splitColors(config.primaryColors),
      secondaryColors: splitColors(config.secondaryColors),
      contactConfig: {
        ...(s.contactConfig ?? {}),
        email: config.email,
        phone: config.phone,
        whatsapp: config.whatsapp,
        address: config.address,
        hours: config.hours,
      },
      socialLinks: {
        ...(s.socialLinks ?? {}),
        instagram: config.instagram,
        facebook: config.facebook,
        twitter: config.twitter,
        youtube: config.youtube,
      },
      department: config.department,
      municipality: config.municipality,
      // OJO: `policiesConfig` no existe en el DTO de tiendas (el ValidationPipe lo
      // descartaba en silencio). Las políticas van por onSavePolicies.
    };
    const ok = await onSave(payload);
    const policiesChanged =
      config.returnPolicy !== (policies?.returnPolicy ?? "");
    if (ok && policiesChanged && onSavePolicies) {
      await onSavePolicies({ returnPolicy: config.returnPolicy });
    }
    if (ok) setEditable(false);
  };

  const handleCancelEdit = () => {
    setData({
      ...DEFAULT_ARTISAN_PROFILE,
      ...((shop.artisanProfile as unknown as ArtisanProfileData) ?? {}),
    });
    setConfig(buildConfigDraft(shop, policies));
    setEditable(false);
  };

  const goToProfileStep = (step: number) => {
    const idx = SECTIONS.findIndex(
      (x) => x.kind === "profile" && x.step === step,
    );
    if (idx >= 0) setCurrent(idx);
  };

  const profileOnChange = editable ? updateProfile : noop;

  const renderProfileStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <Step1Identity
            data={data}
            onChange={profileOnChange}
            shopSlug={shop.shopSlug}
            shopName={shop.shopName}
            userId={shop.userId}
          />
        );
      case 2:
        return <Step2Origin data={data} onChange={profileOnChange} />;
      case 3:
        return <Step5Craft data={data} onChange={profileOnChange} />;
      case 4:
        return (
          <Step4Workshop
            data={data}
            onChange={profileOnChange}
            userId={shop.userId}
          />
        );
      case 5:
        return (
          <Step7Preview
            data={data}
            generatedStory={(data as any).generatedStory}
            isGenerating={false}
            onEditStep={goToProfileStep}
          />
        );
      default:
        return null;
    }
  };

  const renderConfig = (key: string) => {
    if (key === "marca") {
      return (
        <ConfigPanel title="Marca">
          <EditableField
            label="Claim de marca"
            value={config.brandClaim}
            editing={editable}
            onChange={(v) => setCfg({ brandClaim: v })}
            multiline
          />
          <div className="border-b border-slate-100 py-2.5">
            <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400 mb-2">
              Logo
            </p>
            <div className="w-[100px]">
              <ImageUploadSlot
                label="Logo"
                hint="Imagen cuadrada"
                url={logoUrl}
                uploading={uploadingLogo}
                onFile={handleLogoFile}
                onRemove={handleLogoRemove}
                aspect="aspect-square"
                icon="storefront"
              />
            </div>
          </div>
          <EditableField
            label="Colores primarios (coma-separados)"
            value={config.primaryColors}
            editing={editable}
            onChange={(v) => setCfg({ primaryColors: v })}
            placeholder="#000000, #ffffff"
          />
          <EditableField
            label="Colores secundarios (coma-separados)"
            value={config.secondaryColors}
            editing={editable}
            onChange={(v) => setCfg({ secondaryColors: v })}
            placeholder="#000000, #ffffff"
          />
        </ConfigPanel>
      );
    }
    if (key === "contacto") {
      return (
        <ConfigPanel title="Contacto y ubicación">
          <EditableField
            label="Email"
            value={config.email}
            editing={editable}
            onChange={(v) => setCfg({ email: v })}
          />
          <EditableField
            label="Teléfono"
            value={config.phone}
            editing={editable}
            onChange={(v) => setCfg({ phone: v })}
          />
          <EditableField
            label="WhatsApp"
            value={config.whatsapp}
            editing={editable}
            onChange={(v) => setCfg({ whatsapp: v })}
          />
          <EditableField
            label="Dirección"
            value={config.address}
            editing={editable}
            onChange={(v) => setCfg({ address: v })}
          />
          <EditableField
            label="Horario"
            value={config.hours}
            editing={editable}
            onChange={(v) => setCfg({ hours: v })}
          />
          <EditableField
            label="Departamento"
            value={config.department}
            editing={editable}
            onChange={(v) => setCfg({ department: v })}
          />
          <EditableField
            label="Municipio"
            value={config.municipality}
            editing={editable}
            onChange={(v) => setCfg({ municipality: v })}
          />
          <EditableField
            label="Instagram"
            value={config.instagram}
            editing={editable}
            onChange={(v) => setCfg({ instagram: v })}
          />
          <EditableField
            label="Facebook"
            value={config.facebook}
            editing={editable}
            onChange={(v) => setCfg({ facebook: v })}
          />
          <EditableField
            label="Twitter / X"
            value={config.twitter}
            editing={editable}
            onChange={(v) => setCfg({ twitter: v })}
          />
          <EditableField
            label="YouTube"
            value={config.youtube}
            editing={editable}
            onChange={(v) => setCfg({ youtube: v })}
          />
        </ConfigPanel>
      );
    }
    if (key === "hero") {
      const slides = s.heroConfig?.slides ?? [];
      return (
        <ConfigPanel title="Portada">
          <Field
            label="Banner"
            value={
              shop.bannerUrl ? (
                <img
                  src={shop.bannerUrl}
                  alt="banner"
                  className="max-h-40 rounded-lg object-cover"
                />
              ) : undefined
            }
          />
          <Field
            label="Slides del hero"
            value={slides.length > 0 ? `${slides.length} slide(s)` : undefined}
          />
          {editable && (
            <p className="py-2.5 text-[11px] text-slate-400">
              Banner y slides se editan desde el portal de la tienda.
            </p>
          )}
        </ConfigPanel>
      );
    }
    if (key === "politicas") {
      const faq = policies?.faq ?? [];
      return (
        <ConfigPanel title="Políticas y FAQ">
          <EditableField
            label="Política de devoluciones"
            value={config.returnPolicy}
            editing={editable}
            onChange={(v) => setCfg({ returnPolicy: v })}
            multiline
          />
          <Field
            label="Preguntas frecuentes"
            value={
              faq.length > 0 ? (
                <ul className="list-disc space-y-1 pl-4">
                  {faq.map((f: { q: string; a: string }, i: number) => (
                    <li key={i}>
                      <span className="font-semibold">{f.q}</span> — {f.a}
                    </li>
                  ))}
                </ul>
              ) : undefined
            }
          />
          {editable && faq.length > 0 && (
            <p className="py-2.5 text-[11px] text-slate-400">
              Las FAQ se editan desde el portal de la tienda.
            </p>
          )}
        </ConfigPanel>
      );
    }
    if (key === "bancarios") return renderBankDataSection();
    return null;
  };

  // ─── Bank Data Section (independent edit lifecycle) ─────────────────────────
  const renderBankDataSection = () => {
    // Loading state
    if (bankLoading) {
      return (
        <div className="flex items-center justify-center py-20">
          <span className="material-symbols-outlined animate-spin text-2xl text-slate-400">
            progress_activity
          </span>
        </div>
      );
    }

    const setBankField = (field: keyof BankDataDraft, value: string) =>
      setBankDraft((prev) => ({ ...prev, [field]: value }));

    // No bank data — creation form (always in edit mode)
    if (!bankData) {
      return (
        <ConfigPanel title="Crear Datos Bancarios">
          <EditableField
            label="Titular"
            value={bankDraft.holder_name}
            editing={true}
            onChange={(v) => setBankField("holder_name", v)}
            placeholder="Nombre completo del titular"
          />
          <SelectField
            label="Tipo de Documento"
            value={bankDraft.document_type}
            editing={true}
            onChange={(v) => setBankField("document_type", v)}
            options={ID_TYPE_OPTIONS}
          />
          <EditableField
            label="Número de Documento"
            value={bankDraft.document_number}
            editing={true}
            onChange={(v) => setBankField("document_number", v)}
            placeholder="Número de identificación"
          />
          <SelectField
            label="Banco"
            value={bankDraft.bank_code}
            editing={true}
            onChange={(v) => setBankField("bank_code", v)}
            options={BANK_OPTIONS}
          />
          <SelectField
            label="Tipo de Cuenta"
            value={bankDraft.account_type}
            editing={true}
            onChange={(v) => setBankField("account_type", v)}
            options={ACCOUNT_TYPE_OPTIONS}
          />
          <EditableField
            label="Número de Cuenta"
            value={bankDraft.account_number}
            editing={true}
            onChange={(v) => setBankField("account_number", v)}
            placeholder="Número de cuenta bancaria"
          />
          <SelectField
            label="País"
            value={bankDraft.country}
            editing={true}
            onChange={(v) => setBankField("country", v)}
            options={countryOptions}
          />
          <SelectField
            label="Moneda"
            value={bankDraft.currency}
            editing={true}
            onChange={(v) => setBankField("currency", v)}
            options={CURRENCY_OPTIONS}
          />
          <div className="flex justify-end py-3">
            <button
              type="button"
              onClick={async () => {
                const result = await saveBankData({
                  holder_name: bankDraft.holder_name,
                  document_type: bankDraft.document_type,
                  document_number: bankDraft.document_number,
                  bank_code: bankDraft.bank_code,
                  account_type: bankDraft.account_type,
                  account_number: bankDraft.account_number,
                  country: bankDraft.country,
                  currency: bankDraft.currency,
                  status: "complete",
                  geo: "",
                });
                if (result.success) {
                  setBankDraft(EMPTY_BANK_DRAFT);
                }
              }}
              className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white"
              style={{ background: "#ec6d13" }}
            >
              <span className="material-symbols-outlined text-[15px]">
                save
              </span>
              Guardar
            </button>
          </div>
        </ConfigPanel>
      );
    }

    // Bank data exists, read-only mode
    if (!bankEditing) {
      return (
        <ConfigPanel title="Datos Bancarios">
          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={() => {
                setBankDraft({
                  holder_name: bankData.holder_name ?? "",
                  document_type: bankData.document_type ?? "",
                  document_number: bankData.document_number ?? "",
                  bank_code: bankData.bank_code ?? "",
                  account_type: bankData.account_type ?? "",
                  account_number: bankData.account_number ?? "",
                  country: bankData.country ?? "",
                  currency: bankData.currency ?? "",
                });
                setBankEditing(true);
              }}
              className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-semibold"
              style={{ borderColor: "rgba(20,34,57,0.2)", color: "#142239" }}
            >
              <span className="material-symbols-outlined text-[15px]">
                edit
              </span>
              Editar
            </button>
          </div>
          <Field label="Titular" value={bankData.holder_name} />
          <SelectField
            label="Tipo de Documento"
            value={bankData.document_type ?? ""}
            editing={false}
            onChange={noop}
            options={ID_TYPE_OPTIONS}
          />
          <Field label="Número de Documento" value={bankData.document_number} />
          <SelectField
            label="Banco"
            value={bankData.bank_code}
            editing={false}
            onChange={noop}
            options={BANK_OPTIONS}
          />
          <SelectField
            label="Tipo de Cuenta"
            value={bankData.account_type ?? ""}
            editing={false}
            onChange={noop}
            options={ACCOUNT_TYPE_OPTIONS}
          />
          <Field label="Número de Cuenta" value={bankData.account_number} />
          <SelectField
            label="País"
            value={bankData.country}
            editing={false}
            onChange={noop}
            options={countryOptions}
          />
          <SelectField
            label="Moneda"
            value={bankData.currency ?? ""}
            editing={false}
            onChange={noop}
            options={CURRENCY_OPTIONS}
          />
        </ConfigPanel>
      );
    }

    // Bank data exists, editing mode
    return (
      <ConfigPanel title="Datos Bancarios">
        <EditableField
          label="Titular"
          value={bankDraft.holder_name}
          editing={true}
          onChange={(v) => setBankField("holder_name", v)}
          placeholder="Nombre completo del titular"
        />
        <SelectField
          label="Tipo de Documento"
          value={bankDraft.document_type}
          editing={true}
          onChange={(v) => setBankField("document_type", v)}
          options={ID_TYPE_OPTIONS}
        />
        <EditableField
          label="Número de Documento"
          value={bankDraft.document_number}
          editing={true}
          onChange={(v) => setBankField("document_number", v)}
          placeholder="Número de identificación"
        />
        <SelectField
          label="Banco"
          value={bankDraft.bank_code}
          editing={true}
          onChange={(v) => setBankField("bank_code", v)}
          options={BANK_OPTIONS}
        />
        <SelectField
          label="Tipo de Cuenta"
          value={bankDraft.account_type}
          editing={true}
          onChange={(v) => setBankField("account_type", v)}
          options={ACCOUNT_TYPE_OPTIONS}
        />
        <EditableField
          label="Número de Cuenta"
          value={bankDraft.account_number}
          editing={true}
          onChange={(v) => setBankField("account_number", v)}
          placeholder="Número de cuenta bancaria"
        />
        <SelectField
          label="País"
          value={bankDraft.country}
          editing={true}
          onChange={(v) => setBankField("country", v)}
          options={countryOptions}
        />
        <SelectField
          label="Moneda"
          value={bankDraft.currency}
          editing={true}
          onChange={(v) => setBankField("currency", v)}
          options={CURRENCY_OPTIONS}
        />
        <div className="flex justify-end gap-2 py-3">
          <button
            type="button"
            onClick={async () => {
              const result = await updateBankData({
                holder_name: bankDraft.holder_name,
                document_type: bankDraft.document_type,
                document_number: bankDraft.document_number,
                bank_code: bankDraft.bank_code,
                account_type: bankDraft.account_type,
                account_number: bankDraft.account_number,
                country: bankDraft.country,
                currency: bankDraft.currency,
                status: "complete",
                geo: "",
              });
              if (result.success) {
                setBankEditing(false);
              }
            }}
            className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white"
            style={{ background: "#ec6d13" }}
          >
            <span className="material-symbols-outlined text-[15px]">save</span>
            Guardar
          </button>
          <button
            type="button"
            onClick={() => {
              setBankEditing(false);
              setBankDraft({
                holder_name: bankData?.holder_name ?? "",
                document_type: bankData?.document_type ?? "",
                document_number: bankData?.document_number ?? "",
                bank_code: bankData?.bank_code ?? "",
                account_type: bankData?.account_type ?? "",
                account_number: bankData?.account_number ?? "",
                country: bankData?.country ?? "",
                currency: bankData?.currency ?? "",
              });
            }}
            className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50"
          >
            <span className="material-symbols-outlined text-[15px]">close</span>
            Cancelar
          </button>
        </div>
      </ConfigPanel>
    );
  };

  return (
    <div
      className="flex h-full flex-col min-h-0"
      style={{ fontFamily: "'Manrope', sans-serif" }}
    >
      {/* Section rail + controles de edición */}
      <div className="flex-shrink-0 flex items-center gap-2 border-b border-slate-200 bg-white px-3 py-2">
        <div className="flex flex-1 items-center gap-1 overflow-x-auto">
          {SECTIONS.map((sec, idx) => {
            const active = idx === current;
            return (
              <button
                key={sec.key}
                type="button"
                onClick={() => setCurrent(idx)}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold whitespace-nowrap transition-colors"
                style={
                  active
                    ? { background: "#142239", color: "#fff" }
                    : { background: "#f1f5f9", color: "#64748b" }
                }
              >
                <span className="material-symbols-outlined text-[15px]">
                  {sec.icon}
                </span>
                <span className="hidden sm:inline">{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Editar / Guardar / Cancelar */}
        {onSave && (
          <div className="flex flex-shrink-0 items-center gap-1.5">
            {editable ? (
              <>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-md px-3 py-1.5 text-[11px] font-semibold text-white disabled:opacity-50"
                  style={{ background: "#ec6d13" }}
                >
                  <span className="material-symbols-outlined text-[15px]">
                    {saving ? "progress_activity" : "save"}
                  </span>
                  {saving ? "Guardando…" : "Guardar"}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  disabled={saving}
                  className="flex items-center gap-1 rounded-md border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[15px]">
                    close
                  </span>
                  Cancelar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={() => setEditable(true)}
                className="flex items-center gap-1 rounded-md border px-3 py-1.5 text-[11px] font-semibold"
                style={{ borderColor: "rgba(20,34,57,0.2)", color: "#142239" }}
              >
                <span className="material-symbols-outlined text-[15px]">
                  edit
                </span>
                Editar
              </button>
            )}
          </div>
        )}
      </div>

      {/* Contenido: perfil (pasos reales) o config */}
      <div
        className="flex-1 min-h-0 overflow-y-auto"
        style={{ background: "#f9f7f2" }}
      >
        {section.kind === "profile" ? (
          <WizardModeProvider
            mode={editable ? "review-edit" : "review-readonly"}
          >
            <fieldset disabled={!editable} className="min-w-0 border-0 p-0 m-0">
              {renderProfileStep(section.step!)}
            </fieldset>
          </WizardModeProvider>
        ) : (
          renderConfig(section.key)
        )}
      </div>
    </div>
  );
};

export default StoreReviewWizard;
