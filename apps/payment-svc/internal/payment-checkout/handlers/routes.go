package handlers

import "github.com/labstack/echo/v4"

// RegisterRoutes permite que el Handler defina sus propios caminos
func (h *HTTPHandler) RegisterRoutes(e *echo.Group) {
	// Endpoints del API transaccional (App / Frontend)
	e.POST("/checkout", h.CreateCheckout)
	// e.GET("/:id", h.GetCheckout)

	// Endpoints de integración asíncrona (Webhooks de terceros)
	// Nota: Si el grupo 'e' tiene un prefijo como '/api/v1/payments',
	// la URL final para configurar en el dashboard de Wompi será:
	// https://tu-dominio.com/api/v1/payments/webhook/wompi
	e.POST("/webhook/wompi", h.HandleWompiWebhook)
}
