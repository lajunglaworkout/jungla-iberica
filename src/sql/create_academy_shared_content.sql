-- Create academy_shared_content table
CREATE TABLE IF NOT EXISTS academy_shared_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    content TEXT NOT NULL, -- JSON or Text content
    type TEXT NOT NULL CHECK (type IN ('prompt', 'guide', 'resource')),
    category TEXT, -- e.g., 'Writing', 'Design', 'Marketing'
    tags TEXT[], -- Array of tags for filtering
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    is_public BOOLEAN DEFAULT true -- Visible to all academy team
);

-- Enable RLS
ALTER TABLE academy_shared_content ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for all users" ON academy_shared_content
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON academy_shared_content
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for creators and admins" ON academy_shared_content
    FOR UPDATE USING (
        auth.uid() = created_by OR 
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND (base_role = 'ceo' OR base_role = 'director'))
    );

CREATE POLICY "Enable delete for creators and admins" ON academy_shared_content
    FOR DELETE USING (
        auth.uid() = created_by OR 
        EXISTS (SELECT 1 FROM employees WHERE user_id = auth.uid() AND (base_role = 'ceo' OR base_role = 'director'))
    );

-- Create index
CREATE INDEX IF NOT EXISTS idx_academy_shared_content_type ON academy_shared_content(type);
CREATE INDEX IF NOT EXISTS idx_academy_shared_content_category ON academy_shared_content(category);
