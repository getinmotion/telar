# Shared Source Code

This folder contains shared code used across multiple GetInMotion services (agents, api, etc.).

## Structure

```
src/
├── api/                 # API configuration and settings
│   └── config.py       # Environment-based configuration
├── database/           # Database clients and utilities
│   └── supabase_client.py  # Supabase client singleton
├── services/           # Business logic services
│   ├── embedding_service.py        # OpenAI embedding generation
│   ├── product_recommendation_service.py  # Product recommendations
│   └── shop_db_service.py         # Shop database operations
└── utils/             # Utility functions
    ├── enhanced_logger.py  # Structured logging
    └── helpers.py          # General helper functions
```

## Usage

### Configuration

The `config.py` module loads environment variables and provides typed configuration:

```python
from src.api.config import settings

print(settings.openai_api_key)
print(settings.supabase_url)
```

### Database Client

Access Supabase through the singleton client:

```python
from src.database.supabase_client import db

# Query data
response = db.table("artisan_shops").select("*").execute()
```

### Services

Use the business logic services:

```python
from src.services.embedding_service import embedding_service
from src.services.shop_db_service import shop_db_service

# Generate embeddings
embedding = await embedding_service.generate_embedding("Hello world")

# Get shop data
shop = await shop_db_service.get_shop(shop_id)
```

### Utilities

```python
from src.utils.enhanced_logger import create_enhanced_logger
from src.utils.helpers import extract_context_summary

logger = create_enhanced_logger("my-service")
logger.info("Service started", version="1.0.0")

summary = extract_context_summary(context_dict)
```

## Dependencies

This shared code requires the following Python packages:
- `pydantic-settings` - Configuration management
- `supabase` - Supabase client
- `openai` - OpenAI API client

These are already included in the `agents/requirements.txt` file.

## Development

When adding new shared functionality:

1. Create a new module in the appropriate directory
2. Add `__init__.py` if creating a new package
3. Update this README with usage examples
4. Ensure the functionality is generic and reusable across services

## Notes

- This folder was created to satisfy dependencies in the agents service
- Services should be kept stateless where possible
- Use dependency injection for better testability
- Environment variables should be loaded through `src.api.config.settings`
