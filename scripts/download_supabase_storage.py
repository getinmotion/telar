import os
from supabase import create_client
from tqdm import tqdm
import httpx

SUPABASE_URL = "https://ylooqmqmoufqtxvetxuj.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlsb29xbXFtb3VmcXR4dmV0eHVqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc2Nzc1ODIsImV4cCI6MjA2MzI1MzU4Mn0.F_FtGBwpHKBpog6Ad4zUjmogRZMLNVgk18rsbMv7JYs"  # sirve si es public; si algo falla por permisos usa SERVICE_ROLE_KEY

BUCKETS = [
    "product-images",
    "artisan-profiles",
    "hero-images",
    "brand-assets",
    "images",
]

DOWNLOAD_ROOT = "supabase_dump"
LIST_LIMIT = 1000
HTTP_TIMEOUT = 120


supabase = create_client(SUPABASE_URL, SUPABASE_KEY)


def is_file(item: dict) -> bool:
    md = item.get("metadata")
    return isinstance(md, dict) and md.get("size") is not None


def list_page(bucket: str, prefix: str, offset: int):
    """
    Lista una página en un 'folder' (prefix). Supabase list no es recursivo.
    """
    return supabase.storage.from_(bucket).list(prefix, {"limit": LIST_LIMIT, "offset": offset})


def walk_files(bucket: str, start_prefix: str = ""):
    """
    Recorre recursivamente prefijos (carpetas) y retorna paths de archivos.
    Usa stack (iterativo) para evitar recursion depth.
    """
    stack = [start_prefix]  # prefijos a explorar

    while stack:
        prefix = stack.pop()

        offset = 0
        while True:
            items = list_page(bucket, prefix, offset)
            if not items:
                break

            for item in items:
                name = item["name"]
                full_path = f"{prefix}/{name}" if prefix else name

                if is_file(item):
                    yield full_path
                else:
                    # carpeta/prefijo
                    stack.append(full_path)

            if len(items) < LIST_LIMIT:
                break
            offset += LIST_LIMIT


def download_public_fallback(bucket: str, path: str) -> bytes:
    """
    Fallback: si el SDK falla (raro), descarga por URL pública.
    Como tus buckets son PUBLIC, esto funciona.
    """
    storage = supabase.storage.from_(bucket)
    url = storage.get_public_url(path)
    r = httpx.get(url, timeout=HTTP_TIMEOUT)
    r.raise_for_status()
    return r.content


def download_file(bucket: str, path: str) -> bytes:
    storage = supabase.storage.from_(bucket)
    try:
        return storage.download(path)
    except Exception:
        return download_public_fallback(bucket, path)


def download_bucket(bucket: str):
    print(f"\n📦 Descargando bucket: {bucket}")

    # 1) Descubrir todos los archivos (para progreso real)
    file_paths = list(walk_files(bucket, ""))

    if not file_paths:
        print("  (no se detectaron archivos)")
        return

    # 2) Descargar respetando estructura
    for path in tqdm(file_paths, desc=bucket, unit="file"):
        local_path = os.path.join(DOWNLOAD_ROOT, bucket, path)
        os.makedirs(os.path.dirname(local_path), exist_ok=True)

        # Reanudación: si ya existe, lo saltamos
        if os.path.exists(local_path) and os.path.getsize(local_path) > 0:
            continue

        try:
            data = download_file(bucket, path)
            with open(local_path, "wb") as f:
                f.write(data)
        except Exception as e:
            print(f"\n❌ Error descargando {bucket}/{path}: {e}")


def main():
    os.makedirs(DOWNLOAD_ROOT, exist_ok=True)

    for bucket in BUCKETS:
        download_bucket(bucket)

    print("\n✅ Descarga completa")


if __name__ == "__main__":
    main()
