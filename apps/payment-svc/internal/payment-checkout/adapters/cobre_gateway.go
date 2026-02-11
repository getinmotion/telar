package adapters

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
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

// --- Estructuras internas de Cobre ---
type cobreAuthReq struct {
	UserID string `json:"user_id"`
	Secret string `json:"secret"`
}
type cobreAuthResp struct {
	AccessToken string `json:"access_token"`
}
type cobreCheckoutReq struct {
	Alias          string   `json:"alias"`
	Amount         int64    `json:"amount"` // Cobre usa centavos
	ExternalID     string   `json:"external_id"`
	DestinationID  string   `json:"destination_id"`
	CheckoutRails  []string `json:"checkout_rails"`
	CheckoutHeader string   `json:"checkout_header"`
	ValidUntil     string   `json:"valid_until"`
	RedirectURL    string   `json:"redirect_url"`
}
type cobreCheckoutResp struct {
	CheckoutURL string `json:"checkout_url"`
	ID          string `json:"id"` // Cobre ID
}

// --- IMPLEMENTACIÓN CORREGIDA DE LA INTERFAZ ---

// GeneratePaymentLink ahora coincide con la interfaz ports.PaymentGateway
func (g *CobreGateway) GeneratePaymentLink(ctx context.Context, amount float64, currency string, externalRef string) (*ports.GatewayResponse, error) {
	// 1. Autenticación
	token, err := g.authenticate(ctx)
	if err != nil {
		return nil, err
	}

	// 2. Preparar Payload
	// Cobre pide fecha de expiración explícita
	expiresAt := time.Now().Add(15 * time.Minute)
	validUntil := expiresAt.Format(time.RFC3339)

	// Convertir float a centavos
	amountInCents := int64(amount * 100)

	payload := cobreCheckoutReq{
		Alias:          "Marketplace Payment",
		Amount:         amountInCents,
		ExternalID:     externalRef, // Aquí va el Intent ID (ej: pi_123)
		DestinationID:  g.cfg.BalanceID,
		CheckoutRails:  []string{"pse", "bancolombia", "nequi", "breb"},
		CheckoutHeader: "Pago Marketplace",
		ValidUntil:     validUntil,
		// RedirectURL: "...", // Podrías pasarla si la interfaz la soportara
	}

	// 3. Request HTTP
	jsonBody, _ := json.Marshal(payload)
	req, _ := http.NewRequestWithContext(ctx, "POST", g.cfg.BaseURL+"/v1/checkouts", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("error calling cobre: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		return nil, fmt.Errorf("cobre api returned status: %d", resp.StatusCode)
	}

	var result cobreCheckoutResp
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, err
	}

	// 4. Retornar estructura unificada GatewayResponse
	return &ports.GatewayResponse{
		URL:        result.CheckoutURL,
		ExternalID: result.ID,
		ExpiresAt:  expiresAt,
	}, nil
}

// authenticate se mantiene igual...
func (g *CobreGateway) authenticate(ctx context.Context) (string, error) {
	authBody := cobreAuthReq{UserID: g.cfg.APIKey, Secret: g.cfg.APISecret}
	jsonBody, _ := json.Marshal(authBody)

	resp, err := g.client.Post(g.cfg.BaseURL+"/v1/auth", "application/json", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	var authResp cobreAuthResp
	if err := json.NewDecoder(resp.Body).Decode(&authResp); err != nil {
		return "", err
	}
	return authResp.AccessToken, nil
}
