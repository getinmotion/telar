// internal/payment-checkout/adapters/wompy_validator.go
package adapters

import (
	"crypto/sha256"
	"encoding/hex"
	"encoding/json"
	"fmt"
)

type WompiSignatureValidator struct {
	EventsSecret string
}

func NewWompiSignatureValidator(secret string) *WompiSignatureValidator {
	return &WompiSignatureValidator{EventsSecret: secret}
}

// Valida la firma dinámicamente siguiendo la guía de Wompi
// Añadimos signatureHeader para cumplir estrictamente con el puerto, aunque Wompi lo mande en el JSON
func (v *WompiSignatureValidator) ValidateSignature(payloadBytes []byte, signatureHeader string) error {
	var payload struct {
		Data struct {
			Transaction map[string]interface{} `json:"transaction"`
		} `json:"data"`
		Signature struct {
			Properties []string `json:"properties"`
			Checksum   string   `json:"checksum"`
		} `json:"signature"`
		Timestamp int64 `json:"timestamp"`
	}

	if err := json.Unmarshal(payloadBytes, &payload); err != nil {
		return fmt.Errorf("failed to parse webhook json: %w", err)
	}

	// 2. Concatenar los valores según 'properties'
	var concatenated string
	for _, prop := range payload.Signature.Properties {
		// Extraer la propiedad. Ej: "transaction.id" -> quitamos el prefijo "transaction."
		key := prop[12:] // len("transaction.") == 12

		val, ok := payload.Data.Transaction[key]
		if !ok || val == nil {
			return fmt.Errorf("property %s missing in transaction data", prop)
		}

		// Wompi requiere el string exacto. Si es número (ej amount_in_cents), formatear sin decimales.
		switch v := val.(type) {
		case float64:
			concatenated += fmt.Sprintf("%.0f", v)
		default:
			concatenated += fmt.Sprintf("%v", v)
		}
	}

	// 3. Concatenar Timestamp y Secret
	concatenated += fmt.Sprintf("%d", payload.Timestamp)
	concatenated += v.EventsSecret

	// 4. Generar SHA256
	hash := sha256.Sum256([]byte(concatenated))
	calculatedChecksum := hex.EncodeToString(hash[:])

	// 5. Comparar
	if calculatedChecksum != payload.Signature.Checksum {
		return fmt.Errorf("invalid checksum. expected %s, got %s", payload.Signature.Checksum, calculatedChecksum)
	}

	return nil
}
