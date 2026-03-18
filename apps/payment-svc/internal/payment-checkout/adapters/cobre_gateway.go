package adapters

import (
	"bytes"
	"context"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/config"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
)

type CobreGateway struct {
	cfg    config.CobreConfig
	client *http.Client

	// --- Caching de Autenticación ---
	tokenMu        sync.RWMutex
	cachedToken    string
	tokenExpiresAt time.Time
}

func NewCobreGateway(cfg config.CobreConfig) *CobreGateway {
	return &CobreGateway{
		cfg:    cfg,
		client: &http.Client{Timeout: 30 * time.Second},
	}
}

// ==========================================
// ESTRUCTURAS INTERNAS (DTOs)
// ==========================================

// --- Auth ---
type cobreAuthReq struct {
	UserID string `json:"user_id"`
	Secret string `json:"secret"`
}

type cobreAuthResp struct {
	AccessToken string `json:"access_token"`
}

// --- Checkouts ---
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

// --- Payouts (Counterparties y Money Movements) ---
type cobreCounterpartyReq struct {
	Geo      string                 `json:"geo"`
	Type     string                 `json:"type"`
	Alias    string                 `json:"alias"`
	Metadata map[string]interface{} `json:"metadata"`
}

type cobreCounterpartyResp struct {
	ID string `json:"id"`
}

type cobreMoneyMovementReq struct {
	SourceID        string                 `json:"source_id"`
	DestinationID   string                 `json:"destination_id"`
	Amount          int64                  `json:"amount"`
	Metadata        map[string]interface{} `json:"metadata"`
	ExternalID      string                 `json:"external_id"`
	CheckerApproval bool                   `json:"checker_approval"`
}

type cobreMoneyMovementResp struct {
	ID string `json:"id"`
}

// ==========================================
// IMPLEMENTACIÓN DE PAYMENTS Y CHECKOUT
// ==========================================

func (g *CobreGateway) GeneratePaymentLink(ctx context.Context, amount float64, currency string, externalRef string) (*ports.GatewayResponse, error) {
	// 1. Autenticación (Usando el caché optimizado)
	token, err := g.getToken(ctx)
	if err != nil {
		return nil, fmt.Errorf("cobre auth error: %w", err)
	}

	// 2. Lógica de Fechas
	now := time.Now()
	expiresAt := now.Add(15 * time.Minute).UTC()
	validUntil := expiresAt.Format(time.RFC3339)

	loc, errLoc := time.LoadLocation("America/Bogota")
	if errLoc != nil {
		loc = time.UTC // Fallback seguro
	}
	formattedDate := now.In(loc).Format("02/01/2006 15:04")
	descriptionToPayee := "Pago - " + formattedDate

	// 3. Conversión a centavos (Minor Units)
	amountInMinorUnit := int64(amount * 100)

	// 4. Construcción del Payload
	payload := cobreCheckoutReq{
		Alias:                    "Marketplace Telar - pagos",
		Amount:                   amountInMinorUnit,
		ExternalID:               externalRef,
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

// ==========================================
// IMPLEMENTACIÓN DE PAYOUT GATEWAY
// ==========================================

func (g *CobreGateway) CreateCounterparty(ctx context.Context, c *domain.Counterparty) (string, error) {
	token, err := g.getToken(ctx)
	if err != nil {
		return "", err
	}

	metadata := map[string]interface{}{}

	// Mapeo ESTRICTO de campos según la documentación/Postman de Cobre
	if c.AccountType == "breb_key" {
		metadata["key_value"] = c.AccountNumber
	} else {
		// Para cc, ch y dp, estos nombres son obligatorios y exactos:
		metadata["account_number"] = c.AccountNumber
		metadata["beneficiary_institution"] = c.BankCode
		metadata["counterparty_fullname"] = c.FullName
		metadata["counterparty_id_number"] = c.DocumentNumber
		metadata["counterparty_id_type"] = c.DocumentType // Debe ser "nit", "cc", etc.
	}

	payload := cobreCounterpartyReq{
		Geo:      "col",
		Type:     string(c.AccountType),
		Alias:    c.FullName + " - " + string(c.AccountType),
		Metadata: metadata,
	}

	jsonBody, _ := json.Marshal(payload)
	req, _ := http.NewRequestWithContext(ctx, "POST", g.cfg.BaseURL+"/v1/counterparties", bytes.NewBuffer(jsonBody))
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("Accept", "application/json")

	resp, err := g.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("cobre counterparty error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var result cobreCounterpartyResp
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", err
	}
	return result.ID, nil
}

func (g *CobreGateway) CreateMoneyMovement(ctx context.Context, sourceAccount string, destinationId string, amountMinor int64, externalId string) (string, error) {
	token, err := g.getToken(ctx)
	if err != nil {
		return "", err
	}

	payload := cobreMoneyMovementReq{
		SourceID:        sourceAccount,
		DestinationID:   destinationId,
		Amount:          amountMinor,
		ExternalID:      externalId,
		CheckerApproval: false,
		Metadata: map[string]interface{}{
			"description": "Split Payout Marketplace",
		},
	}

	jsonBody, _ := json.Marshal(payload)
	// Nota: Actualizado a /v1/money_movements con guión bajo según la corrección
	req, err := http.NewRequestWithContext(ctx, "POST", g.cfg.BaseURL+"/v1/money_movements", bytes.NewBuffer(jsonBody))
	if err != nil {
		return "", err
	}
	req.Header.Set("Authorization", "Bearer "+token)
	req.Header.Set("Content-Type", "application/json")
	// Importante: Cobre pide Idempotency Key en Money Movements
	req.Header.Set("idempotency", externalId)

	resp, err := g.client.Do(req)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK && resp.StatusCode != http.StatusCreated {
		bodyBytes, _ := io.ReadAll(resp.Body)
		return "", fmt.Errorf("cobre mm error (status %d): %s", resp.StatusCode, string(bodyBytes))
	}

	var result cobreMoneyMovementResp
	if err := json.NewDecoder(resp.Body).Decode(&result); err != nil {
		return "", fmt.Errorf("failed to decode money movement response: %w", err)
	}

	return result.ID, nil
}

// ==========================================
// OPTIMIZACIÓN DE AUTENTICACIÓN (CACHÉ JWT)
// ==========================================

func (g *CobreGateway) getToken(ctx context.Context) (string, error) {
	// 1. Lectura rápida (Read Lock)
	g.tokenMu.RLock()
	// Si el token existe y faltan MÁS de 5 minutos para que expire, lo usamos
	if g.cachedToken != "" && time.Now().Add(5*time.Minute).Before(g.tokenExpiresAt) {
		token := g.cachedToken
		g.tokenMu.RUnlock()
		return token, nil
	}
	g.tokenMu.RUnlock()

	// 2. Si no hay token o está por expirar, obtenemos uno nuevo (Write Lock)
	g.tokenMu.Lock()
	defer g.tokenMu.Unlock()

	// Doble comprobación: otra goroutine podría haber actualizado el token mientras esperábamos el Lock
	if g.cachedToken != "" && time.Now().Add(5*time.Minute).Before(g.tokenExpiresAt) {
		return g.cachedToken, nil
	}

	newToken, err := g.authenticate(ctx)
	if err != nil {
		return "", err
	}

	g.cachedToken = newToken
	g.tokenExpiresAt = extractJWTExpiration(newToken)

	return g.cachedToken, nil
}

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

// extractJWTExpiration decodifica el payload del JWT de forma ligera para obtener la expiración
func extractJWTExpiration(token string) time.Time {
	parts := strings.Split(token, ".")
	if len(parts) != 3 {
		return time.Now().Add(30 * time.Minute) // Fallback seguro si no es un JWT estándar
	}

	payloadData, err := base64.RawURLEncoding.DecodeString(parts[1])
	if err != nil {
		return time.Now().Add(30 * time.Minute)
	}

	var claims struct {
		Exp int64 `json:"exp"`
	}
	if err := json.Unmarshal(payloadData, &claims); err != nil || claims.Exp == 0 {
		return time.Now().Add(30 * time.Minute)
	}

	return time.Unix(claims.Exp, 0)
}
