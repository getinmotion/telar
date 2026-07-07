"""Vista: Chat con Agentes — probar RAG por categoría con el material cargado."""

import sys
from pathlib import Path

project_root = Path(__file__).parent.parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent.parent / ".env")

import streamlit as st

from lib.categories import all_category_keys, get_display_label, get_label, get_prompt_for_category
from lib.rag_bridge import generate_rag_response_sync, list_documents_sync


def render() -> None:
    st.title("💬 Chat con Agentes")
    st.caption("Prueba cómo responde cada agente usando el material indexado en su base de conocimiento.")

    known_categories = all_category_keys()
    existing_doc_categories = sorted({
        d["knowledge_category"] for d in list_documents_sync()
    })
    all_categories = sorted(set(known_categories) | set(existing_doc_categories))

    selected_category = st.selectbox(
        "Agente / Categoría",
        options=all_categories,
        format_func=get_display_label,
        key="chat_category",
    )

    if "chat_history" not in st.session_state:
        st.session_state["chat_history"] = {}

    if selected_category not in st.session_state["chat_history"]:
        st.session_state["chat_history"][selected_category] = []

    history = st.session_state["chat_history"][selected_category]

    col1, col2 = st.columns([4, 1])
    with col1:
        st.caption(f"Conversando con: **{get_display_label(selected_category)}**")
    with col2:
        if st.button("🧹 Limpiar conversación", use_container_width=True):
            st.session_state["chat_history"][selected_category] = []
            st.rerun()

    st.divider()

    if not history:
        st.info(
            "👋 Escribe un mensaje abajo para empezar a probar este agente con el "
            "material que tenga cargado en su base de conocimiento."
        )

    for msg in history:
        with st.chat_message(msg["role"]):
            st.markdown(msg["content"])
            if msg.get("sources"):
                with st.expander("📎 Fuentes y detalles"):
                    st.markdown(f"**Confianza:** {msg.get('confidence', '—')}")
                    st.markdown(f"**Chunks recuperados:** {msg.get('retrieved_chunks', '—')}")
                    st.markdown("**Documentos fuente:**")
                    for src in msg["sources"]:
                        st.markdown(f"- {src}")

    query = st.chat_input(f"Pregúntale algo al agente de {get_label(selected_category)}...")

    if query:
        history.append({"role": "user", "content": query})
        with st.chat_message("user"):
            st.markdown(query)

        with st.chat_message("assistant"):
            with st.spinner("Pensando..."):
                result = generate_rag_response_sync(
                    query=query,
                    category=selected_category,
                    system_prompt=get_prompt_for_category(selected_category),
                    conversation_history=history[:-1],
                )
            answer = result.get("answer", "")
            st.markdown(answer)

            sources = result.get("sources")
            if sources:
                with st.expander("📎 Fuentes y detalles"):
                    st.markdown(f"**Confianza:** {result.get('confidence', '—')}")
                    st.markdown(f"**Chunks recuperados:** {result.get('retrieved_chunks', '—')}")
                    st.markdown("**Documentos fuente:**")
                    for src in sources:
                        st.markdown(f"- {src}")

        history.append({
            "role": "assistant",
            "content": answer,
            "sources": sources,
            "confidence": result.get("confidence"),
            "retrieved_chunks": result.get("retrieved_chunks"),
        })
