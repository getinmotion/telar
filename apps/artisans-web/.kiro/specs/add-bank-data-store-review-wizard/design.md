# Design Document

## Introduction

Este documento describe la arquitectura y diseno para agregar una seccion "Datos Bancarios" al componente StoreReviewWizard. La solucion se basa en reutilizar el hook useBankData existente (adaptado para aceptar un userId externo) y los componentes de presentacion ConfigPanel/EditableField ya presentes en el wizard.

## Architecture Overview

1. **Hook useBankData** - Se extiende para recibir un userId opcional.
2. **StoreReviewWizard** - Se agrega seccion "bancarios" con panel dedicado.

## Components

### 1. useBankData Hook (modificado)

Archivo: src/hooks/useBankData.ts

Acepta parametro userId opcional. Cuando se proporciona, tiene prioridad sobre user?.id del contexto de autenticacion.

### 2. Seccion "Datos Bancarios" en SECTIONS

Archivo: src/components/studio/StoreReviewWizard.tsx

Nueva entrada: { key: "bancarios", label: "Datos Bancarios", icon: "account_balance", kind: "config" }

### 3. BankDataSection (render inline)

Funcion renderBankDataSection dentro de StoreReviewWizard:
- Estado propio: bankEditing (boolean) y bankDraft (BankDataDraft)
- Modo loading: Spinner mientras useBankData carga
- Modo sin datos: Formulario de creacion con todos los campos
- Modo lectura: Campos read-only con boton "Editar" independiente
- Modo edicion: Campos editables con "Guardar" y "Cancelar" propios

### 4. SelectField (componente inline)

Para campos de seleccion (idType, typeAccount, currency, bank_code):

Props: label, value, editing, onChange, options: {value, label}[], placeholder?

**IMPORTANTE: El campo bank_code (Banco) es un select poblado con BANKS_DATA de @/data/cobreBankData.**

En modo lectura muestra el label (nombre del banco). En modo edicion muestra un select con todas las opciones de bancos.

## Interfaces

### BankDataDraft

Estado local del formulario:

- holder_name: string (Nombre del titular)
- document_type: string (cc | pa | nit | ce)
- document_number: string (Numero de documento)
- bank_code: string (Codigo del banco de BANKS_DATA, ej: "1001")
- account_type: string (ch | cc | r2p | dp | breb-key | r2p_breb)
- account_number: string (Numero de cuenta)
- country: string (UUID del pais)
- currency: string (COP | USD)

### Opciones de seleccion

Se importa BANKS_DATA de @/data/cobreBankData

ID_TYPE_OPTIONS:
- cc: Cedula de Ciudadania
- pa: Pasaporte
- nit: NIT
- ce: Cedula de Extranjeria

ACCOUNT_TYPE_OPTIONS:
- ch: Ahorros
- cc: Corriente
- r2p: R2P
- dp: Deposito electronico
- breb-key: Llave Bre-b
- r2p_breb: Recaudo Bre-b

CURRENCY_OPTIONS:
- COP: COP
- USD: USD

BANK_OPTIONS: generado desde BANKS_DATA.map(b => ({ value: b.code, label: b.name }))

### Mapeo bank_code - nombre de banco

Al guardar: bank_code contiene el codigo (ej: "1001"). El hook envia ese valor.
Al pre-cargar (edicion): Se recibe bankData.bank_code como nombre de banco. Se busca en BANKS_DATA por name o code para obtener el code y preseleccionar.

Mismo patron que ContactLocationWizardPage:
const bank = BANKS_DATA.find(b => b.name === payoutData.bankName || b.code === payoutData.bankName);
bankDraft.bank_code = bank?.code || payoutData.bankName || "";

## Data Models

Se reutilizan: PayoutUserInfo, ArtisanBankData, BankDataForm, BANKS_DATA

## Error Handling

- Hook sin userId: loading=false, bankData=null
- Error en fetch: bankData=null, muestra form de creacion
- Error en save/update: Toast error, form preserva datos
- userId cambia durante edicion: Reset bankEditing=false, re-fetch

## Correctness Properties

### Property 1: userId parameter determines fetch target
For any externalUserId provided, fetch uses that ID, never the auth users ID.
Validates: Requirements 1.2

### Property 2: Read-only mode displays all fields
For any valid PayoutUserInfo, all 8 fields render with matching values.
Validates: Requirements 3.1

### Property 3: Bank field renders as select with BANKS_DATA
For any editing state, "Banco" renders as select with BANKS_DATA options (value=code, label=name).
Validates: Requirements 4.1

### Property 4: Form data preservation on failure
If save/update fails, all form values remain unchanged.
Validates: Requirements 4.4, 5.5

### Property 5: Edit pre-fills then cancel restores
Clicking "Editar" pre-fills with current values (bank_code resolved via BANKS_DATA). "Cancelar" restores originals.
Validates: Requirements 5.2, 5.6

### Property 6: Independence from global wizard
Global edit/save/cancel does not affect BankDataSection state.
Validates: Requirements 6.1, 6.3, 6.4
