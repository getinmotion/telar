"""Vista: Inicio — bienvenida y resumen rápido de navegación."""

import streamlit as st


def render() -> None:
    st.title("📚 Telar Knowledge Admin")
    st.markdown(
        "Panel interno de administración de las bases de conocimiento (RAG) "
        "de los agentes de Telar."
    )

    st.divider()

    col1, col2, col3 = st.columns(3)
    with col1:
        with st.container(border=True):
            st.markdown("### 📚 Base de Conocimiento")
            st.caption(
                "Consulta, carga y elimina documentos (TXT, Markdown, PDF, CSV, "
                "Excel) por agente o categoría."
            )
    with col2:
        with st.container(border=True):
            st.markdown("### 💬 Chat con Agentes")
            st.caption(
                "Conversa con cualquier agente para probar cómo responde con el "
                "material recién cargado."
            )
    with col3:
        with st.container(border=True):
            st.markdown("### 📊 Resumen")
            st.caption(
                "Vista general de cuántos documentos y chunks tiene indexados "
                "cada agente."
            )

    st.divider()
    st.caption("Usa el menú de la izquierda para navegar entre secciones.")
