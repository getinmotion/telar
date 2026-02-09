// internal/payment-checkout/adapters/http_handler.go

package adapters

import (
	"net/http"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/usecases"
	"github.com/labstack/echo/v4"
)

type HTTPHandler struct {
	service *usecases.CheckoutService
}

func NewHTTPHandler(service *usecases.CheckoutService) *HTTPHandler {
	return &HTTPHandler{service: service}
}

// Request Body DTO
type createCheckoutReq struct {
	CartID string  `json:"cart_id"`
	Price  float64 `json:"price"`
}

func (h *HTTPHandler) CreateCheckout(c echo.Context) error {
	var req createCheckoutReq

	// 1. Validar input
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	if req.CartID == "" || req.Price <= 0 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "cart_id and positive price are required"})
	}

	// 2. Llamar al servicio (Use Case)
	// Usamos el contexto del request para cancelar si el cliente se desconecta
	ctx := c.Request().Context()
	order, err := h.service.CreatePaymentLink(ctx, req.CartID, req.Price)

	if err != nil {
		// Aquí podrías diferenciar errores de dominio vs errores de servidor
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	// 3. Responder
	return c.JSON(http.StatusOK, order)
}
