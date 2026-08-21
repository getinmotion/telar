# Implementation Plan: Add Bank Data Section to StoreReviewWizard

## Overview

Add a "Datos Bancarios" section to the StoreReviewWizard component, allowing moderators to view, create, and edit artisan bank/payout data directly from the store review interface. The section operates independently from the wizard global edit flow. Two files are modified: the useBankData hook (add optional userId param) and StoreReviewWizard.tsx (new section, SelectField, bank data panel with its own edit lifecycle).

## Tasks

- [ ] 1. Extend useBankData hook to accept external userId
  - [ ] 1.1 Add optional externalUserId parameter to the useBankData function signature
    - Compute effectiveUserId = externalUserId ?? user?.id
    - Replace all references to user?.id / user.id in fetch, save, and update with effectiveUserId
    - Add effectiveUserId to the useCallback dependency array for fetchBankData
    - _Requirements: 1.1, 1.2, 1.3, 1.4_

- [ ] 2. Add "Datos Bancarios" section to StoreReviewWizard navigation
  - [ ] 2.1 Add the "bancarios" entry to the SECTIONS array
    - Append { key: "bancarios", label: "Datos Bancarios", icon: "account_balance", kind: "config" } after the "politicas" entry
    - _Requirements: 2.1, 2.2_

- [ ] 3. Implement SelectField inline component
  - [ ] 3.1 Create the SelectField component inside StoreReviewWizard.tsx
    - Props: label, value, editing, onChange, options: {value, label}[], placeholder?
    - In read mode renders Field with the matching label from options array (not the raw value)
    - In edit mode renders a select element with the same styling pattern as EditableField
    - Define ID_TYPE_OPTIONS (cc, pa, nit, ce), ACCOUNT_TYPE_OPTIONS (ch, cc, r2p, dp, breb-key, r2p_breb), CURRENCY_OPTIONS (COP, USD)
    - Import BANKS_DATA from @/data/cobreBankData and define BANK_OPTIONS = BANKS_DATA.map(b => ({ value: b.code, label: b.name }))
    - The bank_code field MUST use SelectField with BANK_OPTIONS (NOT a text input)
    - _Requirements: 4.1, 5.2_

- [ ] 4. Implement BankDataSection render logic
  - [ ] 4.1 Add bank data state and hook call inside StoreReviewWizard
    - Add bankEditing (boolean) and bankDraft (BankDataDraft interface) local state
    - Call useBankData(shop.userId) to fetch artisan bank data
    - Reset bankEditing to false when shop changes (in existing useEffect)
    - _Requirements: 6.1, 6.3, 6.4_

  - [ ] 4.2 Implement renderBankDataSection function
    - Show loading spinner while hook is loading
    - When no bank data exists: render creation form with all 8 fields (text inputs for holder_name, document_number, account_number + SelectField for document_type, bank_code, account_type, country, currency)
    - bank_code field: use SelectField with BANK_OPTIONS (select from BANKS_DATA, NOT text input)
    - When bank data exists and not editing: render read-only ConfigPanel with all 8 fields and an independent "Editar" button. For bank_code display the bank name by looking up BANKS_DATA.find(b => b.code === value)?.name
    - When bank data exists and editing: render editable fields pre-filled with current values (resolve bank_code from bankName via BANKS_DATA.find(b => b.name === bankData.bank_code || b.code === bankData.bank_code)?.code), plus "Guardar" and "Cancelar" buttons
    - _Requirements: 3.1, 3.2, 3.3, 4.1, 5.1, 5.2, 5.6_

  - [ ] 4.3 Wire save/update actions
    - On creation form submit: call saveBankData with mapped BankDataDraft to BankDataForm, using shop.userId
    - On edit form submit: call updateBankData with mapped draft
    - On success: refetch and switch to read-only; on failure: toast error, preserve form data
    - On cancel: reset bankDraft to current bankData values and set bankEditing = false
    - _Requirements: 4.2, 4.3, 4.4, 5.3, 5.4, 5.5, 5.6_

  - [ ] 4.4 Integrate renderBankDataSection into the renderConfig function
    - Add if (key === "bancarios") return renderBankDataSection(); case
    - _Requirements: 2.3_

- [ ] 5. Checkpoint - Verify build compiles
  - Run npm run build in artisans-web/ to confirm TypeScript compiles without errors

## Notes

- Only two files are modified: src/hooks/useBankData.ts and src/components/studio/StoreReviewWizard.tsx
- The bank_code field MUST be a select populated with BANKS_DATA (same pattern as ContactLocationWizardPage)
- The account_type options must include all 6 types: ch, cc, r2p, dp, breb-key, r2p_breb
- The BankDataSection manages its own edit state independently from the global editable toggle
- When pre-loading bank data for editing, resolve bank name to code using BANKS_DATA.find()

## Task Dependency Graph

```json
{
  "waves": [
    { "id": 0, "tasks": ["1.1", "2.1", "3.1"] },
    { "id": 1, "tasks": ["4.1"] },
    { "id": 2, "tasks": ["4.2"] },
    { "id": 3, "tasks": ["4.3"] },
    { "id": 4, "tasks": ["4.4"] }
  ]
}
```
