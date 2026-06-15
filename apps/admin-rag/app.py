"""Telar Knowledge Admin — entry point.

Internal Streamlit app for managing per-agent RAG knowledge bases:
view/upload/delete documents and chat with each agent to test retrieval.
"""

import sys
from pathlib import Path

# apps/admin-rag/app.py -> apps/ is the project root that contains
# the `agents` and `src` packages (same layout used by seed_knowledge_base.py).
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from dotenv import load_dotenv

load_dotenv(Path(__file__).parent / ".env")

import streamlit as st

from lib.auth import is_authenticated, logout_button, render_login
from views import chat_agentes, dashboard, home, knowledge_base

st.set_page_config(
    page_title="Telar Knowledge Admin",
    page_icon="📚",
    layout="wide",
)

if not is_authenticated():
    # Hide the sidebar entirely until the user logs in.
    st.markdown(
        "<style>[data-testid='stSidebar'] {display: none;}</style>",
        unsafe_allow_html=True,
    )
    render_login()
    st.stop()

pages = [
    st.Page(home.render, title="Inicio", icon="🏠", url_path="inicio", default=True),
    st.Page(knowledge_base.render, title="Base de Conocimiento", icon="📚", url_path="base-de-conocimiento"),
    st.Page(chat_agentes.render, title="Chat con Agentes", icon="💬", url_path="chat-agentes"),
    st.Page(dashboard.render, title="Resumen", icon="📊", url_path="resumen"),
]

nav = st.navigation(pages)

with st.sidebar:
    st.markdown("### 📚 Telar Knowledge Admin")
    st.caption("Acceso interno — equipo Telar")
    st.divider()

nav.run()

with st.sidebar:
    st.divider()
    logout_button()
