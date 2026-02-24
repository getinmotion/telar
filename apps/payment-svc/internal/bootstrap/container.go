package bootstrap

import (
	"context"
	"log/slog"
	"os"
	"os/signal"
	"syscall"

	"github.com/getinmotion/telar/apps/payment-svc/config"
	"github.com/jackc/pgx/v5/pgxpool"
)

// Container mantiene las dependencias de INFRAESTRUCTURA.
// NO debe pasarse a los UseCases. Solo se usa en la fase de arranque (Provide).
type Container struct {
	// Lifecycle
	ShutdownCtx context.Context    // Contexto que se cancela al recibir SIGTERM/SIGINT
	cancel      context.CancelFunc // Función para cancelar el contexto manualmente si falla el arranque

	// Config & Observability
	Config *config.Config
	Logger *slog.Logger

	// Infraestructura (Raw)
	// Nota: Mantenemos esto exportado SOLO para que los Modules (en capa bootstrap)
	// puedan construir los Adapters. Los Adapters NUNCA deben recibir este Container,
	// deben recibir *pgxpool.Pool o una interfaz.
	PgPool *pgxpool.Pool
}

// NewContainer inicializa el contenedor y el contexto de apagado (Graceful Shutdown)
func NewContainer(cfg *config.Config, db *pgxpool.Pool) *Container {
	// Configuración de Logger
	opts := &slog.HandlerOptions{Level: slog.LevelInfo}
	if cfg.Env == "development" {
		opts.Level = slog.LevelDebug
	}
	logger := slog.New(slog.NewJSONHandler(os.Stdout, opts))

	// Configuración de Contexto de Apagado (Trapping Signals)
	// Esto reemplaza al context.Background() global.
	// Si llega un SIGTERM, este contexto se marca como Done().
	ctx, stop := signal.NotifyContext(context.Background(), os.Interrupt, syscall.SIGTERM)

	return &Container{
		ShutdownCtx: ctx,
		cancel:      stop,
		Config:      cfg,
		Logger:      logger,
		PgPool:      db,
	}
}

// Cleanup se debe llamar con defer en el main para cerrar recursos
func (c *Container) Cleanup() {
	c.Logger.Info("Cleaning up container resources...")
	if c.PgPool != nil {
		c.PgPool.Close()
	}
	c.cancel() // Asegura que el contexto se cancele
	c.Logger.Info("Container cleanup finished")
}
