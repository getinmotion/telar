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
	checkoutService *usecases.CheckoutService
	payoutService   *usecases.PayoutService
}

func NewHTTPHandler(checkoutService *usecases.CheckoutService, payoutService *usecases.PayoutService) *HTTPHandler {
	return &HTTPHandler{
		checkoutService: checkoutService,
		payoutService:   payoutService,
	}
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
	resp, err := h.checkoutService.ProcessCheckout(c.Request().Context(), input)
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
		PaymentLinkID:  wompiTx.PaymentLinkID, // TU INTENT ID original venía aquí
		Status:         wompiTx.Status,
		AmountMinor:    wompiTx.AmountInCents,
		Currency:       wompiTx.Currency,
		GatewayPayload: rawPayload,
	}

	// 3. Pasar al Use Case
	err = h.checkoutService.ProcessPaymentEvent(c.Request().Context(), "wompi", rawPayload, "", "", domainEvent)
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

// TriggerSplitPayout inicia el desembolso hacia el vendedor
func (h *HTTPHandler) TriggerSplitPayout(c echo.Context) error {
	var req triggerSplitPayoutRequest
	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request body"})
	}

	if req.CheckoutID == "" || req.Percentage <= 0 || req.Percentage > 100 {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid checkout_id or percentage"})
	}

	payout, err := h.payoutService.ProcessSplitPayout(c.Request().Context(), req.CheckoutID, req.Percentage)
	if err != nil {
		c.Logger().Error("Error processing split payout: ", err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": err.Error()})
	}

	return c.JSON(http.StatusOK, payout)
}

func (h *HTTPHandler) HandleCobreWebhook(c echo.Context) error {
	rawPayload, err := io.ReadAll(c.Request().Body)
	if err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	// 1. Extraer AMBOS headers de Cobre
	signatureHeader := c.Request().Header.Get("event-signature")
	timestampHeader := c.Request().Header.Get("event-timestamp") // <--- NUEVO

	if signatureHeader == "" || timestampHeader == "" { // <--- ACTUALIZADO
		c.Logger().Warn("Cobre webhook missing signature or timestamp header")
		return c.NoContent(http.StatusUnauthorized) // 401 Rechazado
	}

	var cobrePayload CobreWebhookPayload
	if err := json.Unmarshal(rawPayload, &cobrePayload); err != nil {
		return c.NoContent(http.StatusBadRequest)
	}

	ctx := c.Request().Context()

	// ==========================================
	// 1. Manejo de Abonos (Checkouts)
	// ==========================================
	if cobrePayload.EventKey == "accounts.balance.credit" {
		var intentID string
		if extID, ok := cobrePayload.Content.Metadata["mm_external_id"].(string); ok && extID != "" {
			intentID = extID
		} else {
			c.Logger().Warn("Webhook de Cobre sin mm_external_id", "cobre_trx_id", cobrePayload.Content.ID)
			return c.NoContent(http.StatusOK)
		}

		domainEvent := domain.PaymentGatewayEvent{
			EventID:        cobrePayload.ID,
			ExternalTxID:   cobrePayload.Content.ID,
			PaymentLinkID:  intentID,
			Status:         "APPROVED",
			AmountMinor:    cobrePayload.Content.Amount,
			Currency:       cobrePayload.Content.Currency,
			GatewayPayload: rawPayload,
		}

		// PASAMOS EL TIMESTAMP AL CASO DE USO DE CHECKOUTS
		err = h.checkoutService.ProcessPaymentEvent(ctx, "cobre", rawPayload, signatureHeader, timestampHeader, domainEvent)
		if err != nil {
			c.Logger().Error("Error processing Cobre webhook: ", err)
			return c.NoContent(http.StatusInternalServerError)
		}

		return c.NoContent(http.StatusOK)
	}

	// ==========================================
	// 2. Manejo de Payouts (Money Movements)
	// ==========================================
	if cobrePayload.EventKey == "money_movements.status.completed" ||
		cobrePayload.EventKey == "money_movements.status.rejected" ||
		cobrePayload.EventKey == "money_movements.status.failed" {

		movementID := cobrePayload.Content.ID // El ID de Cobre

		// PASAMOS EL TIMESTAMP AL CASO DE USO DE PAYOUTS
		err = h.payoutService.ProcessPayoutWebhook(ctx, movementID, cobrePayload.EventKey, rawPayload, signatureHeader, timestampHeader)
		if err != nil {
			c.Logger().Error("Error processing Payout webhook: ", err)
			return c.NoContent(http.StatusInternalServerError)
		}
		return c.NoContent(http.StatusOK)
	}

	return c.NoContent(http.StatusOK)
}
