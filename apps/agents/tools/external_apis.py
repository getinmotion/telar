"""
LangChain tool for web search using Tavily API.
"""

from typing import Optional
from langchain.tools import tool
import logging
from src.api.config import settings

logger = logging.getLogger(__name__)


def get_web_search_tool():
    """
    Create a web search tool using Tavily.
    
    Returns:
        LangChain tool instance for web search
    """
    
    if not settings.tavily_api_key:
        logger.warning("TAVILY_API_KEY not set. Web search tool will return error message.")
        
        @tool
        def web_search_disabled(query: str) -> str:
            """
            Search the web for current information.
            
            Args:
                query: Search query
                
            Returns:
                Error message indicating Tavily is not configured
            """
            return "La búsqueda web no está disponible. TAVILY_API_KEY no está configurada."
        
        return web_search_disabled
    
    # Import Tavily client directly
    try:
        from tavily import TavilyClient
    except ImportError:
        logger.error("tavily-python not installed. Install with: pip install tavily-python")
        
        @tool
        def web_search_error(query: str) -> str:
            """Search the web for current information."""
            return "Error: tavily-python package not installed."
        
        return web_search_error
    
    # Create Tavily client
    tavily_client = TavilyClient(api_key=settings.tavily_api_key)
    
    @tool
    def search_web(query: str) -> str:
        """
        Search the web for current market information, prices, trends, and competitor data.
        
        Use this tool when you need up-to-date information about:
        - Current market prices for products
        - Competitor pricing strategies
        - Market trends and consumer preferences
        - Regional price variations
        - Product demand and popularity
        
        Args:
            query: Search query in Spanish or English
            
        Returns:
            Formatted search results with titles, snippets, and URLs
        """
        try:
            logger.info(f"Performing web search: {query}")
            
            # Execute Tavily search
            response = tavily_client.search(
                query=query,
                search_depth="advanced",
                max_results=5
            )
            
            results = response.get('results', [])
            
            if not results:
                return "No se encontraron resultados para la búsqueda."
            
            # Format results
            formatted_results = f"Resultados de búsqueda para: '{query}'\n\n"
            
            for i, result in enumerate(results, 1):
                title = result.get('title', 'Sin título')
                content = result.get('content', '')
                url = result.get('url', '')
                
                formatted_results += f"{i}. {title}\n"
                if content:
                    # Truncate long content
                    content_preview = content[:300] + "..." if len(content) > 300 else content
                    formatted_results += f"   {content_preview}\n"
                if url:
                    formatted_results += f"   Fuente: {url}\n"
                formatted_results += "\n"
            
            logger.info(f"Web search completed: {len(results)} results found")
            
            return formatted_results
            
        except Exception as e:
            logger.error(f"Error performing web search: {str(e)}")
            return f"Error al realizar la búsqueda web: {str(e)}"
    
    return search_web

