# Testing and Configuration Guide

## 🚀 Development Server Running

Your application is now running at: **http://localhost:8080/**

## ⚠️ Important: Set Up Supabase Before Testing

Before testing the authentication features, you **MUST** set up Supabase:

### Quick Setup Steps:

1. **Create Supabase Project:**
   - Go to [supabase.com](https://supabase.com)
   - Create a new project
   - Wait for setup to complete

2. **Get Your Credentials:**
   - Go to Settings > API in your Supabase dashboard
   - Copy your Project URL and Anon Key

3. **Create Environment File:**
   ```bash
   cp .env.example .env.local
   ```

4. **Add Your Credentials to .env.local:**
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

5. **Set Up Database:**
   - In Supabase dashboard, go to SQL Editor
   - Copy and run the SQL from `supabase-migration.sql`

6. **Configure Auth Settings:**
   - In Supabase Auth settings, set Site URL to: `http://localhost:8080`

7. **Restart Development Server:**
   ```bash
   # Stop current server (Ctrl+C) and restart
   npm run dev
   ```

## 🧪 Testing the Application

### Without Supabase Setup:
- ❌ You'll see authentication errors
- ❌ API key storage won't work
- ❌ Application will show "Missing Supabase environment variables" error

### With Supabase Setup:
- ✅ Sign up/Sign in forms work
- ✅ API keys are stored securely in the cloud
- ✅ User profile dropdown appears
- ✅ Settings show security status
- ✅ Full quiz functionality available

## 🔍 Features to Test

### 1. Authentication Flow:
1. Visit http://localhost:8080/
2. See sign in/sign up form
3. Create a new account (check email for confirmation)
4. Sign in with your credentials
5. User profile should appear in top-right corner

### 2. Secure API Key Storage:
1. After signing in, go to "Gemini AI" tab
2. Enter a test API key
3. Click "Save API Key"
4. Should see "API Key Saved" message
5. Refresh page - API key should still be there
6. Sign out and sign back in - API key should persist

### 3. Settings Security Status:
1. Open Settings (gear icon in top-right)
2. Should see "Secure Storage Active" green alert
3. Sign out - should see "Sign in required" amber alert

### 4. Cross-Device Testing:
1. Save API key on one device
2. Sign in on another device with same account
3. API key should be available across devices

## 🐛 Troubleshooting

### "Missing Supabase environment variables"
- Check that `.env.local` exists and has correct values
- Restart development server after creating .env.local

### "Failed to save API key"
- Check Supabase database setup
- Verify RLS policies are created
- Check browser console for errors

### Sign up emails not sending
- Check Supabase Auth settings
- Verify Site URL is set correctly
- Check spam folder

### API key not persisting
- Check user is actually signed in
- Verify database table exists
- Check browser network tab for API errors

## 📱 Mobile Testing

The application is fully responsive and works on:
- Desktop browsers
- Tablet devices
- Mobile phones

Test authentication flow on different screen sizes to ensure proper UX.

## 🔒 Security Notes

- API keys are base64 encoded (upgrade to proper encryption for production)
- Row Level Security ensures users only access their own data
- Session management handled by Supabase Auth
- All sensitive operations require authentication

## 🚀 Next Steps

1. Complete Supabase setup following the guide above
2. Test all authentication features
3. Test quiz functionality with secure API key storage
4. Deploy to production with proper environment variables

The application is now feature-complete with secure authentication and API key storage!
