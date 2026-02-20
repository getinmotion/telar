// internal/payment-checkout/handlers/httpx.go
package handlers

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
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

func (h *HTTPHandler) HandleWompiWebhook(c echo.Context) error {
	rawPayload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// 1. Parsear Estructura Wompi
	var wompiPayload WompiWebhookPayload
	if err := json.Unmarshal(rawPayload, &wompiPayload); err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// Parsear la transacción interna fuertemente tipada
	txBytes, _ := json.Marshal(wompiPayload.Data.Transaction)
	var wompiTx WompiTransaction
	json.Unmarshal(txBytes, &wompiTx)

	// 2. Mapear al Dominio (El ExternalTxID de Wompi NO es nuestro IntentID, la Reference sí)
	domainEvent := domain.PaymentGatewayEvent{
		EventID:        fmt.Sprintf("%s_%d", wompiPayload.Event, wompiPayload.Timestamp), // Wompi no manda EventID único siempre, concatenamos nombre+ts
		ExternalTxID:   wompiTx.ID,
		PaymentLinkID:  wompiTx.Reference, // TU INTENT ID original venía aquí
		Status:         wompiTx.Status,
		AmountMinor:    wompiTx.AmountInCents,
		Currency:       wompiTx.Currency,
		GatewayPayload: rawPayload,
	}

	// 3. Pasar al Use Case
	err = h.service.ProcessPaymentEvent(c.Request().Context(), "wompi", rawPayload, domainEvent)
	if err != nil {
		c.Logger().Error("Error processing webhook: ", err)
		// Si es un error de firma, no reintentar (400). Si es error interno, 500 para que Wompi reintente.
		if err.Error() == "invalid signature" {
			return c.NoContent(http.StatusBadRequest)
		}
		return c.NoContent(http.StatusInternalServerError)
	}

	// 4. Wompi exige un 200 OK para no reintentar
	return c.NoContent(http.StatusOK)
}

func (h *HTTPHandler) HandleCobreWebhook(c echo.Context) error {
	rawPayload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	var cobrePayload CobreWebhookPayload
	if err := json.Unmarshal(rawPayload, &cobrePayload); err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// Cobre dispara muchos eventos; solo nos interesan los abonos (créditos)
	if cobrePayload.EventKey != "accounts.balance.credit" {
		return c.NoContent(http.StatusOK) // Ignoramos otros eventos y respondemos 200
	}

	// Extraer el ExternalID (Nuestro Intent ID) de la metadata.
	// Dependiendo del tipo de riel, Cobre lo envía en "mm_external_id" u otros campos.
	var intentID string
	if extID, ok := cobrePayload.Content.Metadata["mm_external_id"].(string); ok && extID != "" {
		intentID = extID
	} else {
		// Fallback: Si no está en mm_external_id, es posible que el evento no sea de un checkout nuestro
		c.Logger().Warn("Webhook de Cobre sin mm_external_id", "cobre_trx_id", cobrePayload.Content.ID)
		return c.NoContent(http.StatusOK)
	}

	// Mapear al Dominio Agnóstico
	domainEvent := domain.PaymentGatewayEvent{
		EventID:        cobrePayload.ID, // Event ID de Cobre
		ExternalTxID:   cobrePayload.Content.ID,
		PaymentLinkID:  intentID,   // El ID que enviamos en la creación del checkout
		Status:         "APPROVED", // Si es un evento de account.balance.credit, el dinero entró
		AmountMinor:    cobrePayload.Content.Amount,
		Currency:       cobrePayload.Content.Currency,
		GatewayPayload: rawPayload,
	}

	// OJO: Tendremos que manejar la firma de Cobre en el futuro
	err = h.service.ProcessPaymentEvent(c.Request().Context(), "cobre", rawPayload, domainEvent)
	if err != nil {
		c.Logger().Error("Error processing Cobre webhook: ", err)
		return c.NoContent(http.StatusInternalServerError)
	}

	return c.NoContent(http.StatusOK)
}
