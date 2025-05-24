## Debug Steps for Name Issue

### 1. Test Profile Loading

Open browser console and check for these logs:
- "Fetching profile for user: [USER_ID]"
- "Profile fetched successfully:" or "Profile query error:"

### 2. Test Database Directly

Go to Supabase SQL Editor and run:
```sql
-- Check if profiles exist
SELECT * FROM user_profiles;

-- Check user metadata
SELECT 
  id, 
  email, 
  raw_user_meta_data->>'full_name' as full_name_meta,
  raw_user_meta_data
FROM auth.users;

-- Check if RLS is blocking queries
SELECT * FROM user_profiles WHERE user_id = 'YOUR_USER_ID';
```

### 3. Test RLS Policies

The issue might be RLS policies. Check if this query works:
```sql
-- Disable RLS temporarily for testing
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;

-- Try the query again, then re-enable
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
```

### 4. Manual Profile Creation

If profile is missing, create it manually:
```sql
INSERT INTO user_profiles (user_id, display_name)
VALUES ('YOUR_USER_ID', 'Your Actual Name')
ON CONFLICT (user_id) 
DO UPDATE SET display_name = EXCLUDED.display_name;
```

### 5. Check Console Logs

Look for these specific error patterns:
- "Error loading user profile:"
- "Profile query error:"
- "Update display name error:"
- Any RLS policy violations
