"""Vista: Base de Conocimiento — listar, cargar y eliminar documentos por categoría."""

import sys
from pathlib import Path

project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

import streamlit as st

from lib.categories import all_category_keys, get_display_label
from lib.document_parsers import extract_text, get_file_type
from lib.rag_bridge import delete_document_sync, list_documents_sync, process_document_sync

from agents.core.state import KnowledgeDocument

STATUS_LABELS = {
    "completed": "✅ Completado",
    "processing": "⏳ Procesando",
    "pending": "🕓 Pendiente",
    "failed": "❌ Error",
}


def _overlay_spinner(message: str):
    """Render a large, centered, full-screen overlay with a spinner message."""
    placeholder = st.empty()
    placeholder.markdown(
        f"""
        <div style="
            position: fixed;
            top: 0; left: 0; right: 0; bottom: 0;
            background: rgba(255, 255, 255, 0.85);
            z-index: 9999;
            display: flex;
            align-items: center;
            justify-content: center;
        ">
            <div style="
                background: white;
                border-radius: 16px;
                padding: 2.5rem 3.5rem;
                box-shadow: 0 8px 32px rgba(0,0,0,0.15);
                text-align: center;
            ">
                <div class="stSpinner" style="display:flex; justify-content:center; margin-bottom: 1rem;">
                    <div style="
                        border: 6px solid #e0e0e0;
                        border-top: 6px solid #FF4B4B;
                        border-radius: 50%;
                        width: 56px;
                        height: 56px;
                        animation: spin 0.8s linear infinite;
                        margin: 0 auto;
                    "></div>
                </div>
                <div style="font-size: 1.2rem; font-weight: 600; color: #31333F;">
                    {message}
                </div>
            </div>
        </div>
        <style>
        @keyframes spin {{
            0% {{ transform: rotate(0deg); }}
            100% {{ transform: rotate(360deg); }}
        }}
        </style>
        """,
        unsafe_allow_html=True,
    )
    return placeholder


def render() -> None:
    st.title("📚 Base de Conocimiento")
    st.caption(
        "Consulta, carga y elimina los documentos que alimentan el RAG de cada agente."
    )

    # ------------------------------------------------------------------
    # Selector de categoría / agente
    # ------------------------------------------------------------------

    known_categories = all_category_keys()
    existing_doc_categories = sorted({
        d["knowledge_category"] for d in list_documents_sync()
    })
    all_categories = sorted(set(known_categories) | set(existing_doc_categories))

    selected_category = st.selectbox(
        "Agente / Categoría",
        options=all_categories,
        format_func=get_display_label,
    )

    st.divider()

    # ------------------------------------------------------------------
    # Documentos existentes
    # ------------------------------------------------------------------

    documents = list_documents_sync(category=selected_category)

    header_col1, header_col2, header_col3 = st.columns(3)
    header_col1.metric("Documentos", len(documents))
    header_col2.metric("Chunks totales", sum(d["chunk_count"] for d in documents))
    header_col3.metric("Agente / Categoría", get_display_label(selected_category))

    st.subheader(f"Documentos en {get_display_label(selected_category)}")

    if not documents:
        st.info("No hay documentos indexados en esta categoría todavía. Carga uno abajo. 👇")
    else:
        header_cols = st.columns([3, 1.4, 1.6, 1.2, 1.6, 1])
        header_cols[0].markdown("**Archivo**")
        header_cols[1].markdown("**Tipo**")
        header_cols[2].markdown("**Estado**")
        header_cols[3].markdown("**Chunks**")
        header_cols[4].markdown("**Cargado el**")
        header_cols[5].markdown("**Acción**")

        for doc in documents:
            with st.container(border=True):
                cols = st.columns([3, 1.4, 1.6, 1.2, 1.6, 1])
                cols[0].markdown(f"**{doc['filename']}**")
                cols[1].markdown(f"`{doc['file_type'].split('/')[-1]}`")
                cols[2].markdown(STATUS_LABELS.get(doc["processing_status"], doc["processing_status"]))
                cols[3].markdown(f"{doc['chunk_count']} chunks")
                cols[4].markdown(
                    doc["created_at"].strftime("%Y-%m-%d %H:%M") if doc.get("created_at") else "—"
                )
                if cols[5].button("🗑️ Eliminar", key=f"delete_{doc['id']}", use_container_width=True):
                    overlay = _overlay_spinner(f"Eliminando '{doc['filename']}'...")
                    delete_document_sync(doc["id"])
                    overlay.empty()
                    st.success(f"Documento '{doc['filename']}' eliminado.")
                    st.rerun()

    st.divider()

    # ------------------------------------------------------------------
    # Carga de nuevos documentos
    # ------------------------------------------------------------------

    st.subheader("Cargar nuevos documentos")
    st.caption("Formatos soportados: TXT, Markdown, PDF, CSV y Excel (.xlsx).")

    uploaded_files = st.file_uploader(
        "Selecciona uno o varios archivos",
        type=["txt", "md", "pdf", "csv", "xlsx"],
        accept_multiple_files=True,
        label_visibility="collapsed",
        key=f"uploader_{selected_category}",
    )

    if uploaded_files:
        st.caption(
            f"{len(uploaded_files)} archivo(s) listo(s) para indexar en "
            f"{get_display_label(selected_category)}"
        )

        for f in uploaded_files:
            with st.expander(f"📄 {f.name}", expanded=False):
                try:
                    text = extract_text(f.name, f.getvalue())
                    preview = text[:500] + ("..." if len(text) > 500 else "")
                    st.text(preview or "(documento vacío)")
                except Exception as e:
                    st.error(f"No se pudo leer este archivo: {e}")

        if st.button("📥 Indexar todos", type="primary"):
            overlay = _overlay_spinner(f"Indexando 1 de {len(uploaded_files)}: {uploaded_files[0].name}...")
            results = []
            for i, f in enumerate(uploaded_files):
                overlay.empty()
                overlay = _overlay_spinner(
                    f"Indexando {i + 1} de {len(uploaded_files)}: {f.name}..."
                )
                try:
                    content = extract_text(f.name, f.getvalue())
                    if not content.strip():
                        raise ValueError("El documento no contiene texto extraíble.")

                    document = KnowledgeDocument(
                        filename=f.name,
                        file_type=get_file_type(f.name),
                        file_size=len(f.getvalue()),
                        content=content,
                        knowledge_category=selected_category,
                        uploaded_by="admin_webapp",
                    )
                    process_document_sync(document)
                    results.append((f.name, "ok", None))
                except Exception as e:
                    results.append((f.name, "error", str(e)))

            overlay.empty()

            for filename, status, error in results:
                if status == "ok":
                    st.success(f"✅ {filename} indexado correctamente.")
                else:
                    st.error(f"❌ {filename}: {error}")

            st.rerun()
