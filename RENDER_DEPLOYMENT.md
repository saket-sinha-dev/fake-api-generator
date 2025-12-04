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
NODE_ENV=production
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
- **Data persistence**: The `data/` directory will reset on each deploy. Consider using a database for production
- **Custom domain**: Available on paid plans

## Troubleshooting

### Build fails
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`

### Auth not working
- Verify `NEXTAUTH_URL` matches your Render URL exactly
- Check Google OAuth redirect URIs

### Data loss on restart
- Render's free tier uses ephemeral storage
- Upgrade to persistent disk or use external database

## Monitoring

View logs in Render dashboard → **Logs** tab
