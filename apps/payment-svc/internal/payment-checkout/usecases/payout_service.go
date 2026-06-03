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

type PayoutService struct {
	uow            ports.UnitOfWork
	payoutGateway  ports.PayoutGateway
	cobreBalanceID string // El BalanceID configurado para sacar el dinero
	logger         *slog.Logger
	validator      ports.WebhookValidator // <-- NUEVO
}

func NewPayoutService(
	uow ports.UnitOfWork,
	payoutGateway ports.PayoutGateway,
	cobreBalanceID string,
	logger *slog.Logger,
	validator ports.WebhookValidator,
) *PayoutService {
	return &PayoutService{
		uow:            uow,
		payoutGateway:  payoutGateway,
		cobreBalanceID: cobreBalanceID,
		logger:         logger,
		validator:      validator,
	}
}

// internal/payment-checkout/usecases/payout_service.go

func (s *PayoutService) ProcessSplitPayout(ctx context.Context, checkoutID string, percentage float64) (*domain.Payout, error) {
	s.logger.Info("Starting split payout process", "checkout_id", checkoutID, "percentage", percentage)

	// ==========================================
	// FASE 1: Transacción Corta (Bloqueo e Inicialización)
	// Objetivo: Bloquear, validar y guardar el estado inicial rapidísimo.
	// ==========================================
	tx1, err := s.uow.BeginTx(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin tx1: %w", err)
	}

	// 1. Bloqueo pesimista rápido (evita concurrencia en el mismo checkout)
	checkout, err := s.uow.CheckoutRepo().GetCheckoutByIDForUpdate(ctx, tx1, checkoutID)
	if err != nil {
		tx1.Rollback(ctx)
		return nil, fmt.Errorf("checkout not found or locked: %w", err)
	}

	if checkout.ContextShopID == nil {
		tx1.Rollback(ctx)
		return nil, fmt.Errorf("checkout does not have a linked shop")
	}
	sellerShopID := *checkout.ContextShopID

	// 2. Idempotencia Interna
	existingPayout, err := s.uow.PayoutRepo().GetPayoutByCheckoutAndShop(ctx, tx1, checkoutID, sellerShopID)
	if err != nil {
		tx1.Rollback(ctx)
		return nil, fmt.Errorf("error checking existing payout: %w", err)
	}
	if existingPayout != nil {
		tx1.Rollback(ctx)
		s.logger.Info("Payout already processed for this checkout and shop", "payout_id", existingPayout.ID)
		return existingPayout, nil
	}

	// 3. Preparar y Guardar Payout en estado inicial
	amountToPay := int64(float64(checkout.TotalMinor) * (percentage / 100.0))
	payoutID := uuid.New().String()
	now := time.Now()

	payout := &domain.Payout{
		ID:           payoutID,
		CheckoutID:   checkout.ID,
		SellerShopID: sellerShopID,
		Percentage:   percentage,
		AmountMinor:  amountToPay,
		Currency:     checkout.Currency,
		Status:       domain.PayoutStatusInitiated, // Asumiendo que definiste estas constantes en domain
		CreatedAt:    now,
		UpdatedAt:    now,
	}

	if err := s.uow.PayoutRepo().SavePayout(ctx, tx1, payout); err != nil {
		tx1.Rollback(ctx)
		return nil, fmt.Errorf("failed to save initiated payout to db: %w", err)
	}

	// ¡COMMIT! Liberamos la Base de Datos antes de ir a Internet
	if err := tx1.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit tx1: %w", err)
	}

	// ==========================================
	// FASE 2: Llamadas a la Red Externa (Sin Lock en DB)
	// Objetivo: Hablar con Cobre sin afectar nuestra infraestructura
	// ==========================================

	// El counterparty (datos bancarios del vendedor) DEBE haber sido registrado
	// previamente por el artesano desde su dashboard (BankDataPage) o por un admin
	// vía el API central (POST /cobre/counterparty-admin).
	// El id_contraparty se almacena en shop.artisan_shops.cobre_counterparty_id.
	destinationCobreID, err := s.getSellerAccountData(ctx, sellerShopID)
	if err != nil || destinationCobreID == "" {
		s.markPayoutFailed(ctx, payout.ID,
			fmt.Errorf("seller %s has no bank data registered (cobre_counterparty_id is empty)", sellerShopID))
		return nil, fmt.Errorf("seller has no bank data: must register via artisan dashboard first")
	}
	s.logger.Info("Using seller Cobre Counterparty from DB", "shop_id", sellerShopID, "cp_id", destinationCobreID)

	// 3. Proceder al pago usando el destinationCobreID
	movementID, err := s.payoutGateway.CreateMoneyMovement(
		ctx,
		s.cobreBalanceID,
		destinationCobreID,
		amountToPay,
		payout.ID,
	)

	if err != nil {
		s.markPayoutFailed(ctx, payout.ID, err)
		return nil, fmt.Errorf("cobre money movement failed: %w", err)
	}

	// ==========================================
	// FASE 3: Transacción Corta (Actualización y Ledger Contable)
	// Objetivo: Registrar el éxito y mover el dinero internamente
	// ==========================================

	tx2, err := s.uow.BeginTx(ctx)
	if err != nil {
		return nil, fmt.Errorf("failed to begin tx2: %w", err)
	}
	defer tx2.Rollback(ctx)

	// 1. Actualizar estado y la referencia externa de Cobre
	payout.ExternalMovementID = &movementID
	payout.Status = domain.PayoutStatusProcessing

	if err := s.uow.PayoutRepo().UpdatePayoutStatus(ctx, tx2, payout.ID, payout.Status); err != nil {
		return nil, fmt.Errorf("failed to update payout status: %w", err)
	}
	if err := s.uow.PayoutRepo().UpdatePayoutExternalID(ctx, tx2, payout.ID, movementID); err != nil {
		return nil, fmt.Errorf("failed to update external ID: %w", err)
	}

	// 2. Ejecutar la doble partida (Ledger)
	if err := s.recordPayoutLedger(ctx, tx2, payout); err != nil {
		return nil, fmt.Errorf("failed to record payout ledger: %w", err)
	}

	// ¡COMMIT FINAL!
	if err := tx2.Commit(ctx); err != nil {
		return nil, fmt.Errorf("failed to commit tx2: %w", err)
	}

	s.logger.Info("Split payout initiated successfully", "payout_id", payout.ID, "cobre_movement_id", movementID)
	return payout, nil
}

// markPayoutFailed es un helper para manejar fallos de red sin ensuciar la lógica principal
func (s *PayoutService) markPayoutFailed(ctx context.Context, payoutID string, originalErr error) {
	s.logger.Error("Network call failed, marking payout as failed", "payout_id", payoutID, "error", originalErr)

	tx, err := s.uow.BeginTx(ctx)
	if err != nil {
		s.logger.Error("Could not start tx to mark payout failed", "payout_id", payoutID)
		return
	}
	defer tx.Rollback(ctx)

	// Actualizamos a fallido. Como no se registró en el Ledger aún, no necesitamos revertir contabilidad.
	_ = s.uow.PayoutRepo().UpdatePayoutStatus(ctx, tx, payoutID, domain.PayoutStatusFailed)
	_ = tx.Commit(ctx)
}

// recordPayoutLedger registra los movimientos contables del desembolso
func (s *PayoutService) recordPayoutLedger(ctx context.Context, tx ports.DBTransaction, payout *domain.Payout) error {
	repo := s.uow.LedgerRepo()

	// 1. Identificar cuentas
	// Cuenta "shop_pending" (Pasivo de la plataforma hacia el vendedor)
	shopPendingAccID, err := repo.GetOrCreateAccount(ctx, tx, "shop", &payout.SellerShopID, "pending", payout.Currency)
	if err != nil {
		return err
	}

	// Cuenta "platform_clearing_cobre" (Activo virtual de la plataforma en el proveedor)
	// Como sale dinero físico, reducimos este saldo.
	clearingAccID, err := repo.GetOrCreateAccount(ctx, tx, "platform", nil, "clearing", payout.Currency)
	if err != nil {
		return err
	}

	// 2. Construir Partida Doble
	entries := []domain.LedgerEntry{
		// DÉBITO (+): Reducimos la deuda que teníamos con el vendedor
		{AccountID: shopPendingAccID, AmountMinor: payout.AmountMinor},
		// CRÉDITO (-): Sale dinero virtual de nuestra cuenta de clearing
		{AccountID: clearingAccID, AmountMinor: -payout.AmountMinor},
	}

	if err := domain.ValidateDoubleEntry(entries); err != nil {
		return err
	}

	// 3. Persistir en el Ledger
	return repo.SaveLedgerTransaction(
		ctx,
		tx,
		"payout",  // reference_type
		payout.ID, // reference_id
		payout.Currency,
		"payout_tx_"+payout.ID, // idempotency_key
		entries,
	)
}

func (s *PayoutService) ProcessPayoutWebhook(ctx context.Context, externalMovementID string, eventKey string, rawPayload []byte, signature string, timestamp string) error {
	s.logger.Info("Processing Payout Webhook", "movement_id", externalMovementID, "event", eventKey)

	if err := s.validator.ValidateSignature(rawPayload, signature, timestamp); err != nil {
		return fmt.Errorf("invalid webhook signature: %w", err)
	}

	tx, err := s.uow.BeginTx(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	payout, err := s.uow.PayoutRepo().GetPayoutByExternalID(ctx, externalMovementID)
	if err != nil {
		s.logger.Warn("Payout not found for external movement, forcing retry", "movement_id", externalMovementID)
		// Devolver error fuerza un HTTP 500, haciendo que Cobre REINTENTE más tarde.
		return fmt.Errorf("payout not found, try again later")
	}

	// Si ya está en estado terminal, lo ignoramos (Idempotencia básica)
	if payout.Status == domain.PayoutStatusCompleted || payout.Status == domain.PayoutStatusFailed {
		return nil
	}

	if eventKey == "money_movements.status.completed" {
		// ¡Éxito! El dinero llegó al vendedor
		err = s.uow.PayoutRepo().UpdatePayoutStatus(ctx, tx, payout.ID, domain.PayoutStatusCompleted)
		if err != nil {
			return err
		}
	} else if eventKey == "money_movements.status.rejected" || eventKey == "money_movements.status.failed" {
		// ¡Fallo! El banco rebotó el dinero.
		err = s.uow.PayoutRepo().UpdatePayoutStatus(ctx, tx, payout.ID, domain.PayoutStatusFailed)
		if err != nil {
			return err
		}

		// REVERSIÓN CONTABLE
		if err := s.reversePayoutLedger(ctx, tx, payout); err != nil {
			return fmt.Errorf("ledger reversion failed: %w", err)
		}
	}

	return tx.Commit(ctx)
}

// reversePayoutLedger reversa la operación contable original si el banco rechaza el pago
func (s *PayoutService) reversePayoutLedger(ctx context.Context, tx ports.DBTransaction, payout *domain.Payout) error {
	repo := s.uow.LedgerRepo()

	shopPendingAccID, err := repo.GetOrCreateAccount(ctx, tx, "shop", &payout.SellerShopID, "pending", payout.Currency)
	if err != nil {
		return err
	}

	clearingAccID, err := repo.GetOrCreateAccount(ctx, tx, "platform", nil, "clearing", payout.Currency)
	if err != nil {
		return err
	}

	// Partida Doble Inversa a la original:
	entries := []domain.LedgerEntry{
		// CRÉDITO (-): Le devolvemos la deuda a la tienda (porque no pudimos pagarle)
		{AccountID: shopPendingAccID, AmountMinor: -payout.AmountMinor},
		// DÉBITO (+): El dinero virtual vuelve a nuestra cuenta de clearing
		{AccountID: clearingAccID, AmountMinor: payout.AmountMinor},
	}

	if err := domain.ValidateDoubleEntry(entries); err != nil {
		return err
	}

	return repo.SaveLedgerTransaction(
		ctx, tx, "payout_reversion", payout.ID, payout.Currency,
		"payout_reversion_tx_"+payout.ID, // idempotency key único para la reversión
		entries,
	)
}

// Métodos internos para manejar la persistencia del ID de Cobre
func (s *PayoutService) getSellerAccountData(ctx context.Context, shopID string) (string, error) {
	// Usamos el repo para ver si ya tenemos el ID de Cobre de este vendedor
	return s.uow.CheckoutRepo().(interface {
		GetShopCobreID(context.Context, string) (string, error)
	}).GetShopCobreID(ctx, shopID)
}

func (s *PayoutService) saveSellerCobreID(ctx context.Context, shopID string, cobreID string) error {
	return s.uow.CheckoutRepo().(interface {
		SaveShopCobreID(context.Context, string, string) error
	}).SaveShopCobreID(ctx, shopID, cobreID)
}
