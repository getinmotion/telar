-- Create agent knowledge base tables for RAG functionality
-- Stores documents and their vector embeddings for semantic search

-- Table for storing uploaded documents
CREATE TABLE IF NOT EXISTS public.agent_knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Document identification
  filename TEXT NOT NULL,
  file_type TEXT NOT NULL CHECK (file_type IN ('pdf', 'txt', 'docx', 'md')),
  file_size INTEGER NOT NULL,
  
  -- Document content
  content TEXT NOT NULL,
  
  -- Classification
  knowledge_category TEXT NOT NULL CHECK (knowledge_category IN ('legal', 'faq', 'general')),
  tags TEXT[] DEFAULT '{}',
  
  -- Metadata
  uploaded_by UUID REFERENCES auth.users(id),
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Status
  processing_status TEXT NOT NULL DEFAULT 'pending' CHECK (processing_status IN ('pending', 'processing', 'completed', 'failed')),
  chunk_count INTEGER DEFAULT 0,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table for storing document chunk embeddings
CREATE TABLE IF NOT EXISTS public.agent_knowledge_embeddings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Reference to source document
  document_id UUID NOT NULL REFERENCES public.agent_knowledge_documents(id) ON DELETE CASCADE,
  
  -- Chunk information
  chunk_index INTEGER NOT NULL,
  chunk_text TEXT NOT NULL,
  
  -- Classification (inherited from document)
  knowledge_category TEXT NOT NULL CHECK (knowledge_category IN ('legal', 'faq', 'general')),
  
  -- Vector embedding (OpenAI text-embedding-3-small = 1536 dimensions)
  embedding VECTOR(1536) NOT NULL,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'::jsonb,
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Ensure unique chunks per document
  UNIQUE(document_id, chunk_index)
);

-- Create indexes for documents table
CREATE INDEX idx_agent_knowledge_documents_category ON public.agent_knowledge_documents(knowledge_category);
CREATE INDEX idx_agent_knowledge_documents_status ON public.agent_knowledge_documents(processing_status);
CREATE INDEX idx_agent_knowledge_documents_created_at ON public.agent_knowledge_documents(created_at DESC);

-- Create indexes for embeddings table
CREATE INDEX idx_agent_knowledge_embeddings_document_id ON public.agent_knowledge_embeddings(document_id);
CREATE INDEX idx_agent_knowledge_embeddings_category ON public.agent_knowledge_embeddings(knowledge_category);

-- IVFFlat index for vector similarity search (cosine distance)
CREATE INDEX idx_agent_knowledge_embeddings_vector_ivfflat 
ON public.agent_knowledge_embeddings 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Enable Row Level Security
ALTER TABLE public.agent_knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_knowledge_embeddings ENABLE ROW LEVEL SECURITY;

-- RLS Policies for documents
CREATE POLICY "Anyone can view documents" 
ON public.agent_knowledge_documents 
FOR SELECT 
USING (true);

CREATE POLICY "Service can manage documents" 
ON public.agent_knowledge_documents 
FOR ALL 
USING (true);

-- RLS Policies for embeddings
CREATE POLICY "Anyone can view embeddings" 
ON public.agent_knowledge_embeddings 
FOR SELECT 
USING (true);

CREATE POLICY "Service can manage embeddings" 
ON public.agent_knowledge_embeddings 
FOR ALL 
USING (true);

-- Create trigger function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_agent_knowledge_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER update_agent_knowledge_documents_updated_at_trigger
  BEFORE UPDATE ON public.agent_knowledge_documents
  FOR EACH ROW
  EXECUTE FUNCTION public.update_agent_knowledge_documents_updated_at();

-- Create RPC function for semantic search on agent knowledge
CREATE OR REPLACE FUNCTION public.search_agent_knowledge(
  query_embedding VECTOR(1536),
  match_count INTEGER DEFAULT 10,
  filter_category TEXT DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  document_id UUID,
  chunk_index INTEGER,
  chunk_text TEXT,
  knowledge_category TEXT,
  similarity FLOAT,
  document_filename TEXT,
  document_metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    ake.id,
    ake.document_id,
    ake.chunk_index,
    ake.chunk_text,
    ake.knowledge_category,
    -- Convert cosine distance to similarity (1 - distance)
    (1 - (ake.embedding <=> query_embedding))::FLOAT AS similarity,
    akd.filename AS document_filename,
    akd.metadata AS document_metadata
  FROM
    public.agent_knowledge_embeddings ake
    JOIN public.agent_knowledge_documents akd ON ake.document_id = akd.id
  WHERE
    -- Apply category filter only if provided
    (filter_category IS NULL OR ake.knowledge_category = filter_category)
    -- Only search in completed documents
    AND akd.processing_status = 'completed'
  ORDER BY
    ake.embedding <=> query_embedding  -- Cosine distance (lower is better)
  LIMIT match_count;
END;
$$;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION public.search_agent_knowledge TO authenticated;
GRANT EXECUTE ON FUNCTION public.search_agent_knowledge TO anon;
GRANT EXECUTE ON FUNCTION public.search_agent_knowledge TO service_role;

-- Add helpful comments
COMMENT ON TABLE public.agent_knowledge_documents IS 'Stores uploaded documents for the agent knowledge base';
COMMENT ON TABLE public.agent_knowledge_embeddings IS 'Stores vector embeddings of document chunks for semantic search';
COMMENT ON COLUMN public.agent_knowledge_embeddings.embedding IS 'OpenAI text-embedding-3-small vector (1536 dimensions)';
COMMENT ON FUNCTION public.search_agent_knowledge IS 'Performs semantic search on agent knowledge base using cosine similarity';

