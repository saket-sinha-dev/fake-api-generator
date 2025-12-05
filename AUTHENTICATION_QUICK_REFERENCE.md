# Authentication Quick Reference

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Configure environment
cp env.example .env
# Edit .env with MongoDB URI, Google OAuth, and SMTP credentials

# 3. Initialize admin
npm run init-admin

# 4. Start server
npm run dev
```

## 🔑 Login Methods

| Method | Endpoint | Features |
|--------|----------|----------|
| **Google OAuth** | `/auth/signin` | One-click, auto profile creation |
| **Email/Password** | `/auth/signin` | Traditional signup/login |

## 📧 Email Features

| Feature | Trigger | Template |
|---------|---------|----------|
| **Welcome** | New user signup | Greeting + features |
| **Admin Credentials** | `npm run init-admin` | Temp password + login link |
| **Password Reset** | Forgot password | Reset link (1hr expiry) |

## 🛡️ Security Features

✅ bcryptjs password hashing (salt rounds: 10)
✅ JWT-based sessions with HTTP-only cookies
✅ Password strength validation (8+ chars, letters + numbers)
✅ Cryptographically secure reset tokens (SHA-256)
✅ No user enumeration (consistent error responses)
✅ CSRF protection (NextAuth built-in)

## 📍 API Endpoints

### Signup
```bash
POST /api/auth/signup
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

### Forgot Password
```bash
POST /api/auth/forgot-password
Content-Type: application/json

{
  "email": "user@example.com"
}
```

### Reset Password
```bash
POST /api/auth/reset-password
Content-Type: application/json

{
  "token": "reset-token-from-email",
  "newPassword": "newpassword123"
}
```

## 🔧 Environment Variables

### Required
```env
MONGODB_URI=mongodb+srv://...
AUTH_SECRET=your-secret-key
GOOGLE_CLIENT_ID=your-client-id
GOOGLE_CLIENT_SECRET=your-client-secret
```

### Optional (Email)
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@example.com
```

## 👨‍💼 Admin Features

```bash
# Create first admin
npm run init-admin

# Features:
✅ View all users
✅ Delete users (cascading)
✅ Toggle roles (user ↔ admin)
✅ Access via Shield icon in dashboard
```

## 🎨 UI Components

### Sign In Page
- Google OAuth button
- Email/password form
- Mode toggle (Sign In ↔ Sign Up)
- Error handling
- Loading states

### Sign Up Page
- Same as Sign In (mode toggle)
- First/Last name fields
- Password strength indicator
- Auto-login after signup

## 🔍 Troubleshooting

| Issue | Solution |
|-------|----------|
| Email not sending | Check SMTP credentials, use App Password |
| Admin not created | Ensure .env configured, run `npm run init-admin` |
| Auth fails | Verify AUTH_SECRET, MongoDB connection, Google OAuth |
| Build errors | Run `npm install`, check imports |

## 📚 Documentation Links

- [Complete Setup Guide](./AUTHENTICATION_SETUP.md)
- [Implementation Summary](./AUTHENTICATION_IMPLEMENTATION_SUMMARY.md)
- [MongoDB Setup](./MONGODB_SETUP.md)
- [Google Auth Setup](./GOOGLE_AUTH_SETUP.md)

## 💡 Code Examples

### Check Authentication in API Routes
```typescript
import { auth } from "@/auth";

export async function GET(request: Request) {
  const session = await auth();
  if (!session?.user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
  // Your code here
}
```

### Check Admin Role
```typescript
const isAdmin = (session: any) => 
  session?.user && (session.user as any).role === 'admin';

if (!isAdmin(session)) {
  return Response.json({ error: 'Forbidden' }, { status: 403 });
}
```

### Send Custom Email
```typescript
import { sendWelcomeEmail } from '@/lib/email';

await sendWelcomeEmail('user@example.com', 'John');
```

## 🎯 User Roles

| Role | Access | Features |
|------|--------|----------|
| **user** | Own projects | Create/edit/delete own resources |
| **admin** | All projects | User management, all CRUD operations |

## 🔐 Password Requirements

- Minimum 8 characters
- At least 1 letter (A-Z, a-z)
- At least 1 number (0-9)
- Allowed special chars: @$!%*#?&

## ⏱️ Token Expiration

| Token Type | Lifetime | Purpose |
|------------|----------|---------|
| **Session JWT** | 30 days | User authentication |
| **Reset Token** | 1 hour | Password reset |
| **Verification Token** | 24 hours | Email verification (future) |

## 🚦 HTTP Status Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Successful operation |
| 201 | Created | User created |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Not logged in |
| 403 | Forbidden | Insufficient permissions |
| 409 | Conflict | Email already exists |
| 500 | Server Error | Internal error |

## 🎪 Demo Credentials (After init-admin)

```
Email: admin@example.com (or your ADMIN_EMAIL)
Password: [Check console or email]
Role: admin
```

⚠️ **Important:** Change temporary password after first login!

## 📦 NPM Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run init-admin   # Create/check admin user
npm run lint         # Run ESLint
```

## 🌐 Email Providers

### Gmail
- Enable 2FA
- Create App Password
- Use app password in SMTP_PASS

### SendGrid
- Get API key
- Use 'apikey' as SMTP_USER
- Use API key as SMTP_PASS

### Mailgun
- Get SMTP credentials from dashboard
- Use provided username and password

## ✨ Features at a Glance

| Feature | Status | Notes |
|---------|--------|-------|
| Google OAuth | ✅ | One-click login |
| Email/Password | ✅ | Traditional auth |
| Signup | ✅ | With welcome email |
| Password Reset | ✅ | Email-based flow |
| Admin System | ✅ | Role-based access |
| Email Service | ✅ | Nodemailer + templates |
| Session Management | ✅ | JWT with NextAuth |
| Password Hashing | ✅ | bcryptjs |
| User Profiles | ✅ | MongoDB storage |
| Error Handling | ✅ | User-friendly messages |

---

**Need Help?** See [AUTHENTICATION_SETUP.md](./AUTHENTICATION_SETUP.md) for detailed instructions.
