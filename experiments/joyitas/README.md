# 💎 Joyitas - Deployment Configuration

Configuración simplificada para desplegar **API + Marketplace-Web** en **telar.store**.

## 📋 Stack

- **API**: NestJS (Puerto 3040)
- **Marketplace**: React/Vite (Puerto 3001)
- **Proxy**: Nginx
- **SSL**: Let's Encrypt
- **Registry**: GitHub Container Registry (GHCR)

## 🌐 Dominios

- `https://telar.store` → Marketplace (puerto 3001)
- `https://www.telar.store` → Redirect a telar.store
- `https://api.telar.store` → API (puerto 3040)

---

## 🚀 Deployment Guide

### 1️⃣ Prerequisites

En el servidor:
```bash
# Docker & Docker Compose
sudo apt update
sudo apt install -y docker.io docker-compose

# Nginx & Certbot
sudo apt install -y nginx certbot python3-certbot-nginx

# Start Docker
sudo systemctl enable docker
sudo systemctl start docker
```

---

### 2️⃣ DNS Configuration

Apunta los siguientes registros A a tu IP del servidor:

| Tipo | Nombre | Valor |
|------|--------|-------|
| A | telar.store | `52.44.3.34` |
| A | www.telar.store | `52.44.3.34` |
| A | api.telar.store | `52.44.3.34` |

Verifica con:
```bash
dig telar.store +short
dig www.telar.store +short
dig api.telar.store +short
```

---

### 3️⃣ Setup en el Servidor

```bash
# Clonar el repo
cd ~
git clone https://github.com/getinmotion/telar.git
cd telar/experiments/joyitas

# Copiar y configurar variables de entorno
cp .env.example .env
nano .env  # Edita con tus credenciales

# Configurar Nginx
sudo cp nginx.conf /etc/nginx/sites-available/joyitas
sudo ln -s /etc/nginx/sites-available/joyitas /etc/nginx/sites-enabled/joyitas
sudo nginx -t
sudo systemctl reload nginx
```

---

### 4️⃣ Obtener Certificados SSL

```bash
sudo certbot certonly --nginx \
  -d telar.store \
  -d www.telar.store \
  -d api.telar.store
```

Luego restaura la configuración limpia:
```bash
sudo cp nginx.conf /etc/nginx/sites-available/joyitas
sudo nginx -t && sudo systemctl reload nginx
```

---

### 5️⃣ Login a GitHub Container Registry

```bash
# Crea un Personal Access Token (PAT) en GitHub con scope: read:packages
export GITHUB_PAT=your_github_pat_here

# Login
echo $GITHUB_PAT | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

---

### 6️⃣ Deploy!

```bash
chmod +x deploy.sh
./deploy.sh
```

O manualmente:
```bash
docker compose pull
docker compose up -d
docker compose logs -f
```

---

## 🔧 Maintenance

### Ver logs:
```bash
docker compose logs -f

# Solo API
docker compose logs -f api

# Solo Marketplace
docker compose logs -f marketplace-web
```

### Restart servicios:
```bash
docker compose restart
```

### Stop servicios:
```bash
docker compose down
```

### Update a nueva versión:
```bash
docker compose pull
docker compose up -d
```

### Verificar salud:
```bash
docker compose ps
curl https://api.telar.store/health
```

---

## 📁 Estructura de Archivos

```
experiments/joyitas/
├── docker-compose.yml    # Definición de servicios
├── nginx.conf           # Configuración de proxy reverso
├── .env.example         # Template de variables
├── .env                 # Variables (no commitear)
├── deploy.sh           # Script de deployment
└── README.md           # Esta guía
```

---

## 🔐 Variables de Entorno Requeridas

Mínimas para funcionar:

```bash
# Database
DATABASE_URL=postgresql://...
DB_HOST=...
DB_PASSWORD=...

# API
API_URL=https://api.telar.store
JWT_SECRET=...

# Frontend
VITE_API_URL=https://api.telar.store
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...

# Payment (Wompi)
WOMPI_PUBLIC_KEY=pub_prod_...
WOMPI_PRIVATE_KEY=prv_prod_...
VITE_WOMPI_PUBLIC_KEY=pub_prod_...
```

Ver `.env.example` para la lista completa.

---

## 🆘 Troubleshooting

### Error: Cannot pull images
```bash
# Verifica login a GHCR
docker login ghcr.io

# Verifica permisos del PAT
# Debe tener scope: read:packages
```

### Error: Port already in use
```bash
# Verifica qué está usando el puerto
sudo lsof -i :3040
sudo lsof -i :3001

# Detén otros servicios o cambia puertos en docker-compose.yml
```

### Error: SSL certificate errors
```bash
# Verifica certificados
sudo certbot certificates

# Renueva si es necesario
sudo certbot renew

# Recarga nginx
sudo systemctl reload nginx
```

### Error: Cannot connect to database
```bash
# Verifica conectividad desde el servidor
psql $DATABASE_URL

# Verifica que la IP del servidor esté permitida en la DB
```

---

## 📞 Support

Si tienes problemas, verifica:
1. ✅ DNS apunta correctamente
2. ✅ Certificados SSL válidos
3. ✅ Variables de entorno correctas
4. ✅ Containers corriendo: `docker compose ps`
5. ✅ Logs sin errores: `docker compose logs`

---

**¡Listo para producción!** 🎉
