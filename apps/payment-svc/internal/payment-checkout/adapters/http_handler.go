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

// DTO de entrada HTTP (Simplificado)
type checkoutRequest struct {
	CartID       string `json:"cart_id"`
	ProviderCode string `json:"provider_code"` // "wompi"
	ReturnURL    string `json:"return_url"`
	BuyerUserID  string `json:"buyer_user_id"` // Opcional en el JSON, podemos poner default
}

func (h *HTTPHandler) CreateCheckout(c echo.Context) error {
	var req checkoutRequest

	// 1. Bindear JSON
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	// 2. Validaciones básicas
	if req.CartID == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "cart_id is required"})
	}
	if req.ProviderCode == "" {
		req.ProviderCode = "wompi" // Default
	}

	// 3. Manejo de Usuario (En prod vendría del JWT Token) TODO: Extraer BuyerUserID del JWT en lugar de pedirlo en el body
	// Usamos el ID del SEED que te pasé si no envían nada, para que no falle la FK
	if req.BuyerUserID == "" {
		req.BuyerUserID = "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11"
	}

	// 4. Mapear al Input del Caso de Uso
	input := usecases.CreateCheckoutInput{
		CartID:       req.CartID,
		BuyerUserID:  req.BuyerUserID,
		ProviderCode: req.ProviderCode,
		ReturnURL:    req.ReturnURL,
	}

	// 5. Llamar al servicio
	resp, err := h.service.ProcessCheckout(c.Request().Context(), input)
	if err != nil {
		// Loguear error real internamente si es necesario
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, resp)
}
