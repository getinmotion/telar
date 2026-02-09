package adapters

import (
	"context"
	"log/slog"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/jackc/pgx/v5/pgxpool"
)

type PostgresRepository struct {
	db *pgxpool.Pool
}

func NewPostgresRepository(db *pgxpool.Pool) *PostgresRepository {
	return &PostgresRepository{db: db}
}

// Save implementa el puerto CheckoutRepository
func (r *PostgresRepository) Save(ctx context.Context, order *domain.CheckoutOrder) error {
	// TODO: Implementar INSERT real cuando tengamos la tabla definida
	// sql := `INSERT INTO checkouts (id, amount, status) VALUES ($1, $2, $3)`

	slog.Info("DUMMY DB: Saving order to Postgres",
		"cart_id", order.CartID,
		"cobre_id", order.ExternalID,
		"amount", order.AmountMinor,
	)

	return nil
}
