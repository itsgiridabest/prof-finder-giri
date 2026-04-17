# ProfFinder Vercel Deployment Guide

Deploy ProfFinder to Vercel in 5 minutes! This is the easiest way to get the app live.

## Why Vercel?

✅ **Free forever** on Hobby plan  
✅ **Zero configuration** — just push to GitHub  
✅ **Automatic deployments** — push = live  
✅ **Free Postgres database** — 1GB storage included  
✅ **Global CDN** — fast everywhere  
✅ **Serverless functions** — no servers to manage  

## Prerequisites

- GitHub account
- Vercel account (free)
- OpenAI API key
- 5 minutes of time

## Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. Create a new repository named `prof-finder-giri`
3. Clone it locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/prof-finder-giri.git
   cd prof-finder-giri
   ```

## Step 2: Add Project Files

Copy all files from this package into your repository:

```bash
# Copy all files
cp -r prof-finder-vercel/* .

# Initialize git
git add .
git commit -m "Initial ProfFinder commit"
git push origin main
```

## Step 3: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `prof-finder-giri` repository
4. Click "Import"

## Step 4: Set Up Database

1. In Vercel dashboard, go to your project
2. Click "Storage" tab
3. Click "Create New" → "Postgres"
4. Select "Hobby" (free tier)
5. Click "Create"
6. Vercel automatically adds `DATABASE_URL` to environment variables

## Step 5: Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables** and add:

| Variable | Value | Example |
|----------|-------|---------|
| `OPENAI_API_KEY` | Your OpenAI API key | `sk-or-v1-...` |
| `JWT_SECRET` | Random 32-char secret | `openssl rand -hex 32` |
| `OWNER_OPEN_ID` | Your Manus OAuth ID | `user-123-abc` |
| `OWNER_NAME` | Your name | `Giri` |

**Note**: `DATABASE_URL` is automatically set by Vercel Postgres.

## Step 6: Initialize Database

After deployment, initialize the database schema:

1. Go to Vercel dashboard
2. Click "Deployments"
3. Click the latest deployment
4. Go to "Logs" tab
5. Run initialization command (see below)

Or use Vercel CLI:

```bash
npm install -g vercel
vercel env pull  # Download environment variables
npm run db:init  # Initialize database schema
```

## Step 7: Deploy!

That's it! Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Update feature"
git push origin main

# Vercel automatically deploys within 1 minute
```

Your app is now live at: `https://prof-finder-giri.vercel.app`

## Verify Deployment

1. Visit your Vercel URL
2. You should see the ProfFinder landing page
3. Click "Get Started" and sign in
4. Try the search functionality
5. Check Vercel logs for any errors: `vercel logs`

## Troubleshooting

### Issue: "Database connection failed"

**Solution**: 
1. Verify `DATABASE_URL` is set in Vercel dashboard
2. Run `npm run db:init` to initialize schema
3. Check Vercel logs: `vercel logs --tail`

### Issue: "OpenAI API error"

**Solution**:
1. Verify `OPENAI_API_KEY` is set correctly
2. Check key is valid: https://platform.openai.com/api-keys
3. Ensure key has API access (not just chat.openai.com)

### Issue: "Unauthorized" errors

**Solution**:
1. Verify `OWNER_OPEN_ID` and `OWNER_NAME` are set
2. Check you're logged in with the correct account
3. Clear browser cookies and try again

### Issue: "Function timeout"

**Solution**:
1. Optimize database queries
2. Use pagination for large result sets
3. Cache responses when possible
4. Check Vercel logs for slow queries

### Issue: "Out of memory"

**Solution**:
1. Reduce query result size
2. Use pagination
3. Stream large responses
4. Upgrade to Pro plan if needed

## Monitoring Your App

### View Logs

```bash
vercel logs --tail
```

### Check Performance

1. Go to Vercel dashboard
2. Click "Analytics"
3. View response times, error rates, etc.

### Monitor Database

1. Go to Vercel dashboard
2. Click "Storage" → "Postgres"
3. View query stats and storage usage

## Updating Your App

To update the app:

1. Make changes locally
2. Commit and push to GitHub
3. Vercel automatically deploys
4. Check deployment status in dashboard

## Custom Domain

To use a custom domain:

1. Go to Vercel dashboard
2. Click "Settings" → "Domains"
3. Add your domain
4. Follow DNS configuration steps
5. Your app is now at your custom domain

## Next Steps

- ✅ App is live and accessible
- ✅ Database is set up
- ✅ Automatic deployments enabled
- 🎉 You're done!

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Postgres Docs**: https://vercel.com/docs/storage/postgres
- **Troubleshooting**: https://vercel.com/help

---

## Summary

Your ProfFinder app is now deployed to Vercel with:

✅ React frontend on global CDN  
✅ Serverless backend functions  
✅ Free Postgres database  
✅ Automatic deployments from GitHub  
✅ HTTPS and security built-in  
✅ Scalable to millions of users  

**Your app is live!** 🚀
