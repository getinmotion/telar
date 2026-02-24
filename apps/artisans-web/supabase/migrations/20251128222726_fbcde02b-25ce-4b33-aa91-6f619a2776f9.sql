-- Add publish_status column to artisan_shops
ALTER TABLE artisan_shops 
ADD COLUMN IF NOT EXISTS publish_status TEXT DEFAULT 'pending_publish' 
CHECK (publish_status IN ('pending_publish', 'published'));

-- Set existing active shops to published status
UPDATE artisan_shops 
SET publish_status = 'published' 
WHERE active = true AND publish_status IS NULL;

-- Create artisan_bank_data table
CREATE TABLE IF NOT EXISTS artisan_bank_data (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL UNIQUE,
  holder_name TEXT NOT NULL,
  document_type TEXT NOT NULL,
  document_number TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_type TEXT NOT NULL,
  account_number TEXT NOT NULL,
  country TEXT DEFAULT 'Colombia',
  currency TEXT DEFAULT 'COP',
  status TEXT DEFAULT 'incomplete' CHECK (status IN ('incomplete', 'complete', 'pending_review', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE artisan_bank_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies for artisan_bank_data
CREATE POLICY "Users can manage own bank data" 
ON artisan_bank_data 
FOR ALL 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_artisan_bank_data_updated_at
BEFORE UPDATE ON artisan_bank_data
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();