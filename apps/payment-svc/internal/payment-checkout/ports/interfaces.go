package ports

import (
	"context"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
)

// GatewayResponse estandariza la respuesta de cualquier pasarela (Wompi, Cobre, Stripe)
type GatewayResponse struct {
	URL        string    // URL a donde redirigir al usuario
	ExternalID string    // ID único de la transacción en el sistema del proveedor
	ExpiresAt  time.Time // Cuándo caduca este link
}

// PaymentGateway define el contrato con proveedores externos
type PaymentGateway interface {
	// GeneratePaymentLink solicita la creación de una transacción.
	// externalRef: Debería ser tu checkout_id o intent_id para reconciliación futura.
	GeneratePaymentLink(ctx context.Context, amount float64, currency string, externalRef string) (*GatewayResponse, error)

	// TODO: A futuro podrías necesitar métodos como:
	// GetTransactionStatus(ctx, externalID) (*GatewayStatus, error)
}

// CheckoutRepository define la persistencia en base de datos
type CheckoutRepository interface {
	// --- Checkouts ---
	// SaveCheckout guarda o actualiza la cabecera de la orden
	SaveCheckout(ctx context.Context, checkout *domain.Checkout) error

	// GetCheckoutByID recupera la orden (útil para verificar status antes de pagar)
	GetCheckoutByID(ctx context.Context, id string) (*domain.Checkout, error)

	// --- Payment Intents (Intenciones de Pago) ---
	// SaveIntent guarda o actualiza (Upsert) la intención de pago
	SaveIntent(ctx context.Context, intent *domain.PaymentIntent) error

	// GetIntentByExternalID es VITAL para los Webhooks: permite saber qué intent actualizar
	// cuando Wompi nos llame diciendo "la transacción abc-123 fue aprobada"
	GetIntentByExternalID(ctx context.Context, externalID string) (*domain.PaymentIntent, error)

	// --- Payment Attempts (Auditoría técnica) ---
	// SaveAttempt registra el log crudo de la comunicación (Request/Response)
	SaveAttempt(ctx context.Context, attempt *domain.PaymentAttempt) error

	// CountAttemptsByIntent sirve para calcular el número de intento (attempt_no)
	// Ej: Si retorna 2, el siguiente intento será el #3
	CountAttemptsByIntent(ctx context.Context, intentID string) (int, error)
}
