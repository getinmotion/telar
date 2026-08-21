---
inclusion: fileMatch
fileMatchPattern: "payment-svc/**"
---

# payment-svc/ — Servicio de Pagos (Go)

## Descripción

Microservicio en Go que gestiona el flujo de checkout y pagos, integrando pasarelas colombianas (Cobre, Wompi). Sigue Clean Architecture con inyección de dependencias explícita.

## Stack Tecnológico

- **Lenguaje:** Go 1.25
- **HTTP Framework:** Echo v4 (labstack)
- **Base de Datos:** PostgreSQL (pgx/v5)
- **Configuración:** godotenv + variables de entorno
- **Logging:** slog (structured JSON)

## Arquitectura (Clean Architecture)

```
cmd/api/main.go          → Entry point, wiring
├── config/              → Load() de configuración
├── infra/               → Clientes de infraestructura (Postgres)
└── internal/
    ├── bootstrap/       → Container (DI), HTTPApp factory, Module interface
    └── payment-checkout/→ Módulo de dominio
        ├── handler.go   → HTTP handlers (Echo)
        ├── service.go   → Lógica de negocio
        ├── repo.go      → Repositorio (pgx queries)
        └── module.go    → Registra rutas y dependencias
```

### Patrón de Módulos

Cada feature es un `Module` que implementa:
```go
type Module interface {
    Register(c *Container, app *echo.Echo) error
}
```

El Container provee: `Config`, `Logger`, `DBPool`, `ShutdownCtx`.

## Comandos Principales

```bash
# Desarrollo
go run cmd/api/main.go

# Build
go build -o payment-svc cmd/api/main.go

# Tests
go test ./...

# Docker
docker build -t payment-svc .
```

## Variables de Entorno

| Variable        | Descripción                        |
|-----------------|------------------------------------|
| `PORT`          | Puerto del servidor (default 8080) |
| `DATABASE_URL`  | PostgreSQL connection string       |
| `COBRE_API_KEY` | API key de Cobre (pasarela)        |
| `WOMPI_API_KEY` | API key de Wompi (pasarela)        |

## Convenciones de Código

- Nombres de archivos: `snake_case.go`
- Paquetes: nombres cortos, sin guiones
- Errores: siempre retornar y manejar explícitamente (no panic)
- Interfaces definidas donde se consumen, no donde se implementan
- Logger: `slog` con campos estructurados (JSON en prod)
- DB: queries SQL explícitos con `pgx` (no ORM)
- Contexto (`context.Context`) como primer parámetro en funciones que hacen I/O
