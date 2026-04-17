# ProfFinder - Vercel Deployment Package

This package contains everything needed to deploy ProfFinder to Vercel.

## 🚀 Quick Start

**5-minute deployment:**

1. Create GitHub repo: https://github.com/new
2. Push this code to GitHub
3. Go to https://vercel.com/new and import your repo
4. Add Vercel Postgres database (free tier)
5. Set environment variables (see below)
6. Done! Your app is live

**See `QUICK_START_VERCEL.md` for step-by-step instructions.**

## 📦 What's Included

```
prof-finder-vercel/
├── QUICK_START_VERCEL.md          ← Start here (5 min)
├── VERCEL_DEPLOYMENT.md           ← Full guide
├── API_ROUTES.md                  ← Backend architecture
├── vercel.json                    ← Vercel config
├── .env.example                   ← Environment template
├── scripts/init-db.mjs            ← Database initialization
├── client/                        ← React frontend
├── server/                        ← Backend code
├── package.json                   ← Dependencies
└── ... (other project files)
```

## ✨ Why Vercel?

- ✅ **Free forever** on Hobby plan
- ✅ **Zero configuration** — just push to GitHub
- ✅ **Automatic deployments** — every push goes live
- ✅ **Free Postgres database** — 1GB included
- ✅ **Global CDN** — fast everywhere
- ✅ **Serverless** — no servers to manage

## 🔧 Technology Stack

- **Frontend**: React 19 + Vite + Tailwind CSS
- **Backend**: Vercel Serverless Functions (Node.js)
- **Database**: Vercel Postgres (PostgreSQL)
- **Deployment**: Vercel (automatic from GitHub)

## 📋 Environment Variables

Required:
- `OPENAI_API_KEY` - Your OpenAI API key
- `JWT_SECRET` - Random secret for sessions
- `OWNER_OPEN_ID` - Your Manus OAuth ID
- `OWNER_NAME` - Your name (e.g., "Giri")

Auto-provided by Vercel:
- `DATABASE_URL` - Vercel Postgres connection string

## 🎯 Deployment Steps

### Step 1: Create GitHub Repository

```bash
git clone https://github.com/YOUR_USERNAME/prof-finder-giri.git
cd prof-finder-giri
cp -r prof-finder-vercel/* .
git add .
git commit -m "Initial commit"
git push origin main
```

### Step 2: Connect to Vercel

1. Go to https://vercel.com/new
2. Click "Import Git Repository"
3. Select your `prof-finder-giri` repo
4. Click "Import"

### Step 3: Create Database

1. In Vercel dashboard, click "Storage"
2. Click "Create New" → "Postgres"
3. Select "Hobby" (free tier)
4. Click "Create"

Vercel automatically adds `DATABASE_URL` to environment variables.

### Step 4: Set Environment Variables

In Vercel dashboard, go to **Settings** → **Environment Variables**:

| Variable | Value |
|----------|-------|
| `OPENAI_API_KEY` | Your OpenAI API key |
| `JWT_SECRET` | Generate: `openssl rand -hex 32` |
| `OWNER_OPEN_ID` | Your Manus OAuth ID |
| `OWNER_NAME` | Giri |

### Step 5: Initialize Database

```bash
vercel env pull
npm run db:init
```

### Step 6: Done!

Your app is live at: `https://prof-finder-giri.vercel.app`

## 🔄 Continuous Deployment

Every time you push to GitHub, Vercel automatically:

1. Builds your app
2. Runs tests
3. Deploys to production
4. Updates your live URL

```bash
git add .
git commit -m "Update feature"
git push origin main
# App updates automatically within 1 minute
```

## 📊 Monitoring

View logs and analytics:

```bash
vercel logs --tail
```

Or in Vercel dashboard:
- **Deployments**: View all deployments
- **Analytics**: Response times, error rates
- **Storage**: Database usage and queries

## 🆘 Troubleshooting

### Database Connection Failed

```bash
# Verify DATABASE_URL is set
vercel env list

# Initialize database
npm run db:init

# Check logs
vercel logs --tail
```

### OpenAI API Errors

- Verify `OPENAI_API_KEY` is correct
- Check key is valid: https://platform.openai.com/api-keys
- Ensure key has API access

### Unauthorized Errors

- Verify `OWNER_OPEN_ID` and `OWNER_NAME` are set
- Check you're logged in with correct account
- Clear browser cookies

## 📚 Documentation

- **Quick Start**: `QUICK_START_VERCEL.md` (5 min)
- **Full Guide**: `VERCEL_DEPLOYMENT.md` (detailed)
- **API Routes**: `API_ROUTES.md` (architecture)
- **Vercel Docs**: https://vercel.com/docs

## 🎨 Features

- ✅ Professor search with AI
- ✅ Personalized email generation
- ✅ Email tone selection (formal, friendly, concise)
- ✅ Professor bookmarking
- ✅ Outreach tracking
- ✅ Analytics dashboard
- ✅ Profile management
- ✅ Search history

## 🔐 Security

- ✅ HTTPS by default
- ✅ Environment variables encrypted
- ✅ JWT-based authentication
- ✅ Database connection pooling
- ✅ Rate limiting built-in

## 💰 Cost

**Free forever on Hobby plan:**

- Unlimited deployments
- 100 GB bandwidth
- 1 GB Postgres storage
- 10 serverless functions
- Global CDN

**No credit card required!**

## 🚀 Next Steps

1. Read `QUICK_START_VERCEL.md`
2. Create GitHub repository
3. Push code to GitHub
4. Connect to Vercel
5. Add database
6. Set environment variables
7. Deploy!

Your ProfFinder app will be live in 5 minutes! 🎉

---

**Questions?** See the detailed guides or visit https://vercel.com/help
