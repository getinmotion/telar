package handlers

import "github.com/labstack/echo/v4"

// RegisterRoutes permite que el Handler defina sus propios caminos
func (h *HTTPHandler) RegisterRoutes(e *echo.Group) {
	// Definimos las rutas relativas al grupo que nos pasen
	e.POST("/checkout", h.CreateCheckout)

	// Aquí agregarías futuros endpoints, por ejemplo:
	// e.GET("/:id", h.GetCheckout)
	// e.POST("/webhook", h.HandleWebhook)
}
