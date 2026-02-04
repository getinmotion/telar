"""
RAG (Retrieval Augmented Generation) service for knowledge-based agents.
"""

from openai import AsyncOpenAI
from src.api.config import settings
from src.database.supabase_client import db
from src.services.embedding_service import embedding_service
from agents.core.state import KnowledgeDocument, KnowledgeSearchResult
from agents.helpers import chunk_text
from src.utils.enhanced_logger import create_enhanced_logger
from typing import List, Dict, Any, Optional
from uuid import UUID
import time

logger = create_enhanced_logger(__name__)


class RAGService:
    """Service for RAG operations: document processing and retrieval."""
    
    def __init__(self):
        """Initialize RAG service."""
        self.client = AsyncOpenAI(api_key=settings.openai_api_key)
        self.model = settings.openai_model
    
    async def process_document(
        self,
        document: KnowledgeDocument
    ) -> UUID:
        """
        Process a document: save, chunk, embed, and store embeddings.
        
        Args:
            document: KnowledgeDocument to process
            
        Returns:
            Document UUID
        """
        try:
            # Save document to database
            result = await db.save_knowledge_document(document)
            document_id = UUID(result['id'])
            
            # Update status to processing
            await db.update_document_status(
                document_id,
                status='processing'
            )
            
            # Chunk the document
            chunks = chunk_text(
                document.content,
                chunk_size=settings.chunk_size,
                chunk_overlap=settings.chunk_overlap
            )
            
            logger.info(f"Document chunked into {len(chunks)} pieces")
            
            # Generate embeddings for all chunks
            embeddings = await embedding_service.generate_embeddings_batch(chunks)
            
            # Prepare embedding records
            embedding_records = []
            for idx, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
                embedding_records.append({
                    "document_id": str(document_id),
                    "chunk_index": idx,
                    "chunk_text": chunk,
                    "knowledge_category": document.knowledge_category,
                    "embedding": embedding,
                    "metadata": {}
                })
            
            # Save embeddings in batch
            await db.save_knowledge_embeddings(embedding_records)
            
            # Update status to completed
            await db.update_document_status(
                document_id,
                status='completed',
                chunk_count=len(chunks)
            )
            
            logger.info(f"Successfully processed document {document.filename}")
            return document_id
            
        except Exception as e:
            logger.error(f"Failed to process document: {str(e)}")
            # Update status to failed
            if 'document_id' in locals():
                await db.update_document_status(
                    document_id,
                    status='failed'
                )
            raise
    
    async def search(
        self,
        query: str,
        category: Optional[str] = None,
        top_k: int = None
    ) -> List[KnowledgeSearchResult]:
        """
        Search the knowledge base for relevant information.
        
        Args:
            query: Search query
            category: Optional category filter (legal, faq, general)
            top_k: Number of results to return (defaults to config value)
            
        Returns:
            List of KnowledgeSearchResult objects
        """
        try:
            if top_k is None:
                top_k = settings.rag_top_k
            
            # Generate query embedding
            query_embedding = await embedding_service.generate_embedding(query)
            
            # Search database
            results = await db.search_knowledge(
                query_embedding=query_embedding,
                match_count=top_k,
                category=category
            )
            
            # Convert to KnowledgeSearchResult objects
            search_results = [
                KnowledgeSearchResult(
                    chunk_text=r['chunk_text'],
                    similarity=r['similarity'],
                    document_filename=r['document_filename'],
                    knowledge_category=r['knowledge_category'],
                    document_metadata=r['document_metadata']
                )
                for r in results
            ]
            
            logger.info(f"Search returned {len(search_results)} results for query: {query[:50]}...")
            return search_results
            
        except Exception as e:
            logger.error(f"Search failed: {str(e)}")
            raise
    
    async def generate_rag_response(
        self,
        query: str,
        category: Optional[str] = None,
        system_prompt: str = "",
        context: Optional[Dict[str, Any]] = None,
        conversation_history: Optional[list] = None
    ) -> Dict[str, Any]:
        """
        Generate a response using RAG: retrieve relevant docs + LLM generation.
        
        Args:
            query: User's query
            category: Optional category filter for retrieval
            system_prompt: System prompt for the LLM
            context: Optional context dictionary with user info
            
        Returns:
            Dictionary with answer and sources
        """
        try:
            # Retrieve relevant documents
            search_results = await self.search(query, category=category)
            
            if not search_results:
                logger.warning(f"No knowledge base results found for query: {query[:50]}...")
                return {
                    "answer": "Lo siento, no encontré información relevante en mi base de conocimiento para responder tu pregunta. ¿Podrías reformular tu pregunta o proporcionar más detalles?",
                    "sources": [],
                    "confidence": "low"
                }
            
            # Build context from search results
            context_text = "\n\n---\n\n".join([
                f"[Fuente: {r.document_filename}]\n{r.chunk_text}"
                for r in search_results[:3]  # Use top 3 results
            ])
            
            # Build context summary if provided
            context_summary = ""
            if context:
                from src.utils.helpers import extract_context_summary
                context_summary = extract_context_summary(context)
            
            # Build conversation history for context
            history_text = ""
            if conversation_history and len(conversation_history) > 0:
                history_text = "\n\nHistorial de conversación:\n"
                for msg in conversation_history[-6:]:  # Last 3 exchanges (6 messages)
                    role = "Usuario" if msg.get('role') == 'user' else "Asistente"
                    history_text += f"{role}: {msg.get('content', '')}\n"
            
            # Build user message
            user_message = f"""Pregunta del usuario: {query}

Contexto del usuario:
{context_summary if context_summary else 'No disponible'}
{history_text}

Documentos relevantes de la base de conocimiento:

{context_text}

Basándote en los documentos proporcionados, el contexto del usuario y la conversación anterior, responde la pregunta de manera clara, precisa y útil."""
            
            # Build messages with conversation history
            messages = [{"role": "system", "content": system_prompt}]
            
            # Add conversation history if available
            if conversation_history and len(conversation_history) > 0:
                # Add last few messages for context
                for msg in conversation_history[-4:]:  # Last 2 exchanges
                    messages.append({
                        "role": msg.get('role', 'user'),
                        "content": msg.get('content', '')
                    })
            
            # Add current query
            messages.append({"role": "user", "content": user_message})
            
            # Generate response using LLM
            response = await self.client.chat.completions.create(
                model=self.model,
                messages=messages,
                temperature=0.7,
                max_tokens=1000
            )
            
            answer = response.choices[0].message.content
            
            # Extract unique sources
            sources = list(set([r.document_filename for r in search_results[:3]]))
            
            return {
                "answer": answer,
                "sources": sources,
                "confidence": "high" if search_results[0].similarity > 0.8 else "medium",
                "retrieved_chunks": len(search_results)
            }
            
        except Exception as e:
            logger.error(f"Failed to generate RAG response: {str(e)}")
            raise


# Global RAG service instance
rag_service = RAGService()

