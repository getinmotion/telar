package domain

import "time"

// ==========================================
// 1. CONTEXTO DE ENTRADA (Lectura del Carrito)
// ==========================================

// CartContext: Representa toda la info que necesitamos del carrito para cotizar
type CartContext struct {
	ID           string
	BuyerUserID  string
	Currency     string
	Status       string
	Items        []CartItem
	ShippingInfo *CartShippingInfo
}

type CartItem struct {
	ID             string
	ProductID      string
	SellerShopID   string
	Quantity       int
	UnitPriceMinor int64
}

type CartShippingInfo struct {
	FullName          string
	Email             string
	Phone             string
	Address           string
	City              string
	State             string
	PostalCode        string
	ShippingMethod    string
	ShippingCostMinor int64
}

// ==========================================
// 2. CONTEXTO DE SALIDA (Checkout Generado)
// ==========================================

// Checkout: Representa la orden de pago final
type Checkout struct {
	ID                string           `json:"id"`
	CartID            string           `json:"cart_id"`
	BuyerUserID       string           `json:"buyer_user_id"`
	Context           string           `json:"context"` // 'marketplace'
	ContextShopID     *string          `json:"context_shop_id,omitempty"`
	Currency          string           `json:"currency"`
	Status            string           `json:"status"`
	SubtotalMinor     int64            `json:"subtotal_minor"`
	ChargesTotalMinor int64            `json:"charges_total_minor"`
	TotalMinor        int64            `json:"total_minor"`
	IdempotencyKey    string           `json:"idempotency_key"`
	Charges           []CheckoutCharge `json:"charges"`
	CreatedAt         time.Time        `json:"created_at"`
}

type CheckoutCharge struct {
	ChargeTypeID string `json:"charge_type_id"`
	TypeCode     string `json:"type_code"` // SHIPPING, VAT
	Scope        string `json:"scope"`     // checkout, order
	AmountMinor  int64  `json:"amount_minor"`
	Currency     string `json:"currency"`
}

// ==========================================
// 3. INTENCIONES DE PAGO Y RESPUESTAS
// ==========================================

type PaymentIntent struct {
	ID           string    `json:"id"`
	CheckoutID   string    `json:"checkout_id"`
	ProviderCode string    `json:"provider_code"`
	ProviderID   string    `json:"provider_id"`
	Currency     string    `json:"currency"`
	AmountMinor  int64     `json:"amount_minor"`
	Status       string    `json:"status"`
	ExternalID   string    `json:"external_id"`
	CreatedAt    time.Time `json:"created_at"`
}

type PaymentAttempt struct {
	ID              string      `json:"id"`
	PaymentIntentID string      `json:"payment_intent_id"`
	Status          string      `json:"status"`
	RequestPayload  interface{} `json:"request_payload"`
	ResponsePayload interface{} `json:"response_payload"`
	ErrorMessage    string      `json:"error_message"`
	CreatedAt       time.Time   `json:"created_at"`

	// Campos auxiliares para respuesta
	CheckoutURL   string `json:"checkout_url,omitempty"`
	AttemptNumber int    `json:"attempt_no,omitempty"`
}

type CheckoutResponse struct {
	CheckoutID      string  `json:"checkout_id"`
	PaymentIntentID string  `json:"payment_intent_id"`
	CheckoutURL     string  `json:"checkout_url"`
	Status          string  `json:"status"`
	TotalAmount     float64 `json:"total_amount"` // Para mostrar al usuario
	Currency        string  `json:"currency"`
}
