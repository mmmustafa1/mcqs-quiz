# Supabase Setup Instructions

This application now includes Supabase authentication and secure API key storage. Follow these steps to set up Supabase for your project.

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign up/sign in
2. Click "New Project"
3. Choose your organization and enter project details
4. Wait for the project to be created (this may take a few minutes)

## 2. Get Your Supabase Credentials

1. In your Supabase dashboard, go to **Settings** > **API**
2. Copy the following:
   - **Project URL** (something like `https://your-project-id.supabase.co`)
   - **Anon/Public key** (starts with `eyJ...`)

## 3. Configure Environment Variables

1. Copy `.env.example` to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` and replace the placeholder values:
   ```env
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_anon_key_here
   ```

## 4. Set Up the Database

1. In your Supabase dashboard, go to **SQL Editor**
2. Copy the contents of `supabase-migration.sql`
3. Paste and run the SQL to create the necessary tables and policies

## 5. Configure Authentication

1. In your Supabase dashboard, go to **Authentication** > **Settings**
2. Configure your Site URL:
   - For development: `http://localhost:5173`
   - For production: Your deployed app URL
3. Optionally configure additional auth providers (Google, GitHub, etc.)

## 6. Features

### Authentication
- **Sign Up**: New users can create accounts with email/password
- **Sign In**: Existing users can sign in
- **Password Reset**: Users can reset forgotten passwords
- **Profile Management**: Users can view their profile and sign out

### Secure API Key Storage
- API keys are stored encrypted in Supabase
- Each user can only access their own API keys
- Keys are automatically loaded when users sign in
- Local storage fallback is removed for better security

## 7. Security Features

- **Row Level Security (RLS)**: Users can only access their own data
- **API Key Encryption**: Keys are base64 encoded (upgrade to proper encryption in production)
- **Session Management**: Secure authentication with Supabase Auth
- **Input Validation**: Proper form validation and error handling

## 8. Development

Start the development server:
```bash
npm run dev
```

The app will require users to sign in before they can use the quiz features and save API keys.

## 9. Production Considerations

For production deployment:

1. **Environment Variables**: Set your production Supabase URL and keys
2. **Site URL**: Update the site URL in Supabase Auth settings
3. **API Key Encryption**: Consider implementing stronger encryption for API keys
4. **Email Templates**: Customize auth email templates in Supabase
5. **Rate Limiting**: Configure rate limiting in Supabase if needed

## Troubleshooting

- **"Missing Supabase environment variables"**: Make sure your `.env.local` file has the correct values
- **RLS errors**: Ensure the SQL migration was run correctly
- **Auth redirects**: Check that your Site URL is configured correctly in Supabase Auth settings
