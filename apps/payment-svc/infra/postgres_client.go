package infra

import (
	"context"
	"fmt"
	"log/slog"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

// NewPostgresClient inicializa el pool de conexiones.
// Retorna *pgxpool.Pool, que es thread-safe y maneja la concurrencia.
func NewPostgresClient(ctx context.Context, cfg *config.Config, logger *slog.Logger) (*pgxpool.Pool, error) {
	// 1. Parsing de la configuración
	poolConfig, err := pgxpool.ParseConfig(cfg.SQLDataSource)
	if err != nil {
		return nil, fmt.Errorf("unable to parse database config: %w", err)
	}

	// 2. Ajustes de Performance (Tuning)
	// En producción, estos valores deberían venir del config
	poolConfig.MaxConns = 25
	poolConfig.MinConns = 2
	poolConfig.MaxConnLifetime = 1 * time.Hour
	poolConfig.MaxConnIdleTime = 30 * time.Minute

	// 3. Health Check timeout (fail fast)
	initCtx, cancel := context.WithTimeout(ctx, 5*time.Second)
	defer cancel()

	// 4. Crear el Pool
	pool, err := pgxpool.NewWithConfig(initCtx, poolConfig)
	if err != nil {
		return nil, fmt.Errorf("unable to create connection pool: %w", err)
	}

	// 5. Ping inicial para asegurar conectividad
	if err := pool.Ping(initCtx); err != nil {
		return nil, fmt.Errorf("database ping failed: %w", err)
	}

	logger.Info("Postgres connection established successfully")
	return pool, nil
}
