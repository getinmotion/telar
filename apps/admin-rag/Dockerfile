# Dockerfile for Telar Knowledge Admin (Streamlit)
# Reuses apps/agents and apps/src — same layout/PYTHONPATH as the agents service.

FROM python:3.11-slim as builder

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

COPY agents/requirements.txt ./agents-requirements.txt
COPY admin-rag/requirements.txt ./admin-rag-requirements.txt

RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r agents-requirements.txt -r admin-rag-requirements.txt


FROM python:3.11-slim

WORKDIR /app

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-client \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Shared source (database, services, utils)
COPY src/ ./src/

# Agents package (rag_service, prompts, models) — needed as a dependency
COPY agents/ ./agents/

# The admin webapp itself
COPY admin-rag/ ./admin-rag/

RUN useradd -m -u 1000 adminuser && \
    chown -R adminuser:adminuser /app

USER adminuser

EXPOSE 8501

HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8501/_stcore/health || exit 1

CMD ["streamlit", "run", "admin-rag/app.py", "--server.port=8501", "--server.address=0.0.0.0"]
