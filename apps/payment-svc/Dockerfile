# ==========================================
# ETAPA 1: BUILDER (Compilación)
# ==========================================
FROM golang:1.23-alpine AS builder

# Instalar certificados CA (Necesario para llamar a HTTPS Wompi) y git
RUN apk update && apk add --no-cache git ca-certificates tzdata

WORKDIR /app

# 1. Copiar dependencias primero (Caché de capas de Docker)
COPY go.mod go.sum ./
RUN go mod download

# 2. Copiar el código fuente
COPY . .

# 3. Compilar el binario
# CGO_ENABLED=0 asegura que sea un binario estático puro
RUN CGO_ENABLED=0 GOOS=linux go build -ldflags="-w -s" -o payment-service cmd/api/main.go

# ==========================================
# ETAPA 2: RUNNER (Imagen Final)
# ==========================================
FROM scratch

# Copiar certificados y zona horaria del builder
COPY --from=builder /etc/ssl/certs/ca-certificates.crt /etc/ssl/certs/
COPY --from=builder /usr/share/zoneinfo /usr/share/zoneinfo

# Copiar el binario compilado
COPY --from=builder /app/payment-service /payment-service

# Copiar archivo .env (OPCIONAL: En producción real, usa variables de entorno del sistema, no archivo .env)
# COPY .env .env 

# Exponer el puerto
EXPOSE 8080

# Comando de arranque
ENTRYPOINT ["/payment-service"]