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

// Provide es el único lugar que "conoce" el Container y la DB cruda.
func (m *Module) Provide(c *bootstrap.Container) error {

	// 1. Capa ADAPTER (Infraestructura)
	// Inicializamos el repositorio de Postgres
	repo := adapters.NewPostgresRepository(c.PgPool)

	// Inicializamos el Gateway de Cobre con la config cargada
	// Asegúrate de que tu config.go tenga el campo 'Cobre' lleno correctamente
	gateway := adapters.NewCobreGateway(c.Config.Cobre)

	// 2. Capa DOMAIN/APPLICATION (Use Cases)
	// Inyectamos Repositorio + Gateway + Logger
	service := usecases.NewCheckoutService(repo, gateway, c.Logger)

	// 3. Capa DELIVERY (HTTP)
	m.handler = adapters.NewHTTPHandler(service)

	return nil
}

func (m *Module) RegisterHTTP(e *echo.Echo) {
	// Registramos rutas usando el handler creado arriba
	// Ruta final: POST /api/v1/checkout
	g := e.Group("/api/v1/checkout")
	g.POST("", m.handler.CreateCheckout)
}
