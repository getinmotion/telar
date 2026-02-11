package domain

import "time"

// Checkout: Representa la orden de pago (Tabla payments.checkouts)
type Checkout struct {
	ID           string                 `json:"id"`
	CartID       string                 `json:"cart_id"`
	Amount       float64                `json:"amount"`       // Decimal (para lógica de negocio)
	AmountMinor  int64                  `json:"amount_minor"` // Centavos (NECESARIO para Repo y Wompi)
	Currency     string                 `json:"currency"`
	Status       string                 `json:"status"`
	CartSnapshot map[string]interface{} `json:"cart_snapshot"` // NECESARIO para Repo
	ExpiresAt    time.Time              `json:"expires_at"`    // NECESARIO para Repo
	CreatedAt    time.Time              `json:"created_at"`
	UpdatedAt    time.Time              `json:"updated_at"`
}

// PaymentIntent: La intención de pagar con un proveedor (Tabla payments.payment_intents)
type PaymentIntent struct {
	ID             string    `json:"id"`
	CheckoutID     string    `json:"checkout_id"`
	Provider       string    `json:"provider"`
	ExternalID     string    `json:"external_id"`    // ID externo (ej: ID de transacción Wompi)
	IdempotencyKey string    `json:"idempotency_key"`
	Status         string    `json:"status"`
	AmountMinor    int64     `json:"amount_minor"` // NECESARIO para Repo
	Currency       string    `json:"currency"`     // NECESARIO para Repo
	CreatedAt      time.Time `json:"created_at"`
	UpdatedAt      time.Time `json:"updated_at"`
}

// PaymentAttempt: El intento técnico HTTP (Tabla payments.payment_attempts)
type PaymentAttempt struct {
	ID              string      `json:"id"`
	PaymentIntentID string      `json:"payment_intent_id"` // Nombre exacto usado en tu repo
	Status          string      `json:"status"`
	RequestPayload  interface{} `json:"request_payload"`  // NECESARIO para Repo (se guarda como JSONB)
	ResponsePayload interface{} `json:"response_payload"` // NECESARIO para Repo (se guarda como JSONB)
	ErrorMessage    string      `json:"error_message"`    // NECESARIO para Repo
	CreatedAt       time.Time   `json:"created_at"`

	// Campos auxiliares para devolver la respuesta (no necesariamente en la tabla attempts)
	CheckoutURL   string    `json:"checkout_url,omitempty"`
	AttemptNumber int       `json:"attempt_no,omitempty"`
	ExpiresAt     time.Time `json:"expires_at,omitempty"`
	ExternalID    string    `json:"external_id,omitempty"` // A veces útil tenerlo aquí también
}

// CheckoutResponse: Estructura de respuesta para el Frontend/Orchestrator
type CheckoutResponse struct {
	CheckoutID       string    `json:"checkout_id"`
	PaymentIntentID  string    `json:"payment_intent_id"`
	PaymentAttemptID string    `json:"payment_attempt_id"`
	AttemptNumber    int       `json:"attempt_no"`
	CheckoutURL      string    `json:"checkout_url"`
	Status           string    `json:"status"`
	ExpiresAt        time.Time `json:"expires_at"`
}