-- Update existing user profiles to use full_name from metadata if available
-- This script should be run after the main migration to fix existing profiles

DO $$
DECLARE
    user_record RECORD;
    new_display_name TEXT;
BEGIN
    -- Loop through all user profiles
    FOR user_record IN 
        SELECT up.user_id, up.display_name, au.raw_user_meta_data, au.email
        FROM user_profiles up
        JOIN auth.users au ON up.user_id = au.id
        WHERE up.display_name = split_part(au.email, '@', 1) -- Only update profiles that are using email username
    LOOP
        -- Get the full name from metadata or keep the current display name
        new_display_name := COALESCE(
            user_record.raw_user_meta_data->>'full_name',
            user_record.raw_user_meta_data->>'display_name',
            user_record.display_name
        );
        
        -- Update the profile if we found a better display name
        IF new_display_name IS NOT NULL AND new_display_name != user_record.display_name THEN
            UPDATE user_profiles 
            SET display_name = new_display_name 
            WHERE user_id = user_record.user_id;
            
            RAISE NOTICE 'Updated profile for user % from "%" to "%"', 
                user_record.user_id, user_record.display_name, new_display_name;
        END IF;
    END LOOP;
END $$;
