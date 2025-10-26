#!/usr/bin/env node

import { config } from 'dotenv';
config(); // Load .env file

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

// Web Search MCP Server for founder verification
class VerificationMCPServer {
  private server: Server;

  constructor() {
    this.server = new Server(
      {
        name: 'verification-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    );

    this.setupHandlers();
    this.setupErrorHandling();
  }

  private setupErrorHandling(): void {
    this.server.onerror = (error) => {
      console.error('[MCP Error]', error);
    };

    process.on('SIGINT', async () => {
      process.exit(0);
    });
  }

  private setupHandlers(): void {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'web_search',
          description: 'Search the web to verify information about a person (name, company, school, etc.)',
          inputSchema: {
            type: 'object',
            properties: {
              query: {
                type: 'string',
                description: 'Search query (e.g., "John Smith Stripe MIT")',
              },
            },
            required: ['query'],
          },
        },
      ],
    }));

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      if (request.params.name === 'web_search') {
        return await this.handleWebSearch(request.params.arguments);
      }
      
      throw new Error(`Unknown tool: ${request.params.name}`);
    });
  }

  private async handleWebSearch(args: any) {
    const { query } = args;

    console.error('🔍 Starting web search...');
    console.error(`   Query: ${query}`);

    const apiKey = process.env.GOOGLE_SEARCH_API_KEY;
    const searchEngineId = process.env.GOOGLE_SEARCH_ENGINE_ID;

    if (!apiKey || !searchEngineId) {
      console.error('❌ Missing Google API credentials');
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Missing GOOGLE_SEARCH_API_KEY or GOOGLE_SEARCH_ENGINE_ID environment variables',
              instructions: 'Set up Google Custom Search API: https://developers.google.com/custom-search/v1/overview',
            }, null, 2),
          },
        ],
      };
    }

    try {
      // Call Google Custom Search API
      const searchUrl = `https://www.googleapis.com/customsearch/v1?key=${apiKey}&cx=${searchEngineId}&q=${encodeURIComponent(query)}`;
      
      console.error('🌐 Calling Google Custom Search API...');
      
      const response = await fetch(searchUrl);
      
      if (!response.ok) {
        throw new Error(`Google API error: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();

      if (!data.items || data.items.length === 0) {
        console.error('⚠️  No search results found');
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({
                query: query,
                found_results: false,
                results: [],
              }, null, 2),
            },
          ],
        };
      }

      // Extract relevant information from search results
      const results = data.items.slice(0, 5).map((item: any) => ({
        title: item.title,
        snippet: item.snippet,
        url: item.link,
      }));

      console.error(`✅ Found ${results.length} results`);
      results.forEach((r: any, i: number) => {
        console.error(`   ${i + 1}. ${r.title}`);
      });

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              query: query,
              found_results: true,
              result_count: results.length,
              results: results,
              instructions: 'Analyze these search results to verify the claimed information. Look for consistency across multiple sources.',
            }, null, 2),
          },
        ],
      };

    } catch (error) {
      console.error('❌ Error during web search:', error);
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: `Web search failed: ${error}`,
              query: query,
            }, null, 2),
          },
        ],
      };
    }
  }

  async run(): Promise<void> {
    const transport = new StdioServerTransport();
    await this.server.connect(transport);
    console.error('🚀 Verification MCP Server running on stdio');
  }
}

// Start the server
const server = new VerificationMCPServer();
server.run().catch((error) => {
  console.error('Fatal error running server:', error);
  process.exit(1);
});
