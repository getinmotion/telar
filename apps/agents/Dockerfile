# Dockerfile for GetInMotion Agents Service
# Optimized multi-stage build for containerized deployment

FROM python:3.11-slim as builder

WORKDIR /app

# Install build dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    gcc \
    postgresql-client \
    ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements from agents folder
COPY agents/requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt


# Production stage
FROM python:3.11-slim

WORKDIR /app

# Install runtime dependencies
RUN apt-get update && \
    apt-get install -y --no-install-recommends \
    postgresql-client \
    ca-certificates \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Copy installed packages from builder
COPY --from=builder /usr/local/lib/python3.11/site-packages /usr/local/lib/python3.11/site-packages
COPY --from=builder /usr/local/bin /usr/local/bin

# Set environment variables
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PYTHONPATH=/app

# Copy application code
# Copy shared src folder (database, services, utils, etc.)
COPY src/ ./src/

# Copy entire agents folder preserving the 'agents' directory name
COPY agents/ ./agents/

# The structure in container will be:
# /app/
#   src/ (shared source)
#   agents/ (main agents package)
#     agents/ (nested - agent implementations)
#     core/
#     prompts/
#     tools/
#     api.py
#     main.py
#     etc.

# Create non-root user for security
RUN useradd -m -u 1000 agentuser && \
    chown -R agentuser:agentuser /app

USER agentuser

# Expose port
EXPOSE 8000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

# Run the agents service  
# main.py is at /app/agents/main.py after COPY agents/ ./agents/
CMD ["uvicorn", "agents.main:app", "--host", "0.0.0.0", "--port", "8000"]
