package adapters

import (
	"context"
	"fmt"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
	"github.com/jackc/pgx/v5"
)

// pgxTxWrapper envuelve la transacción de pgx para cumplir la interfaz DBTransaction del puerto
type pgxTxWrapper struct {
	tx pgx.Tx
}

func (w *pgxTxWrapper) Commit(ctx context.Context) error {
	return w.tx.Commit(ctx)
}

func (w *pgxTxWrapper) Rollback(ctx context.Context) error {
	return w.tx.Rollback(ctx)
}

// extractTx es un helper de seguridad para evitar 'panics' al convertir la interfaz
func extractTx(tx ports.DBTransaction) (pgx.Tx, error) {
	wrapper, ok := tx.(*pgxTxWrapper)
	if !ok {
		return nil, fmt.Errorf("crítico: la transacción no es de tipo *pgxTxWrapper")
	}
	return wrapper.tx, nil
}

// --- Implementación de puertos UnitOfWork en PostgresRepository ---

func (r *PostgresRepository) BeginTx(ctx context.Context) (ports.DBTransaction, error) {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return nil, fmt.Errorf("error iniciando transacción: %w", err)
	}
	return &pgxTxWrapper{tx: tx}, nil
}

func (r *PostgresRepository) CheckoutRepo() ports.CheckoutRepository {
	return r
}

func (r *PostgresRepository) LedgerRepo() ports.LedgerRepository {
	return r
}

func (r *PostgresRepository) EventRepo() ports.EventRepository {
	return r
}

// =========================================================================
// IMPLEMENTACIÓN DE LOS MÉTODOS FALTANTES PARA CUMPLIR LAS INTERFACES
// =========================================================================

// --- 1. CheckoutRepo (Transaccionales) ---

func (r *PostgresRepository) GetIntentByIDForUpdate(ctx context.Context, tx ports.DBTransaction, intentID string) (*domain.PaymentIntent, error) {
	pgTx, err := extractTx(tx)
	if err != nil {
		return nil, err
	}

	// Bloqueo pesimista: FOR UPDATE evita que dos webhooks simultáneos modifiquen el mismo intent
	sql := `SELECT id, checkout_id, provider_id, external_intent_id, status, amount_minor, currency, created_at
	        FROM payments.payment_intents WHERE id = $1 FOR UPDATE`

	var i domain.PaymentIntent
	err = pgTx.QueryRow(ctx, sql, intentID).Scan(
		&i.ID, &i.CheckoutID, &i.ProviderID, &i.ExternalID, &i.Status, &i.AmountMinor, &i.Currency, &i.CreatedAt,
	)
	if err != nil {
		if err == pgx.ErrNoRows {
			return nil, fmt.Errorf("intent no encontrado: %s", intentID)
		}
		return nil, fmt.Errorf("error bloqueando intent para update: %w", err)
	}
	return &i, nil
}

func (r *PostgresRepository) UpdateIntentStatus(ctx context.Context, tx ports.DBTransaction, intentID string, status string) error {
	pgTx, err := extractTx(tx)
	if err != nil {
		return err
	}

	_, err = pgTx.Exec(ctx, "UPDATE payments.payment_intents SET status = $1 WHERE id = $2", status, intentID)
	if err != nil {
		return fmt.Errorf("error actualizando status del intent: %w", err)
	}
	return nil
}

func (r *PostgresRepository) UpdateCheckoutStatus(ctx context.Context, tx ports.DBTransaction, checkoutID string, status string) error {
	pgTx, err := extractTx(tx)
	if err != nil {
		return err
	}

	_, err = pgTx.Exec(ctx, "UPDATE payments.checkouts SET status = $1 WHERE id = $2", status, checkoutID)
	if err != nil {
		return fmt.Errorf("error actualizando status del checkout: %w", err)
	}
	return nil
}

// --- 2. EventRepo (Idempotencia) ---

func (r *PostgresRepository) SaveProcessedEvent(ctx context.Context, tx ports.DBTransaction, eventID string) error {
	pgTx, err := extractTx(tx)
	if err != nil {
		return err
	}

	// Si el event_id ya existe en base de datos, retornará un error de Unique Constraint
	_, err = pgTx.Exec(ctx, "INSERT INTO payments.processed_events (event_id) VALUES ($1)", eventID)
	return err
}

// --- 3. LedgerRepo (Contabilidad Doble) ---

func (r *PostgresRepository) GetOrCreateAccount(ctx context.Context, tx ports.DBTransaction, ownerType string, ownerID *string, accountType string, currency string) (string, error) {
	pgTx, err := extractTx(tx)
	if err != nil {
		return "", err
	}

	var id string

	// Upsert: Intentamos insertar la cuenta. Si ya existe la combinación única, devolvemos su ID.
	sql := `
		INSERT INTO ledger.accounts (owner_type, owner_id, account_type, currency)
		VALUES ($1, $2, $3, $4)
		ON CONFLICT (owner_type, owner_id, currency, account_type) 
		DO UPDATE SET currency = EXCLUDED.currency
		RETURNING id
	`
	err = pgTx.QueryRow(ctx, sql, ownerType, ownerID, accountType, currency).Scan(&id)
	if err != nil {
		return "", fmt.Errorf("error obteniendo/creando cuenta %s (%s): %w", accountType, ownerType, err)
	}
	return id, nil
}

func (r *PostgresRepository) SaveLedgerTransaction(ctx context.Context, tx ports.DBTransaction, referenceType string, referenceID string, currency string, idempotencyKey string, entries []domain.LedgerEntry) error {
	pgTx, err := extractTx(tx)
	if err != nil {
		return err
	}

	var txID string

	// 1. Crear el encabezado de la transacción contable
	sqlTx := `
		INSERT INTO ledger.transactions (reference_type, reference_id, currency, idempotency_key) 
		VALUES ($1, $2, $3, $4) RETURNING id
	`
	err = pgTx.QueryRow(ctx, sqlTx, referenceType, referenceID, currency, idempotencyKey).Scan(&txID)
	if err != nil {
		return fmt.Errorf("error creando ledger transaction: %w", err)
	}

	// 2. Insertar los movimientos (débitos y créditos) usando pgx.Batch (Mejora de performance)
	batch := &pgx.Batch{}
	sqlEntry := `INSERT INTO ledger.entries (transaction_id, account_id, amount_minor) VALUES ($1, $2, $3)`

	for _, entry := range entries {
		batch.Queue(sqlEntry, txID, entry.AccountID, entry.AmountMinor)
	}

	// Enviar todo el lote a Postgres en un solo viaje de red
	br := pgTx.SendBatch(ctx, batch)
	defer br.Close()

	// Verificar que cada instrucción del lote fue exitosa
	for i := 0; i < len(entries); i++ {
		_, err := br.Exec()
		if err != nil {
			return fmt.Errorf("error insertando ledger entry %d: %w", i, err)
		}
	}

	return nil
}
