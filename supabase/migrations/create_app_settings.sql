CREATE TABLE IF NOT EXISTS app_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_by UUID REFERENCES auth.users(id)
);

-- Insert default pickup mtaani settings
INSERT INTO app_settings (key, value) VALUES 
  ('pickup_mtaani_origin', '{"location_id": "", "location_name": "Not Set", "zone": "", "area": ""}')
ON CONFLICT (key) DO NOTHING;

-- Enable RLS
ALTER TABLE app_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Allow public read access to app_settings"
  ON app_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow admin update access to app_settings"
  ON app_settings FOR UPDATE
  USING (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE is_super_admin = true
    ) OR 
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );

CREATE POLICY "Allow admin insert access to app_settings"
  ON app_settings FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'email' IN (
      SELECT email FROM auth.users WHERE is_super_admin = true
    ) OR 
    EXISTS (
      SELECT 1 FROM admin_users
      WHERE admin_users.id = auth.uid() AND admin_users.is_active = true
    )
  );
