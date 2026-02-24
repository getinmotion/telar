-- Create table to track image optimization progress
CREATE TABLE public.image_optimization_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  bucket_id text NOT NULL,
  original_path text NOT NULL,
  optimized_path text,
  original_size_bytes bigint NOT NULL,
  optimized_size_bytes bigint,
  savings_percent numeric(5,2),
  status text NOT NULL DEFAULT 'pending',
  error_message text,
  processed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'skipped'))
);

-- Add index for querying by status
CREATE INDEX idx_image_optimization_log_status ON public.image_optimization_log(status);
CREATE INDEX idx_image_optimization_log_bucket ON public.image_optimization_log(bucket_id);

-- Enable RLS
ALTER TABLE public.image_optimization_log ENABLE ROW LEVEL SECURITY;

-- Only admins can view/modify optimization logs
CREATE POLICY "Admins can view optimization logs"
  ON public.image_optimization_log
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );

CREATE POLICY "Admins can insert optimization logs"
  ON public.image_optimization_log
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );

CREATE POLICY "Admins can update optimization logs"
  ON public.image_optimization_log
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.admin_users 
      WHERE email = (SELECT email FROM auth.users WHERE id = auth.uid())
      AND is_active = true
    )
  );

-- Create summary view for quick stats
CREATE OR REPLACE VIEW public.image_optimization_stats AS
SELECT 
  bucket_id,
  COUNT(*) FILTER (WHERE status = 'completed') as completed_count,
  COUNT(*) FILTER (WHERE status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE status = 'failed') as failed_count,
  COUNT(*) FILTER (WHERE status = 'skipped') as skipped_count,
  COALESCE(SUM(original_size_bytes) FILTER (WHERE status = 'completed'), 0) as total_original_bytes,
  COALESCE(SUM(optimized_size_bytes) FILTER (WHERE status = 'completed'), 0) as total_optimized_bytes,
  ROUND(
    COALESCE(AVG(savings_percent) FILTER (WHERE status = 'completed'), 0)::numeric, 
    2
  ) as avg_savings_percent
FROM public.image_optimization_log
GROUP BY bucket_id;