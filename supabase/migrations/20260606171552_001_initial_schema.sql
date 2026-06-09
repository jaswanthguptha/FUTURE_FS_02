-- Leads table
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  lead_source TEXT NOT NULL CHECK (lead_source IN ('Website', 'Referral', 'LinkedIn', 'Facebook', 'Instagram', 'Other')),
  requirement_message TEXT,
  status TEXT NOT NULL DEFAULT 'New' CHECK (status IN ('New', 'Contacted', 'Qualified', 'Proposal Sent', 'Converted', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notes table
CREATE TABLE notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Follow-ups table
CREATE TABLE followups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  scheduled_date TIMESTAMPTZ NOT NULL,
  description TEXT,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Status history table
CREATE TABLE status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id UUID NOT NULL REFERENCES leads(id) ON DELETE CASCADE,
  old_status TEXT,
  new_status TEXT NOT NULL,
  changed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE status_history ENABLE ROW LEVEL SECURITY;

-- Leads policies
CREATE POLICY "select_leads" ON leads FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_leads" ON leads FOR INSERT WITH CHECK (true);
CREATE POLICY "update_leads" ON leads FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_leads" ON leads FOR DELETE TO authenticated USING (true);

-- Notes policies
CREATE POLICY "select_notes" ON notes FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_notes" ON notes FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "delete_notes" ON notes FOR DELETE TO authenticated USING (true);

-- Follow-ups policies
CREATE POLICY "select_followups" ON followups FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_followups" ON followups FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "update_followups" ON followups FOR UPDATE TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "delete_followups" ON followups FOR DELETE TO authenticated USING (true);

-- Status history policies
CREATE POLICY "select_status_history" ON status_history FOR SELECT TO authenticated USING (true);
CREATE POLICY "insert_status_history" ON status_history FOR INSERT TO authenticated WITH CHECK (true);

-- Create indexes for better performance
CREATE INDEX idx_leads_status ON leads(status);
CREATE INDEX idx_leads_source ON leads(lead_source);
CREATE INDEX idx_leads_created ON leads(created_at);
CREATE INDEX idx_notes_lead ON notes(lead_id);
CREATE INDEX idx_followups_lead ON followups(lead_id);
CREATE INDEX idx_status_history_lead ON status_history(lead_id);

-- Function to track status changes
CREATE OR REPLACE FUNCTION track_status_change()
RETURNS TRIGGER AS $$
BEGIN
  IF OLD.status != NEW.status THEN
    INSERT INTO status_history (lead_id, old_status, new_status)
    VALUES (NEW.id, OLD.status, NEW.status);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for status changes
CREATE TRIGGER status_change_trigger
AFTER UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION track_status_change();

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at
CREATE TRIGGER leads_updated_at
BEFORE UPDATE ON leads
FOR EACH ROW EXECUTE FUNCTION update_updated_at();