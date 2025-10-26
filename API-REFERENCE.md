# API Reference

Quick reference for the Next.js API routes that replaced Supabase Edge Functions.

## Endpoints

### 1. Fetch Conversations
**Endpoint:** `GET /api/fetch-conversations`

**Description:** Fetches all Gary Tan AI conversations from ElevenLabs and syncs them to the Supabase database.

**Response:**
```json
{
  "conversations": [
    {
      "conversation_id": "conv_123",
      "agent_name": "Gary Tan AI",
      "call_duration_secs": 180,
      "transcript": [...],
      "metadata": {...},
      "analysis": {...}
    }
  ]
}
```

**Example:**
```typescript
const response = await fetch('/api/fetch-conversations');
const data = await response.json();
```

---

### 2. Update Conversation Metadata
**Endpoint:** `POST /api/update-conversation-metadata`

**Description:** Updates metadata for a specific conversation. Metadata is merged with existing metadata.

**Request Body:**
```json
{
  "conversation_id": "conv_123",
  "metadata": {
    "tags": ["qualified", "series-a"],
    "notes": "Strong technical background",
    "priority": "high"
  }
}
```

**Response:**
```json
{
  "success": true,
  "conversation_id": "conv_123",
  "metadata": {
    "tags": ["qualified", "series-a"],
    "notes": "Strong technical background",
    "priority": "high",
    "updated_at": "2025-10-26T12:00:00.000Z"
  },
  "data": { ... }
}
```

**Example:**
```typescript
const response = await fetch('/api/update-conversation-metadata', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    conversation_id: 'conv_123',
    metadata: { tags: ['qualified'] }
  })
});
const result = await response.json();
```

---

### 3. Analyze Call
**Endpoint:** `POST /api/analyze-call`

**Description:** Runs multi-agent due diligence analysis on a call transcript.

**Request Body:**
```json
{
  "transcript": "Caller (00:01): Hello...\nGary Tan AI (00:04): Hi there..."
}
```

**Response:**
```json
{
  "quantitativeAnalysis": {
    "verdict": "PASS",
    "revenue": 22000,
    "team_size": 5,
    "reasoning": "..."
  },
  "qualitativeAnalysis": {
    "verdict": "PASS",
    "reasoning": "..."
  },
  "strategicAnalysis": {
    "verdict": "PASS",
    "reasoning": "..."
  },
  "verificationAnalysis": {
    "verdict": "PASS",
    "verified": true,
    "confidence": "high",
    "reasoning": "..."
  },
  "accept": true
}
```

**Example:**
```typescript
const response = await fetch('/api/analyze-call', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ transcript })
});
const analysis = await response.json();
```

---

## Helper Service

For easier use, import from `@/app/services/conversationService`:

```typescript
import {
  fetchAndSyncConversations,
  updateConversationMetadata
} from '@/app/services/conversationService';

// Fetch conversations
const { conversations } = await fetchAndSyncConversations();

// Update metadata
await updateConversationMetadata('conv_123', {
  tags: ['qualified'],
  notes: 'Great pitch'
});
```

---

## Environment Variables

Required in `.env.local`:

```bash
# Anthropic AI
ANTHROPIC_API_KEY=sk-ant-...

# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# ElevenLabs
ELEVENLABS_API_KEY=...

# Google Search (for verification)
GOOGLE_SEARCH_API_KEY=...
GOOGLE_SEARCH_ENGINE_ID=...
```

---

## Testing

Run the test suite:
```bash
npm run dev  # Start dev server first
tsx test-api-routes.ts
```

## Error Handling

All endpoints return errors in this format:
```json
{
  "error": "Error message here"
}
```

Status codes:
- `200`: Success
- `400`: Bad request (invalid input)
- `404`: Not found (for metadata updates)
- `500`: Server error

