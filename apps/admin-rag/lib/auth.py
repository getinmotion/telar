"""Simple shared-credential login for the internal admin tool."""

import hashlib
import os

import streamlit as st


def _hash(password: str) -> str:
    return hashlib.sha256(password.encode("utf-8")).hexdigest()


def is_authenticated() -> bool:
    return bool(st.session_state.get("authenticated"))


def render_login() -> None:
    """Render the login form (centered, no sidebar/navigation visible)."""
    expected_user = os.getenv("ADMIN_RAG_USERNAME", "admin")
    expected_hash = os.getenv("ADMIN_RAG_PASSWORD_HASH", "")

    _, center, _ = st.columns([1, 1.2, 1])
    with center:
        st.markdown(
            "<div style='text-align:center; padding-top: 3rem;'>"
            "<span style='font-size: 3rem;'>📚</span>"
            "</div>",
            unsafe_allow_html=True,
        )
        st.markdown(
            "<h2 style='text-align:center; margin-bottom:0;'>Telar Knowledge Admin</h2>"
            "<p style='text-align:center; color: gray; margin-top:0;'>"
            "Panel interno de administración de bases de conocimiento (RAG)"
            "</p>",
            unsafe_allow_html=True,
        )

        with st.form("login_form"):
            username = st.text_input("Usuario", placeholder="admin")
            password = st.text_input("Contraseña", type="password", placeholder="••••••••")
            submitted = st.form_submit_button("Iniciar sesión", use_container_width=True, type="primary")

        if submitted:
            if not expected_hash:
                st.error(
                    "ADMIN_RAG_PASSWORD_HASH no está configurado. "
                    "Define las variables de entorno de acceso."
                )
            elif username == expected_user and _hash(password) == expected_hash:
                st.session_state["authenticated"] = True
                st.rerun()
            else:
                st.error("Usuario o contraseña incorrectos.")


def logout_button() -> None:
    if st.sidebar.button("🚪 Cerrar sesión", use_container_width=True):
        st.session_state["authenticated"] = False
        st.rerun()
