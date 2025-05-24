# Supabase Email Templates for MCQs Quiz

This folder contains professional HTML email templates for Supabase authentication emails in the MCQs Quiz application.

## 📧 Available Templates

### 1. **confirmation-email.html** - Email Confirmation
- **Purpose**: Sent when users sign up to confirm their email address
- **Variables**: `{{ .ConfirmationURL }}`, `{{ .Email }}`
- **Features**: 
  - Clean, modern design with MCQs Quiz branding
  - Mobile responsive layout
  - Clear call-to-action button
  - Alternative text link for accessibility
  - Security notice with expiration information

### 2. **welcome-email.html** - Welcome Email
- **Purpose**: Sent after successful email confirmation
- **Variables**: `{{ .SiteURL }}`, `{{ .Email }}`
- **Features**:
  - Celebratory welcome design
  - Feature highlights grid
  - Quick start tips
  - Direct link to start using the application

### 3. **password-reset-email.html** - Password Reset
- **Purpose**: Sent when users request a password reset
- **Variables**: `{{ .ConfirmationURL }}`, `{{ .Email }}`
- **Features**:
  - Security-focused design with warning colors
  - Clear instructions for password reset
  - Security warnings for unauthorized requests
  - Help and support links

## 🚀 How to Use with Supabase

### Step 1: Access Supabase Dashboard
1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Settings** → **Email Templates**

### Step 2: Configure Each Template

#### For Email Confirmation:
1. Select **Confirm signup** template
2. Copy the content from `confirmation-email.html`
3. Paste it into the template editor
4. Save the changes

#### For Welcome Email (if using):
1. This would typically be sent via a database trigger or function
2. You can use this template in a custom email service
3. Or modify it for use in Supabase Edge Functions

#### For Password Reset:
1. Select **Reset password** template
2. Copy the content from `password-reset-email.html`
3. Paste it into the template editor
4. Save the changes

### Step 3: Available Variables

Supabase provides these variables that you can use in your templates:

- `{{ .ConfirmationURL }}` - The confirmation/reset URL
- `{{ .Email }}` - The user's email address
- `{{ .SiteURL }}` - Your site URL (configured in auth settings)
- `{{ .RedirectTo }}` - Redirect URL (if specified)

### Step 4: Testing

1. **Test Email Confirmation**: Sign up with a new account
2. **Test Password Reset**: Use the "Forgot Password" feature
3. **Check Spam Folder**: Ensure emails aren't being filtered
4. **Mobile Testing**: Check email appearance on mobile devices

## 🎨 Customization

### Branding
- **Logo**: Replace `MCQs Quiz` with your logo image
- **Colors**: Update the CSS gradient colors to match your brand
- **Footer Links**: Update footer links to point to your actual pages

### Colors Used
- **Primary Gradient**: `#667eea` to `#764ba2` (purple/blue)
- **Success**: `#48bb78` to `#38a169` (green)
- **Warning/Reset**: `#e53e3e` to `#c53030` (red)

### Typography
- **Font**: Segoe UI system font stack
- **Responsive**: Adapts font sizes for mobile devices

## 📱 Mobile Responsiveness

All templates include:
- Responsive grid layouts that stack on mobile
- Optimized font sizes for mobile reading
- Touch-friendly button sizes
- Proper viewport meta tags

## 🔧 Advanced Configuration

### Using with Edge Functions
You can also use these templates with Supabase Edge Functions for more complex email scenarios:

```typescript
// Example Edge Function
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

serve(async (req) => {
  // Your email sending logic here
  // Use the HTML templates with your preferred email service
})
```

### Custom Variables
You can add custom variables to your templates and populate them in your application logic:

```html
<!-- Example custom variables -->
<div>Welcome, {{ .UserName }}!</div>
<div>Your plan: {{ .SubscriptionPlan }}</div>
```

## 📋 Checklist for Implementation

- [ ] Copy email templates to Supabase dashboard
- [ ] Update branding elements (logo, colors, links)
- [ ] Test email confirmation flow
- [ ] Test password reset flow
- [ ] Verify mobile responsiveness
- [ ] Check spam folder delivery
- [ ] Update footer links to real pages
- [ ] Configure SMTP settings in Supabase (if using custom domain)

## 🛡️ Security Notes

- Email confirmation links expire in 24 hours
- Password reset links expire in 1 hour  
- Always include security warnings in reset emails
- Consider implementing rate limiting for email sends
- Monitor for suspicious email activity

## 📞 Support

If you need help implementing these templates:

1. Check the [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
2. Review the [Email Templates Guide](https://supabase.com/docs/guides/auth/auth-email-templates)
3. Contact Supabase support for technical issues

---

**Note**: Remember to test all email flows thoroughly before deploying to production. Consider setting up email analytics to track delivery and engagement rates.
