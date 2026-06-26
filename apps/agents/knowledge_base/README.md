# Knowledge Base

Coloca aquí los documentos que quieres indexar en el RAG de cada agente.

## Estructura

```
knowledge_base/
  legal/           → Agente Legal (impuestos, registros, cumplimiento, DIAN)
  faq/             → Agente FAQ (preguntas frecuentes, guías generales)
  pricing/         → Agente Pricing (estrategias de precios, costos)
  presencia_digital/ → Agente Presencia Digital (redes sociales, marketing)
  servicio_cliente/ → Agente Servicio al Cliente (devoluciones, PQRS)
  fotografia/      → Agente Fotografía (técnicas, composición, iluminación)
  producto/        → Agente Producto (catálogo, descripciones, inventario)
```

## Formato de archivos

Acepta `.md` y `.txt`. Puedes agregar frontmatter YAML opcional:

```markdown
---
knowledge_category: legal
tags: [registro, formalización, DIAN]
---

# Registro Mercantil para Artesanos

El registro mercantil es obligatorio para...
```

Si no hay frontmatter, el nombre de la carpeta se usa como `knowledge_category`.

## Cómo indexar

```bash
# Indexar todo
cd apps/agents
python scripts/seed_knowledge_base.py

# Solo una categoría
python scripts/seed_knowledge_base.py --category legal

# Un archivo específico
python scripts/seed_knowledge_base.py --file knowledge_base/legal/registro.md

# O via API (servidor corriendo)
curl -X POST http://localhost:8000/agents/knowledge/upload \
  -F "file=@knowledge_base/legal/registro.md" \
  -F "knowledge_category=legal"
```
