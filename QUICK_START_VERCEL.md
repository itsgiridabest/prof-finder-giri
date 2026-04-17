# ProfFinder Vercel - Quick Start (5 Minutes)

The fastest way to deploy ProfFinder. Just follow these steps:

## 1. Create GitHub Repo

```bash
# Create repo at https://github.com/new
# Name it: prof-finder-giri

git clone https://github.com/YOUR_USERNAME/prof-finder-giri.git
cd prof-finder-giri
```

## 2. Add Files

```bash
# Copy all files from this package
cp -r prof-finder-vercel/* .

git add .
git commit -m "Initial commit"
git push origin main
```

## 3. Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your repo
4. Click "Import"

## 4. Add Database

1. In Vercel dashboard, click "Storage"
2. Click "Create New" → "Postgres"
3. Select "Hobby" (free)
4. Click "Create"

## 5. Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

```
OPENAI_API_KEY = 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
JWT_SECRET = (run: openssl rand -hex 32)
OWNER_OPEN_ID = your-manus-oauth-id
OWNER_NAME = Giri
```

**DATABASE_URL is auto-added by Vercel Postgres**

## 6. Initialize Database

```bash
# Download env vars
vercel env pull

# Initialize database schema
npm run db:init
```

## 7. Done!

Your app is live at: `https://prof-finder-giri.vercel.app`

---

## That's It!

No servers, no configuration, no DevOps. Just GitHub + Vercel + Postgres.

Every time you push to GitHub, Vercel automatically deploys your changes.

**Questions?** See `VERCEL_DEPLOYMENT.md` for detailed guide.
