/**
 * Test script for the new Next.js API routes
 *
 * This script tests the migrated API endpoints that replaced Supabase Edge Functions
 *
 * Usage:
 *   tsx test-api-routes.ts
 *
 * Prerequisites:
 *   - Next.js dev server must be running on port 3000
 *   - All environment variables must be set in .env.local
 */

import dotenv from "dotenv";

// Load environment variables
dotenv.config({ path: ".env.local" });

const BASE_URL = "http://localhost:3000";

async function testFetchConversations() {
  console.log("\n🧪 Testing GET /api/fetch-conversations");
  console.log("=".repeat(50));

  try {
    const response = await fetch(`${BASE_URL}/api/fetch-conversations`);

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error:", error);
      return false;
    }

    const data = await response.json();
    console.log(
      `✅ Success! Fetched ${data.conversations?.length || 0} conversations`
    );

    if (data.conversations && data.conversations.length > 0) {
      console.log("\n📋 Sample conversation:");
      const sample = data.conversations[0];
      console.log(`   - ID: ${sample.conversation_id}`);
      console.log(`   - Agent: ${sample.agent_name}`);
      console.log(`   - Duration: ${sample.call_duration_secs}s`);
      console.log(`   - Transcript length: ${sample.transcript?.length || 0}`);
    }

    return true;
  } catch (error) {
    console.error("❌ Exception:", error);
    return false;
  }
}

async function testUpdateMetadata(conversationId?: string) {
  console.log("\n🧪 Testing POST /api/update-conversation-metadata");
  console.log("=".repeat(50));

  // If no conversation ID provided, try to fetch one first
  if (!conversationId) {
    console.log("ℹ️  No conversation ID provided, fetching one...");

    try {
      const response = await fetch(`${BASE_URL}/api/fetch-conversations`);
      const data = await response.json();

      if (data.conversations && data.conversations.length > 0) {
        conversationId = data.conversations[0].conversation_id;
        console.log(`✅ Using conversation ID: ${conversationId}\n`);
      } else {
        console.log("⚠️  No conversations found. Cannot test metadata update.");
        return false;
      }
    } catch (error) {
      console.error("❌ Failed to fetch conversations:", error);
      return false;
    }
  }

  try {
    const testMetadata = {
      test_timestamp: new Date().toISOString(),
      test_field: "This is a test from test-api-routes.ts",
      test_tags: ["test", "automated"],
    };

    const response = await fetch(
      `${BASE_URL}/api/update-conversation-metadata`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          conversation_id: conversationId,
          metadata: testMetadata,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      console.error("❌ Error:", error);
      return false;
    }

    const data = await response.json();
    console.log("✅ Success! Metadata updated");
    console.log(`   - Conversation ID: ${data.conversation_id}`);
    console.log(`   - Updated at: ${data.metadata.updated_at}`);
    console.log(`   - Test field: ${data.metadata.test_field}`);

    return true;
  } catch (error) {
    console.error("❌ Exception:", error);
    return false;
  }
}

async function runTests() {
  console.log("\n🚀 Starting API Route Tests");
  console.log("=".repeat(50));
  console.log(`   Base URL: ${BASE_URL}`);
  console.log(`   Make sure your dev server is running!\n`);

  // Wait a moment to make the output clearer
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Test fetch-conversations
  const fetchSuccess = await testFetchConversations();

  // Wait between tests
  await new Promise((resolve) => setTimeout(resolve, 1000));

  // Test update-conversation-metadata
  const updateSuccess = await testUpdateMetadata();

  // Summary
  console.log("\n" + "=".repeat(50));
  console.log("📊 Test Summary");
  console.log("=".repeat(50));
  console.log(
    `   Fetch Conversations: ${fetchSuccess ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(`   Update Metadata: ${updateSuccess ? "✅ PASS" : "❌ FAIL"}`);
  console.log();

  if (fetchSuccess && updateSuccess) {
    console.log("🎉 All tests passed!\n");
    process.exit(0);
  } else {
    console.log("⚠️  Some tests failed. Check the output above.\n");
    process.exit(1);
  }
}

// Check if dev server is likely running
async function checkDevServer() {
  try {
    const response = await fetch(BASE_URL, { method: "HEAD" });
    return response.ok || response.status === 404; // 404 is ok, means server is running
  } catch (error) {
    return false;
  }
}

async function main() {
  const serverRunning = await checkDevServer();

  if (!serverRunning) {
    console.error("\n❌ Error: Dev server is not running on", BASE_URL);
    console.error("\nPlease start the dev server first:");
    console.error("   npm run dev\n");
    process.exit(1);
  }

  await runTests();
}

main();
