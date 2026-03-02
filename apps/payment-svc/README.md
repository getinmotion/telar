# Telar Payment Service (payment-svc)

A robust, production-ready microservice built in Go for managing e-commerce checkouts and payment processing within the Telar ecosystem.

This service acts as an abstraction layer over multiple payment providers (Wompi, Cobre), handling everything from cart pricing calculations to asynchronous webhook processing and internal platform accounting (double-entry ledger).

---

## 🚀 Key Features

- **Multi-Gateway Integration:** Seamlessly generate payment links and process webhooks for **Wompi** and **Cobre**.
- **Pricing Engine:** Automatically calculates subtotals, shipping costs, and taxes (VAT) based on the user's cart context.
- **Secure Webhook Handling:** Includes signature validation (HMAC/SHA256) and strict idempotency checks to prevent duplicate webhook processing.
- **Double-Entry Ledger:** Automatically records accounting movements (debits and credits) ensuring that platform revenue, gateway clearing, and seller pending accounts always balance out.

  **Accounting equation:**

  `Σ Debits + Σ Credits = 0`

- **Hexagonal Architecture:** Clean separation of concerns using Domain, Ports, Adapters, and Use Cases, making it highly testable and extensible.
- **ACID Transactions:** Implements a Unit of Work (UoW) pattern over PostgreSQL to ensure checkouts, intents, and ledger entries are committed or rolled back together.

---

## 🛠 Tech Stack

- **Language:** Go (1.23+)
- **Web Framework:** [Echo v4](https://echo.labstack.com/)
- **Database:** PostgreSQL
- **DB Driver:** [pgx/v5](https://github.com/jackc/pgx) (with connection pooling)
- **Containerization:** Docker (multi-stage builds)

---

## 📁 Project Structure

The project follows a clean architecture / Domain-Driven Design (DDD) layout:

```text
├── cmd/api/                 # Entry point of the application
├── config/                  # Environment variable parsing and configuration
├── infra/                   # Infrastructure setups (e.g., Postgres connection pool)
├── internal/
│   ├── bootstrap/           # Dependency injection container and Echo app setup
│   └── payment-checkout/    # Core Domain Module
│       ├── adapters/        # External implementations (Postgres Repo, Gateway Clients)
│       ├── domain/          # Core business entities (Checkout, Intent, Ledger)
│       ├── handlers/        # HTTP controllers and routing (Echo)
│       ├── ports/           # Interfaces defining contracts for DB, Gateways, UoW
│       └── usecases/        # Business logic (Pricing Engine, Webhook Processing)
├── Dockerfile               # Multi-stage Dockerfile for optimized static builds
└── go.mod                   # Go module dependencies
```

---

## 🚦 Getting Started

### Prerequisites

- Go 1.23 or higher
- PostgreSQL instance
- API keys for Wompi and Cobre (for testing gateway integrations)

---

## ⚙️ Configuration (.env)

Create a `.env` file in the root directory (or two levels above `cmd/api`).

The application requires the following configuration (based on the codebase requirements).

---

## ▶️ Running Locally

Install dependencies:

```bash
go mod download
```

Start the server:

```bash
go run cmd/api/main.go
```

---

## 🐳 Running with Docker

Build and run the highly optimized scratch container:

```bash
docker build -t telar-payment-svc .
docker run -p 8080:8080 --env-file .env telar-payment-svc
```

---

## 📡 API Reference

All payment routes are prefixed with:

```
/api/v1/payments
```

---

### 1️⃣ Create a Checkout

Generates a payment link for a specific cart and provider.

**URL**

```
POST /api/v1/payments/checkout
```

**Body**

```json
{
  "cart_id": "uuid-of-the-cart",
  "provider_code": "wompi",
  "return_url": "https://telar.co/checkout/success",
  "buyer_user_id": "uuid-of-the-buyer"
}
```

---

### 2️⃣ Wompi Webhook

Endpoint for Wompi to send asynchronous payment status updates.

**URL**

```
POST /api/v1/payments/webhook/wompi
```

**Behavior**

- Validates the signature using `WOMPI_EVENTS_SECRET`
- Updates the `PaymentIntent` and `Checkout` status
- Triggers internal ledger movements if the payment is approved

---

### 3️⃣ Cobre Webhook

Endpoint for Cobre to send asynchronous balance updates.

**URL**

```
POST /api/v1/payments/webhook/cobre
```

**Behavior**

- Listens specifically for `accounts.balance.credit` events
- Correlates them via the `mm_external_id`
- Processes the payment completion

---

## 🧪 Error Handling & Resiliency

- **Graceful Shutdown:**  
  The server listens for `SIGTERM` / `SIGINT` and allows up to **10 seconds** for active requests to finish before shutting down the database pool.

- **Idempotency:**  
  Webhooks check `payments.processed_events` to ensure a gateway event is only processed and accounted for once, even if the gateway retries the webhook delivery.
