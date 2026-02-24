package adapters

// CobreSignatureValidator implementa ports.WebhookValidator para Cobre
type CobreSignatureValidator struct {
	Secret string
}

func NewCobreSignatureValidator(secret string) *CobreSignatureValidator {
	return &CobreSignatureValidator{Secret: secret}
}

func (v *CobreSignatureValidator) ValidateSignature(payloadBytes []byte, signatureHeader string) error {
	// TODO: Si Cobre implementa firmas HMAC-SHA256 en sus webhooks, la lógica va aquí.
	// Por ahora, asumimos que si llega al endpoint, es válido (idealmente proteger con IP Whitelisting o un Token en la URL).
	return nil
}
