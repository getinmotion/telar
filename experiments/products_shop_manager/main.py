import streamlit as st
import pandas as pd
from sqlalchemy import create_engine, Column, String, Float, Boolean, JSON, ForeignKey, Numeric, text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base, sessionmaker
from sqlalchemy.engine import URL
from sqlalchemy.pool import QueuePool
import uuid
import json
from openai import OpenAI

# --- 1. CONFIGURACIÓN INICIAL ---
st.set_page_config(page_title="Telar | Manager de Migración + IA", layout="wide", page_icon="🤖")

# --- 1.5 SISTEMA DE AUTENTICACIÓN ---
def check_password():
    """Devuelve True si el usuario ingresó la contraseña correcta."""
    if "logged_in" not in st.session_state:
        st.session_state["logged_in"] = False

    if not st.session_state["logged_in"]:
        st.markdown("## 🔒 Acceso Restringido - Telar")
        
        # Formulario de Login
        with st.form("login_form"):
            username = st.text_input("Usuario")
            password = st.text_input("Contraseña", type="password")
            submit = st.form_submit_button("Ingresar")

            if submit:
                # Verificar en secrets.toml
                users_db = st.secrets["users"]
                if username in users_db and users_db[username]["password"] == password:
                    st.session_state["logged_in"] = True
                    st.session_state["username"] = username
                    st.session_state["assigned_shops"] = users_db[username]["assigned_shops"]
                    st.success("Acceso concedido.")
                    st.rerun()
                else:
                    st.error("Usuario o contraseña incorrectos.")
        
        # Detiene la ejecución del resto del código si no está logueado
        st.stop() 

# Llamamos a la validación antes de cargar nada de la base de datos
check_password()

# --- SI LLEGA AQUÍ, EL USUARIO ESTÁ AUTENTICADO ---
st.sidebar.markdown(f"👤 **Curador:** {st.session_state['username']}")
if st.sidebar.button("Cerrar Sesión"):
    st.session_state.clear()
    st.rerun()

# --- 2. CONFIGURACIÓN DE BASE DE DATOS (LEÍDA DESDE SECRETS) ---
db_config = st.secrets["database"]
connection_url = URL.create(
    drivername="postgresql",
    username=db_config["user"],
    password=db_config["password"],
    host=db_config["host"],
    port=db_config["port"],
    database=db_config["name"]
)

Base = declarative_base()

@st.cache_resource
def get_db_sessionmaker():
    engine = create_engine(
        connection_url, 
        poolclass=QueuePool,
        pool_size=10,        
        max_overflow=20,     
        pool_pre_ping=True,  # <- LÍNEA NUEVA: Verifica que la conexión esté viva
        pool_recycle=1800    # <- LÍNEA NUEVA: Destruye y recrea conexiones de más de 30 min
    )
    # Crear esquemas si no existen
    with engine.connect() as conn:
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS shop"))
        conn.execute(text("CREATE SCHEMA IF NOT EXISTS taxonomy"))
        conn.commit()
        
    Base.metadata.create_all(bind=engine)
    return sessionmaker(bind=engine)

SessionLocal = get_db_sessionmaker()
db = SessionLocal()

@st.cache_data(ttl=600)
def get_cached_taxonomies():
    # Usamos una sesión temporal solo para leer esto sin bloquear la principal
    with SessionLocal() as temp_db:
        crafts = {str(c.id): c.name for c in temp_db.query(TaxonomyCraft).filter(TaxonomyCraft.is_active == True).all()}
        techs = {str(t.id): t.name for t in temp_db.query(TaxonomyTechnique).all()}
        cats = {str(c.id): c.name for c in temp_db.query(TaxonomyCategory).all()}
        mats = {str(m.id): m.name for m in temp_db.query(TaxonomyMaterial).all()}
        # --- NUEVOS ---
        care_tags = {str(ct.id): ct.name for ct in temp_db.query(TaxonomyCareTag).all()}
        badges = {str(b.id): b.name for b in temp_db.query(TaxonomyBadge).filter(TaxonomyBadge.target_type == 'product').all()}
    return crafts, techs, cats, mats, care_tags, badges

@st.cache_data(ttl=300) # Se actualiza cada 5 minutos
def get_cached_legacy_shops():
    with SessionLocal() as temp_db:
        shops = temp_db.query(ShopLegacy.id, ShopLegacy.shop_name).order_by(ShopLegacy.shop_name).all()
        return {str(s.id): s.shop_name for s in shops}

@st.cache_data(ttl=300)
def get_cached_legacy_products(shop_id):
    with SessionLocal() as temp_db:
        prods = temp_db.query(ProductLegacy.id, ProductLegacy.name).filter(ProductLegacy.shop_id == shop_id).all()
        return {str(p.id): p.name for p in prods}
# --- 2. CONFIGURACIÓN IA (LLM) ---
@st.cache_data(show_spinner=False)
def suggest_product_migration(_legacy_product, valid_crafts, valid_techniques, valid_cats):
    crafts_ctx = [{"id": str(k), "name": v} for k, v in valid_crafts.items()]
    techs_ctx = [{"id": str(k), "name": v} for k, v in valid_techniques.items()]
    cats_ctx = [{"id": str(k), "name": v} for k, v in valid_cats.items()]
    
    system_prompt = f"""
    Eres un curador experto y logístico del marketplace artesanal 'Telar'.
    Tu tarea es migrar datos antiguos y desestructurados a un nuevo formato estandarizado.
    
    REGLAS:
    - Analiza los textos y JSONs antiguos para inferir medidas (en cm) y peso (en kg).
    - Asigna los IDs de oficio, técnica y categoría SOLO usando estos catálogos. Si no hay coincidencia, usa null.
    Oficios: {json.dumps(crafts_ctx)}
    Técnicas: {json.dumps(techs_ctx)}
    Categorías Curatoriales: {json.dumps(cats_ctx)}
    
    DEVUELVE ÚNICAMENTE UN JSON con esta estructura exacta:
    {{
        "new_name": string,
        "short_description": string (max 200 chars),
        "primary_craft_id": string o null,
        "primary_technique_id": string o null,
        "curatorial_category_id": string o null,
        "piece_type": "funcional" | "decorativa" | "mixta",
        "style": "tradicional" | "contemporaneo" | "fusion",
        "process_type": "manual" | "mixto" | "asistido",
        "estimated_elaboration_time": string,
        "dim_height_cm": float,
        "dim_width_cm": float,
        "dim_length_cm": float,
        "real_weight_kg": float,
        "packaging_type": "Caja Rígida" | "Bolsa de Tela" | "Tubo" | "Huacal" | "Sobre",
        "pack_weight_kg": float
    }}
    """

    user_prompt = f"""
    Producto legacy:
    Nombre: {legacy_product.name}
    Descripción: {legacy_product.description}
    Peso: {legacy_product.weight}
    Materiales JSON: {json.dumps(legacy_product.materials)}
    Dimensiones JSON: {json.dumps(legacy_product.dimensions)}
    """

    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini", 
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1
        )
        return json.loads(response.choices[0].message.content)
    except Exception as e:
        st.error(f"Error LLM: {e}")
        return {}

# --- 3. MODELOS ORM (CON UUIDS Y NOMBRES SQL) ---

# -- TAXONOMÍA --
class TaxonomyCraft(Base):
    __tablename__ = 'crafts'
    __table_args__ = {'schema': 'taxonomy', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    is_active = Column(Boolean, default=True)

class TaxonomyTechnique(Base):
    __tablename__ = 'techniques'
    __table_args__ = {'schema': 'taxonomy', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    craft_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.crafts.id'))
    name = Column(String, nullable=False)

class TaxonomyMaterial(Base):
    __tablename__ = 'materials'
    __table_args__ = {'schema': 'taxonomy', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    is_organic = Column(Boolean, default=False)
    is_sustainable = Column(Boolean, default=False)

class TaxonomyCategory(Base):
    __tablename__ = 'curatorial_categories'
    __table_args__ = {'schema': 'taxonomy', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)
    description = Column(String)

class TaxonomyBadge(Base):
    __tablename__ = 'badges'
    __table_args__ = {'schema': 'taxonomy', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    code = Column(String, unique=True, nullable=False)
    name = Column(String, nullable=False)
    target_type = Column(String)
    assignment_type = Column(String)

class TaxonomyCareTag(Base):
    __tablename__ = 'care_tags'
    __table_args__ = {'schema': 'taxonomy', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, unique=True, nullable=False)

# -- SHOP LEGACY --
class ShopLegacy(Base):
    __tablename__ = 'artisan_shops'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True)
    user_id = Column(UUID(as_uuid=False), nullable=False) # <- LÍNEA NUEVA
    shop_name = Column(String)
    contact_info = Column(JSON)  


class ProductLegacy(Base):
    __tablename__ = 'products'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True)
    shop_id = Column(UUID(as_uuid=False), ForeignKey('shop.artisan_shops.id'))
    name = Column(String)
    description = Column(String)
    price = Column(Float)
    dimensions = Column(JSON) 
    materials = Column(JSON)
    weight = Column(Float)

# -- SHOP NUEVO --
class Store(Base):
    __tablename__ = 'stores'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(UUID(as_uuid=False), nullable=False) # <- LÍNEA NUEVA
    name = Column(String, nullable=False)
    slug = Column(String, nullable=False)
    legacy_id = Column(UUID(as_uuid=False), ForeignKey('shop.artisan_shops.id')) 

class StoreArtisanalProfile(Base):
    __tablename__ = 'store_artisanal_profiles'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    store_id = Column(UUID(as_uuid=False), ForeignKey('shop.stores.id'), primary_key=True)
    primary_craft_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.crafts.id'))
    is_collaboration_studio = Column(Boolean, default=False)

class StoreContact(Base):
    __tablename__ = 'store_contacts'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(UUID(as_uuid=False), ForeignKey('shop.stores.id'), unique=True)
    email = Column(String)
    phone = Column(String)

class ProductsCore(Base):
    __tablename__ = 'products_core'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    store_id = Column(UUID(as_uuid=False), ForeignKey('shop.stores.id'), nullable=False)
    name = Column(String, nullable=False)
    short_description = Column(String, nullable=False)
    history = Column(String) # <- NUEVO
    care_notes = Column(String) # <- NUEVO
    status = Column(String, default='draft')

class ProductArtisanalIdentity(Base):
    __tablename__ = 'product_artisanal_identity'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    product_id = Column(UUID(as_uuid=False), ForeignKey('shop.products_core.id'), primary_key=True)
    process_type = Column(String) 
    estimated_elaboration_time = Column(String)
    primary_craft_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.crafts.id'))
    primary_technique_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.techniques.id'))
    secondary_technique_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.techniques.id')) # <- NUEVO
    curatorial_category_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.curatorial_categories.id'))
    piece_type = Column(String)
    style = Column(String)
    is_collaboration = Column(Boolean, default=False)

class ProductLogistics(Base):
    __tablename__ = 'product_logistics'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    product_id = Column(UUID(as_uuid=False), ForeignKey('shop.products_core.id'), primary_key=True)
    packaging_type = Column(String)
    pack_height_cm = Column(Numeric(8,2))
    pack_width_cm = Column(Numeric(8,2))
    pack_length_cm = Column(Numeric(8,2))
    pack_weight_kg = Column(Numeric(8,2))
    fragility = Column(String)
    requires_assembly = Column(Boolean, default=False) # <- NUEVO
    special_protection_notes = Column(String) # <- NUEVO
class ProductLogistics(Base):
    __tablename__ = 'product_logistics'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    product_id = Column(UUID(as_uuid=False), ForeignKey('shop.products_core.id'), primary_key=True)
    packaging_type = Column(String)
    pack_height_cm = Column(Numeric(8,2))
    pack_width_cm = Column(Numeric(8,2))
    pack_length_cm = Column(Numeric(8,2))
    pack_weight_kg = Column(Numeric(8,2))
    fragility = Column(String)

class ProductMaterialLink(Base):
    __tablename__ = 'product_materials_link'
    __table_args__ = {'schema': 'shop', 'extend_existing': True}
    product_id = Column(UUID(as_uuid=False), ForeignKey('shop.products_core.id'), primary_key=True)
    material_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.materials.id'), primary_key=True)

class ProductCareTagLink(Base):
    __tablename__ = 'product_care_tags'
    __table_args__ = {'schema': 'shop', 'extend_existing': True} # Si la eliminas en BD, coméntala aquí
    product_id = Column(UUID(as_uuid=False), ForeignKey('shop.products_core.id'), primary_key=True)
    care_tag_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.care_tags.id'), primary_key=True)

class ProductBadgeLink(Base):
    __tablename__ = 'product_badges'
    __table_args__ = {'schema': 'shop', 'extend_existing': True} # Si la eliminas en BD, coméntala aquí
    id = Column(UUID(as_uuid=False), primary_key=True, default=lambda: str(uuid.uuid4()))
    product_id = Column(UUID(as_uuid=False), ForeignKey('shop.products_core.id'))
    badge_id = Column(UUID(as_uuid=False), ForeignKey('taxonomy.badges.id'))

SessionLocal = get_db_sessionmaker()
db = SessionLocal()

# --- 4. INTERFAZ STREAMLIT ---
menu = st.sidebar.radio("Navegación", [
    "📊 Dashboard Global de Migración",
    "🏷️ Gestor de Taxonomía (Maestros)",
    "🏪 Migración de Tiendas", 
    "📦 Migración de Productos",
    "✨ Crear Nuevo Producto"
])

if menu == "📊 Dashboard Global de Migración":
    st.title("🌐 Centro de Comando")
    
    # 1. Traer TODO en 3 consultas únicas (súper rápido)
    shops_df = pd.read_sql(db.query(ShopLegacy.id, ShopLegacy.shop_name).statement, db.bind)
    
    # Leemos las tiendas nuevas (Stores) para cruzar los IDs
    stores_df = pd.read_sql(db.query(Store.id, Store.legacy_id).statement, db.bind)
    
    legacy_prods_df = pd.read_sql(db.query(ProductLegacy.shop_id, ProductLegacy.id).statement, db.bind)
    new_prods_df = pd.read_sql(db.query(ProductsCore.store_id, ProductsCore.id).statement, db.bind)

    # 2. Agrupar y contar usando Pandas
    legacy_counts = legacy_prods_df.groupby('shop_id').size().to_dict() if not legacy_prods_df.empty else {}
    new_counts = new_prods_df.groupby('store_id').size().to_dict() if not new_prods_df.empty else {}
    
    # Diccionario rápido para saber qué store_id nuevo le corresponde al legacy_id viejo
    legacy_to_store = dict(zip(stores_df['legacy_id'].astype(str), stores_df['id'].astype(str))) if not stores_df.empty else {}

    data = []
    shops_fully_migrated = 0
    assigned = st.session_state.get("assigned_shops", ["ALL"])
    
    for _, s in shops_df.iterrows():
        s_id = str(s['id'])
        
        # Filtro de asignación de curadores
        if "ALL" not in assigned and s_id not in assigned:
            continue
            
        store_id = legacy_to_store.get(s_id)
        is_shop_ready = store_id is not None
        
        legacy_count = legacy_counts.get(s_id, 0)
        new_count = new_counts.get(store_id, 0) if is_shop_ready else 0
        
        progress = min((new_count / legacy_count) * 100, 100) if legacy_count > 0 else 0
            
        status = "🔴 Pendiente"
        if is_shop_ready and new_count >= legacy_count and legacy_count > 0:
            status = "✅ Completado"
            shops_fully_migrated += 1
        elif is_shop_ready or new_count > 0:
            status = "🟡 En Progreso"
            
        data.append({
            "Tienda": s['shop_name'],
            "Perfil Migrado": "🟢 Sí" if is_shop_ready else "🔴 No",
            "Prods. Legacy": legacy_count,
            "Prods. Nuevos": new_count,
            "Avance (%)": round(progress, 1),
            "Estado Global": status
        })

    # 3. Mostrar métricas al instante
    c1, c2, c3, c4 = st.columns(4)
    c1.metric("Total de Tiendas", len(data))
    c2.metric("Tiendas Completadas", shops_fully_migrated)
    c3.metric("Total Prods Legacy", sum(legacy_counts.values()))
    c4.metric("Total Prods Nuevos", sum(new_counts.values()))
    
    st.markdown("---")
    if data:
        df_dashboard = pd.DataFrame(data)
        st.dataframe(
            df_dashboard.style.background_gradient(subset=['Avance (%)'], cmap='Greens', vmin=0, vmax=100),
            width='stretch', height=500
        )
    else:
        st.info("Aún no hay tiendas en la base de datos para mostrar el progreso.")
elif menu == "🏷️ Gestor de Taxonomía (Maestros)":
    st.title("🏷️ Constructor y Editor de Taxonomía")
    
    # --- DOCUMENTACIÓN EDUCATIVA ---
    st.info("💡 **Gestión de Catálogos:** Expande el panel inferior para entender las reglas de seguridad al editar o borrar.")
    with st.expander("📖 Reglas de Edición y Relación con Productos (Leer antes de operar)"):
        st.markdown("""
        ### 1. Edición de Textos (Seguro ✅)
        Si editas el nombre de una categoría o material en las tablas de abajo, **todos los productos asociados se actualizarán automáticamente**. La relación se mantiene intacta porque el sistema usa IDs invisibles.

        ### 2. Borrado de Taxonomía "Bloqueadora" (Corazón del Producto 🛑)
        Aplica para: **Oficios, Técnicas, Materiales y Categorías Curatoriales.**
        Son datos vitales. Si intentas borrar uno desde la base de datos y hay productos usándolo, **el sistema bloqueará la acción** para evitar que queden "productos huérfanos". Debes reasignar esos productos a otra categoría primero.

        ### 3. Borrado de Taxonomía "Limpiadora" (Atributos Flexibles 🧹)
        Aplica para: **Insignias (Badges) y Etiquetas de Cuidado (Care Tags).**
        Son datos complementarios. Si se borra uno de estos desde la base de datos, el sistema **lo limpiará silenciosamente en cascada** de todos los productos que lo tenían. El producto seguirá existiendo sin problemas, simplemente perderá esa etiqueta.
        """)
        
    st.markdown("---")

    tab1, tab2, tab3, tab4, tab5 = st.tabs(["🌳 Árbol: Oficios y Técnicas", "🪵 Materiales", "🏛️ Cat. Curatoriales", "🏅 Insignias (Badges)", "🏷️ Care Tags"])
    
    # --- TAB 1: ÁRBOL DE OFICIOS Y TÉCNICAS ---
    with tab1:
        col_tree, col_forms = st.columns([1, 1], gap="large")
        with col_tree:
            st.subheader("Visualizador de Árbol")
            crafts = db.query(TaxonomyCraft).order_by(TaxonomyCraft.name).all()
            if not crafts:
                st.info("El árbol está vacío. Crea un oficio a la derecha.")
            else:
                for c in crafts:
                    with st.expander(f"🧶 {c.name}", expanded=False):
                        if c.description: st.caption(c.description)
                        techs = db.query(TaxonomyTechnique).filter(TaxonomyTechnique.craft_id == c.id).all()
                        for t in techs: st.markdown(f"&nbsp;&nbsp;&nbsp;&nbsp; └─ 🛠️ **{t.name}**")
        with col_forms:
            st.subheader("Añadir Nuevos Nodos")
            with st.form("form_craft_tree"):
                c_name = st.text_input("Nombre del Nuevo Oficio")
                if st.form_submit_button("Guardar Oficio") and c_name.strip():
                    db.add(TaxonomyCraft(name=c_name.strip()))
                    db.commit(); get_cached_taxonomies.clear(); st.rerun()
            
            crafts_for_tech = {str(c.id): c.name for c in db.query(TaxonomyCraft).all()}
            with st.form("form_tech_tree"):
                sel_craft = st.selectbox("Oficio Padre", options=list(crafts_for_tech.keys()), format_func=lambda x: crafts_for_tech[x])
                t_name = st.text_input("Nombre de la Nueva Técnica")
                if st.form_submit_button("Guardar Técnica") and t_name.strip() and sel_craft:
                    db.add(TaxonomyTechnique(craft_id=sel_craft, name=t_name.strip()))
                    db.commit(); get_cached_taxonomies.clear(); st.rerun()

    # --- TAB 2: MATERIALES ---
    with tab2:
        c1, c2 = st.columns([2, 1], gap="large")
        with c1: 
            st.subheader("Editor Rápido")
            mats = db.query(TaxonomyMaterial).all()
            df_mats = pd.DataFrame([{"id": str(m.id), "Nombre": m.name, "Orgánico": m.is_organic, "Sustentable": m.is_sustainable} for m in mats])
            if not df_mats.empty:
                edited_mats = st.data_editor(df_mats, column_config={"id": None}, hide_index=True, use_container_width=True, key="ed_mat")
                if st.button("💾 Guardar Ediciones de Materiales"):
                    for _, row in edited_mats.iterrows():
                        db_m = db.query(TaxonomyMaterial).filter(TaxonomyMaterial.id == row['id']).first()
                        if db_m:
                            db_m.name = row['Nombre']
                            db_m.is_organic = row['Orgánico']
                            db_m.is_sustainable = row['Sustentable']
                    db.commit(); get_cached_taxonomies.clear(); st.success("Actualizado!"); st.rerun()
        with c2:
            st.subheader("Añadir Material")
            with st.form("f_mat"):
                name = st.text_input("Nombre del material")
                org = st.checkbox("Orgánico")
                sus = st.checkbox("Sustentable")
                if st.form_submit_button("Crear Nuevo") and name.strip():
                    db.add(TaxonomyMaterial(name=name.strip(), is_organic=org, is_sustainable=sus))
                    db.commit(); get_cached_taxonomies.clear(); st.rerun()

    # --- TAB 3: CATEGORÍAS ---
    with tab3:
        c1, c2 = st.columns([2, 1], gap="large")
        with c1: 
            st.subheader("Editor Rápido")
            cats = db.query(TaxonomyCategory).all()
            df_cats = pd.DataFrame([{"id": str(c.id), "Nombre": c.name} for c in cats])
            if not df_cats.empty:
                edited_cats = st.data_editor(df_cats, column_config={"id": None}, hide_index=True, use_container_width=True, key="ed_cat")
                if st.button("💾 Guardar Ediciones de Categorías"):
                    for _, row in edited_cats.iterrows():
                        db_c = db.query(TaxonomyCategory).filter(TaxonomyCategory.id == row['id']).first()
                        if db_c: db_c.name = row['Nombre']
                    db.commit(); get_cached_taxonomies.clear(); st.success("Actualizado!"); st.rerun()
        with c2:
            st.subheader("Añadir Categoría")
            with st.form("f_cat"):
                name = st.text_input("Nombre de categoría")
                if st.form_submit_button("Crear Nueva") and name.strip():
                    db.add(TaxonomyCategory(name=name.strip()))
                    db.commit(); get_cached_taxonomies.clear(); st.rerun()

    # --- TAB 4: BADGES ---
    with tab4:
        c1, c2 = st.columns([2, 1], gap="large")
        with c1: 
            st.subheader("Editor Rápido")
            badges = db.query(TaxonomyBadge).all()
            df_badges = pd.DataFrame([{"id": str(b.id), "Código": b.code, "Nombre": b.name, "Target": b.target_type} for b in badges])
            if not df_badges.empty:
                # Ocultamos el ID y protegemos el Código (no se debería editar fácilmente si se usa en lógica)
                edited_badges = st.data_editor(df_badges, column_config={"id": None, "Código": st.column_config.TextColumn(disabled=True)}, hide_index=True, use_container_width=True, key="ed_bad")
                if st.button("💾 Guardar Ediciones de Insignias"):
                    for _, row in edited_badges.iterrows():
                        db_b = db.query(TaxonomyBadge).filter(TaxonomyBadge.id == row['id']).first()
                        if db_b: 
                            db_b.name = row['Nombre']
                            db_b.target_type = row['Target']
                    db.commit(); get_cached_taxonomies.clear(); st.success("Actualizado!"); st.rerun()
        with c2:
            st.subheader("Añadir Insignia")
            with st.form("f_badge"):
                b_code = st.text_input("Código (Ej. HECHO_A_MANO)")
                b_name = st.text_input("Nombre Comercial")
                b_target = st.selectbox("Aplicable a", ["product", "shop"])
                b_assign = st.selectbox("Asignación", ["curated", "automated"])
                if st.form_submit_button("Crear Nueva") and b_code.strip() and b_name.strip():
                    db.add(TaxonomyBadge(code=b_code.strip(), name=b_name.strip(), target_type=b_target, assignment_type=b_assign))
                    db.commit(); get_cached_taxonomies.clear(); st.rerun()

    # --- TAB 5: CARE TAGS ---
    with tab5:
        c1, c2 = st.columns([2, 1], gap="large")
        with c1: 
            st.subheader("Editor Rápido")
            tags = db.query(TaxonomyCareTag).all()
            df_tags = pd.DataFrame([{"id": str(ct.id), "Instrucción": ct.name} for ct in tags])
            if not df_tags.empty:
                edited_tags = st.data_editor(df_tags, column_config={"id": None}, hide_index=True, use_container_width=True, key="ed_tag")
                if st.button("💾 Guardar Ediciones de Etiquetas"):
                    for _, row in edited_tags.iterrows():
                        db_t = db.query(TaxonomyCareTag).filter(TaxonomyCareTag.id == row['id']).first()
                        if db_t: db_t.name = row['Instrucción']
                    db.commit(); get_cached_taxonomies.clear(); st.success("Actualizado!"); st.rerun()
        with c2:
            st.subheader("Añadir Etiqueta")
            with st.form("f_caretag"):
                ct_name = st.text_input("Instrucción (Ej. Lavar en seco)")
                if st.form_submit_button("Crear Nueva") and ct_name.strip():
                    db.add(TaxonomyCareTag(name=ct_name.strip()))
                    db.commit(); get_cached_taxonomies.clear(); st.rerun()
elif menu == "🏪 Migración de Tiendas":
    st.title("Migración Rápida de Tiendas 🏪")
    st.info("Crea el perfil base de la tienda en la nueva arquitectura para desbloquear la migración de sus productos. Podrás enriquecer estos datos más adelante.")

    # 1. Obtener todas las tiendas legacy
    legacy_shops = db.query(ShopLegacy).order_by(ShopLegacy.shop_name).all()
    
    if legacy_shops:
        shop_options = {str(s.id): s.shop_name for s in legacy_shops}
        selected_shop_id = st.selectbox("Selecciona la Tienda Legacy:", options=list(shop_options.keys()), format_func=lambda x: shop_options[x])

        if selected_shop_id:
            # 2. Verificar si ya fue migrada
            existing_store = db.query(Store).filter(Store.legacy_id == selected_shop_id).first()
            
            if existing_store:
                st.success(f"✅ Esta tienda ya fue migrada bajo el nombre '**{existing_store.name}**'. Ya puedes migrar sus productos.")
            else:
                legacy_shop = db.query(ShopLegacy).filter(ShopLegacy.id == selected_shop_id).first()
                
                with st.form("quick_store_migration"):
                    st.write("### Datos Base de la Nueva Tienda")
                    new_name = st.text_input("Nombre de la Tienda (editable)", value=legacy_shop.shop_name)
                    
                    # Generamos un slug temporal limpio a partir del nombre
                    default_slug = str(legacy_shop.shop_name).lower().replace(" ", "-").replace("ñ", "n") if legacy_shop.shop_name else f"tienda-{str(uuid.uuid4())[:6]}"
                    new_slug = st.text_input("Slug (URL único)", value=default_slug)
                    
                    if st.form_submit_button("🚀 Crear Perfil Base", use_container_width=True):
                        try:
                            new_store = Store(
                                user_id=legacy_shop.user_id, # <- LÍNEA NUEVA
                                name=new_name,
                                slug=new_slug,
                                legacy_id=legacy_shop.id
                            )
                            db.add(new_store)
                            db.flush() # Flush para obtener el new_store.id antes del commit
                            
                            # B. Crear los perfiles satélite en blanco para mantener la integridad relacional
                            db.add(StoreArtisanalProfile(store_id=new_store.id))
                            db.add(StoreContact(store_id=new_store.id))
                            
                            db.commit()
                            st.success("¡Tienda base creada con éxito! Ve a la pestaña 'Migración de Productos' para continuar.")
                            
                        except Exception as e:
                            db.rollback()
                            st.error(f"Error al migrar la tienda: {e}")

elif menu == "📦 Migración de Productos":
    st.title("Migración de Productos asistida por IA 🤖")
    
    # Llamamos a todas las taxonomías cacheadas en 1 milisegundo
    crafts, techniques, curatorial_cats, all_materials, all_care_tags, all_badges = get_cached_taxonomies()
    
    # Llamamos a las tiendas cacheadas
    shop_options = get_cached_legacy_shops()
    
    if shop_options:
        selected_shop_id = st.selectbox("1. Tienda / Taller:", options=list(shop_options.keys()), format_func=lambda x: shop_options[x])

        if selected_shop_id:
            # Llamamos a los productos cacheados de esta tienda
            prod_options = get_cached_legacy_products(selected_shop_id)
            
            if prod_options:
                selected_prod_id = st.selectbox("2. Producto Legacy:", options=list(prod_options.keys()), format_func=lambda x: prod_options[x])
                if selected_prod_id:
                    p_legacy = db.query(ProductLegacy).filter(ProductLegacy.id == selected_prod_id).first()
                    crafts, techniques, curatorial_cats, all_materials, all_care_tags, all_badges = get_cached_taxonomies() 
                    st.markdown("---")
                    col_left, col_right = st.columns([1, 1.2], gap="large")
                    
                    with col_left:
                        st.header("⬅️ Data Original")
                        st.markdown(f"**Nombre:** {p_legacy.name}")
                        st.markdown(f"**Desc:** {p_legacy.description}")
                        st.markdown(f"**Peso Viejo:** {p_legacy.weight} kg")
                        st.json(p_legacy.materials if p_legacy.materials else {})
                        st.json(p_legacy.dimensions if p_legacy.dimensions else {})
                        
                        if st.button("✨ Autocompletar con IA", type="primary", use_container_width=True):
                            with st.spinner("🧠 Infiriendo estructura..."):
                                st.session_state[f"ai_sug_{p_legacy.id}"] = suggest_product_migration(p_legacy, crafts, techniques, curatorial_cats)
                                st.success("¡Datos extraídos!")

                    with col_right:
                        st.header("➡️ Nueva Arquitectura")
                        sug = st.session_state.get(f"ai_sug_{p_legacy.id}", {})
                        
                    with st.form("new_architecture_form"):
                            new_name = st.text_input("Nombre", value=sug.get("new_name", p_legacy.name))
                            new_short_desc = st.text_area("Descripción Corta", value=sug.get("short_description", str(p_legacy.description)[:200] if p_legacy.description else ""))
                            
                            # --- NUEVOS CAMPOS CORE ---
                            c_hist1, c_hist2 = st.columns(2)
                            history_text = c_hist1.text_area("Historia del Producto", help="El relato detrás de la pieza.")
                            care_notes_text = c_hist2.text_area("Notas de Cuidado Específicas", help="Instrucciones adicionales a las etiquetas.")
                            
                            st.subheader("🎨 Identidad Curatorial y Artesanal")
                            
                            # Listas de opciones
                            piece_opts = ["funcional", "decorativa", "mixta"]
                            style_opts = ["tradicional", "contemporaneo", "fusion"]
                            proc_opts = ["manual", "mixto", "asistido"]
                            pack_opts = ["Caja Rígida", "Bolsa de Tela", "Tubo", "Huacal", "Sobre"]
                            fragility_opts = ["bajo", "medio", "alto"]
                            
                            def get_idx(opts, val, default=0): return opts.index(val) if val in opts else default
                            def get_dict_idx(dict_obj, key): 
                                keys = list(dict_obj.keys())
                                return keys.index(key) if key in keys else 0

                            col_a, col_b, col_collab = st.columns(3)
                            piece_type = col_a.selectbox("Tipo de Pieza", piece_opts, index=get_idx(piece_opts, sug.get("piece_type")))
                            style = col_b.selectbox("Estilo", style_opts, index=get_idx(style_opts, sug.get("style")))
                            is_collab = col_collab.checkbox("¿Es Colaboración?")
                            
                            col_c, col_d = st.columns(2)
                            process_type = col_c.selectbox("Tipo de Proceso", proc_opts, index=get_idx(proc_opts, sug.get("process_type")))
                            elab_time = col_d.text_input("Tiempo de Elaboración", value=sug.get("estimated_elaboration_time", ""))
                            
                            # Taxonomía
                            c_tax1, c_tax2 = st.columns(2)
                            sel_craft = c_tax1.selectbox("Oficio", options=list(crafts.keys()), format_func=lambda x: crafts[x], index=get_dict_idx(crafts, sug.get("primary_craft_id"))) if crafts else None
                            sel_cat = c_tax2.selectbox("Categoría Curatorial", options=list(curatorial_cats.keys()), format_func=lambda x: curatorial_cats[x], index=get_dict_idx(curatorial_cats, sug.get("curatorial_category_id"))) if curatorial_cats else None
                            
                            # --- TÉCNICA SECUNDARIA AÑADIDA ---
                            c_tech1, c_tech2 = st.columns(2)
                            sel_tech = c_tech1.selectbox("Técnica Principal", options=list(techniques.keys()), format_func=lambda x: techniques[x], index=get_dict_idx(techniques, sug.get("primary_technique_id"))) if techniques else None
                            
                            # Opción de no tener técnica secundaria (None)
                            tech_options_sec = [None] + list(techniques.keys())
                            sel_tech_sec = c_tech2.selectbox("Técnica Secundaria (Opcional)", options=tech_options_sec, format_func=lambda x: techniques[x] if x else "Ninguna") if techniques else None
                            
                            st.subheader("📏 Físico y Logístico")
                            c1, c2, c3, c4 = st.columns(4)
                            dim_h = c1.number_input("Alto (cm)", value=float(sug.get("dim_height_cm", 0.0)), min_value=0.0)
                            dim_w = c2.number_input("Ancho (cm)", value=float(sug.get("dim_width_cm", 0.0)), min_value=0.0)
                            dim_l = c3.number_input("Largo/Diam (cm)", value=float(sug.get("dim_length_cm", 0.0)), min_value=0.0)
                            real_w = c4.number_input("Peso Real (kg)", value=float(sug.get("real_weight_kg", p_legacy.weight or 0.0)), min_value=0.0)
                            
                            st.markdown("**Empaque y Envío**")
                            pc1, pc2, pc3 = st.columns(3)
                            pack_type = pc1.selectbox("Embalaje", pack_opts, index=get_idx(pack_opts, sug.get("packaging_type")))
                            fragility_level = pc2.selectbox("Nivel de Fragilidad", fragility_opts, index=1) # Medio por defecto
                            req_assembly = pc3.checkbox("Requiere Ensamblaje")
                            
                            pc4, pc5, pc6, pc7 = st.columns(4)
                            p_dim_h = pc4.number_input("Pack Alto (cm)", value=float(sug.get("dim_height_cm", 0.0)), min_value=0.0)
                            p_dim_w = pc5.number_input("Pack Ancho (cm)", value=float(sug.get("dim_width_cm", 0.0)), min_value=0.0)
                            p_dim_l = pc6.number_input("Pack Largo (cm)", value=float(sug.get("dim_length_cm", 0.0)), min_value=0.0)
                            pack_weight = pc7.number_input("Peso Pack (kg)", value=float(sug.get("pack_weight_kg", real_w * 1.1)), min_value=0.0)
                            
                            special_notes = st.text_area("Notas Especiales de Protección (Logística)")

                            st.subheader("🏷️ Taxonomía Extendida (Materiales y Atributos)")
                            sel_materials = st.multiselect("Materiales Múltiples", options=list(all_materials.keys()), format_func=lambda x: all_materials[x])
                            sel_care_tags = st.multiselect("Instrucciones de Cuidado", options=list(all_care_tags.keys()), format_func=lambda x: all_care_tags[x])
                            sel_badges = st.multiselect("Insignias", options=list(all_badges.keys()), format_func=lambda x: all_badges[x])

                            if st.form_submit_button("💾 Guardar Revisión Humana", use_container_width=True):
                                if not sel_tech:
                                    st.error("⚠️ Error: Debes seleccionar al menos una 'Técnica' principal.")
                                elif sel_tech == sel_tech_sec:
                                    st.error("⚠️ Error: La técnica principal y secundaria no pueden ser la misma.")
                                else:
                                    target_store = db.query(Store).filter(Store.legacy_id == p_legacy.shop_id).first()
                                    if not target_store:
                                        st.error("⚠️ Esta tienda no ha sido migrada a la tabla 'stores'.")
                                    else:
                                        try:
                                            core = ProductsCore(
                                                store_id=target_store.id, name=new_name, short_description=new_short_desc, 
                                                history=history_text, care_notes=care_notes_text, status='draft'
                                            )
                                            db.add(core)
                                            db.flush() 
                                            
                                            db.add(ProductArtisanalIdentity(
                                                product_id=core.id, process_type=process_type, estimated_elaboration_time=elab_time,
                                                primary_craft_id=sel_craft, primary_technique_id=sel_tech, 
                                                secondary_technique_id=sel_tech_sec, curatorial_category_id=sel_cat,
                                                piece_type=piece_type, style=style, is_collaboration=is_collab
                                            ))
                                            
                                            db.add(ProductPhysicalSpecs(product_id=core.id, height_cm=dim_h, width_cm=dim_w, length_or_diameter_cm=dim_l, real_weight_kg=real_w))
                                            db.add(ProductLogistics(
                                                product_id=core.id, packaging_type=pack_type, fragility=fragility_level, 
                                                pack_height_cm=p_dim_h, pack_width_cm=p_dim_w, pack_length_cm=p_dim_l, pack_weight_kg=pack_weight,
                                                requires_assembly=req_assembly, special_protection_notes=special_notes
                                            ))
                                            
                                            for mat_id in sel_materials:
                                                db.add(ProductMaterialLink(product_id=core.id, material_id=mat_id))
                                            for ct_id in sel_care_tags:
                                                db.add(ProductCareTagLink(product_id=core.id, care_tag_id=ct_id))
                                            for b_id in sel_badges:
                                                db.add(ProductBadgeLink(product_id=core.id, badge_id=b_id))
                                                
                                            db.commit()
                                            st.success("¡Producto verificado y guardado correctamente!")
                                        except Exception as e:
                                            db.rollback()
                                            st.error(f"Error en base de datos: {e}")
elif menu == "✨ Crear Nuevo Producto":
    st.title("✨ Crear Nuevo Producto")
    st.info("Crea un producto desde cero directamente en la nueva arquitectura normalizada.")

    # 1. Seleccionar la tienda nueva (Store)
    stores = db.query(Store).order_by(Store.name).all()
    if not stores:
        st.warning("No hay tiendas registradas en la nueva arquitectura. Migra una primero.")
    else:
        # Filtro de seguridad por curador (usando legacy_id si fue asignado así)
        assigned = st.session_state.get("assigned_shops", ["ALL"])
        store_options = {}
        for s in stores:
            if "ALL" in assigned or str(s.legacy_id) in assigned:
                store_options[str(s.id)] = s.name

        selected_store_id = st.selectbox("1. Selecciona la Tienda / Taller:", options=list(store_options.keys()), format_func=lambda x: store_options[x])

        if selected_store_id:
            st.markdown("---")
            
            # 2. Cargar taxonomías cacheadas en 1 milisegundo
            crafts, techniques, curatorial_cats, all_materials, all_care_tags, all_badges = get_cached_taxonomies()

            with st.form("create_new_product_form"):
                st.subheader("📦 Información Base (Core)")
                new_name = st.text_input("Nombre del Producto")
                new_short_desc = st.text_area("Descripción Corta (Max 200 caracteres)")
                
                c_hist1, c_hist2 = st.columns(2)
                history_text = c_hist1.text_area("Historia del Producto")
                care_notes_text = c_hist2.text_area("Notas de Cuidado Específicas")
                
                st.subheader("🎨 Identidad Curatorial y Artesanal")
                
                if not crafts or not curatorial_cats:
                    st.warning("⚠️ Asegúrate de tener Oficios y Categorías en el Gestor de Taxonomía.")
                
                c_tax1, c_tax2 = st.columns(2)
                sel_craft = c_tax1.selectbox("Oficio Principal", options=list(crafts.keys()), format_func=lambda x: crafts[x]) if crafts else None
                sel_cat = c_tax2.selectbox("Categoría Curatorial", options=list(curatorial_cats.keys()), format_func=lambda x: curatorial_cats[x]) if curatorial_cats else None
                
                c_tech1, c_tech2 = st.columns(2)
                sel_tech = c_tech1.selectbox("Técnica Principal", options=list(techniques.keys()), format_func=lambda x: techniques[x]) if techniques else None
                
                tech_options_sec = [None] + list(techniques.keys())
                sel_tech_sec = c_tech2.selectbox("Técnica Secundaria (Opcional)", options=tech_options_sec, format_func=lambda x: techniques[x] if x else "Ninguna") if techniques else None
                
                col_a, col_b, col_c = st.columns(3)
                piece_type = col_a.selectbox("Tipo de Pieza", ["funcional", "decorativa", "mixta"])
                style = col_b.selectbox("Estilo", ["tradicional", "contemporaneo", "fusion"])
                is_collab = col_c.checkbox("¿Es Colaboración?")

                c_proc1, c_proc2 = st.columns(2)
                process_type = c_proc1.selectbox("Tipo de Proceso", ["manual", "mixto", "asistido"])
                elab_time = c_proc2.text_input("Tiempo de Elaboración (Ej. 5 días)")
                
                st.subheader("📏 Especificaciones Físicas (Capa 1)")
                c1, c2, c3, c4 = st.columns(4)
                dim_h = c1.number_input("Alto (cm)", min_value=0.0)
                dim_w = c2.number_input("Ancho (cm)", min_value=0.0)
                dim_l = c3.number_input("Largo/Diam (cm)", min_value=0.0)
                real_w = c4.number_input("Peso Real (kg)", min_value=0.0)
                
                st.subheader("🚚 Objeto Logístico (Capa 2)")
                pc1, pc2, pc3 = st.columns(3)
                pack_type = pc1.selectbox("Embalaje", ["Caja Rígida", "Bolsa de Tela", "Tubo", "Huacal", "Sobre"])
                fragility_level = pc2.selectbox("Nivel de Fragilidad", ["bajo", "medio", "alto"], index=1)
                req_assembly = pc3.checkbox("Requiere Ensamblaje")
                
                pc4, pc5, pc6, pc7 = st.columns(4)
                p_dim_h = pc4.number_input("Pack Alto (cm)", min_value=0.0)
                p_dim_w = pc5.number_input("Pack Ancho (cm)", min_value=0.0)
                p_dim_l = pc6.number_input("Pack Largo (cm)", min_value=0.0)
                p_real_w = pc7.number_input("Peso Pack (kg)", min_value=0.0)
                
                special_notes = st.text_area("Notas Especiales de Protección (Logística)")

                st.subheader("🏷️ Taxonomía Extendida (Materiales y Atributos)")
                sel_materials = st.multiselect("Materiales Múltiples", options=list(all_materials.keys()), format_func=lambda x: all_materials[x])
                sel_care_tags = st.multiselect("Instrucciones de Cuidado", options=list(all_care_tags.keys()), format_func=lambda x: all_care_tags[x])
                sel_badges = st.multiselect("Insignias (Badges) Curatoriales", options=list(all_badges.keys()), format_func=lambda x: all_badges[x])

                submit_new_prod = st.form_submit_button("💾 Crear Producto Definitivo", use_container_width=True)
                
                if submit_new_prod:
                    if not new_name.strip() or not new_short_desc.strip():
                        st.error("⚠️ El nombre y la descripción corta son obligatorios.")
                    elif not sel_craft or not sel_tech:
                        st.error("⚠️ Debes seleccionar un Oficio y una Técnica Principal.")
                    elif sel_tech == sel_tech_sec:
                        st.error("⚠️ La técnica principal y secundaria no pueden ser la misma.")
                    else:
                        try:
                            # 1. Crear Entidad Principal (Core)
                            core = ProductsCore(
                                store_id=selected_store_id, name=new_name.strip(), short_description=new_short_desc.strip(), 
                                history=history_text, care_notes=care_notes_text, status='draft'
                            )
                            db.add(core)
                            db.flush() 
                            
                            # 2. Identidad
                            db.add(ProductArtisanalIdentity(
                                product_id=core.id, process_type=process_type, estimated_elaboration_time=elab_time,
                                primary_craft_id=sel_craft, primary_technique_id=sel_tech, secondary_technique_id=sel_tech_sec, 
                                curatorial_category_id=sel_cat, piece_type=piece_type, style=style, is_collaboration=is_collab
                            ))
                            
                            # 3. Físico y Logístico
                            db.add(ProductPhysicalSpecs(product_id=core.id, height_cm=dim_h, width_cm=dim_w, length_or_diameter_cm=dim_l, real_weight_kg=real_w))
                            db.add(ProductLogistics(
                                product_id=core.id, packaging_type=pack_type, fragility=fragility_level, 
                                pack_height_cm=p_dim_h, pack_width_cm=p_dim_w, pack_length_cm=p_dim_l, pack_weight_kg=p_real_w,
                                requires_assembly=req_assembly, special_protection_notes=special_notes
                            ))
                            
                            # 4. Tablas Puente (Multi-selects)
                            for mat_id in sel_materials:
                                db.add(ProductMaterialLink(product_id=core.id, material_id=mat_id))
                            for ct_id in sel_care_tags:
                                db.add(ProductCareTagLink(product_id=core.id, care_tag_id=ct_id))
                            for b_id in sel_badges:
                                db.add(ProductBadgeLink(product_id=core.id, badge_id=b_id))
                                
                            # 5. Guardar todo
                            db.commit()
                            st.success(f"¡El producto '{new_name}' fue creado exitosamente en la tienda seleccionada!")
                            st.balloons()
                        except Exception as e:
                            db.rollback()
                            st.error(f"Error al crear el producto: {e}")
db.close()