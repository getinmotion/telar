package adapters

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
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
		webhookURL: baseURL + "/telar/server/weebhook/payments",
	}
}

func (n *HTTPNotifier) NotifyPaymentConfirmation(ctx context.Context, payload ports.PaymentNotification) error {
	body, err := json.Marshal(payload)
	if err != nil {
		return fmt.Errorf("error marshaling notification payload: %w", err)
	}

	req, err := http.NewRequestWithContext(ctx, "POST", n.webhookURL, bytes.NewBuffer(body))
	if err != nil {
		return fmt.Errorf("error creating notification request: %w", err)
	}
	req.Header.Set("Content-Type", "application/json")

	resp, err := n.client.Do(req)
	if err != nil {
		return fmt.Errorf("error calling notification api: %w", err)
	}
	defer resp.Body.Close()

	if resp.StatusCode >= 400 {
		return fmt.Errorf("notification api returned error status: %d", resp.StatusCode)
	}

	return nil
}
