# AI Resource - GetInMotion Server

## Descripción

Este recurso proporciona funcionalidades de inteligencia artificial utilizando OpenAI para generar sugerencias personalizadas para artesanos.

## Características

- ✅ Generación de sugerencias de tienda basadas en el perfil del usuario
- ✅ Generación de sugerencias de productos para tiendas existentes
- ✅ Prompts almacenados en archivos markdown para fácil edición
- ✅ Fallback automático en caso de errores
- ✅ Integración con OpenAI GPT-4

## Configuración

### Variables de Entorno

Agrega la siguiente variable a tu archivo `.env`:

```env
OPENAI_API_KEY=sk-...tu-api-key-aqui...
```

### Obtener API Key de OpenAI

1. Visita [https://platform.openai.com/api-keys](https://platform.openai.com/api-keys)
2. Inicia sesión o crea una cuenta
3. Crea una nueva API key
4. Copia la key y agrégala a tu `.env`

## Instalación

El paquete de OpenAI ya está incluido en el proyecto:

```bash
npm install openai
```

## Servicios

### OpenAIService

Encapsula las llamadas a la API de OpenAI.

**Métodos:**
- `chatCompletion(params)` - Realiza llamadas a chat completion

### PromptsService

Gestiona la lectura y procesamiento de prompts desde archivos markdown.

**Métodos:**
- `getPrompt(name, language)` - Lee un prompt desde archivo .md
- `replacePlaceholders(template, values)` - Reemplaza placeholders en prompts

### AiService

Servicio principal que orquesta las operaciones de IA.

**Métodos:**
- `generateShopSuggestions(dto)` - Genera sugerencias de tienda
- `generateProductSuggestions(dto)` - Genera sugerencias de productos

## Prompts

Los prompts se almacenan en la carpeta `src/resources/ai/prompts/` como archivos markdown:

### Estructura de Archivos

```
prompts/
├── shop-suggestions-system-es.md      # Prompt del sistema para tiendas (español)
├── shop-suggestions-user-es.md        # Prompt del usuario para tiendas (español)
├── product-suggestions-system-es.md   # Prompt del sistema para productos (español)
└── product-suggestions-user-es.md     # Prompt del usuario para productos (español)
```

### Placeholders

En los prompts del usuario, puedes usar placeholders que serán reemplazados automáticamente:

```markdown
- Nombre de marca: {{brandName}}
- Ubicación: {{businessLocation}}
- Objetivos: {{businessGoals}}
```

## Endpoints

### 1. Generar Sugerencias de Tienda

**POST** `/ai/shop-suggestions`

**Autenticación:** Requiere JWT

**Body:**
```json
{
  "userId": "uuid-del-usuario",
  "language": "es"
}
```

**Respuesta:**
```json
{
  "success": true,
  "shopData": {
    "shop_name": "Artesanías El Sol",
    "description": "Tejidos tradicionales colombianos",
    "story": "Historia completa...",
    "craft_type": "textiles",
    "region": "Boyacá"
  },
  "coordinatorMessage": "¡Excelente! He analizado tu perfil...",
  "userContext": {
    "hasExistingData": true,
    "maturityLevel": 65
  }
}
```

### 2. Generar Sugerencias de Productos

**POST** `/ai/product-suggestions`

**Autenticación:** Requiere JWT

**Body:**
```json
{
  "userId": "uuid-del-usuario",
  "language": "es"
}
```

**Respuesta:**
```json
{
  "success": true,
  "products": [
    {
      "name": "Ruana Tradicional Boyacense",
      "description": "Descripción detallada...",
      "suggested_price": 120000,
      "category": "Textiles",
      "tags": ["ruana", "lana", "tradicional"]
    }
  ],
  "shopContext": {
    "craftType": "textiles",
    "region": "Boyacá"
  }
}
```

## Manejo de Errores

El servicio incluye manejo automático de errores con fallback:

- Si OpenAI falla, se retornan datos por defecto
- Los errores se registran en la consola
- El usuario siempre recibe una respuesta válida

## Desarrollo

### Agregar Nuevos Prompts

1. Crea un nuevo archivo `.md` en `src/resources/ai/prompts/`
2. Nombra el archivo siguiendo el patrón: `{nombre}-{idioma}.md`
3. Usa placeholders con `{{nombreVariable}}`
4. Llama al prompt desde el servicio con `promptsService.getPrompt('nombre', 'idioma')`

### Ejemplo de Nuevo Prompt

**Archivo:** `email-suggestions-system-es.md`

```markdown
Eres un experto en marketing por email.

Genera sugerencias de emails para {{shopName}}.
```

**Uso en el código:**

```typescript
const systemPrompt = await this.promptsService.getPrompt('email-suggestions-system', 'es');
const userPrompt = this.promptsService.replacePlaceholders(template, {
  shopName: 'Mi Tienda'
});
```

## Testing

Prueba los endpoints en Swagger:

```
http://localhost:3040/api/docs
```

Busca la sección **ai** y prueba los endpoints directamente.

## Notas Importantes

- ⚠️ Asegúrate de tener créditos en tu cuenta de OpenAI
- ⚠️ El modelo por defecto es `gpt-4o` (más costoso pero mejor calidad)
- ⚠️ Las respuestas se solicitan en formato JSON para facilitar el parsing
- ⚠️ Los prompts están en español por defecto
- ⚠️ El fallback automático garantiza que siempre hay respuesta

## Costos Estimados

**GPT-4o:**
- Entrada: ~$5 por 1M tokens
- Salida: ~$15 por 1M tokens

**Estimación por request:**
- Sugerencias de tienda: ~800 tokens de salida ≈ $0.012 USD
- Sugerencias de productos: ~1000 tokens de salida ≈ $0.015 USD

## Soporte

Si tienes problemas:

1. Verifica que `OPENAI_API_KEY` está configurada
2. Revisa los logs de la consola
3. Verifica que tienes créditos en OpenAI
4. Asegúrate de que los archivos `.md` existen en la carpeta `prompts/`
