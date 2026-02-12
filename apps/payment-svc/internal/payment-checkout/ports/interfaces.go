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
}
