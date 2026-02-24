# Semantic Search Deployment Checklist

Use this checklist to deploy your semantic search system step by step.

## ✅ Pre-Deployment (Done)

- [x] Database migrations created
- [x] FastAPI backend built
- [x] Docker configuration ready
- [x] Frontend integration complete
- [x] Webhook system designed
- [x] Documentation written
- [x] Tests created

## 📋 Deployment Steps

### Phase 1: Database Setup (15 minutes)

- [ ] **1.1** Open Supabase Dashboard → Database → SQL Editor
- [ ] **1.2** Run migration: `20250110000000_enable_pgvector.sql`
- [ ] **1.3** Run migration: `20250110000001_create_store_embeddings.sql`
- [ ] **1.4** Run migration: `20250110000002_create_search_function.sql`
- [ ] **1.5** Verify tables exist:
  ```sql
  SELECT * FROM store_embeddings LIMIT 1;
  ```

### Phase 2: Backend Deployment (30 minutes)

- [ ] **2.1** Get OpenAI API Key from https://platform.openai.com/api-keys
- [ ] **2.2** Get Supabase Service Role Key (Settings → API)
- [ ] **2.3** Generate API Secret Key:
  ```bash
  python -c "import secrets; print(secrets.token_urlsafe(32))"
  ```
- [ ] **2.4** Navigate to backend directory:
  ```bash
  cd backend
  ```
- [ ] **2.5** Copy environment template:
  ```bash
  cp .env.example .env
  ```
- [ ] **2.6** Edit `.env` with your keys
- [ ] **2.7** Run quick start script:
  ```bash
  ./quickstart.sh
  ```
- [ ] **2.8** Verify backend is running:
  ```bash
  curl http://localhost:8000/health
  ```
- [ ] **2.9** Test API documentation:
  - Open http://localhost:8000/docs

### Phase 3: Batch Embed Existing Data (1-2 hours)

- [ ] **3.1** Install Python dependencies for batch script:
  ```bash
  pip install httpx supabase python-dotenv tqdm
  ```
- [ ] **3.2** Run batch embedding script:
  ```bash
  python batch_embed.py
  ```
- [ ] **3.3** Verify embeddings were created:
  ```sql
  SELECT COUNT(*) FROM store_embeddings;
  ```

### Phase 4: Webhook Configuration (20 minutes)

Choose ONE option:

#### Option A: Supabase Dashboard Webhooks (Easier)

- [ ] **4.1** Go to Database → Webhooks in Supabase Dashboard
- [ ] **4.2** Create webhook for `artisan_shops`:
  - Name: `trigger-shop-embedding-update`
  - Table: `artisan_shops`
  - Events: `INSERT`, `UPDATE`
  - Method: `POST`
  - URL: `http://your-backend-url:8000/embed`
  - Headers: `X-API-Key: your-api-secret-key`
- [ ] **4.3** Create webhook for `products`:
  - Name: `trigger-product-embedding-update`
  - Table: `products`
  - Events: `INSERT`, `UPDATE`
  - Method: `POST`
  - URL: `http://your-backend-url:8000/embed`

#### Option B: Supabase Edge Functions (More Robust)

- [ ] **4.1** Deploy Edge Function:
  ```bash
  supabase functions deploy trigger-embedding-update
  ```
- [ ] **4.2** Set secrets:
  ```bash
  supabase secrets set FASTAPI_BACKEND_URL=http://your-backend-url:8000
  supabase secrets set FASTAPI_API_KEY=your-api-secret-key
  ```
- [ ] **4.3** Configure webhooks to call Edge Function

### Phase 5: Frontend Configuration (10 minutes)

- [ ] **5.1** Add environment variables to project root `.env`:
  ```env
  REACT_APP_SEMANTIC_SEARCH_URL=http://localhost:8000/search
  REACT_APP_SEMANTIC_SEARCH_API_KEY=your-api-secret-key
  ```
- [ ] **5.2** Install dependencies (if not already):
  ```bash
  npm install
  ```
- [ ] **5.3** Start development server:
  ```bash
  npm run dev
  ```
- [ ] **5.4** Navigate to http://localhost:5173/tiendas

### Phase 6: Testing (15 minutes)

- [ ] **6.1** Test semantic search toggle works
- [ ] **6.2** Try natural language queries:
  - "busco bolsos de cuero hechos a mano"
  - "regalos únicos para navidad"
  - "decoración tradicional colombiana"
- [ ] **6.3** Verify filters work (craft_type, region)
- [ ] **6.4** Check performance metrics are displayed
- [ ] **6.5** Test fallback (turn off backend, should use keyword search)
- [ ] **6.6** Create a new shop/product, verify embedding is auto-created

### Phase 7: Production Deployment (1-2 hours)

#### Deploy Backend to Production

Choose your platform:

##### Option A: Google Cloud Run
- [ ] **7.1** Build and push image:
  ```bash
  gcloud builds submit --tag gcr.io/PROJECT_ID/semantic-search
  ```
- [ ] **7.2** Deploy to Cloud Run:
  ```bash
  gcloud run deploy semantic-search \
    --image gcr.io/PROJECT_ID/semantic-search \
    --platform managed \
    --set-env-vars OPENAI_API_KEY=...,SUPABASE_URL=...,SUPABASE_SERVICE_ROLE_KEY=...,API_SECRET_KEY=...
  ```

##### Option B: AWS ECS/Fargate
- [ ] **7.1** Push to ECR
- [ ] **7.2** Create ECS Task Definition
- [ ] **7.3** Create ECS Service
- [ ] **7.4** Configure environment variables

##### Option C: DigitalOcean App Platform
- [ ] **7.1** Connect GitHub repository
- [ ] **7.2** Select `backend/` as root
- [ ] **7.3** Set environment variables
- [ ] **7.4** Deploy

#### Update Frontend for Production

- [ ] **7.3** Update `.env.production`:
  ```env
  REACT_APP_SEMANTIC_SEARCH_URL=https://your-backend-url.com/search
  REACT_APP_SEMANTIC_SEARCH_API_KEY=your-api-secret-key
  ```
- [ ] **7.4** Build production frontend:
  ```bash
  npm run build
  ```
- [ ] **7.5** Deploy to hosting (Vercel/Netlify/etc)

### Phase 8: Monitoring & Optimization (Ongoing)

- [ ] **8.1** Set up error monitoring (Sentry)
- [ ] **8.2** Monitor OpenAI API usage and costs
- [ ] **8.3** Track search latency
- [ ] **8.4** Monitor database performance
- [ ] **8.5** Set up uptime monitoring (UptimeRobot)
- [ ] **8.6** Configure logging (CloudWatch/Datadog)
- [ ] **8.7** Set up alerts for errors/downtime

## 🎯 Success Criteria

Your deployment is successful when:

- ✅ Backend health check returns "healthy"
- ✅ Database has embeddings for all shops/products
- ✅ Semantic search toggle works in frontend
- ✅ Search returns relevant results
- ✅ Webhooks create embeddings automatically
- ✅ No errors in logs
- ✅ Performance is acceptable (<500ms search time)

## 🧪 Test Scenarios

Test these scenarios to ensure everything works:

1. **Basic Search**
   - [ ] Toggle semantic search ON
   - [ ] Search: "bolsos de cuero artesanales"
   - [ ] Verify results are relevant leather products

2. **Filtered Search**
   - [ ] Select region: "Bogotá"
   - [ ] Select craft: "Cuero"
   - [ ] Search: "carteras hechas a mano"
   - [ ] Verify only Bogotá leather shops appear

3. **Fallback Test**
   - [ ] Stop backend temporarily
   - [ ] Search should still work (keyword fallback)
   - [ ] Error message should appear

4. **Auto-Update Test**
   - [ ] Create a new shop in Supabase
   - [ ] Wait 10 seconds
   - [ ] Verify embedding exists in `store_embeddings`

5. **Performance Test**
   - [ ] Do 10 searches
   - [ ] Average time should be <500ms
   - [ ] No timeout errors

## 📊 Monitoring Dashboard

Track these metrics:

- **API Health**: http://your-backend-url/health
- **OpenAI Usage**: https://platform.openai.com/usage
- **Supabase Dashboard**: https://app.supabase.com/project/your-project
- **Search Analytics**: (implement custom tracking)

## 🆘 Common Issues & Solutions

### Backend won't start
- Check `.env` file has all required variables
- Verify ports are not in use: `lsof -i :8000`
- Check Docker logs: `docker-compose logs -f`

### Search returns no results
- Verify embeddings exist: `SELECT COUNT(*) FROM store_embeddings`
- Run batch embed script: `python batch_embed.py`
- Check backend logs for errors

### Webhooks not firing
- Verify webhook URL is correct
- Check webhook logs in Supabase Dashboard
- Test webhook manually
- Ensure API key matches

### Slow performance
- Check vector index exists: `\d store_embeddings` in psql
- Consider switching to HNSW index
- Monitor OpenAI API latency
- Enable database query logging

## 📝 Post-Deployment Tasks

- [ ] Document production URLs
- [ ] Share API keys securely with team
- [ ] Set up backup strategy
- [ ] Create runbook for common issues
- [ ] Schedule weekly performance reviews
- [ ] Plan A/B testing with users
- [ ] Collect user feedback on search quality

## 🎉 You're Done!

Congratulations! Your semantic search system is now live.

**Quick Links:**
- Health Check: `{backend-url}/health`
- API Docs: `{backend-url}/docs`
- Search Page: `{frontend-url}/tiendas`
- Setup Guide: `SEMANTIC_SEARCH_SETUP.md`
- Implementation Summary: `IMPLEMENTATION_SUMMARY.md`

**Need Help?**
- Check logs first
- Review troubleshooting guide
- Test API endpoints manually
- Verify environment variables

