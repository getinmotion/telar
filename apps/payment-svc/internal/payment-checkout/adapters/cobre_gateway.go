// internal/payment-checkout/adapters/cobre_gateway.go
package adapters

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/config"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
)

type CobreGateway struct {
	cfg    config.CobreConfig
	client *http.Client
}

func NewCobreGateway(cfg config.CobreConfig) *CobreGateway {
	return &CobreGateway{
		cfg:    cfg,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

// --- Estructuras Internas de Cobre ---
type cobreAuthReq struct {
	UserID string `json:"user_id"`
	Secret string `json:"secret"`
}

type cobreAuthResp struct {
	AccessToken string `json:"access_token"`
}

type cobreCheckoutReq struct {
	Alias                    string   `json:"alias"`
	Amount                   int64    `json:"amount"`
	ExternalID               string   `json:"external_id"`
	DestinationID            string   `json:"destination_id"`
	CheckoutRails            []string `json:"checkout_rails"`
	CheckoutHeader           string   `json:"checkout_header"`
	CheckoutItem             string   `json:"checkout_item"`
	DescriptionToPayee       string   `json:"description_to_payee"`
	ValidUntil               string   `json:"valid_until"`
	MoneyMovementIntentLimit int      `json:"money_movement_intent_limit"`
	RedirectURL              string   `json:"redirect_url"`
}

type cobreCheckoutResp struct {
	ID          string `json:"id"`
	CheckoutURL string `json:"checkout_url"`
}

func (g *CobreGateway) GeneratePaymentLink(ctx context.Context, amount float64, currency string, externalRef string) (*ports.GatewayResponse, error) {
	// 1. Autenticación (Replicando el fetch a /v1/auth)
	token, err := g.authenticate(ctx)
	if err != nil {
		return nil, fmt.Errorf("cobre auth error: %w", err)
	}

	// 2. Lógica de Fechas (Replicando getValidUntilDate y getDescription)
	now := time.Now()

	// ValidUntil: 15 minutos en el futuro (formato ISO 8601 UTC)
	expiresAt := now.Add(15 * time.Minute).UTC()
	validUntil := expiresAt.Format(time.RFC3339)

	// DescriptionToPayee: Formato local Colombia "Pago - DD/MM/YYYY HH:MM"
	loc, errLoc := time.LoadLocation("America/Bogota")
	if errLoc != nil {
		loc = time.UTC // Fallback seguro
	}
	formattedDate := now.In(loc).Format("02/01/2006 15:04")
	descriptionToPayee := "Pago - " + formattedDate

	// 3. Conversión a centavos (Minor Units)
	// Nota: Como 'amount' viene del caso de uso (donde ya lo pasamos de TotalMinor a float),
	// lo volvemos a multiplicar por 100 para cumplir con la interfaz estándar.
	amountInMinorUnit := int64(amount * 100)

	// 4. Construcción del Payload idéntico al de Deno
	payload := cobreCheckoutReq{
		Alias:                    "Marketplace Telar - pagos",
		Amount:                   amountInMinorUnit,
		ExternalID:               externalRef, // OJO: Usamos nuestro Intent.ID, no el Cart.ID (ver nota abajo)
		DestinationID:            g.cfg.BalanceID,
		CheckoutRails:            []string{"pse", "bancolombia", "nequi", "breb"},
		CheckoutHeader:           "Pago - Telar",
		CheckoutItem:             "Pago carrito marketplace Telar",
		DescriptionToPayee:       descriptionToPayee,
		ValidUntil:               validUntil,
		MoneyMovementIntentLimit: 1,
		RedirectURL:              "https://www.telar.co",
	}

	jsonBody, _ := json.Marshal(payload)

	// 5. Llamada para crear el Link de Pago
	req, err := http.NewRequestWithContext(ctx, "POST", g.cfg.BaseURL+"/v1/checkouts", bytes.NewBuffer(jsonBody))
	if err != nil {
		return nil, err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error llamando a cobre: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("cobre api error status: %d, detalles: %s", resp.StatusCode, string(bodyBytes))
	}

	var result cobreCheckoutResp
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("error parseando respuesta de cobre: %w", err)
	}

	// 6. Retornar estructura estándar
	return &ports.GatewayResponse{
		URL:        result.CheckoutURL,
		ExternalID: result.ID, // Este es el money_movement_intent_id de Cobre
		ExpiresAt:  expiresAt,
	}, nil
}

// authenticate implementa la llamada a /v1/auth de tu script de Deno
func (g *CobreGateway) authenticate(ctx context.Context) (string, error) {
	authBody := cobreAuthReq{
		UserID: g.cfg.APIKey,
		Secret: g.cfg.APISecret,
	}
	jsonBody, _ := json.Marshal(authBody)

	req, err := http.NewRequestWithContext(ctx, "POST", g.cfg.BaseURL+"/v1/auth", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := g.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return "", fmt.Errorf("failed to authenticate, status: %d", resp.StatusCode)
	}

	var authResp cobreAuthResp
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return "", err
	}

	return authResp.AccessToken, nil
}
