package usecases

import (
	"context"
	"fmt"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
)

func (s *CheckoutService) ProcessPaymentEvent(ctx context.Context, rawPayload []byte, event domain.PaymentGatewayEvent) error {
	// 1. Validar Firma (Adapter inyectado) - Ahora usamos el nombre correcto
	if err := s.wompiValidator.ValidateSignature(rawPayload, ""); err != nil {
		return fmt.Errorf("invalid signature: %w", err)
	}

	tx, err := s.uow.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// 2. Idempotencia de Evento Webhook
	if err := s.uow.EventRepo().SaveProcessedEvent(ctx, tx, event.EventID); err != nil {
		s.logger.Info("Webhook idempotency triggered, event already processed", "event_id", event.EventID)
		return nil
	}

	intent, err := s.uow.CheckoutRepo().GetIntentByIDForUpdate(ctx, tx, event.PaymentLinkID)
	if err != nil {
		return fmt.Errorf("intent not found: %w", err)
	}

	if intent.Status == "SUCCEEDED" || intent.Status == "FAILED" {
		return tx.Commit(ctx)
	}

	var newIntentStatus, newCheckoutStatus string
	if event.Status == "APPROVED" {
		newIntentStatus, newCheckoutStatus = "SUCCEEDED", "PAID"
	} else if event.Status == "DECLINED" || event.Status == "ERROR" {
		newIntentStatus, newCheckoutStatus = "FAILED", "FAILED"
	} else {
		return tx.Commit(ctx)
	}

	if err := s.uow.CheckoutRepo().UpdateIntentStatus(ctx, tx, intent.ID, newIntentStatus); err != nil {
		return err
	}
	if err := s.uow.CheckoutRepo().UpdateCheckoutStatus(ctx, tx, intent.CheckoutID, newCheckoutStatus); err != nil {
		return err
	}

	if newCheckoutStatus == "PAID" {
		// CORRECCIÓN: Quitamos el 'tx' porque la interfaz original solo pide (ctx, checkoutID)
		checkout, _ := s.uow.CheckoutRepo().GetCheckoutByID(ctx, intent.CheckoutID)

		if err := s.recordLedgerMovement(ctx, tx, intent, checkout, event.EventID); err != nil {
			return fmt.Errorf("ledger error: %w", err)
		}
	}

	return tx.Commit(ctx)
}
func (s *CheckoutService) recordLedgerMovement(ctx context.Context, tx ports.DBTransaction, intent *domain.PaymentIntent, checkout *domain.Checkout, eventID string) error {
	repo := s.uow.LedgerRepo()
	currency := intent.Currency

	// 1. Obtener/Crear los UUIDs de las Cuentas en BD
	// Cuenta Puente del Gateway (Plataforma)
	clearingAccID, err := repo.GetOrCreateAccount(ctx, tx, "platform", nil, "clearing", currency)
	if err != nil {
		return err
	}

	// Cuenta de Ganancia de Plataforma
	revenueAccID, err := repo.GetOrCreateAccount(ctx, tx, "platform", nil, "revenue", currency)
	if err != nil {
		return err
	}

	// Cuenta Pendiente del Vendedor (Shop)
	pendingAccID, err := repo.GetOrCreateAccount(ctx, tx, "shop", checkout.ContextShopID, "pending", currency)
	if err != nil {
		return err
	}

	// 2. Cálculos (Simplificado, en prod viene de checkout.Charges)
	totalAmount := intent.AmountMinor
	platformFee := int64(float64(totalAmount) * 0.05) // Comisión inventada del 5%
	sellerDue := totalAmount - platformFee

	// 3. Construir Asientos Contables (Entries)
	entries := []domain.LedgerEntry{
		{AccountID: clearingAccID, AmountMinor: totalAmount}, // DÉBITO (+) Plataforma recibe dinero del Gateway
		{AccountID: pendingAccID, AmountMinor: -sellerDue},   // CRÉDITO (-) Plataforma debe dinero al Vendedor
		{AccountID: revenueAccID, AmountMinor: -platformFee}, // CRÉDITO (-) Plataforma reconoce ingreso
	}

	if err := domain.ValidateDoubleEntry(entries); err != nil {
		return err
	}

	// 4. Guardar Transacción y Entradas en la DB
	// Usamos el EventID de Wompi como IdempotencyKey de la transacción del Ledger
	return repo.SaveLedgerTransaction(
		ctx,
		tx,
		"payment_intent", // reference_type
		intent.ID,        // reference_id
		currency,
		"wompi_webhook_"+eventID, // idempotency_key
		entries,
	)
}
