package paymentcheckout

import (
	"github.com/getinmotion/telar/apps/payment-svc/internal/bootstrap"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/adapters"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/handlers"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/usecases"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *handlers.HTTPHandler
}

func (m *Module) Provide(c *bootstrap.Container) error {
	// 1. Repo Principal (Implementa CheckoutRepo, LedgerRepo, EventRepo y UnitOfWork)
	repo := adapters.NewPostgresRepository(c.PgPool)

	// 2. Gateways & Validators
	wompiGateway := adapters.NewWompiGateway(c.Config.Wompi)
	wompiValidator := adapters.NewWompiSignatureValidator(c.Config.Wompi.EventsSecret)

	// 3. Service
	// Pasamos 'repo' dos veces: una como CheckoutRepository y otra como UnitOfWork.
	// ¡Magia de las interfaces en Go!
	service := usecases.NewCheckoutService(
		repo,           // ports.CheckoutRepository
		repo,           // ports.UnitOfWork
		wompiGateway,   // ports.PaymentGateway
		wompiValidator, // ports.WebhookValidator
		c.Logger,       // *slog.Logger
	)

	// 4. Handler
	m.handler = handlers.NewHTTPHandler(service)

	return nil
}

func (m *Module) RegisterHTTP(e *echo.Echo) {
	g := e.Group("/api/v1/payments")
	m.handler.RegisterRoutes(g)
}
