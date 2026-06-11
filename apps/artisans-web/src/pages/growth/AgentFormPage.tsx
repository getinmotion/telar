import React, { useState, useEffect } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useNavigate } from "react-router-dom";
import {
  getArtisansKnowledgeProfile,
  submitStep1Identity,
  submitStep2Commercial,
  submitStep3ClientMarket,
  submitStep4OperationGrowth,
  checkProfileCompletion,
} from "@/services/artisansKnowledge.actions";
import { processOnboarding } from "@/services/agent.actions";
import type { OnboardingResponse } from "@/types/agent.types";
import {
  createArtisanShop,
  getArtisanShopByUserId,
} from "@/services/artisanShops.actions";
import { logout } from "@/pages/auth/actions/login.actions";
import type {
  ArtisansIdentityProfile,
  CreateArtisansIdentityOneDto,
  CreateArtisansCommercialTwoDto,
  CreateArtisansClientMarketThreeDto,
  CreateArtisansOperationGrowthFourDto,
} from "@/types/artisansKnowledge.types";
import { toast } from "sonner";
import { SpeechTextarea } from "@/components/ui/speech-textarea";
import {
  SlugCreator,
  CategoryMultiPicker,
} from "@/components/shop/wizards/artisan-profile/Step1Identity";
import { WHEN_OPTIONS } from "@/components/shop/wizards/artisan-profile/Step2Origin";
import { LEARNED_FROM_OPTIONS } from "@/types/artisanProfile";
import {
  DIFFERENTIATORS,
  DIFFERENTIATOR_STORED_LABELS,
} from "@/components/onboarding/Block1Artisan";
import { UNIQUENESS_STORED_LABELS } from "@/constants/uniquenessOptions";
import { WizardHeader } from "@/components/shop/new-product-wizard/components/WizardHeader";
import { WizardFooter } from "@/components/shop/new-product-wizard/components/WizardFooter";

// Mapeo de LEARNED_FROM_OPTIONS.value → texto que se almacena en BD
const LEARNED_FROM_STORED_LABEL: Record<string, string> = {
  family: "Lo heredé de mi familia o comunidad",
  community: "Lo aprendí de mi comunidad",
  master: "Lo aprendí de maestros o procesos tradicionales",
  "self-taught": "Lo desarrollé de forma autodidacta con los años",
  school: "Me formé de manera académica o técnica",
  mixed: "Mezclo tradición, exploración y práctica propia",
  other: "Otro",
};

// ─── Option data con iconos (Steps 2–4) ───────────────────────────────────────

const PRICE_RANGE_OPTIONS = [
  { label: "Menos de $20.000 COP", icon: "savings" },
  { label: "Entre $20.000 y $80.000 COP", icon: "attach_money" },
  { label: "Entre $80.000 y $200.000 COP", icon: "monetization_on" },
  { label: "Más de $200.000 COP", icon: "diamond" },
  { label: "Aún no tengo precios definidos", icon: "help_outline" },
];

const COST_KNOWLEDGE_OPTIONS = [
  {
    label:
      "Sé exactamente cuánto me cuesta producir cada pieza y calculo mi ganancia.",
    desc: "Conozco materiales, tiempo de trabajo y otros costos.",
    icon: "calculate",
  },
  {
    label:
      "Tengo una idea aproximada de mis costos, pero no hago el cálculo completo.",
    desc: "Sé cuánto gasto en algunas cosas, pero no en todas.",
    icon: "trending_flat",
  },
  {
    label:
      "Miro precios de otros artesanos o negocios similares para orientarme.",
    desc: "Me apoyo en lo que veo en el mercado.",
    icon: "search",
  },
  {
    label: "Pongo un precio según lo que considero justo por mi trabajo.",
    desc: "No sigo una fórmula específica.",
    icon: "balance",
  },
  {
    label: "No tengo una forma clara de definir mis precios.",
    icon: "question_mark",
  },
];

const DEFINE_COST_OPTIONS = [
  {
    label: "Lo tengo muy claro.",
    desc: "Sé cuánto gasto en materiales, tiempo y otros costos para producir cada pieza.",
    icon: "check_circle",
  },
  {
    label: "Tengo claros algunos costos, pero no todos.",
    desc: "Conozco lo principal, como materiales, pero no siempre calculo tiempo, transporte, empaque u otros gastos.",
    icon: "pie_chart",
  },
  {
    label: "Lo calculo de forma aproximada.",
    desc: "Más o menos sé cuánto gasto, pero no lo registro ni lo reviso con detalle.",
    icon: "tune",
  },
  {
    label: "Trabajo por experiencia o costumbre.",
    desc: "Sé hacer mis productos, pero no suelo calcular exactamente cuánto cuesta producirlos.",
    icon: "history",
  },
  {
    label: "No tengo claro cuánto me cuesta hacer mis productos.",
    icon: "help_outline",
  },
];

const PROFITABLE_OPTIONS = [
  {
    label: "Lo tengo claro.",
    desc: "Sé cuánto gano aproximadamente por mis productos.",
    icon: "thumb_up",
  },
  {
    label: "Tengo una idea general, pero no llevo un control constante.",
    icon: "trending_up",
  },
  {
    label: "Vendo y recibo dinero, pero no sé realmente cuánto gano.",
    icon: "blur_on",
  },
  {
    label: "Creo que gano muy poco o incluso pierdo dinero algunas veces.",
    icon: "trending_down",
  },
  { label: "Nunca he analizado eso.", icon: "block" },
];

const BUYER_OPTIONS = [
  { label: "Turistas", icon: "luggage" },
  { label: "Amantes de lo artesanal", icon: "favorite" },
  { label: "Compradores de regalos", icon: "card_giftcard" },
  { label: "Diseñadores", icon: "draw" },
  { label: "Clientes locales", icon: "location_on" },
  { label: "No lo tengo claro", icon: "help_outline" },
];

const DIGITAL_PRESENCE_OPTIONS = [
  { label: "Sí, activa", icon: "wifi" },
  { label: "Tengo pero no la uso", icon: "wifi_off" },
  { label: "No tengo", icon: "remove_circle_outline" },
  { label: "Estoy empezando", icon: "rocket_launch" },
];

const WHERE_SELL_OPTIONS = [
  { label: "Ferias y mercados", icon: "storefront" },
  { label: "Redes sociales", icon: "smartphone" },
  { label: "WhatsApp", icon: "chat" },
  { label: "Tienda propia", icon: "store" },
  { label: "Marketplace online", icon: "shopping_bag" },
  { label: "Referidos / voz a voz", icon: "record_voice_over" },
];

const SALES_ACTIVITY_OPTIONS = [
  { label: "Constante", icon: "show_chart" },
  { label: "Irregular", icon: "ssid_chart" },
  { label: "Solo en temporadas", icon: "event" },
  { label: "Casi no vendo", icon: "trending_down" },
];

const PRODUCTS_MONTH_OPTIONS = [
  { label: "Menos de 10", icon: "touch_app" },
  { label: "10 – 30", icon: "inventory_2" },
  { label: "30 – 100", icon: "stacked_bar_chart" },
  { label: "Más de 100", icon: "factory" },
  { label: "Varía mucho", icon: "sync_alt" },
];

const LIMIT_OPTIONS = [
  { label: "Falta de tiempo", icon: "schedule" },
  { label: "Falta de dinero / capital", icon: "money_off" },
  { label: "Materiales o herramientas", icon: "construction" },
  { label: "Pocos clientes o ventas", icon: "groups" },
  { label: "Falta de conocimiento o apoyo", icon: "school" },
  { label: "No lo sé", icon: "help_outline" },
];

const WORKERS_OPTIONS = [
  { label: "Solo yo", icon: "person" },
  { label: "Con mi familia", icon: "people" },
  { label: "Pequeño equipo (2-5)", icon: "group" },
  { label: "Colectivo o taller", icon: "groups" },
];

// ─── Oráculo content per step ─────────────────────────────────────────────────

const ORACLE: Record<
  number,
  { cards: { label: string; text: string }[]; next: string }
> = {
  1: {
    cards: [
      {
        label: "¿Por qué estas preguntas?",
        text: "El agente necesita conocer tu identidad para representarte con autenticidad en el marketplace y generar contenido específico sobre tu trabajo.",
      },
      {
        label: "Qué hace especial tu trabajo",
        text: "Esta selección construye el núcleo diferencial de tu marca artesanal. El agente la usará para crear propuestas de valor únicas y textos de venta.",
      },
      {
        label: "Categorías y origen de tu oficio",
        text: "Con las categorías el agente conecta tu taller con compradores específicos. Tu origen y trayectoria alimentan tu narrativa pública.",
      },
    ],
    next: "Al completar este bloque tendrás un perfil de identidad que el agente puede usar para representarte en el mercado.",
  },
  2: {
    cards: [
      {
        label: "¿Por qué esta información?",
        text: "Entender cómo funciona hoy la parte comercial de tu taller permite al agente detectar oportunidades reales y darte recomendaciones que sí aplican a tu situación.",
      },
      {
        label: "Precios y costos",
        text: "Saber cómo defines tus precios y qué tan claro tienes tus costos ayuda al agente a identificar si estás sub-valorando tu trabajo y cómo mejorar tus márgenes.",
      },
      {
        label: "Claridad sobre ganancias",
        text: "El agente diseñará estrategias distintas según qué tan claro tienes si tu taller genera ganancias hoy. No buscamos perfección — buscamos tu realidad actual.",
      },
    ],
    next: "Con esta información el agente podrá darte recomendaciones comerciales específicas para tu situación actual.",
  },
  3: {
    cards: [
      {
        label: "Segmento de compradores",
        text: "Saber quiénes son tus clientes permite al agente crear mensajes y contenidos dirigidos exactamente a las personas que ya valoran tu trabajo.",
      },
      {
        label: "Canales de venta",
        text: "Conocer dónde vendes permite al agente priorizar acciones donde ya tienes presencia y sugerir nuevos canales de expansión con bajo riesgo.",
      },
      {
        label: "Ritmo y estacionalidad",
        text: "El ritmo de ventas ayuda al agente a identificar estacionalidades y planificar campañas en los momentos de mayor oportunidad para tu taller.",
      },
    ],
    next: "Con tus datos de mercado el agente podrá crear estrategias de captación y retención de clientes específicas para tu taller.",
  },
  4: {
    cards: [
      {
        label: "Capacidad productiva",
        text: "El agente evitará recomendaciones que superen tu capacidad actual y te sugerirá formas de crecer de manera sostenible y realista.",
      },
      {
        label: "Limitaciones actuales",
        text: "El agente diseñará un plan de acción que atiende primero lo que más te frena hoy, con pasos concretos y alcanzables desde donde estás.",
      },
      {
        label: "Primeros pasos con TELAR",
        text: "Con todo el contexto completo, TELAR activará los agentes más relevantes para las necesidades reales de tu taller.",
      },
    ],
    next: "Al completar este último bloque, el agente tendrá todo lo necesario para empezar a trabajar contigo de inmediato.",
  },
};

// ─── Design tokens ─────────────────────────────────────────────────────────────

const glassCard: React.CSSProperties = {
  background: "rgba(255,255,255,0.78)",
  backdropFilter: "blur(14px)",
  WebkitBackdropFilter: "blur(14px)",
  border: "1px solid rgba(255,255,255,0.65)",
  boxShadow: "0 2px 10px -2px rgba(0,0,0,0.05)",
};

const inputCls =
  "w-full rounded-lg px-4 py-3 font-['Manrope'] text-[14px] text-[#151b2d] border border-[#e2d5cf]/50 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 placeholder:text-[#151b2d]/25 transition-all hover:border-[#e2d5cf]/80";
const inputBg: React.CSSProperties = { background: "rgba(247,244,239,0.5)" };

const Label: React.FC<{
  children: React.ReactNode;
  required?: boolean;
  optional?: boolean;
}> = ({ children, required, optional }) => (
  <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
    {children}
    {required && <span className="text-[#ef4444] ml-1">*</span>}
    {optional && (
      <span className="ml-2 text-[#54433e]/30 normal-case tracking-normal font-[500] text-[11px]">
        — Opcional
      </span>
    )}
  </label>
);

// ─── QuestionHeader — numbered section inside a card ─────────────────────────

const QuestionHeader: React.FC<{
  n: number;
  question: React.ReactNode;
  hint?: string;
  required?: boolean;
  multiSelect?: boolean;
  maxSelect?: number;
}> = ({ n, question, hint, required, multiSelect, maxSelect }) => (
  <div className="flex items-start gap-3 mb-4">
    <div
      className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
      style={{ background: "rgba(236,109,19,0.12)" }}
    >
      <span className="font-['Manrope'] text-[10px] font-[800] text-[#ec6d13]">
        {n}
      </span>
    </div>
    <div className="flex-1">
      <p className="font-['Manrope'] text-[14px] font-[700] text-[#151b2d] leading-snug">
        {question}
        {required && <span className="text-[#ef4444] ml-1">*</span>}
      </p>
      {hint && (
        <p className="font-['Manrope'] text-[11px] text-[#54433e]/50 mt-1 leading-snug">
          {hint}
        </p>
      )}
      {multiSelect && maxSelect && (
        <p className="font-['Manrope'] text-[10px] font-[600] text-[#ec6d13]/60 mt-1">
          Selecciona hasta {maxSelect}
        </p>
      )}
    </div>
  </div>
);

// ─── IconOptionCard — opción con icono, label, desc + indicador selección ─────

const IconOptionCard: React.FC<{
  icon: string;
  label: string;
  desc?: string;
  selected: boolean;
  onClick: () => void;
  multiSelect?: boolean;
}> = ({ icon, label, desc, selected, onClick, multiSelect = false }) => (
  <button
    type="button"
    onClick={onClick}
    className="w-full text-left flex items-start gap-3 px-4 py-3 rounded-xl transition-all font-['Manrope']"
    style={{
      background: selected ? "rgba(236,109,19,0.06)" : "rgba(247,244,239,0.5)",
      border: selected
        ? "1.5px solid rgba(236,109,19,0.45)"
        : "1px solid rgba(226,213,207,0.5)",
    }}
  >
    <span
      className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
      style={{ color: selected ? "#ec6d13" : "rgba(84,67,62,0.32)" }}
    >
      {icon}
    </span>
    <div className="flex-1 min-w-0">
      <span
        className="text-[13px] font-[600] block leading-tight"
        style={{ color: selected ? "#ec6d13" : "#151b2d" }}
      >
        {label}
      </span>
      {desc && (
        <span className="text-[11px] text-[#54433e]/50 block mt-0.5 leading-snug">
          {desc}
        </span>
      )}
    </div>
    {multiSelect ? (
      <div
        className="w-4 h-4 rounded flex items-center justify-center shrink-0 mt-0.5 transition-all"
        style={{
          border: selected ? "none" : "2px solid rgba(84,67,62,0.2)",
          background: selected ? "#ec6d13" : "transparent",
        }}
      >
        {selected && (
          <span
            className="material-symbols-outlined text-white"
            style={{ fontSize: 11, fontVariationSettings: "'wght' 700" }}
          >
            check
          </span>
        )}
      </div>
    ) : (
      <div
        className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors"
        style={{ borderColor: selected ? "#ec6d13" : "rgba(84,67,62,0.2)" }}
      >
        {selected && <div className="w-2 h-2 rounded-full bg-[#ec6d13]" />}
      </div>
    )}
  </button>
);

// ─── StepSectionHeader — título visual del bloque ─────────────────────────────

const StepSectionHeader: React.FC<{
  block: number;
  title: string;
  subtitle: string;
}> = ({ block, title, subtitle }) => (
  <div className="pb-1">
    <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13]/70 mb-1.5">
      Bloque {block} de 4
    </p>
    <h2 className="font-['Noto_Serif'] text-[22px] font-[600] text-[#151b2d] mb-1">
      {title}
    </h2>
    <p className="font-['Manrope'] text-[13px] text-[#54433e]/55 leading-snug">
      {subtitle}
    </p>
  </div>
);

// ─── Pre-fill banner ───────────────────────────────────────────────────────────

const PrefillBanner: React.FC = () => (
  <div
    className="flex items-start gap-3 rounded-xl px-4 py-3 mb-6"
    style={{
      background: "rgba(236,109,19,0.07)",
      border: "1px solid rgba(236,109,19,0.2)",
    }}
  >
    <span className="material-symbols-outlined text-[#ec6d13] text-[18px] mt-0.5">
      sync
    </span>
    <p className="font-['Manrope'] text-[13px] text-[#54433e] leading-relaxed">
      <strong>Datos actualizados desde tu Identidad Artesanal.</strong> Los
      campos de nombre, presentación, categorías y origen siempre reflejan tu
      perfil actual. Revisa y guarda si quieres confirmar los cambios.
    </p>
  </div>
);

// ─── Page component ───────────────────────────────────────────────────────────

export const AgentFormPage: React.FC = () => {
  const { user, artisanShop, artisansIdentityProfile } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState<ArtisansIdentityProfile | null>(null);
  const [isPrefilled, setIsPrefilled] = useState(false);
  const [oraculoOpen, setOraculoOpen] = useState(false);
  const [isFirstTime, setIsFirstTime] = useState<boolean | null>(null);
  const [hasShop, setHasShop] = useState(false);
  const [onboardingResponse, setOnboardingResponse] = useState<OnboardingResponse | null>(null);

  // Slug config state (Step 1)
  const [shopSlug, setShopSlug] = useState("");
  const [showSlug, setShowSlug] = useState(false);
  const [showPreciseAge, setShowPreciseAge] = useState(false);

  // ─── Step data ─────────────────────────────────────────────────────────────

  const [step1Data, setStep1Data] = useState<
    Omit<CreateArtisansIdentityOneDto, "createdBy">
  >({
    nameShop: "",
    artisanHistory: "",
    ageExperience: "0",
    shopHistory: "",
    shopDescription: "",
    shopDefinition: "",
    shopCategoriesId: "",
    shopSpecialDefinitionOne: "",
    shopSpecialDefinitionTwo: null,
    shopSpecialDefinitionThree: null,
    shopBornSpecialDefinitionOne: "",
    shopBornSpecialDefinitionTwo: null,
    shopBornSpecialDefinitionThree: null,
  });

  const [step2Data, setStep2Data] = useState<
    Omit<CreateArtisansCommercialTwoDto, "createdBy">
  >({
    shopRangePayment: "",
    shopKnowledgeCost: "",
    shopKnowledgeDefineCost: "",
    shopKnowledgeIsProfitable: "",
  });

  const [step3Data, setStep3Data] = useState<
    Omit<CreateArtisansClientMarketThreeDto, "createdBy">
  >({
    shopKnowledgeMainBuyerOne: "",
    shopKnowledgeMainBuyerTwo: null,
    shopKnowledgeMainBuyerThree: null,
    shopKnowledgeDigitalPresence: "",
    shopKnowledgeWhereSaleOne: "",
    shopKnowledgeWhereSaleTwo: null,
    shopKnowledgeWhereSaleThree: null,
    shopKnowledgeSalesActivity: "",
  });

  const [step4Data, setStep4Data] = useState<
    Omit<CreateArtisansOperationGrowthFourDto, "createdBy">
  >({
    shopKnowledgeProductsMakeMonth: "",
    shopKnowledgeLimitTodayOne: "",
    shopKnowledgeLimitTodayTwo: null,
    shopKnowledgeLimitTodayThree: null,
    shopManyWorkers: "",
    shopFirstSolvingTelar: "",
  });

  // ─── Redirect if already completed ────────────────────────────────────────

  useEffect(() => {
    // Si el usuario ya tiene tienda y perfil artesanal completo, redirigir al dashboard
    if (artisanShop && artisansIdentityProfile) {
      // Verificar si el perfil tiene todos los pasos completos
      const hasAllSteps =
        artisansIdentityProfile.identityOne &&
        artisansIdentityProfile.commercialTwo &&
        artisansIdentityProfile.clientMarketThree &&
        artisansIdentityProfile.operationGrowthFour;

      if (hasAllSteps) {
        navigate('/dashboard', { replace: true });
      }
    }
  }, [artisanShop, artisansIdentityProfile, navigate]);

  // ─── Load Profile ──────────────────────────────────────────────────────────

  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      setIsLoading(true);
      try {
        const [existingProfile, shopData] = await Promise.allSettled([
          getArtisansKnowledgeProfile(user.id),
          getArtisanShopByUserId(user.id),
        ]);

        const knowledgeProfile =
          existingProfile.status === "fulfilled" ? existingProfile.value : null;
        const shop =
          shopData.status === "fulfilled" ? (shopData.value as any) : null;
        setHasShop(!!shop);
        const wizardProfile = shop?.artisanProfile ?? null;

        const wizardCategoriesId = wizardProfile?.categoryIds?.length
          ? wizardProfile.categoryIds.join(",")
          : "";

        const wizardSpecial: string[] = (wizardProfile?.uniquenessKeys ?? [])
          .map(
            (k: string) =>
              UNIQUENESS_STORED_LABELS[
                k as keyof typeof UNIQUENESS_STORED_LABELS
              ] ?? "",
          )
          .filter(Boolean);

        const wizardBorn: string[] = wizardProfile?.learnedFrom
          ? [LEARNED_FROM_STORED_LABEL[wizardProfile.learnedFrom] ?? ""].filter(
              Boolean,
            )
          : [];

        const wizardAge: number = wizardProfile?.startAge ?? 0;

        if (knowledgeProfile) {
          setProfile(knowledgeProfile);
          setIsPrefilled(!!knowledgeProfile.prefilled);
          setIsFirstTime(false);

          const ki = knowledgeProfile.identityOne;

          setStep1Data({
            nameShop: wizardProfile?.artisticName || ki?.nameShop || "",
            artisanHistory: wizardProfile?.shortBio || ki?.artisanHistory || "",
            ageExperience: String(ki?.ageExperience ?? wizardAge ?? 0),
            shopHistory:
              wizardProfile?.learnedFromDetail || ki?.shopHistory || "",
            shopDescription:
              wizardProfile?.productDescription || ki?.shopDescription || "",
            shopDefinition:
              wizardProfile?.culturalMeaning || ki?.shopDefinition || "",
            shopCategoriesId: wizardCategoriesId || ki?.shopCategoriesId || "",
            shopSpecialDefinitionOne:
              wizardSpecial[0] || ki?.shopSpecialDefinitionOne || "",
            shopSpecialDefinitionTwo:
              wizardSpecial[1] ?? ki?.shopSpecialDefinitionTwo ?? null,
            shopSpecialDefinitionThree:
              wizardSpecial[2] ?? ki?.shopSpecialDefinitionThree ?? null,
            shopBornSpecialDefinitionOne:
              wizardBorn[0] || ki?.shopBornSpecialDefinitionOne || "",
            shopBornSpecialDefinitionTwo:
              wizardBorn[1] ?? ki?.shopBornSpecialDefinitionTwo ?? null,
            shopBornSpecialDefinitionThree:
              wizardBorn[2] ?? ki?.shopBornSpecialDefinitionThree ?? null,
          });

          if (knowledgeProfile.commercialTwo) {
            setStep2Data({
              shopRangePayment:
                knowledgeProfile.commercialTwo.shopRangePayment || "",
              shopKnowledgeCost:
                knowledgeProfile.commercialTwo.shopKnowledgeCost || "",
              shopKnowledgeDefineCost:
                knowledgeProfile.commercialTwo.shopKnowledgeDefineCost || "",
              shopKnowledgeIsProfitable:
                knowledgeProfile.commercialTwo.shopKnowledgeIsProfitable || "",
            });
          }

          if (knowledgeProfile.clientMarketThree) {
            setStep3Data({
              shopKnowledgeMainBuyerOne:
                knowledgeProfile.clientMarketThree.shopKnowledgeMainBuyerOne ||
                "",
              shopKnowledgeMainBuyerTwo:
                knowledgeProfile.clientMarketThree.shopKnowledgeMainBuyerTwo ||
                null,
              shopKnowledgeMainBuyerThree:
                knowledgeProfile.clientMarketThree
                  .shopKnowledgeMainBuyerThree || null,
              shopKnowledgeDigitalPresence:
                knowledgeProfile.clientMarketThree
                  .shopKnowledgeDigitalPresence || "",
              shopKnowledgeWhereSaleOne:
                knowledgeProfile.clientMarketThree.shopKnowledgeWhereSaleOne ||
                "",
              shopKnowledgeWhereSaleTwo:
                knowledgeProfile.clientMarketThree.shopKnowledgeWhereSaleTwo ||
                null,
              shopKnowledgeWhereSaleThree:
                knowledgeProfile.clientMarketThree
                  .shopKnowledgeWhereSaleThree || null,
              shopKnowledgeSalesActivity:
                knowledgeProfile.clientMarketThree.shopKnowledgeSalesActivity ||
                "",
            });
          }

          if (knowledgeProfile.operationGrowthFour) {
            setStep4Data({
              shopKnowledgeProductsMakeMonth:
                knowledgeProfile.operationGrowthFour
                  .shopKnowledgeProductsMakeMonth || "",
              shopKnowledgeLimitTodayOne:
                knowledgeProfile.operationGrowthFour
                  .shopKnowledgeLimitTodayOne || "",
              shopKnowledgeLimitTodayTwo:
                knowledgeProfile.operationGrowthFour
                  .shopKnowledgeLimitTodayTwo || null,
              shopKnowledgeLimitTodayThree:
                knowledgeProfile.operationGrowthFour
                  .shopKnowledgeLimitTodayThree || null,
              shopManyWorkers:
                knowledgeProfile.operationGrowthFour.shopManyWorkers || "",
              shopFirstSolvingTelar:
                knowledgeProfile.operationGrowthFour.shopFirstSolvingTelar ||
                "",
            });
          }

          const completion = checkProfileCompletion(knowledgeProfile);
          if (!completion.step1Complete) setCurrentStep(1);
          else if (!completion.step2Complete) setCurrentStep(2);
          else if (!completion.step3Complete) setCurrentStep(3);
          else if (!completion.step4Complete) setCurrentStep(4);
          else setCurrentStep(5);
        } else {
          setIsFirstTime(true);
          if (wizardProfile) {
            setStep1Data({
              nameShop: wizardProfile.artisticName || "",
              artisanHistory: wizardProfile.shortBio || "",
              ageExperience: String(wizardAge),
              shopHistory: wizardProfile.learnedFromDetail || "",
              shopDescription: wizardProfile.productDescription || "",
              shopDefinition: wizardProfile.culturalMeaning || "",
              shopCategoriesId: wizardCategoriesId,
              shopSpecialDefinitionOne: wizardSpecial[0] || "",
              shopSpecialDefinitionTwo: wizardSpecial[1] ?? null,
              shopSpecialDefinitionThree: wizardSpecial[2] ?? null,
              shopBornSpecialDefinitionOne: wizardBorn[0] || "",
              shopBornSpecialDefinitionTwo: wizardBorn[1] ?? null,
              shopBornSpecialDefinitionThree: wizardBorn[2] ?? null,
            });
          }
        }
      } catch (error) {
        console.error("Error loading profile:", error);
      }

      setIsLoading(false);
    };

    loadProfile();
  }, [user?.id]);

  // ─── Submit handlers ───────────────────────────────────────────────────────

  const handleSubmitStep1 = async () => {
    if (!user?.id) return;
    if (!step1Data.nameShop.trim()) {
      toast.error("El nombre del taller es requerido");
      return;
    }
    if (!step1Data.artisanHistory.trim()) {
      toast.error("La presentación breve es requerida");
      return;
    }
    if (!step1Data.ageExperience || step1Data.ageExperience === "0") {
      toast.error("Indica cuántos años de experiencia tienes");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await submitStep1Identity(user.id, step1Data);
      setProfile(updated);
      setIsPrefilled(false);
      toast.success("Bloque 1 guardado");
      setCurrentStep(2);
    } catch (err: any) {
      console.error("[Step1] save error:", err?.response?.data ?? err);
      toast.error("Error al guardar el bloque 1");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitStep2 = async () => {
    if (!user?.id) return;
    if (!step2Data.shopRangePayment) {
      toast.error(
        "Selecciona el rango de precio de tus productos (pregunta 1)",
      );
      return;
    }
    if (!step2Data.shopKnowledgeCost) {
      toast.error("Indica cómo defines tus precios (pregunta 2)");
      return;
    }
    if (!step2Data.shopKnowledgeDefineCost) {
      toast.error("Indica qué tan claro tienes tus costos (pregunta 3)");
      return;
    }
    if (!step2Data.shopKnowledgeIsProfitable) {
      toast.error(
        "Indica qué tan claro tienes si tu taller genera ganancias (pregunta 4)",
      );
      return;
    }
    setIsSaving(true);
    try {
      const updated = await submitStep2Commercial(user.id, step2Data);
      setProfile(updated);
      setIsPrefilled(false);
      toast.success("Bloque 2 guardado");
      setCurrentStep(3);
    } catch {
      toast.error("Error al guardar el bloque 2");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitStep3 = async () => {
    if (!user?.id) return;
    if (!step3Data.shopKnowledgeMainBuyerOne) {
      toast.error("Selecciona al menos un tipo de comprador (pregunta 1)");
      return;
    }
    if (!step3Data.shopKnowledgeDigitalPresence) {
      toast.error("Indica si tienes presencia digital (pregunta 2)");
      return;
    }
    if (!step3Data.shopKnowledgeWhereSaleOne) {
      toast.error("Selecciona al menos un canal de venta (pregunta 3)");
      return;
    }
    if (!step3Data.shopKnowledgeSalesActivity) {
      toast.error("Indica cómo es tu actividad de ventas (pregunta 4)");
      return;
    }
    setIsSaving(true);
    try {
      const updated = await submitStep3ClientMarket(user.id, step3Data);
      setProfile(updated);
      setIsPrefilled(false);
      toast.success("Bloque 3 guardado");
      setCurrentStep(4);
    } catch {
      toast.error("Error al guardar el bloque 3");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmitStep4 = async () => {
    if (!user?.id) return;
    if (!step4Data.shopKnowledgeProductsMakeMonth) {
      toast.error("Indica cuántos productos haces al mes (pregunta 1)");
      return;
    }
    if (!step4Data.shopKnowledgeLimitTodayOne) {
      toast.error("Selecciona al menos una limitación actual (pregunta 2)");
      return;
    }
    if (!step4Data.shopManyWorkers) {
      toast.error("Indica cuántas personas trabajan contigo (pregunta 3)");
      return;
    }
    if (!step4Data.shopFirstSolvingTelar.trim()) {
      toast.error("Cuéntanos cómo puede ayudarte TELAR (pregunta 4)");
      return;
    }
    setIsSaving(true);
    try {
      // Guardar el paso 4
      const updated = await submitStep4OperationGrowth(user.id, step4Data);
      setProfile(updated);
      setIsPrefilled(false);

      // Verificar que el perfil esté completo
      const completion = checkProfileCompletion(updated);

      if (completion.step4Complete && completion.isComplete) {
        // Perfil completo, procesar onboarding con el servicio de agentes
        try {
          const response = await processOnboarding(updated);
          console.log('[Onboarding] Respuesta del agente:', response);

          // Guardar la respuesta para mostrarla en el step 5
          setOnboardingResponse(response);

          toast.success("¡Perfil completado! Tu agente está siendo activado");
        } catch (onboardingError: any) {
          console.error('[Onboarding] Error al procesar onboarding:', onboardingError);
          // No bloqueamos el flujo si falla el onboarding, solo notificamos
          toast.warning("Perfil guardado. El agente se activará próximamente");
        }
      } else {
        toast.success("Bloque 4 guardado");
      }

      setCurrentStep(5);
    } catch {
      toast.error("Error al guardar el bloque 4");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateShopAndFinish = async () => {
    if (!user?.id) return;
    if (hasShop) {
      navigate("/dashboard");
      return;
    }
    if (!profile) return;
    setIsSaving(true);
    try {
      const finalSlug =
        shopSlug ||
        step1Data.nameShop
          .toLowerCase()
          .normalize("NFD")
          .replace(/[̀-ͯ]/g, "")
          .replace(/[^a-z0-9\s-]/g, "")
          .trim()
          .replace(/\s+/g, "-");
      await createArtisanShop({
        userId: user.id,
        shopName: step1Data.nameShop,
        shopSlug: finalSlug,
        creationStatus: "complete",
        creationStep: 0,
        description: step1Data.shopDescription,
        story: step1Data.shopHistory,
      });
      toast.success("¡Tu tienda ha sido creada exitosamente!");
      navigate("/dashboard");
    } catch (error: any) {
      const msg = error?.message || error?.error || "Error al crear la tienda";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // ─── Helpers ───────────────────────────────────────────────────────────────

  const selectedSpecial = [
    step1Data.shopSpecialDefinitionOne,
    step1Data.shopSpecialDefinitionTwo,
    step1Data.shopSpecialDefinitionThree,
  ].filter((v): v is string => !!v);

  const selectedBorn = [
    step1Data.shopBornSpecialDefinitionOne,
    step1Data.shopBornSpecialDefinitionTwo,
    step1Data.shopBornSpecialDefinitionThree,
  ].filter((v): v is string => !!v);

  const handleBornSelect = (value: string) => {
    const isSelected = selectedBorn.includes(value);
    let next: string[];
    if (isSelected) {
      next = selectedBorn.filter((v) => v !== value);
    } else if (selectedBorn.length < 3) {
      next = [...selectedBorn, value];
    } else {
      return;
    }
    setStep1Data({
      ...step1Data,
      shopBornSpecialDefinitionOne: next[0] ?? "",
      shopBornSpecialDefinitionTwo: next[1] ?? null,
      shopBornSpecialDefinitionThree: next[2] ?? null,
    });
  };

  // ─── Generic multi-select helpers for steps 3 & 4 ─────────────────────────

  const toggleBuyerOption = (opt: string) => {
    const sel = [
      step3Data.shopKnowledgeMainBuyerOne,
      step3Data.shopKnowledgeMainBuyerTwo,
      step3Data.shopKnowledgeMainBuyerThree,
    ].filter(Boolean) as string[];
    const isSelected = sel.includes(opt);
    const next = isSelected
      ? sel.filter((s) => s !== opt)
      : sel.length < 3
        ? [...sel, opt]
        : sel;
    setStep3Data({
      ...step3Data,
      shopKnowledgeMainBuyerOne: next[0] ?? "",
      shopKnowledgeMainBuyerTwo: next[1] ?? null,
      shopKnowledgeMainBuyerThree: next[2] ?? null,
    });
  };

  const toggleWhereSaleOption = (opt: string) => {
    const sel = [
      step3Data.shopKnowledgeWhereSaleOne,
      step3Data.shopKnowledgeWhereSaleTwo,
      step3Data.shopKnowledgeWhereSaleThree,
    ].filter(Boolean) as string[];
    const isSelected = sel.includes(opt);
    const next = isSelected
      ? sel.filter((s) => s !== opt)
      : sel.length < 3
        ? [...sel, opt]
        : sel;
    setStep3Data({
      ...step3Data,
      shopKnowledgeWhereSaleOne: next[0] ?? "",
      shopKnowledgeWhereSaleTwo: next[1] ?? null,
      shopKnowledgeWhereSaleThree: next[2] ?? null,
    });
  };

  const toggleLimitOption = (opt: string) => {
    const sel = [
      step4Data.shopKnowledgeLimitTodayOne,
      step4Data.shopKnowledgeLimitTodayTwo,
      step4Data.shopKnowledgeLimitTodayThree,
    ].filter(Boolean) as string[];
    const isSelected = sel.includes(opt);
    const next = isSelected
      ? sel.filter((s) => s !== opt)
      : sel.length < 3
        ? [...sel, opt]
        : sel;
    setStep4Data({
      ...step4Data,
      shopKnowledgeLimitTodayOne: next[0] ?? "",
      shopKnowledgeLimitTodayTwo: next[1] ?? null,
      shopKnowledgeLimitTodayThree: next[2] ?? null,
    });
  };

  // ─── Loading screen ────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: "#f9f7f2" }}
      >
        <div className="text-center">
          <div className="w-12 h-12 rounded-full border-2 border-[#ec6d13]/20 border-t-[#ec6d13] animate-spin mx-auto mb-4" />
          <p className="font-['Manrope'] text-[13px] text-[#54433e]/60">
            Cargando...
          </p>
        </div>
      </div>
    );
  }

  // ─── Oráculo panel ─────────────────────────────────────────────────────────

  const oracle = ORACLE[currentStep];

  const OraculoPanel = oracle ? (
    <section
      className="text-white flex flex-col relative overflow-hidden border border-white/10 shadow-lg rounded-xl p-5"
      style={{ background: "#151b2d", minHeight: 360 }}
    >
      <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6 shrink-0">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[16px] text-[#ec6d13]">
            psychology
          </span>
          <h3 className="font-['Noto_Serif'] text-[16px] font-[500] text-white">
            ORÁCULO
          </h3>
        </div>
        <div
          className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-white/10"
          style={{ background: "rgba(255,255,255,0.05)" }}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-[#ec6d13] animate-pulse" />
          <span className="text-[9px] font-[800] tracking-widest text-white/60 uppercase">
            Analizando
          </span>
        </div>
      </div>
      <div className="flex-1 flex flex-col gap-3">
        {oracle.cards.map(({ label, text }) => (
          <div
            key={label}
            className="p-4 rounded-lg"
            style={{
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.05)",
            }}
          >
            <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">
              {label}
            </p>
            <p className="text-[13px] text-white/80 leading-snug">{text}</p>
          </div>
        ))}
      </div>
      <div className="pt-5 border-t border-white/10 shrink-0 mt-4">
        <div className="flex items-start gap-2.5">
          <span className="material-symbols-outlined text-[14px] text-[#ec6d13] mt-0.5 shrink-0">
            lightbulb
          </span>
          <div>
            <p className="text-[9px] font-[800] uppercase tracking-widest text-white/30 mb-1">
              Próximo paso
            </p>
            <p className="text-[12px] text-white/60 leading-snug">
              {oracle.next}
            </p>
          </div>
        </div>
      </div>
    </section>
  ) : null;

  // ─── Step meta ─────────────────────────────────────────────────────────────

  const STEP_META: Record<
    number,
    { icon: string; title: string; subtitle: string }
  > = {
    1: {
      icon: "person",
      title: "Identidad Artesanal",
      subtitle: "Quién eres y qué hace especial tu trabajo",
    },
    2: {
      icon: "payments",
      title: "Realidad Comercial",
      subtitle: "Cómo funciona hoy la parte comercial de tu taller",
    },
    3: {
      icon: "groups",
      title: "Clientes y Mercado",
      subtitle: "Quiénes compran y dónde vendes",
    },
    4: {
      icon: "trending_up",
      title: "Operaciones y Crecimiento",
      subtitle: "Capacidad, limitaciones y metas",
    },
  };

  const stepMeta = STEP_META[currentStep] ?? STEP_META[1];

  // ─── Computed selected arrays ──────────────────────────────────────────────

  const selectedBuyers = [
    step3Data.shopKnowledgeMainBuyerOne,
    step3Data.shopKnowledgeMainBuyerTwo,
    step3Data.shopKnowledgeMainBuyerThree,
  ].filter(Boolean) as string[];
  const selectedWhereSale = [
    step3Data.shopKnowledgeWhereSaleOne,
    step3Data.shopKnowledgeWhereSaleTwo,
    step3Data.shopKnowledgeWhereSaleThree,
  ].filter(Boolean) as string[];
  const selectedLimits = [
    step4Data.shopKnowledgeLimitTodayOne,
    step4Data.shopKnowledgeLimitTodayTwo,
    step4Data.shopKnowledgeLimitTodayThree,
  ].filter(Boolean) as string[];

  return (
    <div
      className="min-h-screen pb-32 md:pb-10"
      style={{ background: "#f9f7f2" }}
    >
      {/* Sticky wizard header */}
      {currentStep <= 4 && (
        <div
          className="sticky top-0 z-30 border-b border-[#e2d5cf]/40"
          style={{
            background: "rgba(249,247,242,0.95)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
          }}
        >
          <WizardHeader
            step={currentStep}
            totalSteps={4}
            icon={stepMeta.icon}
            title={stepMeta.title}
            subtitle={stepMeta.subtitle}
            onBack={
              currentStep === 1
                ? () => navigate(-1)
                : () => setCurrentStep((prev) => prev - 1)
            }
            onLogout={handleLogout}
          />
        </div>
      )}

      <div className="max-w-[1200px] mx-auto px-4 pt-8">
        {/* Pre-fill banner */}
        {isPrefilled && currentStep <= 4 && <PrefillBanner />}

        {/* 2-column grid: content + oracle */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* ── Content column ── */}
          <div className="lg:col-span-7">
            {/* ── Step 1: Identidad Artesanal ───────────────────────────────────── */}
            {currentStep === 1 && (
              <div className="flex flex-col gap-5">
                {/* Contextual welcome/update message */}
                {isFirstTime === true ? (
                  <div
                    className="rounded-xl p-5"
                    style={{
                      background: "rgba(236,109,19,0.07)",
                      border: "1px solid rgba(236,109,19,0.2)",
                    }}
                  >
                    <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13] mb-2">
                      Bienvenido a TELAR
                    </p>
                    <h2 className="font-['Manrope'] text-[18px] font-[800] text-[#151b2d] mb-2">
                      Cuéntanos sobre ti para activar tu agente
                    </h2>
                    <p className="font-['Manrope'] text-[13px] text-[#54433e]/70 leading-relaxed">
                      Esta información es la base con la que tu agente de IA te
                      representará en el marketplace, generará contenido y te
                      hará recomendaciones personalizadas. Tómate unos minutos —
                      vale la pena.
                    </p>
                  </div>
                ) : isFirstTime === false ? (
                  <div
                    className="rounded-xl p-5"
                    style={{
                      background: "rgba(236,109,19,0.07)",
                      border: "1px solid rgba(236,109,19,0.2)",
                    }}
                  >
                    <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13] mb-2">
                      Actualización de TELAR
                    </p>
                    <h2 className="font-['Manrope'] text-[18px] font-[800] text-[#151b2d] mb-2">
                      Hemos actualizado la plataforma
                    </h2>
                    <p className="font-['Manrope'] text-[13px] text-[#54433e]/70 leading-relaxed">
                      Para que tu agente pueda trabajar contigo necesitamos que
                      completes este perfil. Hemos pre-llenado lo que ya
                      teníamos — solo revisa y confirma.
                    </p>
                  </div>
                ) : (
                  <div>
                    <p className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#ec6d13]/70 mb-1">
                      Bloque 1 de 4
                    </p>
                    <h2 className="font-['Manrope'] text-[20px] font-[800] text-[#151b2d]">
                      Identidad Artesanal
                    </h2>
                  </div>
                )}

                {/* Nombre del taller */}
                <div className="rounded-xl p-5" style={glassCard}>
                  <Label required>Nombre del taller</Label>
                  <input
                    type="text"
                    value={step1Data.nameShop}
                    onChange={(e) =>
                      setStep1Data({ ...step1Data, nameShop: e.target.value })
                    }
                    placeholder="Ej. Tejidos Zenú, Taller del Barro…"
                    className={inputCls}
                    style={inputBg}
                  />
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mt-2 leading-snug">
                    Este es el nombre que aparecerá en el marketplace de TELAR,
                    en tu tienda online y en todos los canales de venta.
                  </p>
                  <button
                    type="button"
                    onClick={() => setShowSlug((v) => !v)}
                    className="mt-4 flex items-center gap-2 group"
                  >
                    <div
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#e2d5cf]/60 group-hover:border-[#ec6d13]/40 transition-colors"
                      style={{ background: "rgba(84,67,62,0.04)" }}
                    >
                      <span className="material-symbols-outlined text-[14px] text-[#ec6d13]/70">
                        link
                      </span>
                      <span className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/55 group-hover:text-[#ec6d13] transition-colors">
                        {showSlug ? "Cerrar configurador" : "Configurar tu URL"}
                      </span>
                      <span
                        className="material-symbols-outlined text-[12px] text-[#54433e]/35 group-hover:text-[#ec6d13] transition-all"
                        style={{
                          transform: showSlug ? "rotate(180deg)" : "none",
                        }}
                      >
                        expand_more
                      </span>
                    </div>
                    {shopSlug && !showSlug && (
                      <span className="font-['Manrope'] text-[11px] text-[#54433e]/35 truncate max-w-[180px]">
                        /{shopSlug}
                      </span>
                    )}
                  </button>
                  {showSlug && (
                    <SlugCreator
                      artisticName={step1Data.nameShop}
                      currentSlug={shopSlug}
                      onSave={async (slug) => {
                        setShopSlug(slug);
                      }}
                    />
                  )}
                </div>

                {/* Presentación breve */}
                <section className="p-5 rounded-xl" style={glassCard}>
                  <p className="font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-[#ec6d13] mb-4">
                    Presentación pública
                  </p>
                  <div>
                    <label className="font-['Manrope'] text-[10px] font-[800] uppercase tracking-widest text-[#54433e]/60 block mb-2">
                      Presentación breve{" "}
                      <span className="text-[#ef4444]">*</span>
                    </label>
                    <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-3 leading-snug">
                      Quién eres, qué haces y qué hace especial tu oficio.
                      Máximo 2–3 oraciones.
                    </p>
                    <SpeechTextarea
                      rows={4}
                      value={step1Data.artisanHistory}
                      onChange={(v) =>
                        setStep1Data({ ...step1Data, artisanHistory: v })
                      }
                      placeholder="Quién eres, qué haces y qué hace especial tu oficio. Máximo 2–3 oraciones."
                      className="w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70"
                      style={{ background: "rgba(247,244,239,0.4)" }}
                    />
                  </div>
                </section>

                {/* ¿Cuándo empezó este camino? */}
                <section className="p-6 rounded-xl" style={glassCard}>
                  <p className="font-['Manrope'] text-[12px] font-[700] text-[#151b2d] mb-1">
                    ¿Cuantos años de experiencia tienes?
                    <span className="text-[#ef4444] ml-1">*</span>
                  </p>
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
                    No necesitas ser exacto. Elige lo que más se acerque a tu
                    historia.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {WHEN_OPTIONS.map((opt) => {
                      const isActive = step1Data.ageExperience === String(opt.age);
                      return (
                        <button
                          key={opt.label}
                          type="button"
                          onClick={() =>
                            setStep1Data({
                              ...step1Data,
                              ageExperience: isActive ? "0" : String(opt.age),
                            })
                          }
                          className="px-4 py-2 rounded-full font-['Manrope'] text-[12px] font-[600] transition-all"
                          style={{
                            background: isActive
                              ? "#ec6d13"
                              : "rgba(236,109,19,0.06)",
                            color: isActive ? "#ffffff" : "#ec6d13",
                            border: isActive
                              ? "1.5px solid #ec6d13"
                              : "1px solid rgba(236,109,19,0.3)",
                          }}
                        >
                          {opt.label}
                        </button>
                      );
                    })}
                  </div>
                  {!showPreciseAge ? (
                    <button
                      type="button"
                      onClick={() => setShowPreciseAge(true)}
                      className="font-['Manrope'] text-[11px] text-[#54433e]/35 hover:text-[#ec6d13] transition-colors underline-offset-2 hover:underline"
                    >
                      Quiero añadir una edad aproximada
                    </button>
                  ) : (
                    <div className="flex items-center gap-3 mt-2">
                      <label className="font-['Manrope'] text-[11px] text-[#54433e]/50 whitespace-nowrap">
                        Edad aproximada:
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={99}
                        value={step1Data.ageExperience || ""}
                        onChange={(e) =>
                          setStep1Data({
                            ...step1Data,
                            ageExperience: e.target.value || "0",
                          })
                        }
                        placeholder="Ej. 12"
                        className="w-24 rounded-lg px-3 py-2 font-['Manrope'] text-[13px] text-[#151b2d] border border-[#e2d5cf]/40 focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 transition-all"
                        style={{ background: "rgba(247,244,239,0.4)" }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPreciseAge(false)}
                        className="text-[#54433e]/30 hover:text-[#54433e]/60 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          close
                        </span>
                      </button>
                    </div>
                  )}
                </section>

                {/* Historia del taller */}
                <section className="p-6 rounded-xl" style={glassCard}>
                  <p className="font-['Manrope'] text-[12px] font-[700] text-[#151b2d] mb-1">
                    Cuéntanos cómo comenzó este camino
                  </p>
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-3 leading-snug">
                    Puedes contarnos quién influyó en ti, cómo aprendiste y qué
                    hizo que este oficio se volviera importante para ti.
                  </p>
                  <SpeechTextarea
                    rows={5}
                    value={step1Data.shopHistory}
                    onChange={(v) =>
                      setStep1Data({ ...step1Data, shopHistory: v })
                    }
                    placeholder="Mi abuelo tejía desde que yo era pequeño y crecí viendo el telar en la casa. Años después decidí retomarlo y convertirlo en mi oficio…"
                    className="w-full border border-[#e2d5cf]/40 p-4 text-[14px] font-['Manrope'] text-[#54433e] focus:outline-none focus:border-[#ec6d13]/50 focus:ring-2 focus:ring-[#ec6d13]/10 resize-none transition-all leading-relaxed rounded-lg hover:border-[#e2d5cf]/70"
                    style={inputBg}
                  />
                </section>

                {/* Tipos de productos */}
                <div className="rounded-xl p-5" style={glassCard}>
                  <Label required>¿Qué tipos de productos creas?</Label>
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-3 leading-snug">
                    Describe los objetos que produces: qué son, para qué sirven,
                    en qué materiales, tamaños o formatos los haces. Entre más
                    específico, mejor te representará el agente en el
                    marketplace.
                  </p>
                  <SpeechTextarea
                    value={step1Data.shopDescription}
                    onChange={(v) =>
                      setStep1Data({ ...step1Data, shopDescription: v })
                    }
                    className={inputCls}
                    style={inputBg}
                    placeholder="Ej. Bolsos tejidos en fique con asas de cuero, en tres tamaños. También hago individuales y portavasos para cocina. Todos son piezas únicas, sin patrones repetidos."
                    rows={4}
                  />
                </div>

                {/* ¿Qué significa para ti? */}
                <div className="rounded-xl p-5" style={glassCard}>
                  <Label required>¿Qué significa para ti lo que haces?</Label>
                  <SpeechTextarea
                    value={step1Data.shopDefinition}
                    onChange={(v) =>
                      setStep1Data({ ...step1Data, shopDefinition: v })
                    }
                    className={inputCls}
                    style={inputBg}
                    placeholder="¿Qué representa tu trabajo para ti?"
                    rows={3}
                  />
                </div>

                {/* Categorías */}
                <div className="rounded-xl p-5" style={glassCard}>
                  <Label required>Categorías de tu taller</Label>
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug mb-4">
                    ¿En qué tipos de productos trabaja tu taller? Puedes elegir
                    varias categorías.
                  </p>
                  <CategoryMultiPicker
                    selectedIds={
                      step1Data.shopCategoriesId
                        ? step1Data.shopCategoriesId.split(",").filter(Boolean)
                        : []
                    }
                    onChange={(ids) =>
                      setStep1Data({
                        ...step1Data,
                        shopCategoriesId: ids.join(","),
                      })
                    }
                    onNamesChange={() => {}}
                  />
                </div>

                {/* ¿Qué te hace especial? */}
                <div className="rounded-xl p-5" style={glassCard}>
                  <Label required>¿Qué te hace especial?</Label>
                  <div className="flex flex-wrap gap-2">
                    {DIFFERENTIATORS.map((d) => {
                      const storedVal =
                        DIFFERENTIATOR_STORED_LABELS[d.value] ?? d.value;
                      const isActive = selectedSpecial.includes(storedVal);
                      return (
                        <button
                          key={d.value}
                          type="button"
                          onClick={() => {
                            const isExclusive = d.value === "aun_no_lo_se";
                            const exclusiveStored =
                              DIFFERENTIATOR_STORED_LABELS["aun_no_lo_se"];
                            const hasExclusive =
                              selectedSpecial.includes(exclusiveStored);
                            let next: string[];
                            if (isActive) {
                              next = selectedSpecial.filter(
                                (v) => v !== storedVal,
                              );
                            } else if (isExclusive) {
                              next = [storedVal];
                            } else if (hasExclusive) {
                              next = [storedVal];
                            } else if (selectedSpecial.length < 3) {
                              next = [...selectedSpecial, storedVal];
                            } else {
                              return;
                            }
                            setStep1Data({
                              ...step1Data,
                              shopSpecialDefinitionOne: next[0] ?? "",
                              shopSpecialDefinitionTwo: next[1] ?? null,
                              shopSpecialDefinitionThree: next[2] ?? null,
                            });
                          }}
                          className="px-4 py-2 rounded-full font-['Manrope'] text-[12px] font-[600] transition-all"
                          style={{
                            background: isActive
                              ? "#ec6d13"
                              : "rgba(236,109,19,0.06)",
                            color: isActive ? "#ffffff" : "#ec6d13",
                            border: isActive
                              ? "1.5px solid #ec6d13"
                              : "1px solid rgba(236,109,19,0.3)",
                          }}
                        >
                          {d.label}
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/40 mt-2">
                    Selecciona hasta 3 opciones
                  </p>
                </div>

                {/* ¿De dónde nace tu oficio? */}
                <section className="p-6 rounded-xl" style={glassCard}>
                  <p className="font-['Manrope'] text-[12px] font-[700] text-[#151b2d] mb-1">
                    ¿Qué marcó el inicio de tu oficio?
                    <span className="text-[#ef4444] ml-1">*</span>
                  </p>
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/45 mb-4 leading-snug">
                    Elige la opción que mejor describe cómo llegaste a este
                    camino.
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {LEARNED_FROM_OPTIONS.map((opt) => {
                      const storedVal =
                        LEARNED_FROM_STORED_LABEL[opt.value] ?? opt.label;
                      const isActive = selectedBorn.includes(storedVal);
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => handleBornSelect(storedVal)}
                          className="flex items-start gap-3 px-4 py-3 rounded-xl text-left transition-all"
                          style={{
                            background: isActive
                              ? "rgba(236,109,19,0.06)"
                              : "rgba(247,244,239,0.5)",
                            border: isActive
                              ? "1.5px solid rgba(236,109,19,0.45)"
                              : "1px solid rgba(226,213,207,0.5)",
                          }}
                        >
                          <span
                            className="material-symbols-outlined text-[20px] shrink-0 mt-0.5"
                            style={{
                              color: isActive
                                ? "#ec6d13"
                                : "rgba(84,67,62,0.35)",
                            }}
                          >
                            {opt.icon}
                          </span>
                          <div className="flex-1 min-w-0">
                            <span
                              className="font-['Manrope'] text-[13px] font-[700] block leading-tight mb-0.5"
                              style={{
                                color: isActive ? "#ec6d13" : "#151b2d",
                              }}
                            >
                              {opt.label}
                            </span>
                            <span className="font-['Manrope'] text-[11px] text-[#54433e]/45 leading-snug">
                              {opt.desc}
                            </span>
                          </div>
                          <div
                            className="w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 flex items-center justify-center transition-colors"
                            style={{
                              borderColor: isActive
                                ? "#ec6d13"
                                : "rgba(84,67,62,0.2)",
                            }}
                          >
                            {isActive && (
                              <div className="w-2 h-2 rounded-full bg-[#ec6d13]" />
                            )}
                          </div>
                        </button>
                      );
                    })}
                  </div>
                  <p className="font-['Manrope'] text-[11px] text-[#54433e]/40 mt-3">
                    Selecciona hasta 3 opciones
                  </p>
                </section>
              </div>
            )}

            {/* ── Step 2: Realidad Comercial ─────────────────────────────────────── */}
            {currentStep === 2 && (
              <div className="flex flex-col gap-5">
                <StepSectionHeader
                  block={2}
                  title="Realidad Comercial"
                  subtitle="Cómo funciona hoy la parte comercial de tu taller"
                />

                {/* Intro */}
                <div
                  className="rounded-xl px-5 py-4 flex items-start gap-3"
                  style={{
                    background: "rgba(236,109,19,0.05)",
                    border: "1px solid rgba(236,109,19,0.15)",
                  }}
                >
                  <span className="material-symbols-outlined text-[18px] text-[#ec6d13] shrink-0 mt-0.5">
                    info
                  </span>
                  <div>
                    <p className="font-['Manrope'] text-[13px] text-[#54433e] leading-relaxed">
                      No buscamos respuestas perfectas ni conocimientos
                      técnicos. Queremos entender cómo vendes, cómo calculas tus
                      precios y qué tan claro tienes el funcionamiento económico
                      de tu taller.
                    </p>
                    <p className="font-['Manrope'] text-[12px] font-[600] text-[#ec6d13] mt-2">
                      Responde según tu realidad actual.
                    </p>
                  </div>
                </div>

                {/* P1 — Rango de precio */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={1}
                    question="¿En qué rango de precio vendes la mayoría de tus productos?"
                    hint="Esto nos ayuda a entender el tipo de mercado en el que compites y qué oportunidades comerciales podrían existir para tu taller."
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {PRICE_RANGE_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={step2Data.shopRangePayment === opt.label}
                        onClick={() =>
                          setStep2Data({
                            ...step2Data,
                            shopRangePayment: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>

                {/* P2 — Cómo pone precios */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={2}
                    question="Cuando pones precio a tus productos, ¿cómo lo haces normalmente?"
                    hint="No existe una única forma correcta. Queremos entender cómo tomas esa decisión hoy."
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {COST_KNOWLEDGE_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        desc={opt.desc}
                        selected={step2Data.shopKnowledgeCost === opt.label}
                        onClick={() =>
                          setStep2Data({
                            ...step2Data,
                            shopKnowledgeCost: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>

                {/* P3 — Claridad sobre costos */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={3}
                    question="¿Qué tan claro tienes cuánto te cuesta hacer cada producto?"
                    hint="Para saber si un producto deja ganancia, primero hay que entender cuánto cuesta hacerlo. Incluye materiales, tiempo, transporte, empaques u otros gastos del taller."
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {DEFINE_COST_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        desc={opt.desc}
                        selected={
                          step2Data.shopKnowledgeDefineCost === opt.label
                        }
                        onClick={() =>
                          setStep2Data({
                            ...step2Data,
                            shopKnowledgeDefineCost: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>

                {/* P4 — Claridad sobre ganancias */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={4}
                    question="¿Qué tan claro tienes si tu taller realmente genera ganancias?"
                    hint="Muchas personas venden constantemente, pero no siempre saben cuánto dinero les queda después de cubrir sus costos."
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {PROFITABLE_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        desc={opt.desc}
                        selected={
                          step2Data.shopKnowledgeIsProfitable === opt.label
                        }
                        onClick={() =>
                          setStep2Data({
                            ...step2Data,
                            shopKnowledgeIsProfitable: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ── Step 3: Clientes y Mercado ─────────────────────────────────────── */}
            {currentStep === 3 && (
              <div className="flex flex-col gap-5">
                <StepSectionHeader
                  block={3}
                  title="Clientes y Mercado"
                  subtitle="Quiénes compran tu trabajo y dónde lo vendes"
                />

                {/* P1 — Compradores */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={1}
                    question="¿Quiénes son tus principales compradores?"
                    hint="Saber quiénes son tus clientes permite al agente crear mensajes dirigidos exactamente a las personas que ya valoran tu trabajo."
                    required
                    multiSelect
                    maxSelect={3}
                  />
                  <div className="flex flex-col gap-2">
                    {BUYER_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={selectedBuyers.includes(opt.label)}
                        onClick={() => toggleBuyerOption(opt.label)}
                        multiSelect
                      />
                    ))}
                  </div>
                </section>

                {/* P2 — Presencia digital */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={2}
                    question="¿Tienes presencia digital?"
                    hint="Redes sociales, sitio web, tienda online o cualquier canal donde se pueda encontrar tu trabajo."
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {DIGITAL_PRESENCE_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={
                          step3Data.shopKnowledgeDigitalPresence === opt.label
                        }
                        onClick={() =>
                          setStep3Data({
                            ...step3Data,
                            shopKnowledgeDigitalPresence: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>

                {/* P3 — Dónde vendes */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={3}
                    question="¿Dónde vendes actualmente?"
                    hint="Conocer dónde vendes permite al agente priorizar acciones donde ya tienes presencia y sugerir nuevos canales de expansión."
                    required
                    multiSelect
                    maxSelect={3}
                  />
                  <div className="flex flex-col gap-2">
                    {WHERE_SELL_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={selectedWhereSale.includes(opt.label)}
                        onClick={() => toggleWhereSaleOption(opt.label)}
                        multiSelect
                      />
                    ))}
                  </div>
                </section>

                {/* P4 — Actividad de ventas */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={4}
                    question="¿Cómo es tu actividad de ventas a lo largo del año?"
                    hint="El ritmo de ventas ayuda al agente a identificar estacionalidades y planificar campañas en los momentos de mayor oportunidad."
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {SALES_ACTIVITY_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={
                          step3Data.shopKnowledgeSalesActivity === opt.label
                        }
                        onClick={() =>
                          setStep3Data({
                            ...step3Data,
                            shopKnowledgeSalesActivity: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* ── Step 4: Operaciones y Crecimiento ────────────────────────────── */}
            {currentStep === 4 && (
              <div className="flex flex-col gap-5">
                <StepSectionHeader
                  block={4}
                  title="Operaciones y Crecimiento"
                  subtitle="Capacidad productiva, limitaciones y tus metas con TELAR"
                />

                {/* P1 — Cuántos productos al mes */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={1}
                    question="¿Cuántos productos haces aproximadamente al mes?"
                    hint="El agente evitará recomendaciones que superen tu capacidad actual y te sugerirá formas de crecer de manera sostenible."
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {PRODUCTS_MONTH_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={
                          step4Data.shopKnowledgeProductsMakeMonth === opt.label
                        }
                        onClick={() =>
                          setStep4Data({
                            ...step4Data,
                            shopKnowledgeProductsMakeMonth: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>

                {/* P2 — Limitaciones */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={2}
                    question="¿Cuáles son tus principales limitaciones hoy?"
                    hint="El agente diseñará un plan de acción que atiende primero lo que más te frena, con pasos concretos y alcanzables desde donde estás."
                    required
                    multiSelect
                    maxSelect={3}
                  />
                  <div className="flex flex-col gap-2">
                    {LIMIT_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={selectedLimits.includes(opt.label)}
                        onClick={() => toggleLimitOption(opt.label)}
                        multiSelect
                      />
                    ))}
                  </div>
                </section>

                {/* P3 — Cuántas personas */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={3}
                    question="¿Cuántas personas trabajan contigo en el taller?"
                    required
                  />
                  <div className="flex flex-col gap-2">
                    {WORKERS_OPTIONS.map((opt) => (
                      <IconOptionCard
                        key={opt.label}
                        icon={opt.icon}
                        label={opt.label}
                        selected={step4Data.shopManyWorkers === opt.label}
                        onClick={() =>
                          setStep4Data({
                            ...step4Data,
                            shopManyWorkers: opt.label,
                          })
                        }
                      />
                    ))}
                  </div>
                </section>

                {/* P4 — Cómo puede ayudar TELAR */}
                <section className="rounded-xl p-5" style={glassCard}>
                  <QuestionHeader
                    n={4}
                    question="¿Qué es lo primero que quieres resolver con TELAR?"
                    hint="Con todo el contexto completo, TELAR activará los agentes más relevantes para las necesidades reales de tu taller."
                    required
                  />
                  <SpeechTextarea
                    value={step4Data.shopFirstSolvingTelar}
                    onChange={(v) =>
                      setStep4Data({ ...step4Data, shopFirstSolvingTelar: v })
                    }
                    className={inputCls}
                    style={inputBg}
                    placeholder="¿Qué esperas de TELAR? Puedes ser tan específico como quieras."
                    rows={4}
                  />
                </section>
              </div>
            )}

            {/* ── Step 5: Completado ─────────────────────────────────────────── */}
            {currentStep === 5 && (
              <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
                {/* Mensaje del agente */}
                {onboardingResponse && (
                  <div
                    className="rounded-2xl p-8"
                    style={{
                      background: "#151b2d",
                      border: "1px solid rgba(236,109,19,0.3)",
                    }}
                  >
                    <div className="flex items-center gap-2 mb-6">
                      <span className="material-symbols-outlined text-[#ec6d13] text-[22px]">
                        psychology
                      </span>
                      <h3 className="font-['Manrope'] text-[13px] font-[800] uppercase tracking-widest text-[#ec6d13]">
                        Análisis de tu perfil
                      </h3>
                    </div>

                    <h2 className="font-['Noto_Serif'] text-[24px] font-[600] text-white mb-4">
                      {onboardingResponse.onboarding_response.message.title}
                    </h2>

                    <p className="font-['Manrope'] text-[15px] text-white/80 leading-relaxed mb-6">
                      {onboardingResponse.onboarding_response.message.body}
                    </p>

                    {/* Nivel de madurez */}
                    <div className="mb-6 p-5 rounded-xl" style={{ background: "rgba(236,109,19,0.1)" }}>
                      <p className="font-['Manrope'] text-[11px] font-[800] uppercase tracking-widest text-[#ec6d13]/70 mb-2">
                        Nivel de madurez
                      </p>
                      <p className="font-['Manrope'] text-[16px] font-[700] text-[#ec6d13] capitalize">
                        {onboardingResponse.onboarding_response.maturity_level.replace('_', ' ')}
                      </p>
                    </div>

                    {/* Recomendaciones */}
                    {onboardingResponse.onboarding_response.next_priority_action.recommendations.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-4">
                          <span className="material-symbols-outlined text-[#ec6d13] text-[18px]">
                            lightbulb
                          </span>
                          <h4 className="font-['Manrope'] text-[12px] font-[800] uppercase tracking-widest text-white/70">
                            Próximos pasos recomendados
                          </h4>
                        </div>
                        <ul className="space-y-3">
                          {onboardingResponse.onboarding_response.next_priority_action.recommendations.map((rec, idx) => (
                            <li
                              key={idx}
                              className="flex items-start gap-3 font-['Manrope'] text-[14px] text-white/80 leading-relaxed"
                            >
                              <span className="text-[#ec6d13] shrink-0 mt-1">•</span>
                              <span>{rec}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}

                {/* Card de acción */}
                <div
                  className="rounded-2xl p-10 flex flex-col items-center gap-6 text-center"
                  style={glassCard}
                >
                  {/* Icono */}
                  <div
                    className="w-20 h-20 rounded-full flex items-center justify-center"
                    style={{ background: "rgba(236,109,19,0.1)" }}
                  >
                    <span className="material-symbols-outlined text-[#ec6d13] text-[36px]">
                      {hasShop ? "autorenew" : "check_circle"}
                    </span>
                  </div>

                  {hasShop ? (
                    /* ── Usuario ya tiene tienda: actualizó su perfil ── */
                    <>
                      <div className="max-w-md">
                        <h2 className="font-['Noto_Serif'] text-[26px] font-[600] text-[#151b2d] mb-3">
                          ¡Información actualizada!
                        </h2>
                        <p className="font-['Manrope'] text-[15px] text-[#54433e]/65 leading-relaxed">
                          Tu agente TELAR ya tiene los datos más recientes sobre
                          tu taller para representarte mejor y darte
                          recomendaciones más precisas.
                        </p>
                      </div>
                      <button
                        onClick={() => navigate("/dashboard")}
                        className="flex items-center gap-2 px-10 py-4 rounded-xl font-['Manrope'] text-[15px] font-[700] text-white transition-all hover:opacity-90"
                        style={{ background: "#151b2d" }}
                      >
                        <span>Volver al dashboard</span>
                        <span className="material-symbols-outlined text-[20px]">
                          arrow_forward
                        </span>
                      </button>
                    </>
                  ) : (
                    /* ── Primera vez: crear tienda y activar agente ── */
                    <>
                      <div className="max-w-md">
                        <h2 className="font-['Noto_Serif'] text-[26px] font-[600] text-[#151b2d] mb-3">
                          ¡Todo listo! Activando tu agente
                        </h2>
                        <p className="font-['Manrope'] text-[15px] text-[#54433e]/65 leading-relaxed">
                          Con la información que compartiste vamos a crear tu
                          espacio en el marketplace de TELAR y activar tu agente
                          de IA.
                        </p>
                      </div>
                      <button
                        onClick={handleCreateShopAndFinish}
                        disabled={isSaving}
                        className="flex items-center gap-2 px-10 py-4 rounded-xl font-['Manrope'] text-[15px] font-[700] text-white transition-all hover:opacity-90 disabled:opacity-50"
                        style={{ background: "#ec6d13" }}
                      >
                        {isSaving ? (
                          <>
                            <span className="material-symbols-outlined text-[20px] animate-spin">
                              progress_activity
                            </span>
                            <span>Creando tu tienda...</span>
                          </>
                        ) : (
                          <>
                            <span>Crear mi tienda y entrar</span>
                            <span className="material-symbols-outlined text-[20px]">
                              arrow_forward
                            </span>
                          </>
                        )}
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
          {/* end content column */}

          {/* ── Oracle column (desktop only) ── */}
          {oracle && (
            <div className="hidden lg:block lg:col-span-5 sticky top-20">
              {OraculoPanel}
            </div>
          )}
        </div>
        {/* end 2-column grid */}
      </div>

      {/* ── Wizard footer ───────────────────────────────────────────────────── */}
      {currentStep <= 4 && (
        <WizardFooter
          step={currentStep}
          totalSteps={4}
          onBack={
            currentStep === 1
              ? () => navigate(-1)
              : () => setCurrentStep((prev) => prev - 1)
          }
          onNext={
            currentStep === 1
              ? handleSubmitStep1
              : currentStep === 2
                ? handleSubmitStep2
                : currentStep === 3
                  ? handleSubmitStep3
                  : handleSubmitStep4
          }
          nextLabel={currentStep === 4 ? "Finalizar" : "Guardar y continuar"}
          nextDisabled={isSaving}
          isFinalStep={currentStep === 4}
          onSubmit={handleSubmitStep4}
          isSubmitting={isSaving}
          submitLabel="Finalizar perfil"
        />
      )}

      {/* ── Mobile oracle drawer ──────────────────────────────────────────── */}
      {oracle && (
        <div
          className="lg:hidden fixed left-0 right-0 z-30"
          style={{ bottom: currentStep <= 4 ? 52 : 0 }}
        >
          <div
            style={{
              overflow: "hidden",
              maxHeight: oraculoOpen ? "55vh" : 0,
              transition: "max-height 0.28s ease",
            }}
          >
            <div
              style={{
                overflowY: "auto",
                maxHeight: "55vh",
                background: "#151b2d",
                borderRadius: "16px 16px 0 0",
                padding: "20px",
              }}
            >
              <div className="flex flex-col gap-3 mb-5">
                {oracle.cards.map(({ label, text }) => (
                  <div
                    key={label}
                    className="p-4 rounded-lg"
                    style={{
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.05)",
                    }}
                  >
                    <p className="text-[9px] font-[800] uppercase tracking-widest text-white/40 mb-1.5">
                      {label}
                    </p>
                    <p className="text-[13px] text-white/80 leading-snug">
                      {text}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex items-start gap-2.5 pt-4 border-t border-white/10">
                <span className="material-symbols-outlined text-[14px] text-[#ec6d13] mt-0.5 shrink-0">
                  lightbulb
                </span>
                <div>
                  <p className="text-[9px] font-[800] uppercase tracking-widest text-white/30 mb-1">
                    Próximo paso
                  </p>
                  <p className="text-[12px] text-white/60 leading-snug">
                    {oracle.next}
                  </p>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={() => setOraculoOpen((v) => !v)}
            className="w-full flex items-center justify-between px-5"
            style={{
              background: "#151b2d",
              height: 46,
              borderTopLeftRadius: oraculoOpen ? 0 : 14,
              borderTopRightRadius: oraculoOpen ? 0 : 14,
              borderTop: oraculoOpen
                ? "1px solid rgba(255,255,255,0.08)"
                : "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span
                className="material-symbols-outlined"
                style={{ color: "#ec6d13", fontSize: 16 }}
              >
                psychology
              </span>
              <span
                style={{
                  fontFamily: "'Manrope', sans-serif",
                  fontSize: 12,
                  fontWeight: 700,
                  color: "rgba(255,255,255,0.85)",
                  letterSpacing: "0.02em",
                }}
              >
                ORÁCULO
              </span>
            </div>
            <span
              className="material-symbols-outlined"
              style={{
                color: "rgba(255,255,255,0.35)",
                fontSize: 18,
                transform: oraculoOpen ? "rotate(180deg)" : "none",
                transition: "transform 0.25s ease",
              }}
            >
              expand_less
            </span>
          </button>
        </div>
      )}
    </div>
  );
};

export default AgentFormPage;
