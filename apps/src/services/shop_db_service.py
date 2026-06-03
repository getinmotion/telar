"""
Shop database service — asyncpg implementation.
Queries shop.* tables on the catalog Postgres DB (CATALOG_DB_URL).
No Supabase dependency.
"""

from typing import List, Dict, Any, Optional
from src.database.pg_client import get_pool
import logging

logger = logging.getLogger(__name__)


class ShopDbService:

    # ------------------------------------------------------------------
    # Shop
    # ------------------------------------------------------------------

    async def get_shop_by_user_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        pool = await get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, user_id, name, slug, story FROM shop.stores WHERE user_id = $1 LIMIT 1",
                user_id,
            )
        if not row:
            return None
        return {
            "id": str(row["id"]),
            "user_id": str(row["user_id"]),
            "shop_name": row["name"],
            "slug": row["slug"],
            "description": row.get("story") or "",
        }

    async def get_shop(self, shop_id: str) -> Optional[Dict[str, Any]]:
        pool = await get_pool()
        async with pool.acquire() as conn:
            row = await conn.fetchrow(
                "SELECT id, user_id, name, slug, story FROM shop.stores WHERE id = $1",
                shop_id,
            )
        if not row:
            return None
        return {
            "id": str(row["id"]),
            "user_id": str(row["user_id"]),
            "shop_name": row["name"],
            "slug": row["slug"],
            "description": row.get("story") or "",
        }

    # ------------------------------------------------------------------
    # Products
    # ------------------------------------------------------------------

    async def query_products(
        self, shop_id: str, filters: Optional[Dict[str, Any]] = None
    ) -> List[Dict[str, Any]]:
        """Return products with their primary variant price and stock."""
        limit = (filters or {}).get("limit", 50)
        order_by = (filters or {}).get("order_by", "name")

        order_col = {
            "price": "pv.base_price_minor",
            "inventory": "pv.stock_quantity",
            "name": "pc.name",
            "created_at": "pc.created_at",
        }.get(order_by, "pc.name")

        pool = await get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                f"""
                SELECT
                    pc.id,
                    pc.name,
                    pc.short_description,
                    pc.status,
                    pv.base_price_minor,
                    pv.stock_quantity,
                    pv.sku,
                    pv.currency
                FROM shop.products_core pc
                JOIN shop.product_variants pv ON pc.id = pv.product_id
                WHERE pc.store_id = $1
                  AND pv.is_active = true
                ORDER BY {order_col}
                LIMIT $2
                """,
                shop_id,
                limit,
            )

        return [
            {
                "id": str(r["id"]),
                "name": r["name"],
                "description": r.get("short_description") or "",
                "status": r["status"],
                "price": (r["base_price_minor"] or 0) / 100,
                "inventory": r["stock_quantity"] or 0,
                "sku": r.get("sku"),
                "currency": r.get("currency", "COP"),
            }
            for r in rows
        ]

    async def query_top_products(
        self, shop_id: str, limit: int = 5, metric: str = "price"
    ) -> List[Dict[str, Any]]:
        """Return top N products ordered by the requested metric."""
        order_col = {
            "price": "pv.base_price_minor DESC",
            "inventory": "pv.stock_quantity DESC",
            "created_at": "pc.created_at DESC",
        }.get(metric, "pv.base_price_minor DESC")

        pool = await get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                f"""
                SELECT
                    pc.name,
                    pc.short_description,
                    pv.base_price_minor,
                    pv.stock_quantity,
                    pv.sku
                FROM shop.products_core pc
                JOIN shop.product_variants pv ON pc.id = pv.product_id
                WHERE pc.store_id = $1
                  AND pv.is_active = true
                ORDER BY {order_col}
                LIMIT $2
                """,
                shop_id,
                limit,
            )

        return [
            {
                "name": r["name"],
                "description": r.get("short_description") or "",
                "price": (r["base_price_minor"] or 0) / 100,
                "inventory": r["stock_quantity"] or 0,
                "sku": r.get("sku"),
            }
            for r in rows
        ]

    async def query_inventory_status(self, shop_id: str) -> Dict[str, Any]:
        """Return inventory summary grouped by category."""
        pool = await get_pool()
        async with pool.acquire() as conn:
            rows = await conn.fetch(
                """
                SELECT
                    pc.name,
                    pv.stock_quantity,
                    pv.base_price_minor
                FROM shop.products_core pc
                JOIN shop.product_variants pv ON pc.id = pv.product_id
                WHERE pc.store_id = $1
                  AND pv.is_active = true
                """,
                shop_id,
            )

        total_products = len(rows)
        total_inventory = sum(r["stock_quantity"] or 0 for r in rows)
        low_stock = [r for r in rows if 0 < (r["stock_quantity"] or 0) < 5]
        out_of_stock = [r for r in rows if (r["stock_quantity"] or 0) == 0]

        products_list = [
            {
                "name": r["name"],
                "stock_quantity": r["stock_quantity"] or 0,
                "price": (r["base_price_minor"] or 0) / 100,
                "stock_status": (
                    "sin stock" if (r["stock_quantity"] or 0) == 0
                    else "stock bajo" if (r["stock_quantity"] or 0) < 5
                    else "ok"
                ),
            }
            for r in rows
        ]

        return {
            "total_products": total_products,
            "total_inventory_items": total_inventory,
            "by_category": {
                "Todos los productos": {
                    "product_count": total_products,
                    "total_inventory": total_inventory,
                    "total_value": sum(
                        (r["base_price_minor"] or 0) / 100 * (r["stock_quantity"] or 0)
                        for r in rows
                    ),
                }
            },
            "low_stock_count": len(low_stock),
            "out_of_stock_count": len(out_of_stock),
            "products": products_list,
        }

    async def query_sales_summary(
        self, shop_id: str, filters: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Return sales summary. If no orders table exists yet, returns empty summary
        with a note so the agent can communicate this to the user gracefully.
        """
        try:
            pool = await get_pool()
            async with pool.acquire() as conn:
                # Check if orders table exists
                table_exists = await conn.fetchval(
                    """
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'shop' AND table_name = 'orders'
                    )
                    """
                )

                if not table_exists:
                    return {
                        "total_orders": 0,
                        "total_revenue": 0.0,
                        "average_order_value": 0.0,
                        "status_breakdown": {},
                        "orders": [],
                        "note": "El módulo de ventas aún no está disponible en esta tienda.",
                    }

                date_filter = ""
                params: list = [shop_id]
                if filters and "date_range" in filters:
                    dr = filters["date_range"]
                    if "start" in dr:
                        params.append(dr["start"])
                        date_filter += f" AND created_at >= ${len(params)}"
                    if "end" in dr:
                        params.append(dr["end"])
                        date_filter += f" AND created_at <= ${len(params)}"

                summary = await conn.fetchrow(
                    f"""
                    SELECT
                        COUNT(*) AS total_orders,
                        COALESCE(SUM(total_amount), 0) AS total_revenue,
                        COALESCE(AVG(total_amount), 0) AS avg_order_value
                    FROM shop.orders
                    WHERE store_id = $1{date_filter}
                    """,
                    *params,
                )

                status_rows = await conn.fetch(
                    f"""
                    SELECT status, COUNT(*) AS cnt
                    FROM shop.orders
                    WHERE store_id = $1{date_filter}
                    GROUP BY status
                    """,
                    *params,
                )

                recent_orders = await conn.fetch(
                    f"""
                    SELECT id, total_amount, status, created_at
                    FROM shop.orders
                    WHERE store_id = $1{date_filter}
                    ORDER BY created_at DESC
                    LIMIT 5
                    """,
                    *params,
                )

            return {
                "total_orders": summary["total_orders"],
                "total_revenue": float(summary["total_revenue"]) / 100,
                "average_order_value": float(summary["avg_order_value"]) / 100,
                "status_breakdown": {r["status"]: r["cnt"] for r in status_rows},
                "orders": [
                    {
                        "order_number": str(r["id"])[:8],
                        "total": float(r["total_amount"]) / 100,
                        "status": r["status"],
                    }
                    for r in recent_orders
                ],
            }

        except Exception as e:
            logger.warning(f"query_sales_summary failed: {e}")
            return {
                "total_orders": 0,
                "total_revenue": 0.0,
                "average_order_value": 0.0,
                "status_breakdown": {},
                "orders": [],
                "note": "No se pudieron obtener datos de ventas.",
            }

    async def query_analytics(
        self, shop_id: str, days: int = 30
    ) -> Dict[str, Any]:
        """
        Return analytics summary. Returns zeroed data when analytics table is absent.
        """
        try:
            pool = await get_pool()
            async with pool.acquire() as conn:
                table_exists = await conn.fetchval(
                    """
                    SELECT EXISTS (
                        SELECT 1 FROM information_schema.tables
                        WHERE table_schema = 'shop' AND table_name = 'store_analytics'
                    )
                    """
                )

                if not table_exists:
                    return {
                        "total_views": 0,
                        "total_visitors": 0,
                        "total_orders": 0,
                        "total_revenue": 0.0,
                        "avg_views_per_day": 0.0,
                        "conversion_rate": 0.0,
                        "note": "El módulo de analíticas aún no está disponible.",
                    }

                row = await conn.fetchrow(
                    """
                    SELECT
                        COALESCE(SUM(views), 0)            AS total_views,
                        COALESCE(SUM(unique_visitors), 0)  AS total_visitors,
                        COALESCE(SUM(orders), 0)           AS total_orders,
                        COALESCE(SUM(revenue), 0)          AS total_revenue
                    FROM shop.store_analytics
                    WHERE store_id = $1
                      AND date >= NOW() - ($2 || ' days')::interval
                    """,
                    shop_id,
                    str(days),
                )

            total_views = row["total_views"] or 0
            total_orders = row["total_orders"] or 0
            total_visitors = row["total_visitors"] or 0
            return {
                "total_views": total_views,
                "total_visitors": total_visitors,
                "total_orders": total_orders,
                "total_revenue": float(row["total_revenue"] or 0) / 100,
                "avg_views_per_day": total_views / days if days else 0,
                "conversion_rate": (total_orders / total_visitors * 100) if total_visitors else 0.0,
            }

        except Exception as e:
            logger.warning(f"query_analytics failed: {e}")
            return {
                "total_views": 0,
                "total_visitors": 0,
                "total_orders": 0,
                "total_revenue": 0.0,
                "avg_views_per_day": 0.0,
                "conversion_rate": 0.0,
                "note": "No se pudieron obtener analíticas.",
            }


# Global instance
shop_db_service = ShopDbService()
