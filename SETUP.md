# Setup Guide

This guide will help you set up all the required environment variables for the AlphaFoundry application.

## Quick Start

1. Copy the example environment file:
```bash
cp env.example .env.local
```

2. Fill in your actual credentials (see sections below)

3. Start the development server:
```bash
npm run dev
```

---

## Environment Variables

### 1. Anthropic API Key

**Variable:** `ANTHROPIC_API_KEY`

**How to get it:**
1. Sign up at https://console.anthropic.com/
2. Navigate to API Keys
3. Create a new API key
4. Copy the key (starts with `sk-ant-`)

**Example:**
```bash
ANTHROPIC_API_KEY=sk-ant-api03-abc123xyz...
```

---

### 2. Supabase Credentials

**Variables:**
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (also called "anon key")
- `SUPABASE_SERVICE_ROLE_KEY`

**How to get them:**

#### Option A: From Supabase Dashboard (Recommended)
1. Go to https://supabase.com/dashboard
2. Select your project (or create a new one)
3. Click on the "Settings" gear icon (⚙️) in the sidebar
4. Go to "API" section
5. You'll see:
   - **Project URL** → Use this for `NEXT_PUBLIC_SUPABASE_URL`
   - **Project API keys:**
     - `anon` `public` → Use this for `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`
     - `service_role` `secret` → Use this for `SUPABASE_SERVICE_ROLE_KEY`

#### Option B: Using Supabase CLI
```bash
# If you have Supabase CLI and project linked
supabase status
```

**Example:**
```bash
NEXT_PUBLIC_SUPABASE_URL=https://abcdefghijklmnop.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOi...
```

⚠️ **Important:** The `service_role` key has full access to your database. Keep it secret and never commit it to git!

---

### 3. ElevenLabs API Key

**Variable:** `ELEVENLABS_API_KEY`

**How to get it:**
1. Sign up at https://elevenlabs.io/
2. Go to your Profile Settings
3. Navigate to API Keys section
4. Copy your API key

**Example:**
```bash
ELEVENLABS_API_KEY=sk_1a2b3c4d5e6f7g8h9i0j...
```

---

### 4. Google Custom Search (Optional - for verification)

**Variables:**
- `GOOGLE_SEARCH_API_KEY`
- `GOOGLE_SEARCH_ENGINE_ID`

**How to get them:**

#### Step 1: Get API Key
1. Go to https://console.cloud.google.com/
2. Create a new project or select existing one
3. Enable "Custom Search API"
4. Go to "Credentials"
5. Create a new API key
6. Copy the API key

#### Step 2: Get Search Engine ID
1. Go to https://programmablesearchengine.google.com/
2. Click "Add" to create a new search engine
3. Configure it to search the entire web
4. Once created, click on your search engine
5. Copy the "Search engine ID" (also called `cx`)

**Example:**
```bash
GOOGLE_SEARCH_API_KEY=AIzaSyAbc123Xyz789...
GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
```

---

## Verification

After setting up your `.env.local` file, verify everything works:

### 1. Check environment variables are loaded
```bash
npm run dev
```

Visit http://localhost:3000 - you should not see any "credentials not configured" errors.

### 2. Test API endpoints
```bash
# In a separate terminal (keep dev server running)
tsx test-api-routes.ts
```

### 3. Test individual services
```bash
# Test AI analysis
tsx test-aiservice.ts

# Test verification (requires Google Search credentials)
tsx test-verification-pass.ts
```

---

## Troubleshooting

### "Supabase credentials not configured"

**Problem:** The API routes can't find your Supabase credentials.

**Solutions:**
1. Make sure `.env.local` exists in the project root
2. Check that `SUPABASE_SERVICE_ROLE_KEY` is set (not just the anon key)
3. Restart your dev server after adding environment variables
4. Make sure there are no typos in the variable names

### "ELEVENLABS_API_KEY is not configured"

**Problem:** The fetch-conversations endpoint can't find your ElevenLabs API key.

**Solutions:**
1. Make sure `ELEVENLABS_API_KEY` is set in `.env.local`
2. Restart your dev server
3. Verify the key is correct by testing it directly with ElevenLabs API

### Environment variables not loading

**Solutions:**
1. Make sure the file is named exactly `.env.local` (with the dot at the start)
2. The file must be in the project root directory (same level as `package.json`)
3. Restart your development server after creating/modifying `.env.local`
4. Check that `.env.local` is not in `.gitignore` as a specific exclusion

### Database connection errors

**Problem:** Can't connect to Supabase or tables don't exist.

**Solutions:**
1. Run the migrations:
```bash
cd supabase
supabase db push
```

2. Or manually run the SQL from `supabase/migrations/` in your Supabase SQL Editor

---

## Security Best Practices

1. ✅ **DO** keep `.env.local` in `.gitignore`
2. ✅ **DO** use different keys for development and production
3. ✅ **DO** rotate your keys if they're accidentally exposed
4. ❌ **DON'T** commit `.env.local` to git
5. ❌ **DON'T** share your service role key
6. ❌ **DON'T** use production keys in development

---

## Example Complete `.env.local`

```bash
# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-api03-abc123xyz789...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xyzabc123456.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSI...

# ElevenLabs
ELEVENLABS_API_KEY=sk_1a2b3c4d5e6f7g8h9i0j...

# Google Search (optional)
GOOGLE_SEARCH_API_KEY=AIzaSyAbc123Xyz789...
GOOGLE_SEARCH_ENGINE_ID=a1b2c3d4e5f6g7h8i
```

---

## Need Help?

If you're still having issues:
1. Check the error messages in your terminal/browser console
2. Review the [README.md](./README.md) for more context
3. Check the [MIGRATION.md](./MIGRATION.md) for migration details
4. Review the [API-REFERENCE.md](./API-REFERENCE.md) for API documentation

