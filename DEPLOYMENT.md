# Vercel Deployment Guide

## Quick Deploy via Vercel Dashboard

1. **Go to Vercel**: https://vercel.com
2. **Sign in** with your GitHub account
3. **Click "Add New Project"**
4. **Import your repository**: `sagar50906/last-one`
5. **Configure the project**:
   - Framework Preset: **Next.js** (auto-detected)
   - Root Directory: `./` (default)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

## Environment Variables

Before deploying, add these environment variables in Vercel:

1. Go to **Project Settings → Environment Variables**
2. Add the following:

### Required Variables:

```
DATABASE_URL=postgresql://neondb_owner:npg_iM81KJQorYeR@ep-shy-hat-a4v0ptwq-fooler.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

```
NEXTAUTH_SECRET=your-secret-key-here
```
(Generate a new one: `node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"`)

```
NEXTAUTH_URL=https://your-app-name.vercel.app
```
(Update this after first deployment with your actual Vercel URL)

### Optional (for GitHub OAuth):

```
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
```

## After First Deployment

1. **Get your deployment URL** from Vercel (e.g., `https://one-last-xyz.vercel.app`)
2. **Update NEXTAUTH_URL** in Vercel environment variables to match
3. **Update GitHub OAuth App** callback URL:
   - Go to: https://github.com/settings/developers
   - Edit your OAuth App
   - Set Authorization callback URL to: `https://your-app-name.vercel.app/api/auth/callback/github`
4. **Redeploy** to apply the new NEXTAUTH_URL

## Database Setup

Your PostgreSQL database (Neon) is already configured. The app will:
- Automatically generate Prisma Client on build
- Connect to your Neon database
- Create tables on first run

## Deploy via CLI (Alternative)

If you prefer using the CLI:

```bash
# Install Vercel CLI (if not already installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

## Troubleshooting

**Build fails with Prisma errors:**
- Make sure DATABASE_URL is set correctly
- Check that your Neon database is accessible
- Ensure Prisma Client is generated (happens automatically in postinstall)

**Authentication not working:**
- Verify NEXTAUTH_URL matches your Vercel deployment URL
- Check NEXTAUTH_SECRET is set
- For GitHub OAuth, verify callback URL matches

**Database connection issues:**
- Verify DATABASE_URL is correct
- Check Neon database is running
- Ensure SSL mode is set correctly in connection string

