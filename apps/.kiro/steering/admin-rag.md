---
inclusion: fileMatch
fileMatchPattern: "admin-rag/**"
---

# admin-rag/ — Admin de Base de Conocimiento (Streamlit)

## Descripción

Herramienta interna para el equipo Telar. Permite gestionar la base de conocimiento RAG de cada agente: subir documentos, visualizar chunks, eliminar contenido, y probar la calidad de retrieval chateando directamente con los agentes.

## Stack Tecnológico

- **Framework:** Streamlit
- **Parsing:** pdfplumber (PDF), openpyxl (Excel), markdown
- **Data:** pandas
- **Backend compartido:** Importa directamente `agents/` y `src/` (mismo entorno Python)

## Estructura del Proyecto

```
admin-rag/
├── app.py                     # Entry point Streamlit (multipage)
├── lib/
│   ├── auth.py                # Autenticación admin
│   ├── categories.py          # Categorías de conocimiento
│   ├── document_parsers.py    # Parseo de documentos
│   └── rag_bridge.py          # Puente con el sistema RAG de agents/
├── views/
│   ├── home.py                # Página principal
│   ├── knowledge_base.py      # CRUD de documentos
│   ├── chat_agentes.py        # Chat de prueba con agentes
│   └── dashboard.py           # Métricas y resumen
├── test_files/                # Archivos de ejemplo para testing
├── requirements.txt
├── Dockerfile
└── .env.example
```

## Comandos Principales

```bash
# Desarrollo
streamlit run app.py

# Con puerto específico
streamlit run app.py --server.port 8501

# Docker
docker build -t admin-rag .
docker run -p 8501:8501 admin-rag
```

## Dependencias con Otros Proyectos

- Importa `agents/` y `src/` directamente (deben estar en el PYTHONPATH)
- Comparte la misma DB PostgreSQL (schema `agents`) que el servicio de agentes
- Requiere las mismas variables de entorno que `agents/` para conexión a DB y OpenAI

## Variables de Entorno

Hereda las de `agents/` más:

| Variable          | Descripción                     |
|-------------------|---------------------------------|
| `ADMIN_PASSWORD`  | Contraseña de acceso al admin   |
| `OPENAI_API_KEY`  | Para generar embeddings         |
| `AGENTS_DB_URL`   | PostgreSQL (schema agents)      |

## Convenciones

- Cada vista es un archivo en `views/` registrado como página Streamlit
- Lógica de negocio en `lib/` (no en las vistas)
- Los documentos se parsean y chunkean antes de generar embeddings
- Usa las mismas funciones de embedding que el servicio de agentes
