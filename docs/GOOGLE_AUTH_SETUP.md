# Google OAuth Setup Guide

## 🔐 Authentication Implementation

This app now requires users to sign in with their Google account before they can create and manage mock APIs.

## 📋 Setup Instructions

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** > **Credentials**
4. Click **Create Credentials** > **OAuth client ID**
5. Configure the OAuth consent screen if prompted:
   - User Type: External
   - App name: Mock API Generator
   - User support email: Your email
   - Developer contact: Your email
6. For Application type, select **Web application**
7. Add authorized redirect URIs:
   ```
   http://localhost:3000/api/auth/callback/google
   ```
   For production, add:
   ```
   https://yourdomain.com/api/auth/callback/google
   ```
8. Click **Create**
9. Copy the **Client ID** and **Client Secret**

### 2. Configure Environment Variables

1. Create a `.env.local` file in the project root:
   ```bash
   cp env.example .env.local
   ```

2. Edit `.env.local` and add your credentials:
   ```env
   NEXTAUTH_SECRET=your-random-secret-key-here
   NEXTAUTH_URL=http://localhost:3000
   
   GOOGLE_CLIENT_ID=your-google-client-id-here
   GOOGLE_CLIENT_SECRET=your-google-client-secret-here
   ```

3. Generate a secure secret for `NEXTAUTH_SECRET`:
   ```bash
   openssl rand -base64 32
   ```
   Or use any random string generator.

### 3. Restart the Development Server

```bash
npm run dev
```

## 🎯 How It Works

### Authentication Flow

1. **Unauthenticated User** → Redirected to `/auth/signin`
2. **Click "Sign in with Google"** → Google OAuth consent screen
3. **User approves** → Redirected back to app
4. **Authenticated** → Access to all features

### Protected Routes

All routes except `/auth/signin` and `/api/auth/*` are protected by middleware.

### Session Management

- Sessions are managed by NextAuth.js
- User info (name, email, image) is available throughout the app
- Sign out button in the header

## 🔒 Security Features

1. **Middleware Protection**: All routes require authentication
2. **Secure Sessions**: Server-side session management
3. **OAuth 2.0**: Industry-standard authentication
4. **CSRF Protection**: Built into NextAuth.js
5. **Secure Cookies**: HTTP-only, secure cookies in production

## 👤 User Experience

### Sign In Page
- Clean, centered design
- Google logo and branding
- One-click sign in
- Terms of service notice

### Authenticated State
- User avatar in header
- User name and email displayed
- Sign out button
- Persistent session across page reloads

## 📁 Files Added

1. **src/auth.ts** - NextAuth configuration
2. **src/middleware.ts** - Route protection
3. **src/app/api/auth/[...nextauth]/route.ts** - Auth API handler
4. **src/app/auth/signin/page.tsx** - Sign in page
5. **env.example** - Environment variables template

## 📁 Files Modified

1. **src/app/layout.tsx** - Added SessionProvider
2. **src/app/page.tsx** - Added user session and sign out
3. **src/app/globals.css** - Added avatar styles

## 🚀 Production Deployment

### Vercel

1. Add environment variables in Vercel dashboard:
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL` (your production URL)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

2. Update Google OAuth redirect URIs to include production URL

### Other Platforms

Same process - add environment variables and update OAuth redirect URIs.

## 🔧 Troubleshooting

### "Error: Missing GOOGLE_CLIENT_ID"
- Make sure `.env.local` exists
- Verify environment variables are set correctly
- Restart the dev server

### "Redirect URI mismatch"
- Check that redirect URI in Google Console matches exactly
- Format: `http://localhost:3000/api/auth/callback/google`

### "Invalid client secret"
- Verify you copied the correct secret from Google Console
- Regenerate credentials if needed

## 🎨 Customization

### Change Sign In Page Design
Edit `src/app/auth/signin/page.tsx`

### Add More OAuth Providers
Edit `src/auth.ts` and add providers:
```typescript
import GitHub from "next-auth/providers/github"

providers: [
  Google({ ... }),
  GitHub({ ... }),
]
```

### Customize Session Callback
Edit `src/auth.ts`:
```typescript
callbacks: {
  async session({ session, token }) {
    // Add custom fields
    return session
  }
}
```

## 📚 Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
- [NextAuth.js Google Provider](https://next-auth.js.org/providers/google)

## ✅ Testing

1. Start the app: `npm run dev`
2. Visit `http://localhost:3000`
3. You should be redirected to `/auth/signin`
4. Click "Sign in with Google"
5. Approve the consent screen
6. You should be redirected back and see your projects

## 🔐 Security Best Practices

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use strong NEXTAUTH_SECRET** - At least 32 characters
3. **Rotate secrets regularly** - Especially in production
4. **Limit OAuth scopes** - Only request what you need
5. **Use HTTPS in production** - Required for secure cookies

---

**Note**: Without proper Google OAuth credentials, the app will not work. Follow the setup instructions above to get started.
