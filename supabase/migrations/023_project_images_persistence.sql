-- Project images persistence table
-- Allows users to save custom project images and have them persist across sessions

CREATE TABLE IF NOT EXISTS project_images (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_key TEXT NOT NULL,
  image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::TEXT, NOW()),
  UNIQUE(user_id, project_key)
);

-- Index for fast lookups by user
CREATE INDEX IF NOT EXISTS idx_project_images_user_id ON project_images(user_id);
CREATE INDEX IF NOT EXISTS idx_project_images_user_project ON project_images(user_id, project_key);

-- Enable RLS
ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

-- Users can only access their own project images
CREATE POLICY "Users can view own project images" ON project_images
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own project images" ON project_images
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own project images" ON project_images
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own project images" ON project_images
  FOR DELETE USING (auth.uid() = user_id);
