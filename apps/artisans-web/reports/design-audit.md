# Auditoría de design tokens — artisans-web

Generado: 2026-06-09 · `node scripts/audit-design-tokens.mjs`

## Totales

| Patrón | Instancias |
|---|---:|
| rgb()/rgba() inline en style | 1667 |
| Hex hardcodeado en className | 1420 |
| Tamaño arbitrario text-[Npx] | 992 |
| Familia inline font-['...'] | 341 |
| Glass inline (backdrop-blur + bg-white/N) | 89 |
| **Total** | **4509** |

(263 coincidencias excluidas por ser SVG fills / datos de gráficos)

## Top colores hex → token sugerido

| Hex | Usos | Token sugerido |
|---|---:|---|
| `#54433e` | 353 | on-surface-variant |
| `#ec6d13` | 341 | brand-orange |
| `#151b2d` | 188 | on-surface |
| `#e2d5cf` | 91 | brand-border |
| `#ef4444` | 52 | destructive (ya existe) |
| `#166534` | 30 | accent-green |
| `#7c3aed` | 23 | domain-business |
| `#15803d` | 18 | domain-moderation |
| `#3b82f6` | 17 | — |
| `#dc2626` | 15 | — |
| `#6b7280` | 14 | — |
| `#b45309` | 12 | — |
| `#0369a1` | 11 | — |
| `#d97706` | 10 | — |
| `#142239` | 9 | navy / primary (ya existe) |
| `#e5e7eb` | 9 | — |
| `#374151` | 8 | — |
| `#9ca3af` | 8 | — |
| `#8b5cf6` | 8 | — |
| `#22c55e` | 7 | — |
| `#6366f1` | 7 | — |
| `#ffffff` | 7 | white (usar bg-white) |
| `#f59e0b` | 7 | — |
| `#2563eb` | 7 | — |
| `#eab308` | 6 | — |

## Archivos con más violaciones

| Archivo | Total | hex | rgba | text-px | font | glass |
|---|---:|---:|---:|---:|---:|---:|
| src/pages/growth/AgentFormPage.tsx | 251 | 83 | 39 | 77 | 52 |  |
| src/components/shop/wizards/artisan-profile/Step7Preview.tsx | 190 | 56 | 29 | 59 | 46 |  |
| src/components/shop/new-product-wizard/steps/Step3ProcessTime.tsx | 160 | 70 | 22 | 56 | 12 |  |
| src/components/shop/new-product-wizard/steps/Step4PriceLogistics.tsx | 156 | 57 | 28 | 56 | 15 |  |
| src/components/shop/wizards/artisan-profile/Step1Identity.tsx | 148 | 58 | 16 | 47 | 27 |  |
| src/components/shop/wizards/artisan-profile/Step5Craft.tsx | 146 | 60 | 31 | 41 | 14 |  |
| src/components/dashboard/CommercialDashboard.tsx | 143 | 17 | 110 | 16 |  |  |
| src/pages/ShopConfigDashboard.tsx | 128 | 4 | 121 | 3 |  |  |
| src/components/shop/new-product-wizard/steps/Step6FinalReview.tsx | 127 | 35 | 12 | 39 | 41 |  |
| src/components/shop/new-product-wizard/steps/Step1NewPiece.tsx | 124 | 56 | 15 | 45 | 8 |  |
| src/components/shop/new-product-wizard/components/TaxonomyPicker.tsx | 115 | 60 | 14 | 41 |  |  |
| src/components/shop/wizards/artisan-profile/Step2Origin.tsx | 112 | 40 | 17 | 30 | 25 |  |
| src/components/shop/new-product-wizard/steps/Step2ArtisanalIdentity.tsx | 111 | 38 | 22 | 40 | 11 |  |
| src/pages/backoffice/BackofficeCmsPage.tsx | 106 | 26 | 33 | 47 |  |  |
| src/components/shop/new-product-wizard/steps/Step5DigitalPassport.tsx | 105 | 35 | 13 | 29 | 28 |  |
| src/components/shop/new-product-wizard/components/CraftPicker.tsx | 87 | 43 | 6 | 38 |  |  |
| src/components/studio/StudioProductEditor.tsx | 87 | 24 | 3 | 44 | 16 |  |
| src/pages/TallerStatusPage.tsx | 77 | 6 | 71 |  |  |  |
| src/pages/InventoryPage.tsx | 63 | 13 | 46 | 4 |  |  |
| src/pages/backoffice/BackofficeMarketplaceHealthPage.tsx | 61 | 6 | 55 |  |  |  |
| src/pages/ShopSalesPage.tsx | 61 | 12 | 49 |  |  |  |
| src/components/cms/SectionPreview.tsx | 58 | 28 | 3 | 27 |  |  |
| src/pages/backoffice/BackofficeDashboardPage.tsx | 57 | 2 | 55 |  |  |  |
| src/components/shop/wizards/artisan-profile/Step4Workshop.tsx | 54 | 24 | 7 | 17 | 6 |  |
| src/pages/config-wizards/BrandIdentityWizardPage.tsx | 53 | 19 | 3 | 19 | 12 |  |
| src/pages/backoffice/BackofficeTiendaDetailPage.tsx | 52 | 5 | 47 |  |  |  |
| src/components/cms/preview/CmsMarketplaceRenderer.tsx | 48 | 1 | 21 | 26 |  |  |
| src/pages/backoffice/BackofficeConveniosPage.tsx | 46 | 6 | 40 |  |  |  |
| src/pages/backoffice/BackofficeHomePage.tsx | 45 | 3 | 42 |  |  |  |
| src/pages/admin/ProductStudioPage.tsx | 37 | 17 | 11 | 8 | 1 |  |
| src/components/backoffice/taxonomy/TaxonomyModeracionTab.tsx | 35 | 11 | 24 |  |  |  |
| src/components/shop/wizards/artisan-profile/ArtisanStepShell.tsx | 35 | 7 | 10 | 16 | 2 |  |
| src/pages/CmsAdminPage.tsx | 35 | 3 | 32 |  |  |  |
| src/components/moderation/ModerationShopDetailView.tsx | 34 |  | 33 | 1 |  |  |
| src/components/shop/new-product-wizard/NewProductWizard.tsx | 34 | 10 | 12 | 5 | 7 |  |
| src/components/shop/mobile/MobileShopConfig.tsx | 33 | 2 | 31 |  |  |  |
| src/pages/backoffice/BackofficeTaxonomiaPage.tsx | 33 | 12 | 21 |  |  |  |
| src/pages/NotificationsPage.tsx | 33 | 9 | 24 |  |  |  |
| src/components/backoffice/taxonomy/TaxonomyTecnicasTab.tsx | 29 | 26 | 3 |  |  |  |
| src/components/backoffice/taxonomy/TaxonomyCrudTab.tsx | 28 | 26 | 2 |  |  |  |
| src/pages/admin/ModerationOSPage.tsx | 28 |  | 20 | 8 |  |  |
| src/components/moderation/ReviewerWorkspace/WorkspaceLeft.tsx | 27 |  | 27 |  |  |  |
| src/pages/HeroSliderWizardPage.tsx | 27 | 27 |  |  |  |  |
| src/components/cms/ImageUploadField.tsx | 26 | 17 | 2 | 6 | 1 |  |
| src/components/cms/SectionFormFields.tsx | 26 | 15 | 5 | 5 | 1 |  |
| src/components/moderation/IntelligentQueue/QueueCard.tsx | 26 | 9 |  | 17 |  |  |
| src/components/onboarding/Block1Artisan.tsx | 24 | 15 |  | 5 | 4 |  |
| src/pages/config-wizards/ContactLocationWizardPage.tsx | 24 |  | 12 | 12 |  |  |
| src/components/moderation/ReviewerWorkspace/AIInsightsPanel.tsx | 23 | 2 | 21 |  |  |  |
| src/components/shop/public/ShopPublicShell.tsx | 23 | 8 | 13 | 2 |  |  |
| src/components/backoffice/taxonomy/TaxonomyCulturaTab.tsx | 22 | 2 | 20 |  |  |  |
| src/pages/config-wizards/HeroImagesWizardPage.tsx | 21 |  | 21 |  |  |  |
| src/components/backoffice/taxonomy/TaxonomyHealthDashboard.tsx | 19 | 5 | 14 |  |  |  |
| src/components/moderation/ReviewerWorkspace/modes/RejectionMode.tsx | 19 | 1 | 17 | 1 |  |  |
| src/components/dashboard/dashboardStyles.tsx | 18 | 14 | 4 |  |  |  |
| src/components/moderation/ReviewerWorkspace/WorkspaceRight.tsx | 18 | 10 | 8 |  |  |  |
| src/components/backoffice/taxonomy/TaxonomyImpactoTab.tsx | 17 | 5 | 12 |  |  |  |
| src/components/dashboard/sections/InventoryAlerts.tsx | 17 |  | 17 |  |  |  |
| src/components/dashboard/sections/ProductsTable.tsx | 17 | 6 | 8 | 3 |  |  |
| src/pages/PublicShopPageNew.tsx | 17 |  | 14 | 3 |  |  |

…y 143 archivos más.

## Resumen por carpeta

| Carpeta | Total |
|---|---:|
| src/components/shop | 1831 |
| src/pages/backoffice | 434 |
| src/components/dashboard | 289 |
| src/components/moderation | 280 |
| src/pages/growth | 251 |
| src/components/backoffice | 221 |
| src/components/cms | 181 |
| src/pages/ShopConfigDashboard.tsx | 128 |
| src/pages/config-wizards | 110 |
| src/components/studio | 87 |
| src/pages/admin | 82 |
| src/pages/TallerStatusPage.tsx | 77 |
| src/pages/InventoryPage.tsx | 63 |
| src/pages/ShopSalesPage.tsx | 61 |
| src/components/onboarding | 42 |
| src/components/ui | 39 |
| src/pages/CmsAdminPage.tsx | 35 |
| src/pages/NotificationsPage.tsx | 33 |
| src/components/profile | 29 |
| src/pages/HeroSliderWizardPage.tsx | 27 |
| src/components/coordinator | 24 |
| src/components/inventory | 20 |
| src/pages/PublicShopPageNew.tsx | 17 |
| src/pages/BioLinkPage.tsx | 16 |
| src/utils/colorUtils.ts | 16 |
| src/pages/PublicArtisanProfile.tsx | 13 |
| src/components/stories | 11 |
| src/pages/ProductAnalyticsPage.tsx | 10 |
| src/contexts/ShopThemeContext.tsx | 7 |
| src/pages/PublicProductPage.tsx | 6 |
| src/components/debug | 6 |
| src/pages/auth | 6 |
| src/components/brand | 5 |
| src/components/auth | 4 |
| src/components/layout | 4 |
| src/components/shipping-dashboard | 4 |
| src/lib/telar-design.ts | 4 |
| src/pages/DesignSystemPage.tsx | 4 |
| src/pages/PublicShopCatalog.tsx | 4 |
| src/components/admin | 4 |
| src/components/common | 3 |
| src/components/navigation | 3 |
| src/components/wizard | 2 |
| src/pages/Admin.tsx | 2 |
| src/pages/moderation | 2 |
| src/pages/ModerationPage.tsx | 2 |
| src/pages/ProfilePage.tsx | 2 |
| src/pages/ShopDirectoryPage.tsx | 2 |
| src/pages/UserRolesAdminPage.tsx | 2 |
| src/components/agent-manager | 1 |
| src/components/artisan | 1 |
| src/pages/AdminLoginPage.tsx | 1 |
| src/pages/TasksDashboard.tsx | 1 |
