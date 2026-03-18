// internal/payment-checkout/ports/interfaces.go
package ports

import (
	"context"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
)

// GatewayResponse estandariza la respuesta de Wompi y Cobre
type GatewayResponse struct {
	URL        string
	ExternalID string
	ExpiresAt  time.Time
}

// PaymentGateway define el contrato para pasarelas externas
type PaymentGateway interface {
	GeneratePaymentLink(ctx context.Context, amount float64, currency string, externalRef string) (*GatewayResponse, error)
}

// CheckoutRepository define el contrato para la base de datos
type CheckoutRepository interface {
	// Lecturas
	GetCartContext(ctx context.Context, cartID string) (*domain.CartContext, error)
	GetProviderIDByCode(ctx context.Context, code string) (string, error)
	GetCheckoutByID(ctx context.Context, id string) (*domain.Checkout, error)
	GetIntentByExternalID(ctx context.Context, externalID string) (*domain.PaymentIntent, error)

	// Escrituras
	SaveCheckoutFull(ctx context.Context, checkout *domain.Checkout) error
	SaveIntent(ctx context.Context, intent *domain.PaymentIntent) error
	SaveAttempt(ctx context.Context, attempt *domain.PaymentAttempt) error

	// Helpers
	CountAttemptsByIntent(ctx context.Context, intentID string) (int, error)
	GetChargeTypeID(ctx context.Context, code string) (string, error) // Opcional en interfaz, pero útil

	// Transaccionales para el Webhook y Payouts
	GetIntentByIDForUpdate(ctx context.Context, tx DBTransaction, intentID string) (*domain.PaymentIntent, error)
	UpdateIntentStatus(ctx context.Context, tx DBTransaction, intentID string, status string) error
	UpdateCheckoutStatus(ctx context.Context, tx DBTransaction, checkoutID string, status string) error

	// NUEVO: Para el bloqueo pesimista en la creación de Payouts
	GetCheckoutByIDForUpdate(ctx context.Context, tx DBTransaction, checkoutID string) (*domain.Checkout, error)
}

// DBTransaction permite orquestar múltiples operaciones en una sola transacción ACID
type DBTransaction interface {
	Commit(ctx context.Context) error
	Rollback(ctx context.Context) error
}

type UnitOfWork interface {
	BeginTx(ctx context.Context) (DBTransaction, error)
	// Los repositorios se inyectan en la Tx
	CheckoutRepo() CheckoutRepository
	LedgerRepo() LedgerRepository
	EventRepo() EventRepository
	PayoutRepo() PayoutRepository
	PayoutRulesRepo() PayoutRulesRepository
}

type LedgerRepository interface {
	// Obtiene o crea la cuenta según tu esquema (owner_type, owner_id, account_type, currency)
	GetOrCreateAccount(ctx context.Context, tx DBTransaction, ownerType string, ownerID *string, accountType string, currency string) (string, error)

	// Guarda la transacción (ledger.transactions) y sus entradas (ledger.entries)
	SaveLedgerTransaction(ctx context.Context, tx DBTransaction, referenceType string, referenceID string, currency string, idempotencyKey string, entries []domain.LedgerEntry) error
}

type EventRepository interface {
	// Falla si el event_id ya existe (Idempotencia)
	SaveProcessedEvent(ctx context.Context, tx DBTransaction, eventID string) error
}

type WebhookValidator interface {
	ValidateSignature(payload []byte, signatureHeader string, timestampHeader string) error
}

// PaymentNotification contiene los datos que requiere tu API central
type PaymentNotification struct {
	GatewayCode   string `json:"gateway_code"`   // ej: "wompi" o "cobre"
	TransactionID string `json:"transaction_id"` // ID de tu PaymentIntent o externo
	CartID        string `json:"cart_id"`        // Identificador del carrito
	Status        string `json:"status"`         // ej: "PAID", "FAILED"
}

// NotificationGateway define el contrato para avisar a otros servicios
type NotificationGateway interface {
	NotifyPaymentConfirmation(ctx context.Context, payload PaymentNotification) error
}

// ==========================================
// PUERTOS PARA PAYOUT RULES (REGLAS DE DISPERSIÓN)
// ==========================================

// PayoutRulesRepository busca la regla de dispersión aplicable
type PayoutRulesRepository interface {
	// FindApplicableRule busca la regla activa para una tienda y evento.
	// Primero busca una regla específica por shop_id, luego cae a la regla global (shop_id IS NULL).
	FindApplicableRule(ctx context.Context, shopID string, triggerEvent string) (*domain.PayoutRule, error)
}

// ==========================================
// PUERTOS PARA PAYOUTS (SPLIT PAYMENTS)
// ==========================================

// PayoutGateway define el contrato estricto para enviar dinero hacia afuera
type PayoutGateway interface {
	// CreateCounterparty registra la cuenta bancaria destino y retorna su ID en el proveedor
	CreateCounterparty(ctx context.Context, counterparty *domain.Counterparty) (string, error)

	// CreateMoneyMovement ejecuta el desembolso.
	// sourceAccount: el BalanceID de Cobre.
	// externalId: nuestro ID local del Payout para conciliación.
	// Retorna el ID del movimiento en el proveedor.
	CreateMoneyMovement(ctx context.Context, sourceAccount string, destinationId string, amountMinor int64, externalId string) (string, error)
}

// PayoutRepository maneja la persistencia de nuestros desembolsos
type PayoutRepository interface {
	// Usamos DBTransaction porque el guardado debe estar atado al UoW (Ledger + Payout)
	SavePayout(ctx context.Context, tx DBTransaction, payout *domain.Payout) error
	UpdatePayoutStatus(ctx context.Context, tx DBTransaction, payoutID string, status domain.PayoutStatus) error

	// Método auxiliar para el webhook
	GetPayoutByID(ctx context.Context, payoutID string) (*domain.Payout, error)
	GetPayoutByExternalID(ctx context.Context, externalID string) (*domain.Payout, error)

	// NUEVO: Prevención de pago doble interno
	GetPayoutByCheckoutAndShop(ctx context.Context, tx DBTransaction, checkoutID string, shopID string) (*domain.Payout, error)

	// NUEVO: Para guardar el ID de Cobre después de insertar el Payout inicial
	UpdatePayoutExternalID(ctx context.Context, tx DBTransaction, payoutID string, externalMovementID string) error
}

// PaymentNotification contiene los datos que requiere tu API central
type PaymentNotification struct {
	GatewayCode   string `json:"gateway_code"`   // ej: "wompi" o "cobre"
	TransactionID string `json:"transaction_id"` // ID de tu PaymentIntent o externo
	CartID        string `json:"cart_id"`        // Identificador del carrito
	Status        string `json:"status"`         // ej: "PAID", "FAILED"
}

// NotificationGateway define el contrato para avisar a otros servicios
type NotificationGateway interface {
	NotifyPaymentConfirmation(ctx context.Context, payload PaymentNotification) error
}
