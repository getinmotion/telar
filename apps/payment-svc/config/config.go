// config/config.go
package config

import (
	"log"
	"os"
)

func getenv(key, defaultValue string) string {
	value := os.Getenv(key)
	if value == "" {
		return defaultValue
	}
	return value
}

// CobreConfig configuración específica para el proveedor Cobre
type CobreConfig struct {
	APIKey    string
	APISecret string
	BalanceID string
	BaseURL   string
}

type WompiConfig struct {
	BaseURL      string
	PrivateKey   string // "prv_..." para backend
	PublicKey    string // "pub_..." (opcional si el front la necesita)
	EventsSecret string
}

// WompiConfig configuración para la pasarela Wompi
// type WompiConfig struct {
// 	PublicKey    string
// 	PrivateKey   string // Para transacciones desde el backend
// 	IntegrityKey string // Para firmar la cadena (SHA256)
// 	EventsSecret string // Para validar la firma de los webhooks entrantes
// 	BaseURL      string
// }

// Config estructura principal que agrupa todo
type Config struct {
	ServiceName string
	Env         string
	Port        string

	// Base de datos
	SQLDriver     string
	SQLDataSource string // DSN para conexión

	// Proveedores de Pagos
	Cobre CobreConfig
	Wompi WompiConfig

	// CentralAppURL string // URL de la aplicación central para notificaciones (opcional)
	CentralAppURL string
}

func Load() *Config {
	cfg := &Config{
		ServiceName: getenv("SERVICE_NAME", "payment-svc"),
		Env:         getenv("ENVIRONMENT", "development"),
		Port:        getenv("PORT", "8080"),

		SQLDriver:     getenv("SQL_DRIVER", "pgx"), // Usamos pgx por defecto
		SQLDataSource: getenv("SQL_DATA_SOURCE", "postgres://postgres:postgres@localhost:5432/payment_db?sslmode=disable"),

		Cobre: CobreConfig{
			APIKey:    getenv("COBRE_API_KEY", ""),
			APISecret: getenv("COBRE_API_SECRET", ""),
			BalanceID: getenv("COBRE_BALANCE_ID", ""),
			BaseURL:   getenv("COBRE_URL", "https://api.cobre.co"), // URL ejemplo
		},

		Wompi: WompiConfig{
			BaseURL:      getenv("WOMPI_BASE_URL", "https://sandbox.wompi.co/v1"), // O sandbox
			PrivateKey:   getenv("WOMPI_PRIVATE_KEY", ""),
			EventsSecret: getenv("WOMPI_EVENTS_SECRET", ""), // <-- ¡Añadido! Fundamental para el Webhook
		},
		// Wompi: WompiConfig{
		// 	PublicKey:    getenv("WOMPI_PUB_KEY", ""),
		// 	PrivateKey:   getenv("WOMPI_PRV_KEY", ""),
		// 	IntegrityKey: getenv("WOMPI_INTEGRITY", ""),
		// 	EventsSecret: getenv("WOMPI_EVENTS_SECRET", ""),
		// 	BaseURL:      getenv("WOMPI_URL", "https://production.wompi.co/v1"),
		// },
		CentralAppURL: getenv("CENTRAL_APP_URL", "http://localhost:3000"),
	}

	// No loguear secretos en producción, aquí solo imprimimos estructura básica
	log.Printf("Configuration loaded for service: %s in env: %s\n", cfg.ServiceName, cfg.Env)
	return cfg
}
