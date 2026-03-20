package adapters

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"time"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
)

type HTTPNotifier struct {
	client     *http.Client
	webhookURL string
}

func NewHTTPNotifier(baseURL string) *HTTPNotifier {
	return &HTTPNotifier{
		client: &http.Client{Timeout: 10 * time.Second},
		// Asegúrate de que baseURL sea la ruta base de tu servidor principal
		webhookURL: baseURL + "/telar/server/payments/webhook/payments",
	}
}

func (n *HTTPNotifier) NotifyPaymentConfirmation(ctx context.Context, payload ports.PaymentNotification) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("error marshaling notification payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", n.webhookURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("error creating notification request to %s: %w", n.webhookURL, err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("error calling notification api [URL: %s]: %w", n.webhookURL, err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		// Leer el body de la respuesta para obtener más detalles del error
		responseBody, readErr := io.ReadAll(resp.Body)
		if readErr != nil {
			return fmt.Errorf("notification api returned error status %d [URL: %s] (failed to read response body: %v)", resp.StatusCode, n.webhookURL, readErr)
		}

		return fmt.Errorf("notification api returned error status %d [URL: %s] [Payload sent: %s] [Response: %s]",
			resp.StatusCode, n.webhookURL, string(body), string(responseBody))
	}

	return nil
}
