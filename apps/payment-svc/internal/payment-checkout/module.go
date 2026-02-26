// internal/payment-checkout/module.go

package paymentcheckout

import (
	"github.com/getinmotion/telar/apps/payment-svc/internal/bootstrap"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/adapters"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/handlers"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/usecases"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *handlers.HTTPHandler
}

func (m *Module) Provide(c *bootstrap.Container) error {
	repo := adapters.NewPostgresRepository(c.PgPool)

	// Gateways
	wompiGateway := adapters.NewWompiGateway(c.Config.Wompi)
	cobreGateway := adapters.NewCobreGateway(c.Config.Cobre)
	gateways := map[string]ports.PaymentGateway{
		"wompi": wompiGateway,
		"cobre": cobreGateway,
	}

	// Validators
	wompiValidator := adapters.NewWompiSignatureValidator(c.Config.Wompi.EventsSecret)
	cobreValidator := adapters.NewCobreSignatureValidator(c.Config.Cobre.APISecret)
	validators := map[string]ports.WebhookValidator{
		"wompi": wompiValidator,
		"cobre": cobreValidator,
	}

	// Notifier
	notifier := adapters.NewHTTPNotifier(c.Config.CentralAppURL)

	service := usecases.NewCheckoutService(
		repo,
		repo,
		gateways,
		validators,
		notifier,
		c.Logger,
	)

	m.handler = handlers.NewHTTPHandler(service)
	return nil
}

func (m *Module) RegisterHTTP(e *echo.Echo) {
	g := e.Group("/api/v1/payments")
	m.handler.RegisterRoutes(g)
}
