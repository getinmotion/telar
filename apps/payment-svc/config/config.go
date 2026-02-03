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

type FirestoreConfig struct {
	ProjectID  string
	Collection string
}

type CoreConfig struct {
	FlarebitURL string
}

type Config struct {
	Firestore   FirestoreConfig
	Core        CoreConfig
	ServiceName string
	Env         string
	Port        string

	DataBackend string // firestore, dynamodb, etc.

	//SQL
	SQLDriver     string
	SQLDataSource string
}

func Load() *Config {
	cfg := &Config{

		ServiceName: getenv("SERVICE_NAME", "payment-svc"),
		Env:         getenv("ENVIRONMENT", "development"),
		Port:        getenv("PORT", "8080"),

		DataBackend: getenv("DATA_BACKEND", "firestore"),

		SQLDriver:     getenv("SQL_DRIVER", "postgres"),
		SQLDataSource: getenv("SQL_DATA_SOURCE", "user=postgres password=postgres dbname=url_redirections sslmode=disable"),
	}

	log.Printf("Configuration loaded: %+v\n", cfg)
	return cfg
}
