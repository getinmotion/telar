package adapters

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io" // <--- AGREGA ESTO debug
	"net/http"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/config"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
)

type WompiGateway struct {
	cfg    config.WompiConfig
	client *http.Client
}

func NewWompiGateway(cfg config.WompiConfig) *WompiGateway {
	return &WompiGateway{
		cfg:    cfg,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

// Estructuras de Request/Response de Wompi
type wompiPaymentLinkReq struct {
	Name            string `json:"name"`
	Description     string `json:"description"`
	SingleUse       bool   `json:"single_use"`
	CollectShipping bool   `json:"collect_shipping"` // <--- CAMPO NUEVO OBLIGATORIO
	Currency        string `json:"currency"`
	AmountInCents   int64  `json:"amount_in_cents"`
	ExpiresAt       string `json:"expires_at,omitempty"`
	Sku             string `json:"sku,omitempty"`
	RedirectURL     string `json:"redirect_url,omitempty"`
}

type wompiPaymentLinkResp struct {
	Data struct {
		ID        string `json:"id"`
		ExpiresAt string `json:"expires_at"` // Puede venir null
	} `json:"data"`
	Meta map[string]interface{} `json:"meta"`
}

func (g *WompiGateway) GeneratePaymentLink(ctx context.Context, amount float64, currency string, externalRef string) (*ports.GatewayResponse, error) {
	// 1. Calcular expiración (1 hora en el futuro en UTC)
	expiresAt := time.Now().UTC().Add(1 * time.Hour)
	// Usamos el formato que Wompi espera (YYYY-MM-DDTHH:mm:ss)
	expiresIso := expiresAt.Format("2006-01-02T15:04:05")

	// 2. Convertir a centavos
	amountInCents := int64(amount * 100)

	// 3. Construir Payload
	payload := wompiPaymentLinkReq{
		Name:            "Pago Orden " + externalRef,
		Description:     "Compra en Marketplace Telar",
		SingleUse:       true,
		CollectShipping: false, // <--- IMPORTANTISIMO: Enviar false explícitamente
		Currency:        currency,
		AmountInCents:   amountInCents,
		ExpiresAt:       expiresIso,
		Sku:             externalRef,
	}
	// RedirectURL: "https://tuapp.com/resultado", // Se puede pasar como param

	bodyBytes, _ := json.Marshal(payload)
	//asda
	// ... dentro de GeneratePaymentLink ...

	// --- DEBUG INICIO (BORRAR LUEGO) ---
	fmt.Println("======= DEBUG WOMPI =======")
	fmt.Println("Target URL:", g.cfg.BaseURL+"/payment_links")
	fmt.Printf("Key Length: %d\n", len(g.cfg.PrivateKey))
	if len(g.cfg.PrivateKey) > 10 {
		fmt.Println("Key Preview:", g.cfg.PrivateKey[0:9]+"...") // Muestra el inicio (prv_test_...)
	} else {
		fmt.Println("Key: [VACIA O INVALIDA]")
	}
	// --- DEBUG FIN ---

	//aasd
	// 4. Request HTTP
	req, err := http.NewRequestWithContext(ctx, "POST", g.cfg.BaseURL+"/payment_links", bytes.NewBuffer(bodyBytes))
	if err != nil {
		return nil, err
	}

	// Auth Bearer con Llave Privada
	req.Header.Set("Authorization", "Bearer "+g.cfg.PrivateKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := g.client.Do(req)
	if err != nil {
		return nil, fmt.Errorf("wompi connection error: %w", err)
	}
	defer resp.Body.Close()
	//asda
	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return nil, fmt.Errorf("wompi error %d: %s", resp.StatusCode, string(bodyBytes))
	}
	//asda
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return nil, fmt.Errorf("wompi api error status: %d", resp.StatusCode)
	}

	// 5. Parse Response
	var result wompiPaymentLinkResp
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return nil, fmt.Errorf("error decoding wompi response: %w", err)
	}

	// Construir URL pública (según docs)
	checkoutURL := fmt.Sprintf("https://checkout.wompi.co/l/%s", result.Data.ID)

	// Parsear fecha de expiración retornada o usar la calculada
	finalExpires, _ := time.Parse(time.RFC3339, result.Data.ExpiresAt)
	if finalExpires.IsZero() {
		finalExpires = expiresAt
	}

	return &ports.GatewayResponse{
		URL:        checkoutURL,
		ExternalID: result.Data.ID,
		ExpiresAt:  finalExpires,
	}, nil
}
