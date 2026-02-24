# 📋 Resumen de ENUMs en el Proyecto

## 1️⃣ Schema: `public` (User Profiles)

### 📄 Migración: `1768411279610-CreateUserProfilesTable.ts`

| ENUM Type | Valores | Tabla | Columna | Default | NULL |
|-----------|---------|-------|---------|---------|------|
| `public.user_type` | `'regular'`, `'premium'`, `'enterprise'` | `artesanos.user_profiles` | `user_type` | `'regular'` | ✅ |
| `public.account_type` | `'buyer'`, `'seller'`, `'both'` | `artesanos.user_profiles` | `account_type` | `'buyer'` | ✅ |

**Actualización pendiente:**
- ⏳ Migración `AddShopOwnerAndAdminToUserType` agregará: `'shop_owner'`, `'admin'` a `user_type`

---

## 2️⃣ Schema: `payments` (Sistema de Pagos)

### 📄 Migración: `1769550000000-CreatePaymentsAndLedgerSchema.ts`

#### Contexto y Carritos

| ENUM Type | Valores | Tabla | Columna |
|-----------|---------|-------|---------|
| `payments.sale_context` | `'marketplace'`, `'tenant'` | `payments.product_prices` | `context` |
| | | `payments.charge_rules` | `context` |
| | | `payments.carts` | `context` (default: `'marketplace'`) |
| | | `payments.checkouts` | `context` |
| `payments.cart_status` | `'open'`, `'locked'`, `'converted'`, `'abandoned'` | `payments.carts` | `status` (default: `'open'`) |

#### Checkout y Órdenes

| ENUM Type | Valores | Tabla | Columna |
|-----------|---------|-------|---------|
| `payments.checkout_status` | `'created'`, `'awaiting_payment'`, `'paid'`, `'failed'`, `'canceled'`, `'refunded'`, `'partial_refunded'` | `payments.checkouts` | `status` (default: `'created'`) |
| `payments.order_status` | `'pending_fulfillment'`, `'delivered'`, `'canceled'`, `'refunded'` | `payments.orders` | `status` (default: `'pending_fulfillment'`) |

#### Cargos (Charges)

| ENUM Type | Valores | Tabla | Columna |
|-----------|---------|-------|---------|
| `payments.charge_direction` | `'add'`, `'subtract'` | `payments.charge_types` | `direction` |
| `payments.charge_scope` | `'checkout'`, `'order'` | `payments.charge_types` | `scope` |
| | | `payments.checkout_charges` | `scope` |

#### Pagos

| ENUM Type | Valores | Tabla | Columna |
|-----------|---------|-------|---------|
| `payments.payment_intent_status` | `'requires_payment_method'`, `'requires_action'`, `'processing'`, `'succeeded'`, `'failed'`, `'canceled'` | `payments.payment_intents` | `status` (default: `'requires_payment_method'`) |
| `payments.payment_attempt_status` | `'created'`, `'redirected'`, `'authorized'`, `'captured'`, `'failed'`, `'canceled'` | `payments.payment_attempts` | `status` (default: `'created'`) |

#### Retiros (Payouts)

| ENUM Type | Valores | Tabla | Columna |
|-----------|---------|-------|---------|
| `payments.payout_status` | `'requested'`, `'processing'`, `'paid'`, `'failed'`, `'canceled'` | `payments.payouts` | `status` (default: `'requested'`) |

---

## 3️⃣ Schema: `ledger` (Contabilidad)

### 📄 Migración: `1769550000000-CreatePaymentsAndLedgerSchema.ts`

| ENUM Type | Valores | Tabla | Columna |
|-----------|---------|-------|---------|
| `ledger.owner_type` | `'platform'`, `'shop'` | `ledger.accounts` | `owner_type` |
| `ledger.account_type` | `'clearing'`, `'revenue'`, `'taxes'`, `'pending'`, `'available'`, `'payout_in_transit'` | `ledger.accounts` | `account_type` |

---

## 📊 Resumen General

| Schema | ENUMs Totales | Tablas Afectadas |
|--------|---------------|------------------|
| `public` | 2 | 1 (`user_profiles`) |
| `payments` | 9 | 11 tablas |
| `ledger` | 2 | 1 (`accounts`) |
| **TOTAL** | **13 ENUMs** | **13 tablas únicas** |

---

## 🔄 ENUMs Compartidos (Usados en Múltiples Tablas)

1. **`payments.sale_context`** → Usado en 4 tablas:
   - `product_prices`
   - `charge_rules`
   - `carts`
   - `checkouts`

2. **`payments.charge_scope`** → Usado en 2 tablas:
   - `charge_types`
   - `checkout_charges`

---

## ⚠️ Nota Importante sobre ENUMs

- ✅ Agregar valores: Fácil con `ALTER TYPE ... ADD VALUE`
- ❌ Eliminar valores: Muy difícil, requiere recrear el tipo completo
- ❌ Renombrar valores: No soportado directamente
- ✅ Los valores de ENUM se ordenan en el orden que fueron agregados

---

## 🎯 Próxima Acción

Ejecutar la migración `AddShopOwnerAndAdminToUserType` para actualizar `public.user_type`:

```bash
npm run migration:run
```

Esto agregará:
- `'shop_owner'` - Para artesanos con tienda
- `'admin'` - Para administradores del sistema

Al ENUM `public.user_type` que usa la tabla `artesanos.user_profiles`.
