# Requirements Document

## Introduction

Agregar una sección "Datos Bancarios" al componente `StoreReviewWizard` del portal de artesanos, permitiendo a los moderadores visualizar, crear y editar la información de pago (payout) de un artesano directamente desde la vista de revisión de tienda. La sección opera de forma independiente al flujo de edición global del wizard, ya que persiste datos en un endpoint diferente (`payout-user-info`).

## Glossary

- **StoreReviewWizard**: Componente React de revisión/moderación de tiendas artesanas que muestra secciones de perfil y configuración comercial.
- **BankDataSection**: Nueva sección dentro del StoreReviewWizard que muestra y gestiona los datos bancarios del artesano.
- **useBankData**: Hook custom de React que encapsula la lógica de fetch, creación y actualización de datos de payout contra la API NestJS.
- **PayoutUserInfo**: Recurso del backend que almacena información bancaria del artesano (titular, banco, cuenta, documento).
- **ConfigPanel**: Patrón visual existente en StoreReviewWizard para presentar campos de configuración en paneles con título.
- **EditableField**: Componente existente que alterna entre modo lectura (Field) y modo edición (input/textarea).
- **Moderador**: Usuario administrador que revisa tiendas artesanas desde el Studio.

## Requirements

### Requirement 1: Adaptación del hook useBankData para aceptar userId externo

**User Story:** As a moderador, I want the bank data hook to fetch data for any artisan (not just the authenticated user), so that I can review bank data from the store review wizard.

#### Acceptance Criteria

1. THE useBankData hook SHALL accept an optional `userId` parameter that overrides the authenticated user's ID for data fetching.
2. WHEN a `userId` parameter is provided, THE useBankData hook SHALL fetch payout data for that specific user ID instead of the authenticated user.
3. WHEN no `userId` parameter is provided, THE useBankData hook SHALL maintain its current behavior of using the authenticated user's ID.
4. WHEN the `userId` parameter changes, THE useBankData hook SHALL re-fetch the payout data for the new user ID.

### Requirement 2: Sección "Datos Bancarios" en el rail de navegación del wizard

**User Story:** As a moderador, I want to see a "Datos Bancarios" tab in the store review wizard navigation, so that I can access bank information alongside other store sections.

#### Acceptance Criteria

1. THE StoreReviewWizard SHALL include a "Datos Bancarios" entry in the SECTIONS navigation array with kind "config".
2. THE BankDataSection SHALL appear after the existing "Políticas" section in the navigation rail.
3. WHEN the moderador clicks the "Datos Bancarios" tab, THE StoreReviewWizard SHALL display the bank data content panel.

### Requirement 3: Visualización de datos bancarios en modo lectura

**User Story:** As a moderador, I want to see the artisan's bank data in a read-only panel, so that I can review their payout information.

#### Acceptance Criteria

1. WHEN bank data exists for the artisan, THE BankDataSection SHALL display the following fields in read-only mode using the ConfigPanel pattern: titular (namePayoutMain), tipo de documento (idType), número de documento (idNumber), tipo de cuenta (typeAccount), nombre del banco (bankName), número de cuenta (numAccount), país (countryId), and moneda (currency).
2. WHEN no bank data exists for the artisan, THE BankDataSection SHALL display a message indicating no bank data is registered and show a creation form.
3. WHILE the useBankData hook is loading, THE BankDataSection SHALL display a loading indicator.

### Requirement 4: Creación de datos bancarios desde el wizard

**User Story:** As a moderador, I want to create bank data for an artisan who has none, so that I can set up their payout information during the review process.

#### Acceptance Criteria

1. WHEN no bank data exists, THE BankDataSection SHALL display a form with all required fields: titular (text input), tipo de documento (select: CC, PA, NIT, CE), número de documento (text input), tipo de cuenta (select: Ahorros, Corriente), nombre del banco (text input), número de cuenta (text input), país (text input), and moneda (select: COP, USD).
2. WHEN the moderador submits the creation form with valid data, THE BankDataSection SHALL call the useBankData saveBankData function with the artisan's userId.
3. WHEN the creation succeeds, THE BankDataSection SHALL transition to read-only mode showing the newly created data.
4. IF the creation fails, THEN THE BankDataSection SHALL display an error notification without losing the form data.

### Requirement 5: Edición de datos bancarios existentes

**User Story:** As a moderador, I want to edit existing bank data for an artisan, so that I can correct payout information during review.

#### Acceptance Criteria

1. WHEN bank data exists in read-only mode, THE BankDataSection SHALL display an independent "Editar" button within the section.
2. WHEN the moderador clicks the section's "Editar" button, THE BankDataSection SHALL switch all fields to editable mode with current values pre-filled.
3. WHEN the moderador submits the edit form, THE BankDataSection SHALL call the useBankData updateBankData function.
4. WHEN the update succeeds, THE BankDataSection SHALL return to read-only mode showing the updated data.
5. IF the update fails, THEN THE BankDataSection SHALL display an error notification without losing the edited form data.
6. WHEN the moderador clicks "Cancelar" during editing, THE BankDataSection SHALL discard changes and return to read-only mode with the original data.

### Requirement 6: Independencia del flujo de edición global

**User Story:** As a moderador, I want the bank data section to have its own save flow, so that saving bank data does not depend on saving the entire store.

#### Acceptance Criteria

1. THE BankDataSection SHALL manage its own edit/save/cancel state independently from the StoreReviewWizard global edit toggle.
2. THE BankDataSection save action SHALL persist data to the payout-user-info endpoint without triggering the global shop PATCH.
3. WHEN the global StoreReviewWizard "Guardar" is triggered, THE BankDataSection state SHALL remain unaffected.
4. WHEN the global StoreReviewWizard "Cancelar" is triggered, THE BankDataSection state SHALL remain unaffected.
