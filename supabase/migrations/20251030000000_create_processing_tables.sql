-- Garantir que estamos usando o schema public
SET search_path TO public;

-- Tabela de lotes de processamento
CREATE TABLE IF NOT EXISTS public.processing_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_name VARCHAR(255) NOT NULL,
  document_types JSONB NOT NULL DEFAULT '[]',
  total_companies INTEGER NOT NULL DEFAULT 0,
  processed_companies INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  created_by_admin BOOLEAN NOT NULL DEFAULT false,
  admin_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de documentos processados
CREATE TABLE IF NOT EXISTS public.processing_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.processing_batches(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL ,
  company_id UUID NOT NULL ,
  document_type VARCHAR(50) NOT NULL,
  document_name VARCHAR(255) NOT NULL,
  document_path TEXT NOT NULL,
  document_size BIGINT,
  fiscontech_document_id VARCHAR(255),
  periodo VARCHAR(50),
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de logs simplificados
CREATE TABLE IF NOT EXISTS public.processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID NOT NULL REFERENCES public.processing_batches(id) ON DELETE CASCADE,
  tenant_id UUID NOT NULL,
  company_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
