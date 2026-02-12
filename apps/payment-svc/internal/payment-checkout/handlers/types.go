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
