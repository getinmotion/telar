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

// Request Body (Simula el Snapshot enviado por el Orchestrator)
type payRequest struct {
	CartID    string  `json:"cart_id"`
	Amount    float64 `json:"amount"`   // Total calculado por Commerce
	Currency  string  `json:"currency"` // "COP"
	Provider  string  `json:"provider"` // "wompi"
	ReturnURL string  `json:"return_url"`
}

func (h *HTTPHandler) CreateCheckout(c echo.Context) error {
	var req payRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid body"})
	}

	// Validaciones básicas
	if req.CartID == "" || req.Amount <= 0 || req.Provider == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Missing required fields"})
	}
	if req.Currency == "" {
		req.Currency = "COP"
	}

	// Mapeo al input del caso de uso
	input := usecases.CreateCheckoutInput{
		CartID:    req.CartID,
		Amount:    req.Amount,
		Currency:  req.Currency,
		Provider:  req.Provider,
		ReturnURL: req.ReturnURL,
	}

	resp, err := h.service.ProcessCheckout(c.Request().Context(), input)
	if err != nil {
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, resp)
}
