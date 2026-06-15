# Telar Knowledge Admin

Webapp interna (Streamlit) para administrar las bases de conocimiento (RAG)
de los agentes de Telar: cargar/eliminar documentos por agente, probar cada
agente vía chat, y ver un resumen de cuánto contenido tiene cada uno.

## Cómo funciona

- **Stack**: Streamlit + Python, reutiliza directamente el código de
  `apps/agents` (`rag_service`, `KnowledgeDocument`, prompts) y
  `apps/src/database/supabase_client.py` (`AgentsDbClient`/`db`). No hay API
  intermedia: la webapp habla con Postgres (pgvector) y OpenAI igual que el
  servicio de agentes.
- **Autenticación**: usuario/contraseña compartido del equipo, vía
  `ADMIN_RAG_USERNAME` / `ADMIN_RAG_PASSWORD_HASH` (hash SHA-256). Mientras no
  estés autenticado, solo se ve el formulario de login (sidebar oculto).
- **Navegación** (`st.navigation`, una vez logueado):
  - **Inicio**: bienvenida y resumen de las 3 secciones.
  - **Base de Conocimiento**: selector de agente/categoría, tabla de
    documentos (archivo, tipo, estado, chunks, fecha, eliminar), y carga de
    nuevos documentos (TXT, Markdown, PDF, CSV, Excel) con preview e
    indexación con spinner overlay.
  - **Chat con Agentes**: chat por categoría (historial independiente por
    agente), usando `rag_service.generate_rag_response` con el prompt real
    de cada agente. Muestra fuentes, confianza y chunks recuperados.
  - **Resumen**: tabla con conteo de documentos/chunks por agente y aviso de
    agentes sin contenido.
- **Async → sync**: Streamlit es síncrono; `lib/rag_bridge.py` ejecuta cada
  llamada (`process_document`, `generate_rag_response`, queries de DB) en un
  event loop nuevo y descarta/recrea el pool de asyncpg y los clientes de
  OpenAI si quedaron ligados a un loop anterior (esto evita el error
  `InterfaceError: cannot perform operation: another operation is in
  progress` que aparece si Streamlit reusa un loop viejo entre reruns).

## Estructura

```
apps/admin-rag/
  app.py                  # Entry point: auth + navegación
  views/
    home.py                # Inicio
    knowledge_base.py       # Base de Conocimiento
    chat_agentes.py          # Chat con Agentes
    dashboard.py             # Resumen
  lib/
    auth.py                  # Login simple (SHA-256)
    categories.py             # Registro de agentes/categorías + prompts + iconos
    document_parsers.py        # Extracción de texto: txt/md/pdf/csv/xlsx
    rag_bridge.py               # Wrappers sync sobre rag_service / db
  test_files/
    politica_devoluciones.md     # Ejemplo para categoría "legal"
    guia_fotografia_producto.md   # Ejemplo para categoría "fotografia"
  requirements.txt
  Dockerfile
  .env.example
```

## Cómo correrlo localmente

1. **Túnel a la base de datos de stage** (estable, con autossh):

   ```bash
   brew install autossh   # una sola vez

   autossh -M 0 -i ~/Downloads/LightsailDefaultKey-us-east-1.pem \
       -o "ServerAliveInterval=30" -o "ServerAliveCountMax=3" \
       -o "ExitOnForwardFailure=yes" \
       -L 5433:localhost:5432 ubuntu@52.7.98.126 -N -f
   ```

   A diferencia de `ssh -N -f` simple, `autossh` reinicia el túnel
   automáticamente si la conexión se cae (mantiene vivo el proceso
   supervisor). Si el túnel deja de responder igualmente (ej. cambio de red),
   basta con `pkill autossh` y volver a correr el comando.

2. **Configurar `.env`**: copiar `.env.example` a `.env` dentro de
   `apps/admin-rag/` y completar:
   - `AGENTS_DB_URL=postgresql://postgres:<password>@localhost:5433/getinmotion`
   - `OPENAI_API_KEY`, `OPENAI_MODEL`, `EMBEDDING_MODEL`, `EMBEDDING_DIMENSIONS`
     (mismos valores que `apps/agents/.env`)
   - `ADMIN_RAG_USERNAME` y `ADMIN_RAG_PASSWORD_HASH` (generar el hash con
     `python -c "import hashlib; print(hashlib.sha256(b'tu_password').hexdigest())"`)

3. **Instalar dependencias** (usa el mismo venv que `apps/agents`):

   ```bash
   cd apps
   agents/.venv311/bin/pip install -r admin-rag/requirements.txt
   ```

4. **Correr la app**:

   ```bash
   cd apps/admin-rag
   set -a && source .env && set +a
   ../agents/.venv311/bin/streamlit run app.py --server.port=8501
   ```

   Abrir http://localhost:8501.

## Plan de pruebas funcionales

1. **Login**: sin sesión solo se ve el formulario (sin sidebar). Credenciales
   incorrectas → error. Correctas → entra a "Inicio" con sidebar visible.
   "Cerrar sesión" vuelve al login.
2. **Base de Conocimiento — lectura**: categoría "Capacitaciones" debe
   mostrar `ejemplo_precios.md` ya indexado (✅ Completado).
3. **Carga de documentos**: subir `test_files/politica_devoluciones.md` a
   "Legal" y `test_files/guia_fotografia_producto.md` a "Fotografía". Verificar
   el overlay de carga, y que tras indexar aparezcan con estado ✅ y
   `chunk_count > 0`.
4. **Independencia por categoría**: al cambiar de categoría, el selector de
   archivos se limpia (no arrastra el archivo de la categoría anterior).
5. **Eliminación**: borrar un documento de prueba, confirmar overlay y que
   desaparece de la tabla y de "Resumen".
6. **Chat**: en "Legal", preguntar sobre la política de devoluciones; en
   "Fotografía", preguntar sobre iluminación. Verificar respuesta + "Fuentes
   y detalles" citando el documento correcto. "Limpiar conversación" solo
   afecta la categoría activa.
7. **Resumen**: conteos de documentos/chunks coherentes con lo cargado, y
   aviso de agentes sin contenido.
8. **Navegación repetida**: moverse varias veces entre Inicio → Base de
   Conocimiento → Chat → Resumen sin recargar la página — no debe haber
   pantallas de carga eternas ni `InterfaceError`.

## Despliegue en `experiments-telar` (pendiente)

Pasos sugeridos para el siguiente avance:

1. **Build de imagen**: `docker build -f apps/admin-rag/Dockerfile -t
   gim-knowledge-admin:dev apps/` (el contexto debe ser `apps/` porque el
   Dockerfile copia `agents/`, `src/` y `admin-rag/` como hermanos).
2. **Variables de entorno en `experiments-telar`**: las mismas de `.env`
   local, pero `AGENTS_DB_URL` debe apuntar a la IP de `telar-stage`
   (`52.7.98.126`) en el puerto 5432. Confirmar que el Security Group de
   Lightsail permite esa conexión desde `experiments-telar` (instancia a
   instancia, no público).
3. **docker-compose**: crear `infra/experiments/docker-compose.yml` con el
   servicio `knowledge-admin`, puerto `8501:8501`, healthcheck
   `curl -f http://localhost:8501/_stcore/health`.
4. **Despliegue**: copiar compose + `.env` a `experiments-telar`, `docker
   compose up -d`, verificar `http://<ip-experiments-telar>:8501`.
5. **(Opcional) CI**: job en `build-and-push.yml` filtrado por
   `apps/admin-rag/**` para construir y subir `gim-knowledge-admin` a GHCR.

## Notas de seguridad

- `.env` (con credenciales reales) **no se sube al repo** — está en
  `.gitignore`. Solo `.env.example` queda versionado.
- La autenticación es deliberadamente simple (un usuario/contraseña
  compartido del equipo) ya que es una herramienta interna de bajo riesgo. Si
  se expone públicamente en algún momento, conviene añadir un usuario por
  persona o restringir por IP/VPN.
