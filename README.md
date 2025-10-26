# AlphaFoundry — AI Call Analytics & Due Diligence

AI‑assisted pipeline for ingesting investor conversations, surfacing insights, and running automated due‑diligence using multi‑agent analysis plus an MCP‑powered verification step.

## Highlights
- Next.js 16 + React 18 + TypeScript, Tailwind CSS, shadcn‑ui
- Dashboard to browse investor conversations and transcripts
- Supabase for storage and Edge Functions to sync ElevenLabs ConvAI conversations
- Multi‑agent analysis (Quantitative, Qualitative, Strategic) via Anthropic Claude
- Verification agent (via MCP server) uses Google Custom Search to validate founder claims

## Project structure
```
/app                 # Next.js app router
  /api/analyze-call  # POST endpoint to run due‑diligence
  /dashboard         # Dashboard UI
  /services          # AI analysis + verification agent
/src
  /components        # UI components (Dashboard, CallDetail, etc.)
  /hooks             # data fetching / transforms
  /integrations      # supabase client & types
  /types             # app types (Call, Transcript)
/supabase
  /functions         # Edge Functions (fetch-conversations, update-conversation-metadata)
  /migrations        # SQL migrations (metadata, transcript, triggers)
/mcp-server          # MCP server exposing web_search tool
```

## Getting started
### Prerequisites
- Node.js 18+ (Node 20 recommended)
- npm (or pnpm/yarn)

### Install
```bash
npm install
```

### Environment variables
Create a `.env.local` in the repo root:
```bash
# Frontend / API
ANTHROPIC_API_KEY=sk-ant-...
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY

# MCP verification (Google Programmable Search)
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_cx_id
```

Supabase Edge Functions run on Supabase and need their own secrets (set via Supabase CLI or Dashboard):
```bash
# For fetch-conversations
ELEVENLABS_API_KEY=your_elevenlabs_key
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
```

### Run the app
```bash
npm run dev
# http://localhost:3000
```

## Data flow
1) The dashboard invokes the Supabase Edge Function `fetch-conversations` to pull latest ElevenLabs ConvAI conversations, upserting into tables like `conversations`, `data_collection`, and `call_metrics`.
2) The page then queries Supabase to render calls, metrics, metadata, and transcripts.
3) From a call detail view, clicking “Run Due Diligence” posts the transcript to `/api/analyze-call`.
4) The API runs three Anthropic agents (Quantitative, Qualitative, Strategic) in parallel, then runs a Verification agent which spawns the MCP server and uses Google search to verify claims. Final decision is ACCEPT only if all four agents PASS.

## API
### POST `/api/analyze-call`
Request:
```json
{ "transcript": "Caller (00:01): ...\nGary Tan AI (00:04): ..." }
```
Response (shape):
```json
{
  "quantitativeAnalysis": { "verdict": "PASS", "revenue": 22000, ... },
  "qualitativeAnalysis": { "verdict": "PASS", ... },
  "strategicAnalysis": { "verdict": "FAIL", ... },
  "verificationAnalysis": { "verdict": "PASS", "verified": true, ... },
  "accept": false
}
```

## Supabase Edge Functions
- `fetch-conversations`: pulls ElevenLabs ConvAI conversations, saves transcript, basic metrics, and data collection fields into Supabase.
- `update-conversation-metadata`: merges arbitrary `metadata` (JSONB) onto a conversation row.

Migrations live in `supabase/migrations` and include:
- `metadata` JSONB column + GIN index on `conversations`
- `transcript` JSONB column on `conversations`
- updated trigger function for `updated_at`

Deploy functions from the repo root (example):
```bash
# Using Supabase CLI (logged in and linked)
supabase functions deploy fetch-conversations
supabase functions deploy update-conversation-metadata
```

## MCP verification server
Location: `mcp-server/`

Provides a `web_search` tool over stdio. The app spawns it via `npx tsx mcp-server/index.ts` during verification. Ensure Google API env vars are available in the app process (see `.env.local`).

Local test:
```bash
cd mcp-server
npm install
npx tsx test-web-search.ts
```

## Scripts
```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint"
}
```

## Tests / examples
- `tsx test-aiservice.ts` — end‑to‑end run of the multi‑agent analysis
- `tsx test-verification-pass.ts` — verification PASS case
- `tsx test-verification-fraud.ts` — verification FAIL case (catches inconsistent claims)

Run with required env in `.env.local`.

## Troubleshooting
- Analysis fails: check `ANTHROPIC_API_KEY` and model access, and that the transcript string is provided.
- Verification returns low confidence or errors: ensure `GOOGLE_SEARCH_API_KEY` and `GOOGLE_SEARCH_ENGINE_ID` are set; confirm outbound network allowed.
- Dashboard shows no conversations: verify `ELEVENLABS_API_KEY`, Supabase function deployment, and that your Supabase URL/keys are correct.

## License
Proprietary. All rights reserved unless a license is added.
