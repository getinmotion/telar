package adapters

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"fmt"
)

type CobreSignatureValidator struct {
	Secret string
}

func NewCobreSignatureValidator(secret string) *CobreSignatureValidator {
	return &CobreSignatureValidator{Secret: secret}
}

func (v *CobreSignatureValidator) ValidateSignature(payloadBytes []byte, signatureHeader string, timestampHeader string) error {
	if signatureHeader == "" {
		return fmt.Errorf("missing signature header")
	}
	if timestampHeader == "" {
		return fmt.Errorf("missing timestamp header")
	}

	// 1. Crear el hash HMAC usando SHA256 y tu Secret de Cobre
	mac := hmac.New(sha256.New, []byte(v.Secret))

	// 2. COBRE: Concatenar timestamp + "." + raw_body
	dataToHash := timestampHeader + "." + string(payloadBytes)

	// 3. Escribir el string concatenado en el hash
	mac.Write([]byte(dataToHash))

	// 4. Obtener el hash resultante y convertirlo a string hexadecimal
	expectedMAC := hex.EncodeToString(mac.Sum(nil))

	// 5. Comparar de forma segura para evitar ataques de tiempo (Timing Attacks)
	if !hmac.Equal([]byte(expectedMAC), []byte(signatureHeader)) {
		// Tip: En desarrollo puedes imprimir expectedMAC y signatureHeader para ver por qué fallan
		return fmt.Errorf("invalid webhook signature")
	}

	return nil
}
