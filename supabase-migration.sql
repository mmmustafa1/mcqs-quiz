-- Create secure_settings table for storing encrypted API keys
CREATE TABLE secure_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    gemini_api_key TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE secure_settings ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can only access their own settings" ON secure_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create an index for faster lookups
CREATE INDEX idx_secure_settings_user_id ON secure_settings(user_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_secure_settings_updated_at
    BEFORE UPDATE ON secure_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
