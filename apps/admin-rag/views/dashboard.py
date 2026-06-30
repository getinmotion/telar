"""Vista: Resumen — vista general de documentos/chunks por agente."""

import sys
from pathlib import Path

project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

import pandas as pd
import streamlit as st

from lib.categories import all_category_keys, get_display_label
from lib.rag_bridge import list_categories_sync


def render() -> None:
    st.title("📊 Resumen de Bases de Conocimiento")
    st.caption("Vista general de cuánto contenido tiene cargado cada agente.")

    stats = {row["knowledge_category"]: row for row in list_categories_sync()}

    known_categories = all_category_keys()
    all_categories = sorted(set(known_categories) | set(stats.keys()))

    total_docs = sum(s.get("doc_count", 0) for s in stats.values())
    total_chunks = sum(s.get("total_chunks", 0) for s in stats.values())
    empty_count = len([c for c in all_categories if stats.get(c, {}).get("doc_count", 0) == 0])

    col1, col2, col3, col4 = st.columns(4)
    col1.metric("Agentes", len(all_categories))
    col2.metric("Documentos totales", total_docs)
    col3.metric("Chunks totales", total_chunks)
    col4.metric("Agentes sin contenido", empty_count)

    st.divider()

    rows = []
    for category in all_categories:
        s = stats.get(category, {})
        rows.append({
            "Agente / Categoría": get_display_label(category),
            "Clave": category,
            "Documentos": s.get("doc_count", 0),
            "Chunks totales": s.get("total_chunks", 0),
            "Última carga": (
                s.get("last_uploaded_at").strftime("%Y-%m-%d %H:%M")
                if s.get("last_uploaded_at") else "—"
            ),
        })

    df = pd.DataFrame(rows)

    st.dataframe(
        df,
        use_container_width=True,
        hide_index=True,
        column_config={
            "Documentos": st.column_config.NumberColumn(format="%d 📄"),
            "Chunks totales": st.column_config.NumberColumn(format="%d 🧩"),
        },
    )

    empty_categories = [r["Agente / Categoría"] for r in rows if r["Documentos"] == 0]
    if empty_categories:
        st.warning(
            "⚠️ Agentes sin contenido indexado todavía: " + ", ".join(empty_categories)
        )
    else:
        st.success("✅ Todos los agentes tienen al menos un documento indexado.")
