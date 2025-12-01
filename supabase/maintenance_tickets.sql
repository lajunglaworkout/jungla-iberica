-- Create maintenance_tickets table
CREATE TABLE IF NOT EXISTS maintenance_tickets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  inspection_item_id UUID REFERENCES maintenance_inspection_items(id),
  center_id BIGINT REFERENCES centers(id) NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK (status IN ('open', 'in_progress', 'resolved', 'closed')),
  priority TEXT NOT NULL CHECK (priority IN ('low', 'medium', 'high', 'critical')),
  assigned_to UUID REFERENCES auth.users(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE,
  resolution_notes TEXT
);

-- Enable RLS
ALTER TABLE maintenance_tickets ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Enable read access for authenticated users" ON maintenance_tickets
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert access for authenticated users" ON maintenance_tickets
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update access for authenticated users" ON maintenance_tickets
  FOR UPDATE USING (auth.role() = 'authenticated');

-- Indexes
CREATE INDEX idx_maintenance_tickets_center_id ON maintenance_tickets(center_id);
CREATE INDEX idx_maintenance_tickets_status ON maintenance_tickets(status);
