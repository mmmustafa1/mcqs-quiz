-- Migration for Display Name Feature
-- Run this if you already have the secure_settings table from the original migration

-- Create user_profiles table for storing user display names and preferences
CREATE TABLE IF NOT EXISTS user_profiles (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT,
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

-- Create or replace the update function (reusable for both tables)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to update updated_at column for profiles
DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON user_profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to create a profile when a user signs up
CREATE OR REPLACE FUNCTION create_user_profile()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO user_profiles (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)))
    ON CONFLICT (user_id) DO NOTHING;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically create profile when user signs up
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION create_user_profile();

-- Create profiles for existing users (if any)
INSERT INTO user_profiles (user_id, display_name)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'display_name', split_part(email, '@', 1)) as display_name
FROM auth.users
WHERE id NOT IN (SELECT user_id FROM user_profiles);
