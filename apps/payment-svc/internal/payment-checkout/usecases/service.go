package usecases

import (
	"context"
	"log/slog"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
	"github.com/google/uuid"
)

type CheckoutService struct {
	repo    ports.CheckoutRepository
	gateway ports.PaymentGateway
	logger  *slog.Logger
}

func NewCheckoutService(repo ports.CheckoutRepository, gateway ports.PaymentGateway, logger *slog.Logger) *CheckoutService {
	return &CheckoutService{
		repo:    repo,
		gateway: gateway,
		logger:  logger,
	}
}

// CreatePaymentLink es la función principal que replica tu lógica de Deno
func (s *CheckoutService) CreatePaymentLink(ctx context.Context, cartID string, price float64) (*domain.CheckoutOrder, error) {
	s.logger.Info("Starting checkout creation", "cart_id", cartID)

	// 1. Crear Entidad de Dominio
	order := &domain.CheckoutOrder{
		ID:        uuid.New().String(), // Generamos ID interno
		CartID:    cartID,
		Amount:    price,
		Status:    "PENDING",
		CreatedAt: time.Now(),
	}

	// 2. Lógica de Negocio: Convertir decimal a "Minor Units" (centavos)
	order.CalculateMinorUnit()

	// 3. Llamar al Puerto de Pago (Gateway)
	// El servicio no sabe si es Cobre o Wompi, solo pide un link.
	url, externalID, err := s.gateway.GeneratePaymentLink(ctx, order)
	if err != nil {
		s.logger.Error("Failed to generate payment link", "error", err)
		return nil, err
	}

	// 4. Actualizar orden con datos de respuesta
	order.PaymentLinkURL = url
	order.ExternalID = externalID

	// 5. Llamar al Puerto de Persistencia (Repo)
	if err := s.repo.Save(ctx, order); err != nil {
		s.logger.Error("Failed to save order", "error", err)
		// Dependiendo del negocio, aquí podríamos retornar error o simplemente loguearlo
		return nil, err
	}

	s.logger.Info("Checkout created successfully", "url", url)
	return order, nil
}
