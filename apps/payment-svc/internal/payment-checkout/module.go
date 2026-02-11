package paymentcheckout

import (
	"github.com/getinmotion/telar/apps/payment-svc/internal/bootstrap"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/adapters"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/usecases"
	"github.com/labstack/echo/v4"
)

type Module struct {
	handler *adapters.HTTPHandler
}

func (m *Module) Provide(c *bootstrap.Container) error {
	// Repositorio
	repo := adapters.NewPostgresRepository(c.PgPool) // Nota: Debes actualizar el repo con los métodos SaveIntent, SaveAttempt

	// Gateways
	cobreGateway := adapters.NewCobreGateway(c.Config.Cobre)
	wompiGateway := adapters.NewWompiGateway(c.Config.Wompi)

	// Service
	service := usecases.NewCheckoutService(repo, wompiGateway, cobreGateway, c.Logger)

	// Handler
	m.handler = adapters.NewHTTPHandler(service)

	return nil
}

func (m *Module) RegisterHTTP(e *echo.Echo) {
	// Endpoint unificado de pagos
	g := e.Group("/api/v1/payments")
	g.POST("/checkout", m.handler.CreateCheckout)
}
