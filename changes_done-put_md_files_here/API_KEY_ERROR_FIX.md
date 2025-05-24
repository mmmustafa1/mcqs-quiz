# API Key Storage Error - Troubleshooting Guide

## Issue
You're getting an error when trying to store API keys in Supabase. This is most likely because the database table hasn't been created yet.

## Solution Steps

### Step 1: Check the Diagnostic Tool
1. Open your application at http://localhost:8080/
2. Sign in to your account
3. Go to Settings
4. Scroll down to see the **Supabase Diagnostics** section
5. Click "Run Diagnostics" to see what's failing

### Step 2: Create the Database Table
The error is most likely because the `secure_settings` table doesn't exist in your Supabase project.

**To fix this:**

1. Go to your Supabase dashboard: https://supabase.com/dashboard
2. Select your project: `mvdchldagxwkhbmmxqbj`
3. In the left sidebar, click on **SQL Editor**
4. Copy the entire content from `supabase-migration.sql` file in your project
5. Paste it into the SQL Editor
6. Click **Run** to execute the SQL

**The SQL creates:**
- `secure_settings` table for storing encrypted API keys
- Row Level Security (RLS) policies so users can only access their own data
- Proper indexes for performance

### Step 3: Verify the Fix
After running the SQL:

1. Refresh your application
2. Run the diagnostics again - all checks should now pass ✅
3. Try saving your API key again

## Common Error Messages

### "table 'secure_settings' does not exist"
- **Cause**: You haven't run the migration SQL yet
- **Fix**: Follow Step 2 above

### "Permission denied" or "RLS policy violation"
- **Cause**: Row Level Security policies aren't working correctly
- **Fix**: Re-run the migration SQL, particularly the policy creation part

### "User not authenticated"
- **Cause**: You're not signed in
- **Fix**: Sign in first, then try saving the API key

## Database Schema
The migration creates this table structure:

```sql
secure_settings (
    id UUID PRIMARY KEY,
    user_id UUID (references auth.users),
    gemini_api_key TEXT (encrypted),
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
```

## Security Features
- **Row Level Security**: Users can only access their own API keys
- **Encryption**: API keys are base64 encoded before storage
- **Automatic Cleanup**: Data is deleted when user account is deleted

## Still Having Issues?

If you're still getting errors after running the migration:

1. Check the diagnostic tool results
2. Look at the browser console for detailed error messages
3. Verify your Supabase project URL and anon key in `.env.local`
4. Make sure you're signed in to the application

The diagnostic tool will show you exactly what's failing and help pinpoint the issue.
