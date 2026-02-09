// internal/payment-checkout/domain/checkot.go

package domain

import "time"

// CheckoutOrder representa la intención de pago
type CheckoutOrder struct {
	ID             string    `json:"id"`
	CartID         string    `json:"cart_id"`
	Amount         float64   `json:"amount"`       // Precio original (ej: 10.50)
	AmountMinor    int64     `json:"amount_minor"` // Precio en centavos (ej: 1050)
	Status         string    `json:"status"`
	PaymentLinkURL string    `json:"payment_link_url"`
	ExternalID     string    `json:"external_id"` // ID devuelto por Cobre
	CreatedAt      time.Time `json:"created_at"`
}

// ConvertToMinorUnit convierte el decimal a centavos (lógica de negocio pura)
func (c *CheckoutOrder) CalculateMinorUnit() {
	// Multiplicamos por 100 y redondeamos para evitar flotantes
	c.AmountMinor = int64(c.Amount * 100)
}
