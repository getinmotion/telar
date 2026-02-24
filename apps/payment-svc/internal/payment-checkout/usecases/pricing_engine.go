package usecases

import (
	"context"
	"errors"

	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/domain"
	"github.com/getinmotion/telar/apps/payment-svc/internal/payment-checkout/ports"
)

type PricingEngine struct {
	repo ports.CheckoutRepository // Necesita el repo para leer el carrito
}

func NewPricingEngine(repo ports.CheckoutRepository) *PricingEngine {
	return &PricingEngine{repo: repo}
}

// CalculateTotalsOrchestrator: Obtiene datos reales y calcula
func (pe *PricingEngine) CalculateTotalsOrchestrator(ctx context.Context, cartID string) (*domain.Checkout, error) {
	// 1. Obtener Contexto del Carrito (DB)
	cart, err := pe.repo.GetCartContext(ctx, cartID)
	if err != nil {
		return nil, err
	}

	if cart.ShippingInfo == nil {
		return nil, errors.New("cart missing shipping info: cannot checkout")
	}

	// 2. Calcular Subtotal (Suma de items)
	var subtotal int64 = 0
	for _, item := range cart.Items {
		subtotal += item.UnitPriceMinor * int64(item.Quantity)
	}

	// 3. Obtener Costo de Envío (Ya viene en DB payments.cart_shipping_info)
	shippingCost := cart.ShippingInfo.ShippingCostMinor

	// 4. Calcular Impuestos (Ej: Plataforma 5% o IVA 19%)
	// Logica MOCK: Asumimos un IVA genérico del 19% sobre subtotal
	vatAmount := int64(float64(subtotal) * 0.19)

	// 5. Totalizar
	chargesTotal := shippingCost + vatAmount
	grandTotal := subtotal + chargesTotal

	// 6. Construir Estructura Checkout (Sin ID aún)
	checkout := &domain.Checkout{
		CartID:            cart.ID,
		BuyerUserID:       cart.BuyerUserID,
		Context:           "marketplace",
		Currency:          cart.Currency,
		SubtotalMinor:     subtotal,
		ChargesTotalMinor: chargesTotal,
		TotalMinor:        grandTotal,
		Charges: []domain.CheckoutCharge{
			{
				TypeCode:    "SHIPPING",
				Scope:       "checkout",
				AmountMinor: shippingCost,
				Currency:    cart.Currency,
			},
			{
				TypeCode:    "VAT",
				Scope:       "checkout",
				AmountMinor: vatAmount,
				Currency:    cart.Currency,
			},
		},
	}

	return checkout, nil
}
