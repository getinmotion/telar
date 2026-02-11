package adapters

import (
	"context"
	"encoding/json"
	"fmt"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

// Esta línea verifica en tiempo de compilación que cumplimos la interfaz
var _ ports.CheckoutRepository = (*PostgresRepository)(nil)

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

// --- CHECKOUTS ---

func (r *PostgresRepository) SaveCheckout(ctx context.Context, checkout *domain.Checkout) error {
	// Nota: Usamos ON CONFLICT para soportar actualizaciones si el ID ya existe
	sql := `
        INSERT INTO payments.checkouts 
        (id, cart_id, amount_minor, currency, status, cart_snapshot, expires_at, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        ON CONFLICT (id) DO UPDATE SET
            status = EXCLUDED.status,
            updated_at = EXCLUDED.updated_at
    `

	// Serializar el mapa de snapshot a JSON
	snapshotJSON, err := json.Marshal(checkout.CartSnapshot)
	if err != nil {
		// Si es nil, guardamos un objeto vacío
		snapshotJSON = []byte("{}")
	}

	_, err = r.db.Exec(ctx, sql,
		checkout.ID,
		checkout.CartID,
		checkout.AmountMinor,
		checkout.Currency,
		checkout.Status,
		snapshotJSON,
		checkout.ExpiresAt,
		checkout.CreatedAt,
		time.Now(),
	)

	if err != nil {
		return fmt.Errorf("db: failed to save checkout: %w", err)
	}
	return nil
}

func (r *PostgresRepository) GetCheckoutByID(ctx context.Context, id string) (*domain.Checkout, error) {
	sql := `
        SELECT id, cart_id, amount_minor, currency, status, cart_snapshot, expires_at, created_at 
        FROM payments.checkouts 
        WHERE id = $1`

	var c domain.Checkout
	var snapshotBytes []byte

	err := r.db.QueryRow(ctx, sql, id).Scan(
		&c.ID, &c.CartID, &c.AmountMinor, &c.Currency, &c.Status, &snapshotBytes, &c.ExpiresAt, &c.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("checkout not found")
	}
	if err != nil {
		return nil, fmt.Errorf("db: error getting checkout: %w", err)
	}

	// Deserializar JSONB a map
	if len(snapshotBytes) > 0 {
		_ = json.Unmarshal(snapshotBytes, &c.CartSnapshot)
	}

	return &c, nil
}

// --- INTENTS ---

func (r *PostgresRepository) SaveIntent(ctx context.Context, intent *domain.PaymentIntent) error {
	sql := `
        INSERT INTO payments.payment_intents 
        (id, checkout_id, provider, external_intent_id, idempotency_key, status, amount_minor, currency, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT (id) DO UPDATE SET
            external_intent_id = EXCLUDED.external_intent_id,
            status = EXCLUDED.status,
            updated_at = EXCLUDED.updated_at
    `

	_, err := r.db.Exec(ctx, sql,
		intent.ID,
		intent.CheckoutID,
		intent.Provider,
		intent.ExternalID,
		intent.IdempotencyKey,
		intent.Status,
		intent.AmountMinor,
		intent.Currency,
		intent.CreatedAt,
		time.Now(),
	)

	if err != nil {
		return fmt.Errorf("db: failed to save intent: %w", err)
	}
	return nil
}

func (r *PostgresRepository) GetIntentByExternalID(ctx context.Context, externalID string) (*domain.PaymentIntent, error) {
	sql := `
        SELECT id, checkout_id, provider, external_intent_id, idempotency_key, status, amount_minor, currency, created_at
        FROM payments.payment_intents
        WHERE external_intent_id = $1
    `
	var i domain.PaymentIntent
	err := r.db.QueryRow(ctx, sql, externalID).Scan(
		&i.ID, &i.CheckoutID, &i.Provider, &i.ExternalID, &i.IdempotencyKey, &i.Status, &i.AmountMinor, &i.Currency, &i.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil // O return error custom "not found"
	}
	if err != nil {
		return nil, fmt.Errorf("db: failed to get intent: %w", err)
	}
	return &i, nil
}

// --- ATTEMPTS ---

func (r *PostgresRepository) SaveAttempt(ctx context.Context, attempt *domain.PaymentAttempt) error {
	sql := `
        INSERT INTO payments.payment_attempts
        (id, payment_intent_id, status, request_payload, response_payload, error_message, created_at)
        VALUES ($1, $2, $3, $4, $5, $6, $7)
    `

	reqJSON, _ := json.Marshal(attempt.RequestPayload)
	resJSON, _ := json.Marshal(attempt.ResponsePayload)

	_, err := r.db.Exec(ctx, sql,
		attempt.ID,
		attempt.PaymentIntentID,
		attempt.Status,
		reqJSON,
		resJSON,
		attempt.ErrorMessage,
		attempt.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("db: failed to save attempt: %w", err)
	}
	return nil
}

// CountAttemptsByIntent implementa el método que faltaba
func (r *PostgresRepository) CountAttemptsByIntent(ctx context.Context, intentID string) (int, error) {
	sql := `SELECT COUNT(*) FROM payments.payment_attempts WHERE payment_intent_id = $1`

	var count int
	err := r.db.QueryRow(ctx, sql, intentID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("db: failed to count attempts: %w", err)
	}

	return count, nil
}
