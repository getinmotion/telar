package adapters

import (
	"context"
	//	"database/sql"
	"encoding/json"
	"fmt"

	//	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

var _ ports.CheckoutRepository = (*PostgresRepository)(nil)

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

// --- CHECKOUTS ---

// GetCheckoutByID: Actualizado al nuevo esquema SQL
func (r *PostgresRepository) GetCheckoutByID(ctx context.Context, id string) (*domain.Checkout, error) {
	sql := `
		SELECT id, cart_id, buyer_user_id, context, currency, status, 
		       subtotal_minor, charges_total_minor, total_minor, idempotency_key, created_at
		FROM payments.checkouts 
		WHERE id = $1
	`
	var c domain.Checkout

	// Nota: Scan debe coincidir con el SELECT y el Struct
	err := r.db.QueryRow(ctx, sql, id).Scan(
		&c.ID, &c.CartID, &c.BuyerUserID, &c.Context, &c.Currency, &c.Status,
		&c.SubtotalMinor, &c.ChargesTotalMinor, &c.TotalMinor, &c.IdempotencyKey, &c.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, fmt.Errorf("checkout not found")
	}
	if err != nil {
		return nil, fmt.Errorf("db: error getting checkout: %w", err)
	}

	return &c, nil
}

// --- INTENTS ---

func (r *PostgresRepository) SaveIntent(ctx context.Context, intent *domain.PaymentIntent) error {
	// SIN idempotency_key
	sql := `
		INSERT INTO payments.payment_intents 
		(id, checkout_id, provider_id, currency, amount_minor, status, external_intent_id, created_at)
		VALUES ($1, $2, $3, $4, $5, $6::payments.payment_intent_status, $7, $8)
		ON CONFLICT (id) DO UPDATE SET 
			status = EXCLUDED.status, 
			external_intent_id = EXCLUDED.external_intent_id,
			updated_at = NOW()
	`
	_, err := r.db.Exec(ctx, sql,
		intent.ID,
		intent.CheckoutID,
		intent.ProviderID,
		intent.Currency,
		intent.AmountMinor,
		intent.Status,
		intent.ExternalID,
		intent.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("db: failed to save intent: %w", err)
	}
	return nil
}

func (r *PostgresRepository) GetIntentByExternalID(ctx context.Context, externalID string) (*domain.PaymentIntent, error) {
	sql := `
		SELECT id, checkout_id, provider_id, external_intent_id, status, amount_minor, currency, created_at
		FROM payments.payment_intents
		WHERE external_intent_id = $1
	`
	var i domain.PaymentIntent
	err := r.db.QueryRow(ctx, sql, externalID).Scan(
		&i.ID, &i.CheckoutID, &i.ProviderID, &i.ExternalID, &i.Status, &i.AmountMinor, &i.Currency, &i.CreatedAt,
	)

	if err == pgx.ErrNoRows {
		return nil, nil
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
		attempt.ID, attempt.PaymentIntentID, attempt.Status,
		reqJSON, resJSON, attempt.ErrorMessage, attempt.CreatedAt,
	)

	if err != nil {
		return fmt.Errorf("db: failed to save attempt: %w", err)
	}
	return nil
}

func (r *PostgresRepository) CountAttemptsByIntent(ctx context.Context, intentID string) (int, error) {
	sql := `SELECT COUNT(*) FROM payments.payment_attempts WHERE payment_intent_id = $1`
	var count int
	err := r.db.QueryRow(ctx, sql, intentID).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("db: failed to count attempts: %w", err)
	}
	return count, nil
}

// --- NEW METHODS (Requeridos por la interfaz y PricingEngine) ---

// 1. GetCartContext
func (r *PostgresRepository) GetCartContext(ctx context.Context, cartID string) (*domain.CartContext, error) {
	sqlCart := `
		SELECT c.id, c.buyer_user_id, c.currency, c.status,
		       s.full_name, s.address, s.desc_ciudad, s.desc_depart, s.postal_code, s.desc_envio, s.valor_total_flete_minor
		FROM payments.carts c
		LEFT JOIN payments.cart_shipping_info s ON c.id = s.cart_id
		WHERE c.id = $1
	`
	cart := &domain.CartContext{}
	var shipName, shipAddr, shipCity, shipState, shipZip, shipMethod *string
	var shipCost *int64

	err := r.db.QueryRow(ctx, sqlCart, cartID).Scan(
		&cart.ID, &cart.BuyerUserID, &cart.Currency, &cart.Status,
		&shipName, &shipAddr, &shipCity, &shipState, &shipZip, &shipMethod, &shipCost,
	)
	if err != nil {
		return nil, fmt.Errorf("cart not found: %w", err)
	}

	if shipName != nil {
		cart.ShippingInfo = &domain.CartShippingInfo{
			FullName:          *shipName,
			Address:           *shipAddr,
			City:              *shipCity,
			State:             *shipState,
			PostalCode:        *shipZip,
			ShippingMethod:    *shipMethod,
			ShippingCostMinor: *shipCost,
		}
	}

	// Leer Items
	sqlItems := `SELECT id, product_id, seller_shop_id, quantity, unit_price_minor FROM payments.cart_items WHERE cart_id = $1`
	rows, err := r.db.Query(ctx, sqlItems, cartID)
	if err != nil {
		return nil, fmt.Errorf("failed to get items: %w", err)
	}
	defer rows.Close()

	for rows.Next() {
		var item domain.CartItem
		if err := rows.Scan(&item.ID, &item.ProductID, &item.SellerShopID, &item.Quantity, &item.UnitPriceMinor); err != nil {
			return nil, err
		}
		cart.Items = append(cart.Items, item)
	}
	return cart, nil
}

// 2. GetProviderIDByCode
func (r *PostgresRepository) GetProviderIDByCode(ctx context.Context, code string) (string, error) {
	var id string
	err := r.db.QueryRow(ctx, "SELECT id FROM payments.payment_providers WHERE code = $1", code).Scan(&id)
	if err == pgx.ErrNoRows {
		return "", fmt.Errorf("provider '%s' not found", code)
	}
	return id, err
}

// 3. GetChargeTypeID (Helper interno y externo)
func (r *PostgresRepository) GetChargeTypeID(ctx context.Context, code string) (string, error) {
	var id string
	err := r.db.QueryRow(ctx, "SELECT id FROM payments.charge_types WHERE code = $1", code).Scan(&id)
	return id, err
}

// 4. SaveCheckoutFull (La nueva forma de guardar)
func (r *PostgresRepository) SaveCheckoutFull(ctx context.Context, checkout *domain.Checkout) error {
	tx, err := r.db.Begin(ctx)
	if err != nil {
		return err
	}
	defer tx.Rollback(ctx)

	// Insertar Checkout
	sqlCheckout := `
		INSERT INTO payments.checkouts 
		(id, cart_id, buyer_user_id, context, currency, status, subtotal_minor, charges_total_minor, total_minor, idempotency_key, created_at)
		VALUES ($1, $2, $3, $4::payments.sale_context, $5, $6::payments.checkout_status, $7, $8, $9, $10, $11)
	`
	_, err = tx.Exec(ctx, sqlCheckout,
		checkout.ID, checkout.CartID, checkout.BuyerUserID, checkout.Context,
		checkout.Currency, checkout.Status, checkout.SubtotalMinor,
		checkout.ChargesTotalMinor, checkout.TotalMinor, checkout.IdempotencyKey, checkout.CreatedAt,
	)
	if err != nil {
		return fmt.Errorf("insert checkout: %w", err)
	}

	// Insertar Cargos
	sqlInsertCharge := `
		INSERT INTO payments.checkout_charges (checkout_id, charge_type_id, scope, amount_minor, currency)
		VALUES ($1, $2, $3::payments.charge_scope, $4, $5)
	`
	for _, charge := range checkout.Charges {
		typeID, err := r.GetChargeTypeID(ctx, charge.TypeCode)
		if err != nil {
			return fmt.Errorf("charge type '%s' invalid", charge.TypeCode)
		}

		_, err = tx.Exec(ctx, sqlInsertCharge,
			checkout.ID, typeID, charge.Scope, charge.AmountMinor, checkout.Currency,
		)
		if err != nil {
			return fmt.Errorf("insert charge: %w", err)
		}
	}

	return tx.Commit(ctx)
}
