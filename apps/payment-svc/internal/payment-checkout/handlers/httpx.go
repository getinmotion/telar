package handlers

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

func (h *HTTPHandler) CreateCheckout(c echo.Context) error {
	var req createCheckoutRequest

	// 1. Bindear JSON
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// 2. Validaciones básicas
	if req.CartID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "cart_id is required"})
	}
	// Defaults
	if req.ProviderCode == "" {
		req.ProviderCode = "wompi"
	}
	// En prod esto viene del Token JWT, aquí hardcodeado por el Seed
	if req.BuyerUserID == "" {
		req.BuyerUserID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
	}

	// 3. Mapear al Input del Caso de Uso
	input := usecases.CreateCheckoutInput{
		CartID:       req.CartID,
		BuyerUserID:  req.BuyerUserID,
		ProviderCode: req.ProviderCode,
		ReturnURL:    req.ReturnURL,
	}

	// 4. Llamar al servicio
	resp, err := h.service.ProcessCheckout(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, resp)
}
