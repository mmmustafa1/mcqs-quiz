-- Create secure_settings table for storing encrypted API keys
CREATE TABLE IF NOT EXISTS secure_settings (
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
DROP POLICY IF EXISTS "Users can only access their own settings" ON secure_settings;
CREATE POLICY "Users can only access their own settings" ON secure_settings
    FOR ALL USING (auth.uid() = user_id);

-- Create an index for faster lookups
CREATE INDEX IF NOT EXISTS idx_secure_settings_user_id ON secure_settings(user_id);

-- Create trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

DROP TRIGGER IF EXISTS update_secure_settings_updated_at ON secure_settings;
CREATE TRIGGER update_secure_settings_updated_at
    BEFORE UPDATE ON secure_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Create user_profiles table for storing user display names and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL DEFAULT 'User',
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

-- Enable Row Level Security for user_profiles
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
DROP POLICY IF EXISTS "Users can only access their own profile" ON user_profiles;
CREATE POLICY "Users can only access their own profile" ON user_profiles
    FOR ALL USING (auth.uid() = user_id);

-- Create an index for faster profile lookups
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);

-- Create trigger to update updated_at column for profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
DECLARE
    display_name_value TEXT;
BEGIN
    -- Try to get display name from metadata, fallback to email username
    display_name_value := COALESCE(
        NEW.raw_user_meta_data->>'full_name', 
        NEW.raw_user_meta_data->>'display_name', 
        split_part(NEW.email, '@', 1),
        'User'
    );
    
    -- Ensure we have a non-empty display name
    IF display_name_value IS NULL OR trim(display_name_value) = '' THEN
        display_name_value := 'User';
    END IF;
    
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (NEW.id, display_name_value)
    ON CONFLICT (user_id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION
    WHEN others THEN
        -- Log error but don't fail the signup
        RAISE WARNING 'Failed to create user profile for user %: %', NEW.id, SQLERRM;
        RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();
