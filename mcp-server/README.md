# Verification MCP Server

A Model Context Protocol (MCP) server that enables AI agents to verify founder credentials using web search.

## What it Does

This MCP server exposes a `web_search` tool that:
1. Takes a search query (e.g., "Sarah Chen Databricks Stanford")
2. Searches the web using Google Custom Search API
3. Returns top 5 results with titles, snippets, and URLs
4. Claude analyzes these results to verify claimed credentials

## Setup

### 1. Install Dependencies

```bash
cd mcp-server
npm install
```

### 2. Get Google Custom Search API Credentials

#### Step A: Get API Key
1. Go to https://console.cloud.google.com/
2. Create a new project (or select existing)
3. Enable "Custom Search API"
4. Go to Credentials → Create Credentials → API Key
5. Copy your API key

#### Step B: Create Custom Search Engine
1. Go to https://programmablesearchengine.google.com/
2. Click "Add" to create new search engine
3. In "Sites to search": Enter `*` (to search entire web)
4. Click "Create"
5. Copy your "Search engine ID" (cx parameter)

### 3. Set Environment Variables

Create `.env` file in the mcp-server directory:

```bash
GOOGLE_SEARCH_API_KEY=your_api_key_here
GOOGLE_SEARCH_ENGINE_ID=your_search_engine_id_here
```

**Note:** Free tier gives you 100 searches per day.

## Testing the Server

Run the test to verify everything works:

```bash
npx tsx test-web-search.ts
```

This will:
- Start the MCP server
- Connect a test client
- Search for "Chinat Yu MLH Stanford"
- Display the search results

**Expected output:**
```
✅ Found 5 results

1. Chinat Yu - Top 50 MLH Hacker | LinkedIn
   Profile information...
   🔗 https://linkedin.com/in/chinat-yu

2. Stanford University - Chinat Yu
   ...
```

## How It Works

### Architecture

```
Your App
    ↓
Claude API (with tool use)
    ↓
"I need to verify this person, let me use web_search"
    ↓
MCP Client
    ↓
This MCP Server (stdio)
    ↓
Google Custom Search API
    ↓
Returns search results
    ↓
Claude analyzes and verifies
```

### Example Verification Flow

**Founder claims:**
- Name: Sarah Chen
- Company: Databricks
- School: UC Berkeley

**MCP tool call:**
```typescript
await client.callTool({
  name: 'web_search',
  arguments: {
    query: 'Sarah Chen Databricks UC Berkeley'
  }
});
```

**Returns:**
```json
{
  "query": "Sarah Chen Databricks UC Berkeley",
  "found_results": true,
  "results": [
    {
      "title": "Sarah Chen - Staff Engineer - Databricks | LinkedIn",
      "snippet": "Sarah Chen. Staff Engineer at Databricks. University of California, Berkeley...",
      "url": "https://linkedin.com/in/sarah-chen"
    }
  ]
}
```

**Claude's analysis:**
```
✅ VERIFIED
- LinkedIn result confirms Databricks employment
- Education matches UC Berkeley
- High confidence: Multiple sources consistent
```

## Files

- `index.ts` - Main MCP server implementation
- `test-web-search.ts` - Test script
- `package.json` - Dependencies
- `.env` - API credentials (you create this)

## Why This Approach?

### vs LinkedIn Scraping
- ✅ More reliable (no HTML parsing)
- ✅ Multiple sources (LinkedIn, company sites, news)
- ✅ Simpler code
- ✅ No browser automation needed
- ✅ Still shows proper MCP architecture

### Benefits
- Cross-reference multiple sources
- Catches inconsistencies
- Works for people without LinkedIn
- Google snippets are rich with info
- Respects rate limits (100/day free)

## For Production

For production use:
- Upgrade to paid tier for more searches
- Add caching to avoid repeat searches
- Implement retry logic
- Add more sophisticated verification logic
- Consider additional search APIs (Brave, Bing)
