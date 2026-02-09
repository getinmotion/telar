// internal/payment-checkout/ports/interfaces.go

package ports

import (
	"context"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
)

// PaymentGateway define el contrato para hablar con pasarelas (Cobre, Wompi, etc.)
type PaymentGateway interface {
	// GeneratePaymentLink solicita a la pasarela externa una URL de pago
	GeneratePaymentLink(ctx context.Context, order *domain.CheckoutOrder) (string, string, error) // Returns: URL, ExternalID, error
}

// CheckoutRepository define el contrato para persistencia (Postgres)
type CheckoutRepository interface {
	// Save guarda la orden generada
	Save(ctx context.Context, order *domain.CheckoutOrder) error
}
