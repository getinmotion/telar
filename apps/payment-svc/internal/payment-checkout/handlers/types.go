package handlers

// createCheckoutRequest define qué esperamos recibir del Frontend
type createCheckoutRequest struct {
	CartID       string `json:"cart_id"`
	ProviderCode string `json:"provider_code"`
	ReturnURL    string `json:"return_url"`
	BuyerUserID  string `json:"buyer_user_id"`
}

// checkoutResponse define qué devolvemos
type checkoutResponse struct {
	CheckoutID  string  `json:"checkout_id"`
	CheckoutURL string  `json:"checkout_url"`
	Status      string  `json:"status"`
	Total       float64 `json:"total"`
}

// Estructura exacta basada en la documentación de eventos de Wompi
type WompiWebhookPayload struct {
	Event string `json:"event"`
	Data  struct {
		Transaction map[string]interface{} `json:"transaction"` // Usamos map para extraer props dinámicamente
	} `json:"data"`
	Environment string `json:"environment"`
	Signature   struct {
		Properties []string `json:"properties"`
		Checksum   string   `json:"checksum"`
	} `json:"signature"`
	Timestamp int64 `json:"timestamp"`
}

// Estructura tipada para acceder fácil a los datos que nos importan
type WompiTransaction struct {
	ID            string `json:"id"`
	AmountInCents int64  `json:"amount_in_cents"`
	Reference     string `json:"reference"` // Este es nuestro Intent.ID
	Status        string `json:"status"`
	Currency      string `json:"currency"`
}

// --- Estructuras para Cobre Webhook ---

type CobreWebhookPayload struct {
	ID        string `json:"id"`
	EventKey  string `json:"event_key"`
	CreatedAt string `json:"created_at"`
	Content   struct {
		ID              string                 `json:"id"`
		Type            string                 `json:"type"`
		Amount          int64                  `json:"amount"`
		Currency        string                 `json:"currency"`
		Date            string                 `json:"date"`
		Metadata        map[string]interface{} `json:"metadata"`
		AccountID       string                 `json:"account_id"`
		PreviousBalance int64                  `json:"previous_balance"`
		CurrentBalance  int64                  `json:"current_balance"`
		CreditDebitType string                 `json:"credit_debit_type"`
	} `json:"content"`
}
