package domain

import "time"

// PayoutStatus define los estados posibles de un desembolso
type PayoutStatus string

const (
	PayoutStatusInitiated  PayoutStatus = "initiated"
	PayoutStatusProcessing PayoutStatus = "processing"
	PayoutStatusCompleted  PayoutStatus = "completed"
	PayoutStatusFailed     PayoutStatus = "failed"
)

// CounterpartyAccountType define los tipos de cuenta soportados por Cobre
type CounterpartyAccountType string

const (
	AccountTypeChecking   CounterpartyAccountType = "cc" // Checking
	AccountTypeSavings    CounterpartyAccountType = "ch" // Savings
	AccountTypeElectronic CounterpartyAccountType = "dp" // Electronic Deposit
	AccountTypeCobre      CounterpartyAccountType = "cobre_balance"
)

// Payout representa la intención y el estado de un desembolso hacia un vendedor
type Payout struct {
	ID                 string       `json:"id"`
	CheckoutID         string       `json:"checkout_id"`
	SellerShopID       string       `json:"seller_shop_id"`
	Percentage         float64      `json:"percentage"`
	AmountMinor        int64        `json:"amount_minor"`
	Currency           string       `json:"currency"`
	Status             PayoutStatus `json:"status"`
	ExternalMovementID *string      `json:"external_movement_id,omitempty"` // ID del money_movement en Cobre
	CreatedAt          time.Time    `json:"created_at"`
	UpdatedAt          time.Time    `json:"updated_at"`
}

// Counterparty representa los datos bancarios del destinatario (vendedor)
type Counterparty struct {
	FullName       string                  `json:"full_name"`
	DocumentType   string                  `json:"document_type"` // Ej: "CC", "NIT"
	DocumentNumber string                  `json:"document_number"`
	BankCode       string                  `json:"bank_code"`
	AccountType    CounterpartyAccountType `json:"account_type"`
	AccountNumber  string                  `json:"account_number"`
	CobreID        *string                 `json:"cobre_id,omitempty"` // ID generado por Cobre tras crearlo
}
