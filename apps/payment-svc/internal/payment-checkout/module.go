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
	// 1. Repo
	repo := adapters.NewPostgresRepository(c.PgPool)

	// 2. Gateways
	// Cobre lo instanciamos pero NO lo usamos por ahora en el servicio v1
	// _ = adapters.NewCobreGateway(c.Config.Cobre)

	wompiGateway := adapters.NewWompiGateway(c.Config.Wompi)

	// 3. Service
	// CORRECCIÓN: Quitamos cobreGateway de los argumentos para coincidir con la definición
	service := usecases.NewCheckoutService(repo, wompiGateway, c.Logger)

	// 4. Handler
	m.handler = adapters.NewHTTPHandler(service)

	return nil
}

func (m *Module) RegisterHTTP(e *echo.Echo) {
	g := e.Group("/api/v1/payments")
	g.POST("/checkout", m.handler.CreateCheckout)
}
