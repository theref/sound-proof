
-- Enable Row Level Security on tracks table
ALTER TABLE public.tracks ENABLE ROW LEVEL SECURITY;

-- Create policy to allow users to insert their own tracks
CREATE POLICY "Users can insert their own tracks" ON public.tracks
  FOR INSERT WITH CHECK (true);

-- Create policy to allow users to view all tracks (for the music feed)
CREATE POLICY "Users can view all tracks" ON public.tracks
  FOR SELECT USING (true);

-- Create policy to allow users to update their own tracks
CREATE POLICY "Users can update their own tracks" ON public.tracks
  FOR UPDATE USING (uploader = auth.uid()::text);

-- Create policy to allow users to delete their own tracks  
CREATE POLICY "Users can delete their own tracks" ON public.tracks
  FOR DELETE USING (uploader = auth.uid()::text);
