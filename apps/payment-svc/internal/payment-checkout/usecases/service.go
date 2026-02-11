package usecases

import (
	"context"
	"errors"
	"fmt"
	"log/slog"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
	"github.com/google/uuid"
)

type CheckoutService struct {
	repo         ports.CheckoutRepository
	wompiGateway ports.PaymentGateway
	cobreGateway ports.PaymentGateway // Mantienes Cobre si lo necesitas
	logger       *slog.Logger
}

func NewCheckoutService(
	repo ports.CheckoutRepository,
	wompi ports.PaymentGateway,
	cobre ports.PaymentGateway,
	logger *slog.Logger,
) *CheckoutService {
	return &CheckoutService{
		repo:         repo,
		wompiGateway: wompi,
		cobreGateway: cobre,
		logger:       logger,
	}
}

// Input DTO: El "Snapshot" que viene del Backend externo
type CreateCheckoutInput struct {
	CartID    string
	Amount    float64
	Currency  string
	Provider  string // "wompi" o "cobre"
	ReturnURL string
}

func (s *CheckoutService) ProcessCheckout(ctx context.Context, input CreateCheckoutInput) (*domain.CheckoutResponse, error) {
	s.logger.Info("Processing checkout", "cart_id", input.CartID, "provider", input.Provider)

	amountMinor := int64(input.Amount * 100)

	// 1. Crear el Checkout
	checkout := &domain.Checkout{
		ID:          uuid.New().String(),
		CartID:      input.CartID,
		Amount:      input.Amount,
		AmountMinor: amountMinor, // <--- AHORA REQUERIDO
		Currency:    input.Currency,
		Status:      "awaiting_payment",
		CartSnapshot: map[string]interface{}{ // <--- AHORA REQUERIDO (aunque sea vacío por ahora)
			"original_price": input.Amount,
			"items":          "TODO: Fetch details",
		},
		ExpiresAt: time.Now().Add(1 * time.Hour), // <--- AHORA REQUERIDO
		CreatedAt: time.Now(),
	}

	// 2. Crear el Intent
	intent := &domain.PaymentIntent{
		ID:             uuid.New().String(),
		CheckoutID:     checkout.ID,
		Provider:       input.Provider,
		IdempotencyKey: fmt.Sprintf("ik_%s_%s", input.CartID, input.Provider),
		Status:         "processing",
		AmountMinor:    amountMinor,    // <--- AHORA REQUERIDO
		Currency:       input.Currency, // <--- AHORA REQUERIDO
		CreatedAt:      time.Now(),
	}

	// 3. Seleccionar Gateway
	var gateway ports.PaymentGateway
	switch input.Provider {
	case "wompi":
		gateway = s.wompiGateway
	case "cobre":
		gateway = s.cobreGateway // Asumiendo que adaptaste Cobre a la nueva interfaz
	default:
		return nil, errors.New("unsupported provider")
	}

	// 4. Llamar al Gateway (Crear Attempt)
	// Usamos intent.ID como referencia externa para trazabilidad
	gwResp, err := gateway.GeneratePaymentLink(ctx, checkout.Amount, checkout.Currency, intent.ID)
	if err != nil {
		s.logger.Error("Gateway failed", "error", err)
		return nil, err
	}

	// 5. Crear el Attempt (Registro del intento #1)
	attempt := &domain.PaymentAttempt{
		ID:              uuid.New().String(),
		PaymentIntentID: intent.ID, // <--- CORREGIDO (antes era IntentID)
		ExternalID:      gwResp.ExternalID,
		CheckoutURL:     gwResp.URL,
		AttemptNumber:   1,
		ExpiresAt:       gwResp.ExpiresAt,
		Status:          "pending",

		// Agregamos estos campos para que no queden nil y el repo no falle
		RequestPayload:  map[string]interface{}{"amount": input.Amount, "currency": input.Currency},
		ResponsePayload: map[string]interface{}{"url": gwResp.URL},
		ErrorMessage:    "",
		CreatedAt:       time.Now(),
	}

	// 6. Persistencia (Idealmente en una transacción DB)
	// Guardamos todo para tener trazabilidad completa
	if err := s.repo.SaveCheckout(ctx, checkout); err != nil {
		return nil, err
	}
	if err := s.repo.SaveIntent(ctx, intent); err != nil {
		return nil, err
	}
	if err := s.repo.SaveAttempt(ctx, attempt); err != nil {
		return nil, err
	}

	// 7. Retornar respuesta estructurada al Orchestrator
	return &domain.CheckoutResponse{
		CheckoutID:       checkout.ID,
		PaymentIntentID:  intent.ID,
		PaymentAttemptID: attempt.ID,
		AttemptNumber:    attempt.AttemptNumber,
		CheckoutURL:      attempt.CheckoutURL,
		Status:           checkout.Status,
		ExpiresAt:        attempt.ExpiresAt,
	}, nil
}
