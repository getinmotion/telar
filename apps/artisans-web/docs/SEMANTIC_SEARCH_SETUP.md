# Semantic Search Setup Guide

This guide walks you through setting up the semantic search backend service for your artisan marketplace.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Database Setup](#database-setup)
3. [Backend Deployment](#backend-deployment)
4. [Frontend Configuration](#frontend-configuration)
5. [Webhook Setup](#webhook-setup)
6. [Testing](#testing)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

- Supabase project with admin access
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))
- Docker installed (for backend deployment)
- Node.js 18+ (for frontend)

## Database Setup

### Step 1: Enable pgvector Extension

Run the migrations in order:

```bash
# Navigate to your project
cd /path/to/getinmotion

# Apply migrations (automatically when you push to Supabase)
# Or manually in Supabase SQL Editor
```

The migrations will:
1. Enable the `pgvector` extension
2. Create the `store_embeddings` table
3. Create indexes for fast vector search
4. Create the RPC function for semantic search

### Step 2: Verify Database Setup

Run this query in Supabase SQL Editor to verify:

```sql
-- Check if pgvector is enabled
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Check if table exists
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'store_embeddings';

-- Check if search function exists
SELECT routine_name FROM information_schema.routines 
WHERE routine_schema = 'public' AND routine_name = 'search_store_embeddings';
```

All three queries should return results.

## Backend Deployment

### Step 1: Configure Environment Variables

```bash
cd backend
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# OpenAI API Key (required)
OPENAI_API_KEY=sk-proj-...

# Supabase Configuration (required)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...  # From Supabase Settings > API

# API Security (required - generate a strong random key)
API_SECRET_KEY=your-secret-key-here-min-32-characters

# Optional Configuration
PORT=8000
LOG_LEVEL=info
EMBEDDING_MODEL=text-embedding-3-small
EMBEDDING_DIMENSIONS=1536
```

**Generate a secure API key:**
```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Step 2: Build and Run with Docker

```bash
# Build the Docker image
docker build -t semantic-search-backend .

# Run with docker-compose (recommended)
docker-compose up -d

# Check logs
docker-compose logs -f

# Check health
curl http://localhost:8000/health
```

Expected response:
```json
{
  "status": "healthy",
  "version": "1.0.0",
  "openai_configured": true,
  "supabase_configured": true
}
```

### Step 3: Deploy to Production

#### Option A: Deploy to Google Cloud Run

```bash
# Build and push to Google Container Registry
gcloud builds submit --tag gcr.io/YOUR_PROJECT_ID/semantic-search-backend

# Deploy to Cloud Run
gcloud run deploy semantic-search-backend \
  --image gcr.io/YOUR_PROJECT_ID/semantic-search-backend \
  --platform managed \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars OPENAI_API_KEY=sk-...,SUPABASE_URL=https://...,SUPABASE_SERVICE_ROLE_KEY=...,API_SECRET_KEY=...
```

#### Option B: Deploy to AWS ECS/Fargate

```bash
# Push to AWS ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com
docker tag semantic-search-backend:latest YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/semantic-search-backend:latest
docker push YOUR_ACCOUNT_ID.dkr.ecr.us-east-1.amazonaws.com/semantic-search-backend:latest

# Create ECS service using AWS Console or CLI
```

#### Option C: Deploy to DigitalOcean App Platform

1. Connect your GitHub repository
2. Select `backend/` as root directory
3. Set environment variables in the dashboard
4. Deploy!

## Frontend Configuration

### Step 1: Set Environment Variables

Create or edit `.env` in the project root:

```env
# Semantic Search Backend URL
REACT_APP_SEMANTIC_SEARCH_URL=http://localhost:8000/search  # Local
# REACT_APP_SEMANTIC_SEARCH_URL=https://your-backend-url.run.app/search  # Production

# API Key (same as backend API_SECRET_KEY)
REACT_APP_SEMANTIC_SEARCH_API_KEY=your-secret-key-here
```

### Step 2: Install Dependencies

```bash
npm install
# or
yarn install
```

### Step 3: Run Development Server

```bash
npm run dev
# or
yarn dev
```

### Step 4: Test Semantic Search

1. Navigate to `/tiendas`
2. Toggle "Búsqueda Inteligente (AI)" switch
3. Enter a natural language query like:
   - "busco bolsos artesanales de cuero hechos a mano"
   - "regalos únicos para navidad hechos por artesanos"
   - "decoración para el hogar estilo tradicional colombiano"

## Webhook Setup

Webhooks automatically update embeddings when shops or products are created/updated.

### Option 1: Supabase Dashboard Webhooks (Recommended)

1. Go to **Database > Webhooks** in Supabase Dashboard

2. Create webhook for `artisan_shops`:
   - **Name**: trigger-shop-embedding-update
   - **Table**: artisan_shops
   - **Events**: INSERT, UPDATE
   - **Type**: HTTP Request
   - **Method**: POST
   - **URL**: `https://your-backend-url.com/embed`
   - **HTTP Headers**:
     ```
     Content-Type: application/json
     X-API-Key: your-secret-key-here
     ```
   - **Payload Template**:
     ```json
     {
       "shop_id": "{{ record.id }}",
       "product_id": null,
       "shop_name": "{{ record.shop_name }}",
       "description": "{{ record.description }}",
       "story": "{{ record.story }}",
       "craft_type": "{{ record.craft_type }}",
       "region": "{{ record.region }}"
     }
     ```

3. Create webhook for `products`:
   - **Name**: trigger-product-embedding-update
   - **Table**: products
   - **Events**: INSERT, UPDATE
   - **Type**: Edge Function
   - **Edge Function**: trigger-embedding-update

### Option 2: Deploy Edge Function

If using Edge Functions:

```bash
# Deploy the edge function
supabase functions deploy trigger-embedding-update

# Set secrets
supabase secrets set FASTAPI_BACKEND_URL=https://your-backend-url.com
supabase secrets set FASTAPI_API_KEY=your-secret-key-here
```

### Verify Webhooks

1. Create a test shop in Supabase:
   ```sql
   INSERT INTO artisan_shops (shop_name, description, craft_type, region, active)
   VALUES ('Test Shop', 'A test artisan shop', 'textiles', 'bogota', true);
   ```

2. Check if embedding was created:
   ```sql
   SELECT * FROM store_embeddings 
   WHERE shop_name = 'Test Shop';
   ```

## Testing

### Manual API Testing

#### Test Embedding Generation

```bash
curl -X POST http://localhost:8000/embed \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key-here" \
  -d '{
    "shop_id": "123e4567-e89b-12d3-a456-426614174000",
    "shop_name": "Artesanías del Valle",
    "description": "Tienda especializada en textiles artesanales",
    "craft_type": "textiles",
    "region": "valle_del_cauca"
  }'
```

#### Test Semantic Search

```bash
curl -X POST http://localhost:8000/search \
  -H "Content-Type: application/json" \
  -H "X-API-Key: your-secret-key-here" \
  -d '{
    "query": "busco bolsos de cuero hechos a mano",
    "limit": 10
  }'
```

### Run Automated Tests

```bash
cd backend
pytest tests/ -v
```

## Troubleshooting

### Issue: "OpenAI API Error"

**Cause**: Invalid API key or quota exceeded

**Solution**:
1. Verify API key is correct
2. Check OpenAI usage limits
3. Ensure billing is set up

### Issue: "Database Connection Error"

**Cause**: Invalid Supabase credentials or network issues

**Solution**:
1. Verify `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`
2. Check if Supabase project is active
3. Verify network connectivity

### Issue: "pgvector Extension Not Found"

**Cause**: pgvector not enabled in database

**Solution**:
```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### Issue: "Slow Search Performance"

**Cause**: Missing or inefficient indexes

**Solution**:
```sql
-- Rebuild vector index
REINDEX INDEX idx_store_embeddings_vector_ivfflat;

-- Or switch to HNSW for better performance
DROP INDEX idx_store_embeddings_vector_ivfflat;
CREATE INDEX idx_store_embeddings_vector_hnsw 
ON public.store_embeddings 
USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
```

### Issue: "Search Returns No Results"

**Cause**: No embeddings in database

**Solution**:
1. Check if embeddings exist:
   ```sql
   SELECT COUNT(*) FROM store_embeddings;
   ```
2. Manually trigger embedding generation for existing data:
   ```bash
   # Create a script to process all shops and products
   ```

### Issue: "Webhook Not Triggering"

**Cause**: Webhook misconfigured or backend not reachable

**Solution**:
1. Check webhook logs in Supabase Dashboard
2. Verify backend URL is accessible
3. Check API key matches
4. Test webhook manually

## Performance Optimization

### 1. Batch Embed Existing Data

Create a script to embed all existing shops/products:

```python
import asyncio
from supabase import create_client
import httpx

async def batch_embed():
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Fetch all shops
    shops = supabase.table('artisan_shops').select('*').execute()
    
    async with httpx.AsyncClient() as client:
        for shop in shops.data:
            await client.post(
                f"{BACKEND_URL}/embed",
                headers={"X-API-Key": API_KEY},
                json={
                    "shop_id": shop['id'],
                    "shop_name": shop['shop_name'],
                    # ... other fields
                }
            )
            
asyncio.run(batch_embed())
```

### 2. Monitor Performance

Add monitoring to track:
- Search latency
- OpenAI API call times
- Database query performance
- Error rates

### 3. Cache Frequent Searches

Implement Redis caching for common search queries.

## Cost Estimation

**OpenAI Embeddings (text-embedding-3-small)**:
- $0.02 per 1M tokens
- Average text ~200 tokens per shop/product
- 1,000 shops + 10,000 products = 2.2M tokens = $0.044

**Search Cost**:
- Free (vector search is done in PostgreSQL)

**Total Monthly Cost** (estimated):
- Initial embedding: $0.05
- Updates: ~$0.10/month
- **Total: ~$0.15/month** for embeddings

## Next Steps

1. ✅ Database setup complete
2. ✅ Backend deployed
3. ✅ Frontend integrated
4. ⬜ Webhooks configured
5. ⬜ Batch embed existing data
6. ⬜ Monitor and optimize

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Review backend README: `backend/README.md`
- API docs: `http://localhost:8000/docs`

