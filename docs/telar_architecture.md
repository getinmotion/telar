# Telar -- Arquitectura de Repositorio y Plataforma

Este documento describe la **arquitectura técnica del proyecto Telar**,
las decisiones clave tomadas y las razones detrás de ellas.\
Su objetivo es servir como **fuente de verdad** para el equipo de
desarrollo y facilitar la evolución del sistema de forma ordenada,
escalable y profesional.

------------------------------------------------------------------------

## 1. Contexto del proyecto

Telar es una plataforma digital para el ecosistema artesanal que
incluye:

-   Un **Marketplace público** para compradores.
-   Una **Plataforma privada para artesanos** donde gestionan tiendas,
    productos y reciben apoyo mediante agentes de IA.
-   Integraciones por **WhatsApp** para compradores y artesanos.
-   Capacidades de **búsqueda semántica** y **agentes inteligentes** que
    apoyan el crecimiento del negocio artesanal.

Aunque existen **múltiples interfaces (web, WhatsApp)**, todas hacen
parte de **un solo dominio de negocio**:\
**comercio y gestión de productos artesanales**.

------------------------------------------------------------------------

## 2. Decisión clave: Monorepo

### 2.1 ¿Por qué un monorepo?

Se eligió una arquitectura **Monorepo** porque:

-   Todo el sistema pertenece a **un mismo dominio de negocio**.
-   Frontends, backend y agentes **comparten modelos, reglas y
    conceptos**.
-   Permite **coherencia**, **trazabilidad** y **evolución controlada**.
-   Reduce duplicación de lógica y deuda técnica temprana.

> **Un dominio de negocio → un repositorio**

------------------------------------------------------------------------

### 2.2 Ventajas del monorepo en Telar

-   ✅ Visión completa del sistema en un solo lugar.
-   ✅ Cambios atómicos (backend + frontend + agentes).
-   ✅ Un solo control de versiones.
-   ✅ CI/CD más simple.
-   ✅ Menor fricción entre equipos pequeños.
-   ✅ Facilita escalar a microservicios en el futuro si es necesario.

------------------------------------------------------------------------

### 2.3 ¿Cuándo NO usar monorepo?

No se recomienda monorepo cuando: - Hay dominios de negocio
completamente distintos. - Equipos grandes e independientes. - Backends
desacoplados por diseño.

Actualmente **Telar no cumple esos criterios**, por lo que monorepo es
la opción correcta.

------------------------------------------------------------------------

## 3. Arquitectura general del repositorio

``` text
telar/
├── apps/
│   ├── marketplace-web/     # Frontend compradores
│   ├── artisans-web/        # Frontend artesanos
│   ├── api/                 # Backend único (FastAPI)
│   └── agents/              # Sistema de agentes IA
│
├── infra/                   # Infraestructura por ambiente
│   ├── dev/
│   └── prod/
│
├── docs/                    # Documentación
└── scripts/                 # Scripts operativos
```

------------------------------------------------------------------------

## 4. Frontends

### 4.1 marketplace-web

Frontend público para compradores:

-   Navegación de productos y tiendas.
-   Búsqueda (clásica y semántica).
-   Carrito de compras.
-   Checkout.
-   Autenticación de compradores.

### 4.2 artisans-web

Frontend privado para artesanos:

-   Gestión de tienda.
-   CRUD de productos.
-   Ventas y métricas.
-   Interacción con agentes de IA.
-   Configuración de WhatsApp.

📌 **Ambos frontends consumen el mismo backend.**

------------------------------------------------------------------------

## 5. Backend (API única)

El backend es un **monolito modular** basado en FastAPI.

### 5.1 Principio rector

> **Un backend por dominio de negocio**\
> Múltiples canales → una sola lógica central.

### 5.2 Responsabilidades del backend

-   Autenticación y autorización.
-   CRUD del dominio (usuarios, tiendas, productos, órdenes).
-   Orquestación de agentes IA.
-   Webhook y flujos de WhatsApp.
-   Generación y consulta de embeddings.
-   Integración con storage y servicios externos.

### 5.3 Organización interna

``` text
api/app/
├── auth/          # login, tokens, passwords
├── users/
├── shops/
├── products/
├── orders/
├── payments/
├── media/
├── whatsapp/      # canal WhatsApp (buyers / artisans)
├── search/        # embeddings + búsqueda semántica
├── agents_client/ # comunicación con agentes IA
└── common/        # DB, seguridad, excepciones
```

------------------------------------------------------------------------

## 6. WhatsApp como canal (no como sistema)

WhatsApp se trata como un **canal de entrada**, no como un backend
independiente.

-   Un solo webhook.
-   Flujos separados por rol:
    -   compradores
    -   artesanos
-   El backend decide:
    -   quién es el usuario
    -   qué agente llamar
    -   qué respuesta devolver

Esto evita duplicación y mantiene coherencia con la web.

------------------------------------------------------------------------

## 7. Sistema de Agentes IA

Los agentes viven en un módulo separado, **agnósticos del canal**.

### 7.1 Principios de diseño

-   Los agentes no conocen HTTP ni WhatsApp.
-   Reciben intención + contexto.
-   Son reutilizables por web o WhatsApp.
-   Orquestados desde el backend.

### 7.2 Tipos de agentes

-   Product Agent
-   FAQ Agent
-   Legal Agent
-   Growth Agent
-   Onboarding Agent
-   Support Agent

``` text
agents/
├── core/       # orquestación, estado, memoria
├── agents/     # agentes específicos
├── tools/      # DB, vector search, storage
└── prompts/    # prompts versionados
```

------------------------------------------------------------------------

## 8. Búsqueda semántica y embeddings

La búsqueda semántica se implementa como **módulo del backend**, no como
servicio aparte.

### Características

-   Embeddings generados en backend.
-   Almacenados en Postgres + pgvector.
-   Batch jobs para reindexación.
-   Consultas semánticas reutilizadas por:
    -   marketplace
    -   agentes
    -   WhatsApp

------------------------------------------------------------------------

## 9. Manejo de ambientes (dev / prod)

### 9.1 Principio clave

> **El código es el mismo en todos los ambientes**\
> Lo que cambia es: - configuración - infraestructura - versión
> desplegada

------------------------------------------------------------------------

### 9.2 Ambientes definidos

#### Dev / Pruebas (Lightsail)

-   Una instancia:
    -   frontend
    -   backend
    -   agents
    -   postgres
-   Storage separado (Lightsail Object Storage).

#### Producción (Lightsail)

-   Una instancia:
    -   frontend
    -   backend
    -   agents
-   Base de datos gestionada (Lightsail DB).
-   Storage separado.

------------------------------------------------------------------------

### 9.3 Infraestructura en el repo

``` text
infra/
├── dev/
│   ├── docker-compose.yml
│   └── .env
└── prod/
    ├── docker-compose.yml
    └── .env
```

------------------------------------------------------------------------

## 10. Estrategia de ramas

Se utiliza un flujo simple y robusto:

``` text
feature/* → develop → main
```

-   `main`: producción (estable).
-   `develop`: integración y pruebas.
-   `feature/*`: ramas temporales.

📌 **`main` es la rama default y está protegida.**

------------------------------------------------------------------------

## 11. Principios finales

-   Claridad sobre complejidad innecesaria.
-   Modularidad sin sobre-microservicios.
-   Escalabilidad progresiva.
-   Decisiones reversibles.
-   Arquitectura entendible por humanos.

------------------------------------------------------------------------

## 12. Evolución futura

Esta arquitectura permite:

-   Separar agentes como servicio independiente si es necesario.
-   Escalar búsqueda semántica.
-   Incorporar nuevos canales (admin, analytics).
-   Migrar partes a microservicios sin reescritura masiva.

------------------------------------------------------------------------

## 13. Conclusión

La arquitectura de Telar prioriza:

-   coherencia
-   simplicidad
-   escalabilidad
-   velocidad de desarrollo

El monorepo no es una limitación, sino una **base sólida para crecer de
forma ordenada**.
