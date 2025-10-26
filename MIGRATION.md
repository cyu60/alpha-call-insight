# Migration from Supabase Edge Functions to Next.js API Routes

## Overview
This document describes the migration from Supabase Edge Functions to Next.js API routes for better integration with the Next.js application and simplified deployment.

## Changes Made

### 1. New API Routes Created

#### `/app/api/fetch-conversations/route.ts`
- **Method**: GET
- **Purpose**: Fetches all Gary Tan AI conversations from ElevenLabs and syncs them to Supabase
- **Replaces**: `supabase/functions/fetch-conversations/`
- **Key differences**:
  - Runs in Node.js environment instead of Deno
  - Uses Next.js `NextRequest`/`NextResponse` instead of Deno's `serve`
  - Environment variables read from `process.env` instead of `Deno.env`
  - No CORS handling needed (handled by Next.js)

#### `/app/api/update-conversation-metadata/route.ts`
- **Method**: POST
- **Purpose**: Updates metadata for a specific conversation
- **Replaces**: `supabase/functions/update-conversation-metadata/`
- **Key differences**: Same as above

### 2. Hook Updated

#### `/src/hooks/useConversations.ts`
- Changed from using `supabase.functions.invoke('fetch-conversations')` to `fetch('/api/fetch-conversations')`
- Now uses standard fetch API instead of Supabase SDK's function invocation
- Error handling improved with JSON error parsing

### 3. New Service Created

#### `/app/services/conversationService.ts`
- Created utility functions for calling the new API endpoints
- Provides TypeScript types and error handling
- Functions:
  - `fetchAndSyncConversations()`: Fetches conversations from ElevenLabs
  - `updateConversationMetadata(conversationId, metadata)`: Updates conversation metadata

### 4. Documentation Updated

#### `README.md`
- Updated project structure diagram
- Documented all three API endpoints
- Updated environment variables section to consolidate all vars in `.env.local`
- Updated data flow description
- Marked Supabase Edge Functions as "legacy/deprecated"

## Environment Variables Required

All environment variables should now be in `.env.local`:

```bash
# Anthropic AI for analysis
ANTHROPIC_API_KEY=sk-ant-...

# Supabase (frontend & API routes)
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=YOUR_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# ElevenLabs API (for fetching conversations)
ELEVENLABS_API_KEY=your_elevenlabs_key

# MCP verification (Google Programmable Search)
GOOGLE_SEARCH_API_KEY=your_google_api_key
GOOGLE_SEARCH_ENGINE_ID=your_cx_id
```

## Benefits of Migration

1. **Simplified Deployment**: No need to deploy Supabase Edge Functions separately
2. **Unified Environment**: All environment variables in one place (`.env.local`)
3. **Better Integration**: Direct access to Next.js features and middleware
4. **Easier Development**: Local development without Supabase CLI
5. **Type Safety**: Full TypeScript support without Deno-specific imports
6. **Standard Node.js**: Uses familiar Node.js APIs instead of Deno

## Usage Examples

### Fetching Conversations

```typescript
// Using the service (recommended)
import { fetchAndSyncConversations } from '@/app/services/conversationService';

const data = await fetchAndSyncConversations();
console.log(data.conversations);
```

```typescript
// Direct API call
const response = await fetch('/api/fetch-conversations');
const data = await response.json();
```

### Updating Conversation Metadata

```typescript
// Using the service (recommended)
import { updateConversationMetadata } from '@/app/services/conversationService';

const result = await updateConversationMetadata('conv_xyz123', {
  tags: ['qualified', 'series-a'],
  notes: 'Strong technical background',
  priority: 'high'
});
```

```typescript
// Direct API call
const response = await fetch('/api/update-conversation-metadata', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_id: 'conv_xyz123',
    metadata: {
      tags: ['qualified', 'series-a'],
      notes: 'Strong technical background'
    }
  })
});
const result = await response.json();
```

## Backward Compatibility

The old Supabase Edge Functions still exist in `supabase/functions/` but are no longer used by the application. They can be safely removed if you're not using them elsewhere.

## Testing

To verify the migration works:

1. Start the development server: `npm run dev`
2. Navigate to the dashboard at `http://localhost:3000/dashboard`
3. The dashboard should automatically fetch conversations on load
4. Check the browser console for logs showing successful API calls

## Rollback Instructions

If you need to rollback to Supabase Edge Functions:

1. In `/src/hooks/useConversations.ts`, change:
```typescript
const apiResponse = await fetch('/api/fetch-conversations');
```
back to:
```typescript
const { data: apiData, error: fnError } = await supabase.functions.invoke('fetch-conversations');
```

2. Ensure Supabase Edge Functions are deployed:
```bash
supabase functions deploy fetch-conversations
supabase functions deploy update-conversation-metadata
```

3. Set environment variables in Supabase dashboard/CLI instead of `.env.local`

