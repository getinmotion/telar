# Store Data Map — Telar Artisan Platform

> **Rule**: One source of truth per field. Store config only writes fields it owns.  
> Reference-only fields are displayed with a "Del [source]" badge and a link to the source wizard.

## Field Ownership Matrix

| Field | DB column | Source / Owner | Editable in store config | Destinations |
|---|---|---|---|---|
| `shopName` | `shop_name` | Onboarding wizard | ❌ Reference only | 🏪 Marketplace · 🛍️ Own store |
| `shopSlug` | `shop_slug` | Onboarding wizard | ❌ Reference only | 🏪 🛍️ |
| `description` | `description` | Artisan profile wizard (`artisanProfile.shortBio`) | ❌ Reference only | 🏪 🛍️ |
| `craftType` | `craft_type` | Artisan profile wizard (Step 2) | ❌ Reference only | 🏪 🛍️ |
| `department` | `department` | Artisan profile wizard (Step 2) | ❌ Reference only | 🏪 🛍️ |
| `municipality` | `municipality` | Artisan profile wizard (Step 2) | ❌ Reference only | 🏪 🛍️ |
| `artisanProfile` | `artisan_profile` | Artisan profile wizard (Steps 1–6) | ❌ Reference only | 🏪 🛍️ |
| `artisanProfileCompleted` | `artisan_profile_completed` | Artisan profile wizard | ❌ Reference only | 🏪 🛍️ |
| `logoUrl` | `logo_url` | **Store config S1** | ✅ Own | 🏪 🛍️ |
| `brandClaim` | `brand_claim` | **Store config S1** | ✅ Own | 🏪 🛍️ |
| `bannerUrl` | `banner_url` | **Store config S2** | ✅ Own | 🛍️ |
| `heroConfig` | `hero_config` | **Store config S2** | ✅ Own | 🛍️ |
| `contactConfig.whatsapp` | `contact_config->whatsapp` | **Store config S4** | ✅ Own | 🏪 🛍️ |
| `contactConfig.email` | `contact_config->email` | **Store config S4** | ✅ Own | 🏪 🛍️ |
| `contactConfig.hours` | `contact_config->hours` | **Store config S4** | ✅ Own | 🛍️ |
| `socialLinks` | `social_links` | **Store config S4** | ✅ Own | 🏪 🛍️ |
| `policiesConfig.returnPolicy` | `policies_config->return_policy` | **Store config S5a** | ✅ Own (new JSONB field) | 🏪 🛍️ |
| `policiesConfig.faq` | `policies_config->faq` | **Store config S5b** | ✅ Own (new JSONB field) | 🏪 🛍️ |
| `activeThemeId` | `active_theme_id` | **Store config S6** | ✅ Own | 🛍️ |
| `seoData` | `seo_data` | Store config (future section) | ✅ Own | 🏪 🛍️ |
| `publishStatus` | `publish_status` | Publish flow (CommercialDashboard) | ❌ Not here | — |
| `marketplaceApproved` | `marketplace_approved` | Admin moderator | ❌ Not here | — |
| `bankDataStatus` | `bank_data_status` | Bank setup flow | ❌ Not here | — |

---

## Duplications to Eliminate

### 1. `region` vs `department`
- `region` (text) is a historical alias for `department`.
- **Decision**: Store config stops writing `region`. Only `department` is written going forward.
- The artisan profile wizard already writes `department` + sets `artisanProfile.department`.

### 2. `contactConfig` sub-fields consolidation
- Previously store config wrote: `phone`, `address`, `hours`, `welcomeMessage`, `formIntroText`
- Going forward, store config S4 **only owns**: `whatsapp`, `email`, `hours`
- `welcomeMessage` and `formIntroText` are AI-generated text — moved to a future AI content module
- `phone` and `address` are secondary and not shown in S4 (no loss of existing data — spread pattern preserves them)

### 3. `description` duplication
- The shop has a top-level `description` field originally set by the product wizard
- Store config used to allow editing it, creating a second source of truth
- **Decision**: `description` is read-only in store config, shown as "Del perfil artesanal"
- If `artisanProfile.shortBio` exists, it takes precedence as the display value

---

## Store Config Section → Field Map

| Section | Fields owned | Fields referenced |
|---|---|---|
| **S1 Brand Identity** | `logoUrl`, `brandClaim` | `shopName` (onboarding), `description` (artisan profile) |
| **S2 Hero Images** | `bannerUrl`, `heroConfig` | — |
| **S3 Artisan Profile** | none (read-only panel) | `artisanProfile`, `artisanProfileCompleted`, `craftType` |
| **S4 Contact & Location** | `contactConfig.{whatsapp,email,hours}`, `socialLinks` | `department`, `municipality` (artisan profile) |
| **S5 Policies** | `policiesConfig.{returnPolicy,faq}` | `craftType`, `department` (for AI context injection) |
| **S6 Design & Preview** | `activeThemeId` | all fields (for preview rendering) |

---

## AI Context Injection (AIService)

All AI calls receive this context built from the shop object:

```typescript
{
  shopName:     shop.shopName
  craftType:    shop.craftType
  region:       shop.department          // use department, not region
  municipality: shop.municipality
  brandClaim:   shop.brandClaim
  artisanProfile: shop.artisanProfile   // full JSONB blob
}
```

Source: `apps/artisans-web/src/services/AIService.ts`

---

## New Fields (require JSONB write on first use)

| Field | First written by | Write pattern |
|---|---|---|
| `policiesConfig` | Store config S5 | `updateArtisanShop(id, { policiesConfig: { returnPolicy, faq } } as any)` |

The backend `PATCH` handler merges partial payloads into the existing record — new JSONB keys are safe to write without schema migration (consistent with existing `availabilityConfig`, `shippingConfig`, `bioConfig` fields).
