# Deployment Guide for Render

## Prerequisites
1. GitHub account with this repository pushed
2. Render account (free tier available at https://render.com)
3. Google OAuth credentials configured

## Step 1: Push to GitHub

```bash
git add .
git commit -m "Prepare for Render deployment"
git push origin main
```

## Step 2: Deploy on Render

### Option A: Using render.yaml (Recommended)

1. Go to https://render.com/dashboard
2. Click **New +** → **Blueprint**
3. Connect your GitHub repository
4. Render will automatically detect `render.yaml`
5. Click **Apply** to create the service

### Option B: Manual Setup

1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Connect your GitHub repository
4. Configure:
   - **Name**: fakeapi-generator
   - **Runtime**: Node
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free

## Step 3: Configure Environment Variables

In Render dashboard, go to your service → **Environment** and add:

```
AUTH_SECRET=<generate with: openssl rand -base64 32>
NEXTAUTH_URL=https://your-app-name.onrender.com
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-client-secret>
MONGODB_URI=<your-mongodb-atlas-connection-string>
ADMIN_EMAIL=<your-admin-email@example.com>
NODE_ENV=production
```

**Important:** All environment variables from your local `.env` file need to be added to Render's Environment section. The app cannot read `.env` files in production.

### Optional Email Service Variables (for password reset & notifications):
```
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<your-email@gmail.com>
SMTP_PASS=<your-app-password>
FROM_EMAIL=<your-email@gmail.com>
APP_NAME=Fake API Generator
```

## Step 4: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** → **Credentials**
3. Edit your OAuth 2.0 Client
4. Add to **Authorized redirect URIs**:
   ```
   https://your-app-name.onrender.com/api/auth/callback/google
   ```

## Step 5: Deploy

Render will automatically deploy when you push to GitHub. You can also trigger manual deploys from the dashboard.

## Notes

- **Free tier**: App will spin down after 15 minutes of inactivity (cold starts)
- **Data persistence**: Uses MongoDB Atlas cloud database (free tier available)
- **Custom domain**: Available on paid plans

## Troubleshooting

### Build fails
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`

### Auth not working
- Verify `NEXTAUTH_URL` matches your Render URL exactly
- Check Google OAuth redirect URIs

### "MONGODB_URI environment variable" Error
**Symptom:** `CallbackRouteError: Please define the MONGODB_URI environment variable`

**Solution:**
1. Go to Render Dashboard → Your Service → **Environment** tab
2. Click **Add Environment Variable**
3. Add: `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/database?retryWrites=true&w=majority`
4. Click **Save Changes**
5. Render will automatically redeploy

**Important:** Environment variables must be set in Render's dashboard, not in code. The `.env` file only works locally.

### Credentials Login Fails (Email/Password)
- Ensure `MONGODB_URI` is set in Render environment variables
- Check `AUTH_SECRET` is configured
- Verify MongoDB Atlas allows connections from all IPs (0.0.0.0/0)
- Check Render logs for specific error messages

### Database connection issues
- Verify `MONGODB_URI` is set correctly in environment variables
- Check MongoDB Atlas network access allows connections from anywhere (0.0.0.0/0)
- Ensure database user credentials are correct
- Test connection string locally first

## Monitoring

View logs in Render dashboard → **Logs** tab
