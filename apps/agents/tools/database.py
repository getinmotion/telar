"""
LangChain tool for querying shop data from database.
"""

from typing import Dict, Any, Optional
from langchain.tools import tool
import json
import logging
from src.services.shop_db_service import shop_db_service
import asyncio

logger = logging.getLogger(__name__)


def get_shop_data_tool(user_id: str):
    """
    Create a shop data tool bound to a specific user.
    
    Args:
        user_id: UUID of the user whose shop data to query
        
    Returns:
        LangChain tool instance
    """
    
    @tool
    async def query_shop_data(
        query_type: str,
        filters: Optional[str] = None
    ) -> str:
        """
        Query shop data from the database.
        
        Use this tool to get real-time information about the artisan's shop, products, sales, and inventory.
        
        Args:
            query_type: Type of query to perform. Options:
                - 'shop_info': Get basic shop information
                - 'products': List products (use filters for category, limit, etc.)
                - 'sales': Get sales summary (use filters for date_range)
                - 'inventory': Get inventory status by category
                - 'top_products': Get top products (use filters for metric: price/inventory/created_at)
                - 'analytics': Get analytics summary (use filters for days)
            filters: Optional JSON string with filters. Examples:
                - Products: {"category": "joyería", "limit": 10, "order_by": "price"}
                - Sales: {"date_range": {"start": "2025-01-01", "end": "2025-01-31"}}
                - Top products: {"limit": 5, "metric": "price"}
                - Analytics: {"days": 30}
        
        Returns:
            Formatted string with query results
        """
        try:
            logger.info(f"Shop data tool called: query_type={query_type}, user_id={user_id}")
            
            # Parse filters if provided
            parsed_filters = None
            if filters:
                try:
                    parsed_filters = json.loads(filters)
                except json.JSONDecodeError:
                    logger.warning(f"Failed to parse filters: {filters}")
            
            # Get shop first
            shop = await shop_db_service.get_shop_by_user_id(user_id)
            
            if not shop:
                return f"No se encontró tienda activa para el usuario."
            
            shop_id = shop['id']
            shop_name = shop['shop_name']
            
            # Execute query based on type
            if query_type == 'shop_info':
                result = {
                    'shop_name': shop['shop_name'],
                    'description': shop.get('description', ''),
                    'craft_type': shop.get('craft_type', ''),
                    'region': shop.get('region', ''),
                    'active': shop.get('active', False),
                    'featured': shop.get('featured', False)
                }
                return f"Información de la tienda '{shop_name}':\n" + \
                       f"Tipo de artesanía: {result['craft_type']}\n" + \
                       f"Región: {result['region']}\n" + \
                       f"Descripción: {result['description']}\n" + \
                       f"Estado: {'Activa' if result['active'] else 'Inactiva'}"
            
            elif query_type == 'products':
                products = await shop_db_service.query_products(shop_id, parsed_filters)
                
                if not products:
                    return f"No se encontraron productos en la tienda '{shop_name}'."
                
                result_text = f"Productos de '{shop_name}' ({len(products)} encontrados):\n\n"
                
                for i, product in enumerate(products[:20], 1):  # Limit to 20 for readability
                    result_text += f"{i}. {product['name']}\n"
                    result_text += f"   Precio: ${product['price']:,.0f}\n"
                    result_text += f"   Inventario: {product['inventory']} unidades\n"
                    result_text += f"   Categoría: {product.get('category', 'N/A')}\n"
                    if product.get('compare_price'):
                        result_text += f"   Precio anterior: ${product['compare_price']:,.0f}\n"
                    result_text += "\n"
                
                if len(products) > 20:
                    result_text += f"... y {len(products) - 20} productos más.\n"
                
                return result_text
            
            elif query_type == 'sales':
                summary = await shop_db_service.query_sales_summary(shop_id, parsed_filters)
                
                result_text = f"Resumen de ventas de '{shop_name}':\n\n"
                result_text += f"Total de órdenes: {summary['total_orders']}\n"
                result_text += f"Ingresos totales: ${summary['total_revenue']:,.2f}\n"
                result_text += f"Valor promedio por orden: ${summary['average_order_value']:,.2f}\n\n"
                
                result_text += "Órdenes por estado:\n"
                for status, count in summary['status_breakdown'].items():
                    result_text += f"  - {status}: {count}\n"
                
                if summary['orders']:
                    result_text += f"\nÚltimas {len(summary['orders'])} órdenes:\n"
                    for order in summary['orders'][:5]:
                        result_text += f"  - {order['order_number']}: ${order['total']:,.2f} ({order['status']})\n"
                
                return result_text
            
            elif query_type == 'inventory':
                summary = await shop_db_service.query_inventory_status(shop_id)
                
                result_text = f"Estado de inventario de '{shop_name}':\n\n"
                result_text += f"Total de productos: {summary['total_products']}\n"
                result_text += f"Total de unidades en inventario: {summary['total_inventory_items']}\n\n"
                
                result_text += "Por categoría:\n"
                for category, data in summary['by_category'].items():
                    result_text += f"  {category}:\n"
                    result_text += f"    - Productos: {data['product_count']}\n"
                    result_text += f"    - Inventario: {data['total_inventory']} unidades\n"
                    result_text += f"    - Valor total: ${data['total_value']:,.2f}\n"
                
                if summary['low_stock_count'] > 0:
                    result_text += f"\n⚠️  {summary['low_stock_count']} productos con stock bajo (< 5 unidades)\n"
                
                if summary['out_of_stock_count'] > 0:
                    result_text += f"❌ {summary['out_of_stock_count']} productos sin stock\n"
                
                return result_text
            
            elif query_type == 'top_products':
                limit = parsed_filters.get('limit', 5) if parsed_filters else 5
                metric = parsed_filters.get('metric', 'price') if parsed_filters else 'price'
                
                products = await shop_db_service.query_top_products(shop_id, limit, metric)
                
                metric_names = {
                    'price': 'precio',
                    'inventory': 'inventario',
                    'created_at': 'más recientes'
                }
                
                result_text = f"Top {len(products)} productos de '{shop_name}' por {metric_names.get(metric, metric)}:\n\n"
                
                for i, product in enumerate(products, 1):
                    result_text += f"{i}. {product['name']}\n"
                    result_text += f"   Precio: ${product['price']:,.0f}\n"
                    result_text += f"   Inventario: {product['inventory']} unidades\n"
                    result_text += f"   Categoría: {product.get('category', 'N/A')}\n\n"
                
                return result_text
            
            elif query_type == 'analytics':
                days = parsed_filters.get('days', 30) if parsed_filters else 30
                summary = await shop_db_service.query_analytics(shop_id, days)
                
                result_text = f"Analíticas de '{shop_name}' (últimos {days} días):\n\n"
                result_text += f"Vistas totales: {summary['total_views']:,}\n"
                result_text += f"Visitantes únicos: {summary['total_visitors']:,}\n"
                result_text += f"Órdenes: {summary['total_orders']}\n"
                result_text += f"Ingresos: ${summary['total_revenue']:,.2f}\n"
                result_text += f"Promedio de vistas por día: {summary['avg_views_per_day']:.1f}\n"
                result_text += f"Tasa de conversión: {summary['conversion_rate']:.2f}%\n"
                
                return result_text
            
            else:
                return f"Tipo de consulta no reconocido: {query_type}. " + \
                       f"Opciones válidas: shop_info, products, sales, inventory, top_products, analytics"
        
        except Exception as e:
            logger.error(f"Error in shop data tool: {str(e)}")
            return f"Error al consultar datos de la tienda: {str(e)}"
    
    return query_shop_data

