# 🔄 Guía para Sincronizar Edge Functions desde Supabase Cloud

Esta guía te ayudará a obtener todas las Edge Functions que están en Supabase Cloud pero no en tu carpeta local.

---

## 📋 Métodos Disponibles

Hay varias formas de obtener las Edge Functions desde Supabase Cloud:

1. **Método Manual** (Más confiable) - Desde el Dashboard
2. **Método con Supabase CLI** - Usando comandos CLI
3. **Método con API** - Script automatizado (puede tener limitaciones)

---

## 🎯 Método 1: Manual desde Dashboard (Recomendado)

Este es el método más confiable y directo.

### Pasos:

1. **Accede al Dashboard de Supabase**
   - Ve a https://supabase.com/dashboard
   - Selecciona tu proyecto

2. **Navega a Edge Functions**
   - En el menú lateral, ve a **Edge Functions**
   - Verás la lista de todas las funciones

3. **Descarga cada función faltante**
   - Haz clic en cada función que no tengas localmente
   - En la vista de código, copia todo el contenido
   - Crea el archivo localmente en `supabase/functions/[nombre-funcion]/index.ts`
   - Pega el código copiado

4. **Verifica archivos adicionales**
   - Algunas funciones pueden tener archivos adicionales
   - Revisa si hay imports de otros archivos en la misma función
   - Descarga esos archivos también si existen

### Ventajas:
- ✅ 100% confiable
- ✅ Obtienes el código exacto
- ✅ Puedes ver la estructura completa

### Desventajas:
- ⏱️ Puede ser lento si hay muchas funciones
- 🔄 Requiere trabajo manual

---

## 🛠️ Método 2: Usando Supabase CLI

### Requisitos Previos:

```bash
# Instalar Supabase CLI
npm install -g supabase

# Autenticarse
supabase login

# Vincular proyecto
supabase link --project-ref ylooqmqmoufqtxvetxuj
```

### Listar Funciones:

```bash
# Listar todas las funciones en cloud
supabase functions list --project-ref ylooqmqmoufqtxvetxuj
```

### Nota Importante:

⚠️ **La CLI de Supabase actualmente NO tiene un comando directo para descargar funciones desde cloud**. 

Sin embargo, puedes usar la CLI para:
- Listar funciones
- Ver logs
- Deployar funciones
- Pero NO para descargar código existente

---

## 🤖 Método 3: Script con API (Experimental)

He creado scripts que intentan usar la API de Supabase para descargar funciones automáticamente.

### Requisitos:

1. **Obtener Access Token de Supabase**
   - Ve a https://supabase.com/dashboard/account/tokens
   - Crea un nuevo token
   - Copia el token

2. **Configurar Token**

   Opción A: Variable de entorno
   ```bash
   export SUPABASE_ACCESS_TOKEN=tu_token_aqui
   ```

   Opción B: Archivo `.env.local`
   ```env
   SUPABASE_ACCESS_TOKEN=tu_token_aqui
   ```

3. **Ejecutar Script**

   ```bash
   # Ver funciones faltantes
   node scripts/sync-edge-functions-api.js
   
   # Descargar automáticamente
   node scripts/sync-edge-functions-api.js --auto
   ```

### Limitaciones:

⚠️ **La API de Supabase Management puede tener limitaciones**:
- Puede no exponer el código completo de las funciones
- Puede requerir permisos específicos
- La estructura de respuesta puede variar

Si este método no funciona, usa el **Método 1 (Manual)**.

---

## 📝 Método 4: Comparación Manual

Si quieres identificar qué funciones faltan:

### 1. Listar Funciones Locales

```bash
# Desde la raíz del proyecto
ls supabase/functions/ | grep -v "^_"
```

### 2. Listar Funciones en Cloud

Ve al Dashboard de Supabase > Edge Functions y anota todas las funciones.

### 3. Comparar

Crea una lista de las funciones que están en cloud pero no localmente.

### 4. Descargar Manualmente

Usa el Método 1 para descargar cada función faltante.

---

## 🔍 Script de Comparación

He creado un script que compara funciones locales vs cloud:

```bash
# Usando Supabase CLI
node scripts/sync-edge-functions.js
```

Este script:
- ✅ Lista funciones locales
- ✅ Lista funciones en cloud (usando CLI)
- ✅ Muestra diferencias
- ⚠️ No descarga automáticamente (limitación de CLI)

---

## 📦 Estructura Esperada

Cada Edge Function debe tener esta estructura:

```
supabase/functions/
  ├── nombre-funcion/
  │   ├── index.ts          # Código principal
  │   └── [otros-archivos]   # Archivos adicionales si los hay
  └── _shared/              # Archivos compartidos
      ├── auth-helpers.ts
      └── validation-helpers.ts
```

---

## ✅ Checklist de Sincronización

- [ ] Listar todas las funciones en Supabase Cloud
- [ ] Comparar con funciones locales
- [ ] Identificar funciones faltantes
- [ ] Descargar cada función faltante
- [ ] Verificar que el código se guardó correctamente
- [ ] Probar que las funciones funcionan localmente
- [ ] Actualizar `supabase/config.toml` si es necesario

---

## 🚨 Problemas Comunes

### Problema: "No se puede descargar función X"

**Solución:**
- Usa el método manual desde el dashboard
- Verifica que tienes permisos en el proyecto
- Revisa que el nombre de la función sea correcto

### Problema: "La función descargada no funciona"

**Solución:**
- Verifica que todos los archivos relacionados estén descargados
- Revisa imports y dependencias
- Verifica variables de entorno y secretos

### Problema: "Faltan archivos adicionales"

**Solución:**
- Revisa los imports en `index.ts`
- Descarga los archivos referenciados
- Verifica la carpeta `_shared/` para helpers comunes

---

## 📚 Recursos Adicionales

- [Documentación de Supabase Edge Functions](https://supabase.com/docs/guides/functions)
- [Supabase CLI Reference](https://supabase.com/docs/reference/cli)
- [Supabase Management API](https://supabase.com/docs/reference/api)

---

## 💡 Recomendación Final

Para la mayoría de casos, **recomiendo el Método 1 (Manual)** porque:
- Es 100% confiable
- Te permite revisar el código mientras lo descargas
- No depende de APIs o herramientas externas
- Te da control total sobre qué descargar

Una vez que tengas todas las funciones sincronizadas, puedes usar Git para mantenerlas actualizadas.

---

**Última actualización**: 2025-01-19

