/**
 * Environment Variable Checker
 *
 * This script checks if your .env.local file is properly configured
 * Run with: node check-env.js
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

console.log("\n🔍 Checking Environment Variables...\n");
console.log("=".repeat(60));

const requiredVars = {
  ANTHROPIC_API_KEY: "Anthropic AI",
  NEXT_PUBLIC_SUPABASE_URL: "Supabase URL (public)",
  NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: "Supabase Publishable Key (public)",
  SUPABASE_SERVICE_ROLE_KEY: "Supabase Service Role Key (SECRET)",
  ELEVENLABS_API_KEY: "ElevenLabs API Key",
};

const optionalVars = {
  GOOGLE_SEARCH_API_KEY: "Google Search API Key",
  GOOGLE_SEARCH_ENGINE_ID: "Google Search Engine ID",
};

let allGood = true;
let missingRequired = [];

console.log("\n📋 REQUIRED VARIABLES:\n");

for (const [varName, description] of Object.entries(requiredVars)) {
  const value = process.env[varName];
  const status = value ? "✅" : "❌";
  const preview = value ? `${value.substring(0, 20)}...` : "NOT SET";

  console.log(`${status} ${varName}`);
  console.log(`   Description: ${description}`);
  console.log(`   Value: ${preview}`);
  console.log();

  if (!value) {
    allGood = false;
    missingRequired.push(varName);
  }
}

console.log("=".repeat(60));
console.log("\n📋 OPTIONAL VARIABLES:\n");

for (const [varName, description] of Object.entries(optionalVars)) {
  const value = process.env[varName];
  const status = value ? "✅" : "⚠️";
  const preview = value ? `${value.substring(0, 20)}...` : "NOT SET (optional)";

  console.log(`${status} ${varName}`);
  console.log(`   Description: ${description}`);
  console.log(`   Value: ${preview}`);
  console.log();
}

console.log("=".repeat(60));
console.log("\n📊 SUMMARY:\n");

if (allGood) {
  console.log("✅ All required environment variables are set!");
  console.log("\nYou can now run:");
  console.log("   npm run dev\n");
} else {
  console.log("❌ Missing required environment variables:\n");
  missingRequired.forEach((varName) => {
    console.log(`   - ${varName}`);
  });
  console.log("\n📖 Next steps:");
  console.log("   1. Create .env.local file: cp env.example .env.local");
  console.log(
    "   2. Fill in the missing values (see SETUP.md for instructions)"
  );
  console.log("   3. Run this script again: node check-env.js");
  console.log("   4. Restart your dev server\n");
}

console.log("=".repeat(60));
console.log();

process.exit(allGood ? 0 : 1);
