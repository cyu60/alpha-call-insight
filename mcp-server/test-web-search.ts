// Test script for web search verification

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function testWebSearchVerification() {
  console.log('🧪 Testing Web Search MCP Server\n');

  const transport = new StdioClientTransport({
    command: 'npx',
    args: ['tsx', 'index.ts'],
  });

  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    console.log('📡 Connecting to MCP server...');
    await client.connect(transport);
    console.log('✅ Connected!\n');

    // List available tools
    console.log('📋 Listing available tools...');
    const tools = await client.listTools();
    console.log('Available tools:', tools.tools.map(t => t.name).join(', '));
    console.log();

    // Test verification
    console.log('🔍 Testing web_search tool...');
    console.log('Searching: Chinat Yu MLH Stanford\n');

    const result = await client.callTool({
      name: 'web_search',
      arguments: {
        query: 'Chinat Yu MLH Stanford',
      },
    });

    console.log('\n📊 Search Results:');
    console.log('='.repeat(80));
    
    if (result.content && result.content.length > 0) {
      const data = JSON.parse(result.content[0].text);
      
      if (data.error) {
        console.log('❌ Error:', data.error);
        if (data.instructions) {
          console.log('\n💡', data.instructions);
        }
      } else if (data.found_results) {
        console.log(`✅ Found ${data.result_count} results\n`);
        
        data.results.forEach((result: any, index: number) => {
          console.log(`${index + 1}. ${result.title}`);
          console.log(`   ${result.snippet}`);
          console.log(`   🔗 ${result.url}\n`);
        });
        
        console.log('💡', data.instructions);
      }
    }

    console.log('='.repeat(80));
    console.log('\n✅ Test completed!');

  } catch (error) {
    console.error('\n❌ Test failed:', error);
    process.exit(1);
  } finally {
    console.log('\n🧹 Cleaning up...');
    await client.close();
    process.exit(0);
  }
}

testWebSearchVerification().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});

