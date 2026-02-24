-- Add status column to waitlist table
ALTER TABLE public.waitlist 
ADD COLUMN status text DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected'));

-- Create index for better performance on status queries
CREATE INDEX idx_waitlist_status ON public.waitlist(status);

-- Add updated_at column to track when status was changed
ALTER TABLE public.waitlist 
ADD COLUMN updated_at timestamp with time zone DEFAULT now();

-- Create trigger to update updated_at column
CREATE TRIGGER update_waitlist_updated_at
    BEFORE UPDATE ON public.waitlist
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();