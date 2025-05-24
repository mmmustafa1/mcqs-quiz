# Testing Signup with Name Field

## Steps to Test:

1. **Apply the SQL Migration**:
   - Go to your Supabase dashboard
   - Navigate to SQL Editor
   - Copy and paste the entire content from `supabase-migration.sql`
   - Run the migration

2. **Test the Application**:
   - Start the development server: `npm run dev`
   - Navigate to the signup form
   - Fill in:
     - Full Name: "John Doe"
     - Email: "john.doe@example.com"
     - Password: "password123"
   - Submit the form

3. **Verify**:
   - Check your email for confirmation
   - After confirming, check the `user_profiles` table in Supabase
   - The display_name should be "John Doe"

## Key Changes Made:

1. **AuthForm.tsx**: Added name field to signup form
2. **AuthContext.tsx**: Updated signUp function to accept and pass name parameter
3. **ProfileService.ts**: Enhanced profile creation with name metadata
4. **supabase-migration.sql**: Updated trigger to handle `full_name` metadata

## Database Schema:
The `user_profiles` table now has:
- `display_name` field is NOT NULL with default 'User'
- Trigger automatically creates profile with name from metadata
- Fallback to email username if no name provided
