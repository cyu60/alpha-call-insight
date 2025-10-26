# AlphaFoundry — AI Call Analytics & Due Diligence

AI‑assisted pipeline for ingesting investor conversations, surfacing insights, and running automated due‑diligence using multi‑agent analysis plus an MCP‑powered verification step.

## Highlights
- Next.js 16 + React 18 + TypeScript, Tailwind CSS, shadcn‑ui
- Dashboard to browse investor conversations and transcripts
- Supabase for storage with Next.js API routes to sync ElevenLabs ConvAI conversations
- Multi‑agent analysis (Quantitative, Qualitative, Strategic) via Anthropic Claude
- Verification agent (via MCP server) uses Google Custom Search to validate founder claims

## Project structure
```
/app                                    # Next.js app router
  /api
    /analyze-call                       # POST endpoint to run due‑diligence
    /fetch-conversations                # GET endpoint to sync ElevenLabs conversations
    /update-conversation-metadata       # POST endpoint to update conversation metadata
  /dashboard                            # Dashboard UI
  /services                             # AI analysis, verification agent & conversation service
/src
  /components                           # UI components (Dashboard, CallDetail, etc.)
  /hooks                                # data fetching / transforms
  /integrations                         # supabase client & types
  /types                                # app types (Call, Transcript)
/supabase
  /functions                            # Legacy Edge Functions (deprecated, replaced by /app/api)
  /migrations                           # SQL migrations (metadata, transcript, triggers)
/mcp-server                             # MCP server exposing web_search tool
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
# Copy the example file
cp env.example .env.local
```

Then fill in your actual credentials. See [SETUP.md](./SETUP.md) for detailed instructions on how to get each credential.

Required variables:
```bash
# Anthropic AI for analysis
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (frontend & API routes)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# ElevenLabs API (for fetching conversations)
ELEVENLABS_API_KEY=your_elevenlabs_key

# MCP verification (Google Programmable Search) - Optional
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_cx_id
```

⚠️ **Important:** Make sure to set `SUPABASE_SERVICE_ROLE_KEY` - this is required for the API routes to work!

### Run the app
```bash
npm run dev
# http://localhost:3000
```

## Data flow
1) The dashboard calls the Next.js API route `/api/fetch-conversations` to pull latest ElevenLabs ConvAI conversations, upserting into tables like `conversations`, `data_collection`, and `call_metrics`.
2) The page then queries Supabase to render calls, metrics, metadata, and transcripts.
3) From a call detail view, clicking "Run Due Diligence" posts the transcript to `/api/analyze-call`.
4) The API runs three Anthropic agents (Quantitative, Qualitative, Strategic) in parallel, then runs a Verification agent which spawns the MCP server and uses Google search to verify claims. Final decision is ACCEPT only if all four agents PASS.

## API

### GET `/api/fetch-conversations`
Fetches all Gary Tan AI conversations from ElevenLabs and syncs them to the Supabase database.

Response:
```json
{
  "conversations": [
    {
      "conversation_id": "...",
      "agent_name": "Gary Tan AI",
      "transcript": [...],
      "metadata": {...},
      ...
    }
  ]
}
```

### POST `/api/update-conversation-metadata`
Updates metadata for a specific conversation.

Request:
```json
{
  "conversation_id": "conv_xyz123",
  "metadata": {
    "custom_field": "value",
    "tags": ["qualified", "series-a"]
  }
}
```

Response:
```json
{
  "success": true,
  "conversation_id": "conv_xyz123",
  "metadata": { ... },
  "data": { ... }
}
```

### POST `/api/analyze-call`
Runs multi-agent due diligence analysis on a call transcript.

Request:
```json
{ "transcript": "Caller (00:01): ...\nGary Tan AI (00:04): ..." }
```

Response:
```json
{
  "quantitativeAnalysis": { "verdict": "PASS", "revenue": 22000, ... },
  "qualitativeAnalysis": { "verdict": "PASS", ... },
  "strategicAnalysis": { "verdict": "FAIL", ... },
  "verificationAnalysis": { "verdict": "PASS", "verified": true, ... },
  "accept": false
}
```

## Database
Supabase migrations live in `supabase/migrations` and include:
- `metadata` JSONB column + GIN index on `conversations`
- `transcript` JSONB column on `conversations`
- updated trigger function for `updated_at`

Tables:
- `conversations`: main conversation data with transcript and metadata
- `data_collection`: extracted business data (name, profile, stage, revenue, region)
- `call_metrics`: computed metrics (action items, transcript length, etc.)

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
