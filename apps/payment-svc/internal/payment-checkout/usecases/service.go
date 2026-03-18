package usecases

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
	"github.com/google/uuid"
)

type CheckoutService struct {
	repo          ports.CheckoutRepository
	uow           ports.UnitOfWork
	pricingEngine *PricingEngine
	gateways      map[string]ports.PaymentGateway
	validators    map[string]ports.WebhookValidator
	notifier      ports.NotificationGateway
	logger        *slog.Logger
}

func NewCheckoutService(
	repo ports.CheckoutRepository,
	uow ports.UnitOfWork,
	gateways map[string]ports.PaymentGateway,
	validators map[string]ports.WebhookValidator,
	notifier ports.NotificationGateway,
	logger *slog.Logger,
) *CheckoutService {
	return &CheckoutService{
		repo:          repo,
		uow:           uow,
		pricingEngine: NewPricingEngine(repo),
		gateways:      gateways,
		validators:    validators,
		notifier:      notifier,
		logger:        logger,
	}
}

type CreateCheckoutInput struct {
	CartID       string `json:"cart_id"`
	BuyerUserID  string `json:"buyer_user_id"`
	ProviderCode string `json:"provider_code"`
	ReturnURL    string `json:"return_url"`
}

func (s *CheckoutService) ProcessCheckout(ctx context.Context, input CreateCheckoutInput) (*domain.CheckoutResponse, error) {
	s.logger.Info("Starting checkout", "cart_id", input.CartID)

	// 1. MOTOR DE PRECIOS (Lee DB y Calcula)
	checkoutData, err := s.pricingEngine.CalculateTotalsOrchestrator(ctx, input.CartID)
	if err != nil {
		return nil, fmt.Errorf("pricing engine: %w", err)
	}

	// 2. Completar Datos del Checkout
	checkoutData.ID = uuid.New().String()
	checkoutData.Status = "created"
	checkoutData.IdempotencyKey = "chk_" + input.CartID + "_" + uuid.New().String()
	checkoutData.CreatedAt = time.Now()

	// 3. PERSISTIR CHECKOUT + CARGOS (Transacción)
	if err := s.repo.SaveCheckoutFull(ctx, checkoutData); err != nil {
		return nil, fmt.Errorf("db save checkout: %w", err)
	}

	// 4. CREAR INTENT
	intent := &domain.PaymentIntent{
		ID:           uuid.New().String(),
		CheckoutID:   checkoutData.ID,
		ProviderCode: input.ProviderCode,
		Currency:     checkoutData.Currency,
		AmountMinor:  checkoutData.TotalMinor,
		Status:       "requires_action",
	}

	// Buscar Provider ID (wompi)
	providerID, err := s.repo.GetProviderIDByCode(ctx, input.ProviderCode)
	if err != nil {
		return nil, fmt.Errorf("provider not found: %w", err)
	}
	intent.ProviderID = providerID

	// 5. SELECCIONAR GATEWAY Y LLAMAR
	gateway, exists := s.gateways[input.ProviderCode]
	if !exists {
		return nil, fmt.Errorf("unsupported provider code: %s", input.ProviderCode)
	}

	amountFloat := float64(checkoutData.TotalMinor) / 100.0
	gwResp, err := gateway.GeneratePaymentLink(ctx, amountFloat, checkoutData.Currency, intent.ID)
	if err != nil {
		return nil, fmt.Errorf("gateway error: %w", err)
	}
	// 6. ACTUALIZAR INTENT
	intent.ExternalID = gwResp.ExternalID
	intent.Status = "requires_action"

	if err := s.repo.SaveIntent(ctx, intent); err != nil {
		return nil, err
	}

	return &domain.CheckoutResponse{
		CheckoutID:      checkoutData.ID,
		PaymentIntentID: intent.ID,
		CheckoutURL:     gwResp.URL,
		Status:          checkoutData.Status,
		TotalAmount:     amountFloat,
		Currency:        checkoutData.Currency,
	}, nil
}
