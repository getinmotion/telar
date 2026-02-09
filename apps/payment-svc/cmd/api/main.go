package main

import (
	"context"
	"log/slog"
	"net/http"
	"os"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/config"
	"github.com/getinmotion/telar/apps/payment-svc/infra"
	"github.com/getinmotion/telar/apps/payment-svc/internal/bootstrap"
	paymentcheckout "github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout"
)

func main() {
	// 1. Cargar Configuración
	cfg := config.Load()

	// Logger temporal para el bootstrap de infraestructura
	initLogger := slog.New(slog.NewJSONHandler(os.Stdout, nil))

	// 2. Crear conexión a DB (Infra pura)
	initCtx := context.Background()
	dbPool, err := infra.NewPostgresClient(initCtx, cfg, initLogger)
	if err != nil {
		// Usamos Error y os.Exit porque log.Fatal no es estructurado en slog por defecto
		initLogger.Error("Fatal: could not connect to DB", "error", err)
		os.Exit(1)
	}

	// 3. Crear Contenedor (Wiring)
	// Esto inicializa el logger definitivo de la app y el contexto de apagado
	c := bootstrap.NewContainer(cfg, dbPool)
	defer c.Cleanup()

	// 4. Crear App HTTP (Echo)
	app := bootstrap.NewHTTPApp()

	// 5. Registrar Módulos
	// Aquí se inyectan las dependencias (Postgres -> Repo -> Service -> Handler)
	modules := []bootstrap.Module{
		&paymentcheckout.Module{},
	}

	if err := bootstrap.ApplyModules(c, app, modules...); err != nil {
		c.Logger.Error("Error initializing modules", "error", err)
		os.Exit(1)
	}

	// 6. Arrancar Servidor en Goroutine
	go func() {
		c.Logger.Info("Starting server", "port", cfg.Port)
		if err := app.Start(":" + cfg.Port); err != nil && err != http.ErrServerClosed {
			c.Logger.Error("Server shutting down unexpectedly", "error", err)
		}
	}()

	// 7. Esperar señal de apagado (Ctrl+C o SIGTERM)
	<-c.ShutdownCtx.Done()

	c.Logger.Info("Shutting down server...")

	// Contexto de timeout para terminar peticiones vivas (10 seg máx)
	shutdownCtx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	if err := app.Shutdown(shutdownCtx); err != nil {
		c.Logger.Error("Server forced to shutdown", "error", err)
	}

	c.Logger.Info("Server exited properly")
}
