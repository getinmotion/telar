// internal/payment-checkout/usecases/return_webhook.go
package usecases

import (
	"context"
	"fmt"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
)

func (s *CheckoutService) ProcessPaymentEvent(ctx context.Context, providerCode string, rawPayload []byte, event domain.PaymentGatewayEvent) error {

	// 1. Validar Firma dinámicamente según el proveedor
	validator, exists := s.validators[providerCode]
	if exists {
		// Aquí le pasamos el header de la firma (por ahora vacío)
		if err := validator.ValidateSignature(rawPayload, ""); err != nil {
			return fmt.Errorf("invalid signature for %s: %w", providerCode, err)
		}
	} else {
		s.logger.Warn("No validator found for provider, skipping signature check", "provider", providerCode)
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

	// --- INICIO DE LA LÓGICA DE NOTIFICACIÓN ---
	if newCheckoutStatus == "PAID" {
		// CORRECCIÓN: Quitamos el 'tx' porque la interfaz original solo pide (ctx, checkoutID)
		checkout, _ := s.uow.CheckoutRepo().GetCheckoutByID(ctx, intent.CheckoutID)

		if err := s.recordLedgerMovement(ctx, tx, intent, checkout, event.EventID); err != nil {
			return fmt.Errorf("ledger error: %w", err)
		}
	}

	// 1. Guardamos la transacción en Postgres primero
	if err := tx.Commit(ctx); err != nil {
		return err
	}

	// 2. Si el commit fue exitoso y el estado es definitivo, NOTIFICAMOS.
	if newCheckoutStatus == "PAID" || newCheckoutStatus == "FAILED" {

		// Obtenemos el checkout si no lo hemos buscado antes (caso FAILED)
		checkout, _ := s.uow.CheckoutRepo().GetCheckoutByID(ctx, intent.CheckoutID)
		cartID := ""
		if checkout != nil {
			cartID = checkout.CartID
		}

		payload := ports.PaymentNotification{
			GatewayCode:   intent.ProviderCode, // "wompi" o "cobre"
			TransactionID: intent.ID,           // Identificador interno del movimiento
			CartID:        cartID,              // Para generar guías en tu API central
			Status:        newCheckoutStatus,
		}

		// Ejecutamos en background (Goroutine) con un contexto independiente
		// para no fallar la petición HTTP principal.
		go func(bgCtx context.Context, p ports.PaymentNotification) {
			s.logger.Info("Sending payment notification to central API", "cart_id", p.CartID)
			if err := s.notifier.NotifyPaymentConfirmation(bgCtx, p); err != nil {
				// Aquí solo logueamos. En un sistema ultra-resiliente podrías implementar
				// un Outbox Pattern o enviar a RabbitMQ/SQS.
				s.logger.Error("Failed to notify central API", "error", err, "cart_id", p.CartID)
			}
		}(context.Background(), payload)
	}

	return nil
	// --- FIN DE LA LÓGICA DE NOTIFICACIÓN ---
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
