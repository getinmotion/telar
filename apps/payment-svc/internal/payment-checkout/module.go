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
	// 1. Repositorios (Postgres implementa tanto UoW como Checkout/Ledger/Payout Repos)
	repo := adapters.NewPostgresRepository(c.PgPool)

	// 2. Gateways
	wompiGateway := adapters.NewWompiGateway(c.Config.Wompi)
	cobreGateway := adapters.NewCobreGateway(c.Config.Cobre)
	gateways := map[string]ports.PaymentGateway{
		"wompi": wompiGateway,
		"cobre": cobreGateway,
	}

	// 3. Validadores de Webhooks
	wompiValidator := adapters.NewWompiSignatureValidator(c.Config.Wompi.EventsSecret)
	cobreValidator := adapters.NewCobreSignatureValidator(c.Config.Cobre.EventsSecret) //donde cargamos el validador de jwk
	validators := map[string]ports.WebhookValidator{
		"wompi": wompiValidator,
		"cobre": cobreValidator,
	}

	// 4. Notificador (API Central)
	notifier := adapters.NewHTTPNotifier(c.Config.CentralAppURL)

	// 5. Casos de Uso (Servicios de Dominio)
	checkoutService := usecases.NewCheckoutService(
		repo,
		repo, // repo actúa como UoW
		gateways,
		validators,
		notifier,
		c.Logger,
	)

	// Inicializamos el servicio de Payouts (Desembolsos)
	payoutService := usecases.NewPayoutService(
		repo,                     // repo actúa como UoW
		cobreGateway,             // cobreGateway implementa ports.PayoutGateway
		c.Config.Cobre.BalanceID, // El ID de tu cuenta origen en Cobre
		c.Logger,
		cobreValidator,
	)

	// 6. Handlers HTTP
	m.handler = handlers.NewHTTPHandler(checkoutService, payoutService)
	return nil
}

func (m *Module) RegisterHTTP(e *echo.Echo) {
	g := e.Group("/api/v1/payments")
	// Asegúrate de que tu método RegisterRoutes en el handler esté mapeando
	// los nuevos endpoints (como TriggerSplitPayout) a este grupo 'g'.
	m.handler.RegisterRoutes(g)
}
