import Anthropic from '@anthropic-ai/sdk';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { spawn } from 'child_process';
import path from 'path';
import { createSupabaseClient } from '../../lib/server';


export interface VerificationResult {
  verified: boolean;
  confidence: 'very_high' | 'high' | 'medium' | 'low' | 'very_low';
  reasoning: string;
  sources_found: number;
  details: string;
  verdict: 'PASS' | 'FAIL';
}

interface FounderInfo {
  founder_name?: string;
  company?: string;
  school?: string;
  pedigree?: string;
  social_capital?: string;
}  

/**
 * Verification Agent - Uses MCP server to autonomously verify founder claims
 */
export async function verificationAgent(
  transcript: string,
  founderInfo: FounderInfo
): Promise<VerificationResult> {
  console.log('🔍 Starting Verification Agent...');
  
  let mcpClient: Client | null = null;
  let mcpTransport: StdioClientTransport | null = null;

  try {
    // Start MCP server
    console.log('📡 Connecting to MCP server...');
    const mcpServerDir = path.join(process.cwd(), 'mcp-server');
    const mcpServerPath = path.join(mcpServerDir, 'index.ts');
    
    mcpTransport = new StdioClientTransport({
      command: 'npx',
      args: ['tsx', mcpServerPath],
      env: {
        ...process.env,
        // Ensure MCP server can find its .env file
        GOOGLE_SEARCH_API_KEY: process.env.GOOGLE_SEARCH_API_KEY,
        GOOGLE_SEARCH_ENGINE_ID: process.env.GOOGLE_SEARCH_ENGINE_ID,
      },
    });

    mcpClient = new Client(
      {
        name: 'verification-client',
        version: '1.0.0',
      },
      {
        capabilities: {},
      }
    );

    await mcpClient.connect(mcpTransport);
    console.log('✅ MCP server connected');

    // Get available tools from MCP server
    const toolsList = await mcpClient.listTools();
    console.log(`📋 Available MCP tools: ${toolsList.tools.map(t => t.name).join(', ')}`);

    // Convert MCP tools to Anthropic tool format
    const anthropicTools = toolsList.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
      input_schema: {
        type: "object" as const,
        properties: tool.inputSchema.properties || {},
        required: tool.inputSchema.required || [],
      },
    }));

    // Create prompt for Claude to verify founder claims
    const verificationPrompt = `You are a verification agent for a VC firm's due diligence process.

FOUNDER CLAIMS (extracted from transcript):
${JSON.stringify(founderInfo, null, 2)}

YOUR TASK:
1. Use the web_search tool to verify the founder's claims
2. Search for information about their name, company, school, and credentials
3. Analyze the search results to determine if claims are accurate
4. Return a verification verdict

CRITICAL GUIDELINES:
- Search for: "${founderInfo.founder_name} ${founderInfo.company || ''} ${founderInfo.school || ''}"
- Look for consistency across multiple sources
- **FAIL immediately if ANY claim contradicts what you find**
- **FAIL if you cannot verify a major claim (school, company, credentials)**
- High confidence = 3+ sources confirm ALL claims
- Low confidence = 1-2 sources OR any unverified claims
- PASS ONLY if ALL major claims are verified with medium+ confidence
- If someone claims to be "John Smith from Stanford" but sources show "John Smith from MIT", that's a FAIL

FRAUD DETECTION:
- Be suspicious of unverified claims
- Timeline inconsistencies are RED FLAGS
- If claimed school doesn't match found school → FAIL
- If claimed company doesn't match found company → FAIL
- Missing verification of major claims → FAIL

Return ONLY a JSON object with:
{
  "verified": boolean,
  "confidence": "very_high" | "high" | "medium" | "low" | "very_low",
  "reasoning": "Detailed explanation of what you found and why",
  "sources_found": number,
  "details": "Summary of key findings from search results",
  "verdict": "PASS" | "FAIL"
}`;

    // Call Claude with tool access
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    console.log('🤖 Calling Claude with MCP tool access...');
    
    const messages: Anthropic.MessageParam[] = [
      { role: 'user', content: verificationPrompt }
    ];

    let continueLoop = true;
    let finalResponse = '';

    // Tool use loop
    while (continueLoop) {
      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 4096,
        tools: anthropicTools,
        messages: messages,
      });

      console.log(`📨 Claude response type: ${response.stop_reason}`);

      // Check if Claude wants to use a tool
      if (response.stop_reason === 'tool_use') {
        // Find tool use blocks
        const toolUseBlocks = response.content.filter(
          (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
        );

        // Add Claude's response to messages
        messages.push({ role: 'assistant', content: response.content });

        // Execute each tool call via MCP
        const toolResults: Anthropic.ToolResultBlockParam[] = [];

        for (const toolUse of toolUseBlocks) {
          console.log(`🔧 Claude called tool: ${toolUse.name}`);
          console.log(`   Arguments: ${JSON.stringify(toolUse.input)}`);

          try {
            // Call MCP server
            const mcpResult = await mcpClient!.callTool({
              name: toolUse.name,
              arguments: toolUse.input as { [x: string]: unknown },
            });

            console.log(`✅ MCP tool returned results`);

            // Extract text content from MCP result
            const resultText = (mcpResult.content as any[])
              .map((item: any) => item.text)
              .join('\n');

            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: resultText,
            });
          } catch (error) {
            console.error(`❌ Tool call failed:`, error);
            toolResults.push({
              type: 'tool_result',
              tool_use_id: toolUse.id,
              content: `Error: ${error}`,
              is_error: true,
            });
          }
        }

        // Add tool results to messages
        messages.push({ role: 'user', content: toolResults });

      } else if (response.stop_reason === 'end_turn') {
        // Claude is done, extract final response
        const textBlocks = response.content.filter(
          (block): block is Anthropic.TextBlock => block.type === 'text'
        );
        finalResponse = textBlocks.map(block => block.text).join('\n');
        continueLoop = false;
      } else {
        // Unexpected stop reason
        console.warn(`⚠️ Unexpected stop reason: ${response.stop_reason}`);
        continueLoop = false;
      }
    }

    console.log('🎉 Verification complete!');

    // Parse Claude's final response - clean markdown and extract JSON
    let cleanedResponse = finalResponse.trim();
    
    // Remove markdown code blocks
    if (cleanedResponse.startsWith('```')) {
      cleanedResponse = cleanedResponse.replace(/^```(?:json)?\s*\n?/, '');
      cleanedResponse = cleanedResponse.replace(/\n?```\s*$/, '');
    }
    
    // Try to extract JSON if there's extra text
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedResponse = jsonMatch[0];
    }
    
    cleanedResponse = cleanedResponse.trim();
    
    console.log('📝 Parsing Claude response...');
    const result = JSON.parse(cleanedResponse) as VerificationResult;

    console.log(`📊 Verification Result: ${result.verdict} (${result.confidence} confidence)`);

    return result;

  } catch (error) {
    console.error('❌ Verification agent error:', error);
    
    // Return a failure result on error
    return {
      verified: false,
      confidence: 'very_low',
      reasoning: `Verification failed due to error: ${error}`,
      sources_found: 0,
      details: 'Unable to complete verification',
      verdict: 'FAIL',
    };
  } finally {
    // Cleanup MCP connection
    if (mcpClient) {
      console.log('🧹 Closing MCP connection...');
      try {
        await mcpClient.close();
      } catch (e) {
        console.error('Error closing MCP client:', e);
      }
    }
  }
}

