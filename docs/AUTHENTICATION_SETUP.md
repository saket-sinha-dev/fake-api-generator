# Authentication Setup Guide

This guide covers the complete authentication system with Google OAuth and email/password login.

## Features

- ✅ Google OAuth Authentication
- ✅ Email/Password Authentication with signup
- ✅ Password hashing with bcryptjs
- ✅ Admin role system
- ✅ Password reset functionality
- ✅ Email notifications
- ✅ Welcome emails for new users
- ✅ Admin credential generation

## Prerequisites

1. **MongoDB Database** (see [MONGODB_SETUP.md](./MONGODB_SETUP.md))
2. **Google OAuth Credentials** (see [GOOGLE_AUTH_SETUP.md](./GOOGLE_AUTH_SETUP.md))
3. **Email Service** (SMTP credentials)

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Authentication
AUTH_SECRET=your-secret-key-change-this-in-production
NEXTAUTH_URL=http://localhost:3000

# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# MongoDB
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/fakegen

# Admin Setup
ADMIN_EMAIL=your-email@example.com

# Email Service (for password reset and admin credentials)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
FROM_EMAIL=your-email@gmail.com
APP_NAME=Fake API Generator
```

### Generating AUTH_SECRET

```bash
openssl rand -base64 32
```

### Email Service Setup

#### Using Gmail

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Create a new app password
   - Use this password in `SMTP_PASS`

#### Other SMTP Services

- **SendGrid**: `smtp.sendgrid.net:587`
- **Mailgun**: `smtp.mailgun.org:587`
- **Outlook**: `smtp-mail.outlook.com:587`
- **Yahoo**: `smtp.mail.yahoo.com:587`

## Setup Steps

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

```bash
cp env.example .env
# Edit .env with your credentials
```

### 3. Initialize Admin User

```bash
npm run init-admin
```

This script will:
- Check if an admin user exists
- Create a new admin user if none exists
- Generate a temporary password
- Send credentials via email (if configured)
- Display credentials in the console

**Output Example:**
```
🔍 Checking for admin users...
📝 No admin user found. Creating admin account...
✅ Admin user created successfully!
📧 Email: admin@example.com
🔑 Temporary Password: a1b2c3d4e5f6g7h8
⚠️  IMPORTANT: Please change this password after first login!
📨 Sending admin credentials email...
✅ Admin credentials email sent successfully!
✨ Admin initialization complete!
```

### 4. Start Development Server

```bash
npm run dev
```

## Authentication Endpoints

### User Signup
**POST** `/api/auth/signup`

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "mobile": "+1234567890" // Optional
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

### Forgot Password
**POST** `/api/auth/forgot-password`

```json
{
  "email": "user@example.com"
}
```

**Response:**
```json
{
  "message": "If an account exists with this email, a password reset link has been sent."
}
```

### Reset Password
**POST** `/api/auth/reset-password`

```json
{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

**Response:**
```json
{
  "message": "Password reset successful. You can now log in with your new password."
}
```

## User Flows

### Sign Up Flow

1. User visits `/auth/signin`
2. Clicks "Sign up" to switch to signup mode
3. Fills in email, password, and optional details
4. System validates input:
   - Email format
   - Password strength (min 8 chars, letters + numbers)
   - Checks if email already exists
5. Password is hashed with bcryptjs
6. User is created in MongoDB with role='user'
7. Welcome email is sent (non-blocking)
8. User is automatically signed in
9. Redirected to dashboard

### Sign In Flow

#### Google OAuth
1. User clicks "Continue with Google"
2. Redirected to Google consent screen
3. After approval, redirected back to app
4. User profile is saved/updated in MongoDB
5. Session is created with JWT
6. Redirected to dashboard

#### Email/Password
1. User enters email and password
2. System finds user in MongoDB
3. Password is verified with bcrypt
4. Session is created with JWT
5. Redirected to dashboard

### Password Reset Flow

1. User clicks "Forgot password?" (to be added to UI)
2. Enters email address
3. System generates reset token and stores hash in DB
4. Email sent with reset link (expires in 1 hour)
5. User clicks link in email
6. Enters new password
7. Password is hashed and updated
8. Reset token is cleared
9. User can sign in with new password

## Admin Management

### Creating Additional Admins

1. Sign in as an existing admin
2. Navigate to Admin Panel (Shield icon)
3. Find user in the list
4. Click "Make Admin" button

### Admin Capabilities

- View all users and their statistics
- Delete users and cascade delete their:
  - Projects
  - Resources
  - APIs
  - Database records
  - Collaborator references
- Toggle user roles (user ↔ admin)
- Cannot delete or demote own account

## Security Features

### Password Requirements

- Minimum 8 characters
- At least one letter
- At least one number
- Validated on both client and server

### Password Hashing

- Uses bcryptjs with salt rounds = 10
- Passwords never stored in plain text
- Hashed before database storage

### Password Reset Security

- Token hashed (SHA-256) before storage
- 1-hour expiration on reset tokens
- Token cleared after successful reset
- No user existence disclosure

### Session Management

- JWT-based sessions (NextAuth.js)
- Secure HTTP-only cookies
- CSRF protection built-in

## Email Templates

### Admin Credentials Email

Sent when admin user is created:
- Contains temporary password
- Security warning to change password
- Login button/link
- List of admin capabilities

### Password Reset Email

Sent when user requests password reset:
- Contains one-time reset link
- 1-hour expiration notice
- Security warning if not requested

### Welcome Email

Sent when new user signs up:
- Personalized greeting
- Feature highlights
- Getting started button

## Troubleshooting

### Email Not Sending

1. **Check SMTP credentials**
   ```bash
   # Verify credentials in .env
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

2. **Test email configuration**
   ```bash
   npm run init-admin
   # Check console for email errors
   ```

3. **Gmail App Password**
   - Ensure 2FA is enabled
   - Create new app password
   - Use app password, not account password

4. **Firewall/Network Issues**
   - Ensure port 587 (or 465) is not blocked
   - Try different SMTP ports

### Admin User Not Created

1. **Run init script manually**
   ```bash
   npm run init-admin
   ```

2. **Check MongoDB connection**
   ```bash
   # Verify MONGODB_URI in .env
   # Test connection in MongoDB Compass
   ```

3. **Check for existing admin**
   - Script only creates admin if none exists
   - Check MongoDB users collection

### Authentication Not Working

1. **Check environment variables**
   ```bash
   # Ensure all required vars are set
   AUTH_SECRET=...
   GOOGLE_CLIENT_ID=...
   MONGODB_URI=...
   ```

2. **Verify Google OAuth setup**
   - Correct redirect URIs in Google Console
   - Client ID and secret match

3. **Check database connection**
   - MongoDB is running
   - Connection string is correct
   - User has proper permissions

### Password Reset Link Invalid

1. **Token expired** (> 1 hour old)
   - Request new reset link

2. **Token already used**
   - Request new reset link

3. **User not found**
   - Verify email address is correct

## Development Notes

### Adding Password Reset UI

To add a "Forgot Password" link to the signin page:

```tsx
{mode === 'signin' && (
  <div className="signin-forgot-password">
    <a href="/auth/forgot-password" className="signin-link">
      Forgot password?
    </a>
  </div>
)}
```

### Customizing Email Templates

Edit templates in `src/lib/email.ts`:
- `sendAdminCredentials()`
- `sendPasswordResetEmail()`
- `sendWelcomeEmail()`

### Adding Email Verification

1. Add verification token to UserProfile schema
2. Create `/api/auth/verify-email` endpoint
3. Send verification email on signup
4. Check `isEmailVerified` before sensitive actions

## API Integration

### Using Authentication in API Routes

```typescript
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  
  // Access user data
  const userEmail = session.user.email;
  const userRole = (session.user as any).role;
  
  // Your logic here
}
```

### Checking Admin Role

```typescript
function isAdmin(session: any): boolean {
  return session?.user && (session.user as any).role === 'admin';
}

export async function DELETE(request: Request) {
  const session = await auth();
  
  if (!isAdmin(session)) {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }
  
  // Admin-only logic
}
```

## Production Checklist

- [ ] Generate strong `AUTH_SECRET`
- [ ] Configure production `NEXTAUTH_URL`
- [ ] Set up Google OAuth for production domain
- [ ] Configure production SMTP service
- [ ] Set secure admin email
- [ ] Run `npm run init-admin` in production
- [ ] Test all authentication flows
- [ ] Verify email delivery
- [ ] Enable HTTPS/SSL
- [ ] Set secure cookie settings
- [ ] Monitor authentication logs
- [ ] Set up rate limiting
- [ ] Configure CORS properly

## Resources

- [NextAuth.js Documentation](https://next-auth.js.org/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [bcryptjs Documentation](https://github.com/dcodeIO/bcrypt.js)
- [Nodemailer Documentation](https://nodemailer.com/)
- [Google OAuth Setup](./GOOGLE_AUTH_SETUP.md)
- [MongoDB Setup](./MONGODB_SETUP.md)
